"use strict";
// Гишүүн 4: JSON файлтай хоолны цэс; UI framework байхгүй.
document.addEventListener("DOMContentLoaded", async function () {
  const page = document.body.dataset.page;
  const status = document.getElementById("data-status");
  status.dataset.state = "loading";
  let data;
  try {
    const response = await fetch("../data/menu.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    data = await response.json();
    if (!Array.isArray(data.items) || !Array.isArray(data.seasonal)) throw new Error("Формат буруу");
    const rows = page === "seasonal" ? data.seasonal : data.items;
    status.dataset.state = rows.length ? "success" : "empty";
    status.textContent = rows.length ? "Цэсийн мэдээлэл ачааллаа." : "Харуулах мэдээлэл алга.";
  } catch (error) {
    status.dataset.state = "error";
    status.textContent = "Цэс ачаалж чадсангүй. Live Server ашиглана уу.";
    return;
  }
  const money = function (n) { return Number(n).toLocaleString("en-US") + "₮"; };
  const text = function (tag, value) {
    const node = document.createElement(tag);
    node.textContent = String(value);
    return node;
  };
  function addRow(root, values) {
    const tr = document.createElement("tr");
    values.forEach(function (value, index) {
      const cell = text(index === 0 ? "th" : "td", value);
      if (index === 0) cell.scope = "row";
      tr.appendChild(cell);
    });
    root.appendChild(tr);
  }
  function loadFavorites() {
    try {
      const ids = JSON.parse(localStorage.getItem("khukh_menu_favorites") || "[]");
      return Array.isArray(ids) ? ids.filter(function (id) { return typeof id === "string"; }) : [];
    } catch (error) { return []; }
  }
  if (page === "index") {
    const queryInput = document.getElementById("menu-query");
    const select = document.getElementById("menu-filter");
    const target = document.getElementById("menu-items");
    function drawMenu() {
      target.replaceChildren();
      const query = queryInput.value.trim().toLowerCase();
      const rows = data.items.filter(function (food) {
        return (select.value === "all" || food.type === select.value) &&
          food.name.toLowerCase().includes(query);
      });
      if (!rows.length) { target.appendChild(text("p", "Тохирох хоол олдсонгүй.")); return; }
      rows.forEach(function (food) {
        const card = document.createElement("article");
        card.className = "project-tile";
        if (food.image) {
          const img = document.createElement("img");
          img.src = food.image;
          img.alt = food.name + "-ны жишиг зураг";
          img.loading = "lazy";
          card.appendChild(img);
        }
        card.append(text("h3", food.name), text("p", food.serving),
          text("strong", money(food.price)), text("p", food.ingredients));
        target.appendChild(card);
      });
    }
    queryInput.addEventListener("input", drawMenu);
    select.addEventListener("change", drawMenu);
    drawMenu();
  }
  if (page === "compare") {
    const a = document.getElementById("food-a");
    const b = document.getElementById("food-b");
    data.items.forEach(function (food) {
      for (const select of [a, b]) {
        const option = document.createElement("option");
        option.value = food.id;
        option.textContent = food.name;
        select.appendChild(option);
      }
    });
    if (data.items.length > 1) b.selectedIndex = 1;
    function drawComparison() {
      const root = document.getElementById("compare-body");
      root.replaceChildren();
      const one = data.items.find(function (f) { return f.id === a.value; });
      const two = data.items.find(function (f) { return f.id === b.value; });
      if (!one || !two) {
        addRow(root, ["Төлөв", "Харьцуулах хоол алга."]);
        return;
      }
      addRow(root, ["Хоол", one.name + " / " + two.name]);
      addRow(root, ["Үнэ", money(one.price) + " / " + money(two.price)]);
      addRow(root, ["Порц", one.serving + " / " + two.serving]);
      addRow(root, ["Орц", one.ingredients + " / " + two.ingredients]);
      addRow(root, ["Анхаарах орц", one.allergens + " / " + two.allergens]);
    }
    document.getElementById("compare-food").addEventListener("click", drawComparison);
    drawComparison();
  }
  if (page === "ingredients") {
    const root = document.getElementById("ingredients-body");
    data.items.forEach(function (food) {
      addRow(root, [food.name, food.ingredients, food.allergens]);
    });
  }
  if (page === "favorites") {
    const choices = document.getElementById("favorites-choices");
    const list = document.getElementById("favorites-list");
    let favorites = loadFavorites();
    function drawList() {
      list.replaceChildren();
      data.items.forEach(function (food) {
        if (favorites.includes(food.id)) list.appendChild(text("li", food.name + " · " + money(food.price)));
      });
      if (!list.children.length) list.appendChild(text("li", "Дуртай хоол сонгоогүй байна."));
    }

    function showChoice(button, food) {
      const selected = favorites.includes(food.id);
      button.setAttribute("aria-pressed", String(selected));
      button.textContent = (selected ? "♥ " : "♡ ") + food.name + " — " + money(food.price);
    }

    data.items.forEach(function (food) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "project-favorite";
      button.setAttribute("aria-label", food.name);
      showChoice(button, food);
      button.addEventListener("click", function () {
        const next = favorites.includes(food.id)
          ? favorites.filter(function (id) { return id !== food.id; })
          : [...favorites, food.id];
        try {
          localStorage.setItem("khukh_menu_favorites", JSON.stringify(next));
          favorites = next;
          showChoice(button, food);
          drawList();
          status.dataset.state = "success";
          status.textContent = "Дуртай хоолны жагсаалт шинэчлэгдлээ.";
        } catch (error) {
          status.dataset.state = "error";
          status.textContent = "Браузер сонголтыг хадгалж чадсангүй.";
        }
      });
      choices.appendChild(button);
    });
    drawList();
  }
  if (page === "seasonal") {
    const target = document.getElementById("seasonal-items");
    data.seasonal.forEach(function (row) {
      const article = document.createElement("article");
      article.className = "project-tile";
      article.append(text("h3", row.season + " · " + row.title), text("p", row.text));
      target.append(article);
    });
  }
});
