import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, resolve, sep } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const widths = [360, 768, 1280];
const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".webp": "image/webp", ".wav": "audio/wav", ".mp4": "video/mp4"
};

async function serve(root, request, response) {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    const file = resolve(root, "." + pathname);
    if (!file.startsWith(root + sep)) {
      response.writeHead(404).end();
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) {
      response.writeHead(404).end();
      return;
    }
    const headers = {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "Accept-Ranges": "bytes"
    };
    const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range || "");
    const start = range ? Number(range[1]) : 0;
    const end = range && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
    if (range && (start > end || start >= info.size)) {
      response.writeHead(416, { "Content-Range": "bytes */" + info.size }).end();
      return;
    }
    headers["Content-Length"] = end - start + 1;
    if (range) headers["Content-Range"] = "bytes " + start + "-" + end + "/" + info.size;
    response.writeHead(range ? 206 : 200, headers);
    if (request.method === "HEAD" || info.size === 0) {
      response.end();
      return;
    }
    const stream = createReadStream(file, { start, end });
    response.on("close", () => stream.destroy());
    stream.on("error", () => response.destroy());
    stream.pipe(response);
  } catch (error) {
    if (response.headersSent) response.destroy();
    else response.writeHead(404).end();
  }
}

async function withSite(root, check) {
  const server = createServer((request, response) => serve(root, request, response));
  await new Promise((ready, fail) => {
    server.once("error", fail);
    server.listen(0, "127.0.0.1", ready);
  });
  try {
    await check("http://127.0.0.1:" + server.address().port);
  } finally {
    await new Promise((done) => server.close(done));
  }
}

async function open(page, base, path) {
  const response = await page.goto(base + "/" + path, { waitUntil: "domcontentloaded" });
  assert.equal(response.status(), 200, path);
}

async function waitForData(page, selector, value) {
  await page.waitForFunction(
    ([id, state]) => document.querySelector(id)?.dataset.state === state, [selector, value]
  );
}

async function checkLayout(page, base, path, staticOnly) {
  await open(page, base, path);
  if (!staticOnly) {
    await page.waitForFunction(() =>
      [...document.querySelectorAll("#news-load-status, #service-load-status, #data-status")]
        .every((node) => node.dataset.state === "success"));
  }
  await page.evaluate(() => {
    for (const image of document.images) image.loading = "eager";
  });
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    brokenImages: [...document.images].filter((image) => !image.naturalWidth).map((image) => image.src),
    scriptCount: document.scripts.length
  }));
  assert.equal(result.overflow, false, "Horizontal page overflow on " + path);
  assert.deepEqual(result.brokenImages, [], path);
  if (staticOnly) assert.equal(result.scriptCount, 0, path);
}

async function checkFlows(page, base) {
  await open(page, base, "index.html");
  const details = page.locator(".food-detail-btn").first();
  await details.focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#modalTitle").textContent(), "Бууз");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#foodModal").isHidden(), true);
  assert.equal(await details.evaluate((el) => el === document.activeElement), true);

  const booking = page.locator("#booking-form");
  await booking.locator('[name="name"]').fill("Туршилт суралцагч");
  const phone = booking.locator('[name="phone"]');
  await phone.fill("abcdef");
  assert.equal(await phone.evaluate((el) => el.validity.patternMismatch), true);
  await phone.fill("+976 (99) 123456");
  const tomorrow = await page.evaluate(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")].join("-");
  });
  await booking.locator('[name="date"]').fill("2000-01-01");
  assert.equal(await booking.locator('[name="date"]').evaluate((el) => el.validity.rangeUnderflow), true);
  await booking.locator('[name="date"]').fill(tomorrow);
  await booking.locator('[name="time"]').fill("15:30");
  await booking.locator('[name="guests"]').selectOption({ index: 1 });
  await booking.locator('button[type="submit"]').click();
  const add = page.getByRole("button", { name: "Бууз нэмэх", exact: true });
  await add.click();
  await add.click();
  await page.getByRole("button", { name: "Хоолны захиалга хадгалах" }).click();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.restaurant_bookings)[0].total), 19000);
  await page.locator("#booking-result a").click();
  await page.waitForFunction(() =>
    document.querySelector("#manage-result")?.textContent.includes("19,000₮")
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#manage-delete").click();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.restaurant_bookings).length), 0);

  await open(page, base, "contact.html");
  const email = page.locator('#contact-form [name="email"]');
  await email.fill("test-at-example");
  assert.equal(await email.evaluate((el) => el.validity.typeMismatch), true);

  await open(page, base, "services/delivery.html");
  await page.locator("#zone-select").selectOption("Сүхбаатар дүүрэг");
  await page.locator('#zone-form button[type="submit"]').click();
  assert.match(await page.locator("#zone-result").textContent(), /3,000₮/);
  for (const path of ["services/catering.html", "services/feedback.html", "services/offers.html"]) {
    await open(page, base, path);
    await page.locator('form button[type="submit"]:enabled').waitFor();
  }

  await open(page, base, "booking/group.html");
  await page.locator("#group-count").fill("12");
  await page.locator("#group-budget").fill("35000");
  await page.locator('#group-booking-form button[type="submit"]').click();
  assert.match(await page.locator("#group-answer").textContent(), /420,000₮/);

  await open(page, base, "menu/index.html");
  await waitForData(page, "#data-status", "success");
  await page.locator("#menu-query").fill("цуЙВан");
  assert.equal(await page.locator("#menu-items article").count(), 1);
  await open(page, base, "menu/compare.html");
  await waitForData(page, "#data-status", "success");
  await page.locator("#food-a").selectOption("buuz");
  await page.locator("#food-b").selectOption("khorkhog");
  await page.locator("#compare-food").click();
  assert.match(await page.locator("#compare-body").textContent(), /38,000₮/);
  await open(page, base, "menu/dish.html");
  const favorite = page.locator("#favorites-choices").getByRole("button", { name: "Бууз", exact: true });
  await favorite.click();
  assert.equal(await favorite.getAttribute("aria-pressed"), "true");
  assert.equal(await favorite.evaluate((el) => el === document.activeElement), true);
  await page.reload();
  await waitForData(page, "#data-status", "success");
  assert.equal(await favorite.getAttribute("aria-pressed"), "true");
  await favorite.click();
  assert.equal(await favorite.getAttribute("aria-pressed"), "false");
  await open(page, base, "menu/sets.html");
  await waitForData(page, "#data-status", "success");
  assert.ok(await page.locator("#seasonal-items article").count());

  await open(page, base, "visit/planner.html");
  await page.locator("#plan-date").fill(tomorrow);
  await page.locator("#plan-guests").fill("3");
  await page.locator('#visit-plan-form button[type="submit"]').click();
  assert.match(await page.locator("#visit-plan-result").textContent(), /Тайван булан/);

  await open(page, base, "recipe.html");
  await waitForData(page, "#data-status", "success");
  await page.locator("#recipe-kind").selectOption("buuz");
  await page.locator("#recipe-people").fill("8");
  await page.locator('#recipe-form button[type="submit"]').click();
  assert.match(await page.locator("#recipe-result").textContent(), /800 г/);
}

const cases = [
  ["news.html", "home-news", "#news-load-status", []],
  ["services/index.html", "service-guide", "#service-load-status", []],
  ["booking/faq.html", "booking", "#data-status", { areas: [], faqs: [] }],
  ["menu/index.html", "menu", "#data-status", { items: [], seasonal: [] }],
  ["menu/sets.html", "menu", "#data-status", { items: [{ id: "buuz" }], seasonal: [] }],
  ["visit/hours.html", "visit", "#data-status", { info: {}, hours: [], spaces: [] }],
  ["recipe.html", "culture", "#data-status", { recipes: [], stories: [{}] }]
];

async function checkData(page, base) {
  for (const [path, data, selector, empty] of cases) {
    const endpoint = "**/data/" + data + ".json";
    let release;
    const gate = new Promise((done) => { release = done; });
    await page.route(endpoint, async (route) => { await gate; await route.continue(); });
    try {
      await open(page, base, path);
      await waitForData(page, selector, "loading");
    } finally {
      release();
    }
    await waitForData(page, selector, "success");
    await page.unroute(endpoint);
    await page.route(endpoint, (route) => route.fulfill({ json: empty }));
    await open(page, base, path);
    await waitForData(page, selector, "empty");
    await page.unroute(endpoint);
    await page.route(endpoint, (route) => route.fulfill({ status: 404, body: "Test data unavailable" }));
    await open(page, base, path);
    await waitForData(page, selector, "error");
    if (path === "recipe.html") {
      assert.equal(await page.locator('#recipe-form button[type="submit"]').isDisabled(), true);
    }
    await page.unroute(endpoint);
    console.log("PASS " + path + " · loading, success, empty, HTTP 404");
  }
}

async function checkSite(browser, root, staticOnly) {
  const pages = execFileSync("git", ["ls-files", "-z", "--", "*.html"], {
    cwd: root, encoding: "utf8"
  }).split("\0").filter(Boolean);
  assert.ok(pages.length >= 30);
  await withSite(root, async (base) => {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: 900 }, reducedMotion: "reduce"
      });
      await context.route("**/*", (route) => route.request().url().startsWith(base + "/")
        ? route.continue() : route.abort());
      try {
        const page = await context.newPage();
        const errors = [], missing = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const onResponse = (response) => {
          if (response.status() >= 400) missing.push(response.url());
        };
        page.on("response", onResponse);
        for (const path of pages) await checkLayout(page, base, path, staticOnly);
        assert.deepEqual(missing, []);
        page.off("response", onResponse);
        console.log("PASS " + (staticOnly ? "HTML/CSS" : "Interactive") + " " + width + "px · " + pages.length + " pages");
        if (!staticOnly) {
          await checkFlows(page, base);
          console.log("PASS interactive forms, cart, menu, visit and recipe at " + width + "px");
          if (width === 768) await checkData(page, base);
        }
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
      }
    }
  });
}

const phaseOne = process.argv[2];
assert.ok(phaseOne, "Pass the path to the checked out submission/phase1-static branch.");
const browser = await chromium.launch({ channel: "chrome" });
try {
  console.log("Chrome " + browser.version());
  await checkSite(browser, resolve(phaseOne), true);
  await checkSite(browser, resolve(import.meta.dirname, ".."), false);
} finally {
  await browser.close();
}
