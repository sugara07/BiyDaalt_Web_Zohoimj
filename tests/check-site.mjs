// Node.js built-in smoke test; npm болон бэлэн UI сан шаардлагагүй.
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const groups = {
  "": ["index","about","news","contact","sitemap"],
  services: ["index","delivery","catering","offers","feedback"],
  booking: ["index","seating","group","manage","faq"],
  menu: ["index","compare","ingredients","favorites","seasonal"],
  visit: ["index","hours","spaces","access","planner"],
  culture: ["index","recipes","sourcing","etiquette","stories"]
};
const scripts = ["app","services","home-news","services-data","booking","menu","visit","culture"];
const jsonFiles = ["home-news","service-guide","booking","menu","visit","culture"];
let errors = [];
let countLinks = 0;
let countPages = 0;

for (const [folder, names] of Object.entries(groups)) {
  for (const name of names) {
    const filename = resolve(root, folder, name + ".html");
    if (!existsSync(filename)) {
      errors.push("Хуудас алга: " + filename);
      continue;
    }
    const html = readFileSync(filename, "utf8");
    countPages++;
    if (!html.includes('lang="mn"')) errors.push("lang=mn алга: " + filename);
    if (!html.includes("name=\"viewport\"")) errors.push("viewport алга: " + filename);
    if (!/<main\b/.test(html) || !/<h1\b/.test(html)) errors.push("main/h1 алга: " + filename);

    const srcs = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)];
    for (const match of srcs) {
      const link = match[1];
      if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(link)) continue;
      const path = link.split("#")[0].split("?")[0];
      const section = link.includes("#") ? link.split("#")[1] : "";
      const referenced = path ? resolve(dirname(filename), path) : filename;
      if (!existsSync(referenced)) errors.push("Холбоос алга: " + filename + " -> " + link);
      else if (section && path.endsWith(".html")) {
        const target = readFileSync(referenced, "utf8");
        if (!target.includes('id="' + section + '"') && !target.includes("id='" + section + "'")) {
          errors.push("Anchor алга: " + filename + " -> " + link);
        }
      } else if (section && !path) {
        if (!html.includes('id="' + section + '"') && !html.includes("id='" + section + "'")) {
          errors.push("Anchor алга: " + filename + " -> " + link);
        }
      }
      countLinks++;
    }
    for (const image of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\balt=/.test(image[0])) errors.push("Зургийн alt алга: " + filename);
    }
  }
}

for (const name of scripts) {
  const file = resolve(root, "js", name + ".js");
  if (!existsSync(file)) { errors.push("JS алга: " + name); continue; }
  try { execFileSync(process.execPath, ["--check", file]); }
  catch (error) { errors.push("JS syntax: " + name); }
}
for (const name of jsonFiles) {
  const file = resolve(root, "data", name + ".json");
  if (!existsSync(file)) { errors.push("JSON алга: " + name); continue; }
  try { JSON.parse(readFileSync(file, "utf8")); }
  catch (error) { errors.push("JSON parse: " + name); }
}

if (countPages !== 30) errors.push("30 хуудас биш: " + countPages);
console.log("Хуудас:", countPages, "| Дотоод reference:", countLinks, "| JS:", scripts.length, "| JSON:", jsonFiles.length);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("PASS: файлын холбоос, HTML суурь бүтэц, JS syntax, JSON parse");
  console.log("Анхаар: Браузерын 360/768/1280 responsive ба хэрэглэгчийн UI тестийг тусад нь хийнэ.");
}
