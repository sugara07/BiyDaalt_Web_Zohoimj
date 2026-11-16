// F.ITM202: 30 гол хуудасны smoke test (Node built-in; npm install хийхгүй).
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";

const staticOnly = process.argv[2] === "--static";
const root = staticOnly ? resolve(process.argv[3] ?? ".") : resolve(import.meta.dirname, "..");
const groups = [
  ["", ["index", "about", "news", "contact", "sitemap"]],
  ["services", ["index", "delivery", "catering", "offers", "feedback"]],
  ["booking", ["index", "seating", "group", "manage", "faq"]],
  ["menu", ["index", "dish", "compare", "ingredients", "sets"]],
  ["visit", ["index", "hours", "spaces", "access", "planner"]],
  ["", ["cultureint", "cooking", "recipe", "media", "terminology"]]
];
const scriptNames = ["app","services","home-news","services-data","booking","menu","visit","culture"];
const jsonNames = ["home-news","service-guide","booking","menu","visit","culture"];
const errors = [];
let totalPages = 0;
let linksChecked = 0;
const sitemap = readFileSync(resolve(root, "sitemap.html"), "utf8");
const sitemapLinks = new Set(Array.from(sitemap.matchAll(/\bhref=["']([^"']+)["']/g), match => match[1]));

for (const [folder, pageNames] of [...groups, ["", ["recipedelge"]]]) {
  for (const pageName of pageNames) {
    const pagePath = [folder, pageName + ".html"].filter(Boolean).join("/");
    const file = resolve(root, pagePath);
    if (!existsSync(file)) { errors.push("Алга: " + file); continue; }
    const html = readFileSync(file, "utf8");
    if (pageName !== "recipedelge") {
      totalPages++;
      if (!sitemapLinks.has(pagePath)) errors.push("Зураглалд алга: " + pagePath);
    }
    if (!/<html[^>]*lang=["']mn["']/i.test(html)) errors.push("lang=mn: " + file);
    if (!/<meta[^>]+name=["']viewport["']/i.test(html)) errors.push("viewport: " + file);
    if (!/<h1\b/i.test(html) || !/<main\b/i.test(html)) errors.push("h1/main: " + file);
    for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\balt\s*=/.test(image[0])) errors.push("img alt: " + file);
    }
    if (staticOnly && /<script\b/i.test(html)) errors.push("Статик хуудсанд script байна: " + pagePath);
    if (staticOnly && /<button\b(?=[^>]*\btype=["']submit["'])(?![^>]*\bdisabled\b)/i.test(html)) {
      errors.push("Статик маягтад илгээх товч идэвхтэй байна: " + pagePath);
    }
    for (const [, pattern] of html.matchAll(/\bpattern="([^"]+)"/g)) {
      try { new RegExp(pattern, "v"); }
      catch (error) { errors.push("HTML pattern алдаа: " + pagePath + " -> " + pattern); }
    }
    for (const match of html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/g)) {
      const url = match[1];
      if (/^(?:https?:|mailto:|tel:|sms:|data:|javascript:|\/\/)/i.test(url)) continue;
      const fragment = url.includes("#") ? url.split("#")[1] : "";
      const first = url.split("#")[0].split("?")[0];
      let part;
      try { part = decodeURIComponent(first); } catch (error) { part = first; }
      const target = part ? resolve(dirname(file), part) : file;
      if (!existsSync(target)) { errors.push("Холбоос алга: " + file + " -> " + url); continue; }
      const htmlTarget = part.endsWith(".html") || part === "";
      if (fragment && htmlTarget) {
        const body = target === file ? html : readFileSync(target, "utf8");
        if (!body.includes('id="' + fragment + '"') && !body.includes("id='" + fragment + "'")) {
          errors.push("Anchor алга: " + file + " -> " + url);
        }
      }
      linksChecked++;
    }
  }
}
if (totalPages !== 30) errors.push("30 үндсэн хуудас биш: " + totalPages);

for (const name of staticOnly ? [] : scriptNames) {
  const file = resolve(root,"js",name+".js");
  if (!existsSync(file)) { errors.push("JS алга: " + name); continue; }
  try { execFileSync(process.execPath,["--check",file]); }
  catch (error) { errors.push("JS syntax алдаа: " + name); }
}
for (const name of staticOnly ? [] : jsonNames) {
  const file = resolve(root,"data",name+".json");
  if (!existsSync(file)) { errors.push("JSON алга: " + name); continue; }
  try { JSON.parse(readFileSync(file,"utf8")); }
  catch (error) { errors.push("JSON parse алдаа: " + name); }
}
console.log("Үндсэн хуудас:", totalPages, "| Нэмэлт жорын хуудас: 1 | Холбоос:", linksChecked,
  "| JS:", staticOnly ? 0 : scriptNames.length, "| JSON:", staticOnly ? 0 : jsonNames.length);
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else { console.log("PASS: HTML, зураглал, холбоос, маягтын pattern ба JS/JSON шалгалт."); }
