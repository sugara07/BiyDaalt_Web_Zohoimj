"use strict";
// Гишүүн 6: Монгол хоолны өв, жорын тооцоо, хайлт.
document.addEventListener("DOMContentLoaded", async function () {
  const page = document.body.dataset.page;
  const status = document.getElementById("data-status");
  status.dataset.state = "loading";
  let data;
  try {
    const response = await fetch("data/culture.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    data = await response.json();
    if (!Array.isArray(data.recipes) || !Array.isArray(data.stories)) throw new Error("Формат буруу");
    const collections = {
      recipes: data.recipes,
      stories: data.stories,
      sourcing: data.sources ?? [],
      etiquette: data.etiquette ?? []
    };
    const rows = collections[page];
    if (page !== "index" && !Array.isArray(rows)) throw new Error("Формат буруу");
    const hasContent = page === "index" ? Boolean(data.fact) : rows.length > 0;
    status.dataset.state = hasContent ? "success" : "empty";
    status.textContent = hasContent ? "Соёлын мэдээлэл ачааллаа." : "Өгөгдөл хоосон байна.";
    if (!hasContent) return;
  } catch (error) {
    status.dataset.state = "error";
    status.textContent = "JSON татаж чадсангүй. Live Server ашиглаж үзнэ үү.";
    return;
  }
  function textNode(tag, value) {
    const node = document.createElement(tag);
    node.textContent = String(value);
    return node;
  }
  if (page === "index") {
    document.getElementById("culture-fact").textContent = data.fact || "Одоогоор танилцуулга алга.";
  }
  if (page === "recipes") {
    const select = document.getElementById("recipe-kind");
    const form = document.getElementById("recipe-form");
    const result = document.getElementById("recipe-result");
    data.recipes.forEach(function (recipe) {
      const option = document.createElement("option");
      option.value = recipe.id;
      option.textContent = recipe.name;
      select.appendChild(option);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const recipe = data.recipes.find(function (row) { return row.id === select.value; });
      const count = Number(document.getElementById("recipe-people").value);
      if (!recipe || count < 1 || count > 30) { result.textContent = "Сонголтоо шалгана уу."; return; }
      result.replaceChildren();
      result.appendChild(textNode("h3", recipe.name + " — " + count + " хүн"));
      const list = document.createElement("ul");
      recipe.ingredients.forEach(function (row) {
        const amount = Math.round(row.amount * count / recipe.base);
        list.appendChild(textNode("li", row.name + ": " + amount + " " + row.unit));
      });
      result.appendChild(list);
      const steps = document.createElement("ol");
      recipe.steps.forEach(function (step) { steps.appendChild(textNode("li", step)); });
      result.append(textNode("h4", "Хийх дараалал"), steps);
    });
    form.querySelector('button[type="submit"]').disabled = false;
  }
  if (page === "sourcing") {
    const root = document.getElementById("sourcing-list");
    data.sources.forEach(function (item) {
      const article = document.createElement("article");
      article.className = "project-tile";
      article.append(textNode("h3", item.name), textNode("strong", item.stage), textNode("p", item.desc));
      root.appendChild(article);
    });
  }
  if (page === "etiquette") {
    const tabs = document.getElementById("etiquette-tabs");
    const output = document.getElementById("etiquette-output");
    const categories = [...new Set((data.etiquette || []).map(function (row) { return row.category; }))];
    function draw(category) {
      output.replaceChildren();
      const rows = data.etiquette.filter(function (row) { return row.category === category; });
      rows.forEach(function (row) {
        output.append(textNode("h3", row.title), textNode("p", row.text));
      });
      tabs.querySelectorAll("button").forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.textContent === category));
      });
    }
    categories.forEach(function (category) {
      const button = textNode("button", category);
      button.type = "button";
      button.className = "project-action";
      button.addEventListener("click", function () { draw(category); });
      tabs.appendChild(button);
    });
    draw(categories[0]);
  }
  if (page === "stories") {
    const input = document.getElementById("story-query");
    const target = document.getElementById("stories-list");
    function showStories() {
      target.replaceChildren();
      const query = input.value.trim().toLowerCase();
      const rows = data.stories.filter(function (item) {
        return (item.title + " " + item.food + " " + item.text).toLowerCase().includes(query);
      });
      if (!rows.length) { target.appendChild(textNode("p", "Тохирох түүх олдсонгүй.")); return; }
      rows.forEach(function (item) {
        const article = document.createElement("article");
        article.append(textNode("h3", item.title), textNode("p", item.text));
        target.appendChild(article);
      });
    }
    input.addEventListener("input", showStories);
    showStories();
  }
});
