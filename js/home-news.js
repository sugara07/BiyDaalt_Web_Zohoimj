"use strict";
// GitHub ажлын мэдээг JSON-оос уншиж хайна.
document.addEventListener("DOMContentLoaded", async function () {
  const status = document.getElementById("news-load-status");
  const filter = document.getElementById("news-filter");
  const target = document.getElementById("news-live");
  let news;
  status.dataset.state = "loading";
  status.textContent = "Мэдээг ачаалж байна…";
  try {
    const response = await fetch("data/home-news.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    news = await response.json();
    if (!Array.isArray(news)) throw new Error("JSON массив биш");
  } catch (error) {
    status.dataset.state = "error";
    status.textContent = "Алдаа: мэдээг ачаалж чадсангүй. Live Server дээр шалгана уу.";
    return;
  }
  function render() {
    target.replaceChildren();
    const q = filter.value.trim().toLowerCase();
    const rows = news.filter(function (item) {
      return (item.title + " " + item.desc + " " + item.tag).toLowerCase().includes(q);
    });
    status.dataset.state = rows.length ? "success" : "empty";
    status.textContent = rows.length ? rows.length + " мэдээ харагдаж байна." : "Тохирох мэдээ олдсонгүй.";
    rows.forEach(function (item) {
      const article = document.createElement("article");
      const title = document.createElement("h3");
      const date = document.createElement("small");
      const desc = document.createElement("p");
      title.textContent = item.title;
      date.textContent = item.date + " · " + item.tag;
      desc.textContent = item.desc;
      article.append(title, date, desc);
      target.appendChild(article);
    });
  }
  filter.addEventListener("input", render);
  render();
});
