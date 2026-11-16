// F.ITM202: 30 гол хуудасны smoke test (Node built-in; npm install хийхгүй).
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
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

for (const [folder, pageNames] of groups) {
  for (const pageName of pageNames) {
    const file = resolve(root, folder, pageName + ".html");
    if (!existsSync(file)) { errors.push("Алга: " + file); continue; }
    const html = readFileSync(file, "utf8");
    totalPages++;
    if (!/<html[^>]*lang=["']mn["']/i.test(html)) errors.push("lang=mn: " + file);
    if (!/<meta[^>]+name=["']viewport["']/i.test(html)) errors.push("viewport: " + file);
    if (!/<h1\b/i.test(html) || !/<main\b/i.test(html)) errors.push("h1/main: " + file);
    for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\balt\s*=/.test(image[0])) errors.push("img alt: " + file);
    }
    for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
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
if (!existsSync(resolve(root, "recipedelge.html"))) errors.push("Нэмэлт жорын файл алга");

for (const name of scriptNames) {
  const file = resolve(root,"js",name+".js");
  if (!existsSync(file)) { errors.push("JS алга: " + name); continue; }
  try { execFileSync(process.execPath,["--check",file]); }
  catch (error) { errors.push("JS syntax алдаа: " + name); }
}
for (const name of jsonNames) {
  const file = resolve(root,"data",name+".json");
  if (!existsSync(file)) { errors.push("JSON алга: " + name); continue; }
  try { JSON.parse(readFileSync(file,"utf8")); }
  catch (error) { errors.push("JSON parse алдаа: " + name); }
}
console.log("30 гол хуудас:", totalPages, "| Холбоос:", linksChecked, "| JS:", scriptNames.length, "| JSON:", jsonNames.length);
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else { console.log("PASS: HTML/файлын холбоос, JS syntax, JSON parse."); }
console.log("Анхаар: Responsive 360/768/1280 болон хэрэглэгчийн үйлдлийг браузерт тусад нь туршина.");
