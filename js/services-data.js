"use strict";
// Гишүүн 2: үйлчилгээний мэдээллийг JSON-оос татаж шүүх.
document.addEventListener("DOMContentLoaded", async function () {
  const status = document.getElementById("service-load-status");
  const select = document.getElementById("service-filter");
  const target = document.getElementById("service-live");
  let services;
  status.textContent = "Үйлчилгээний мэдээлэл ачаалж байна…";
  try {
    const response = await fetch("../data/service-guide.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    services = await response.json();
    if (!Array.isArray(services)) throw new Error("Өгөгдөл буруу");
  } catch (error) {
    status.textContent = "Алдаа: мэдээлэл татаж чадсангүй. Live Server ашиглана уу.";
    return;
  }
  function display() {
    target.replaceChildren();
    const rows = services.filter(function (item) {
      return select.value === "all" || select.value === item.id;
    });
    status.textContent = rows.length ? rows.length + " үйлчилгээ харуулж байна." : "Өгөгдөл хоосон байна.";
    rows.forEach(function (item) {
      const article = document.createElement("article");
      const heading = document.createElement("h3");
      const description = document.createElement("p");
      const link = document.createElement("a");
      heading.textContent = item.name;
      description.textContent = item.answer;
      link.href = item.url;
      link.textContent = "Дэлгэрэнгүй";
      article.append(heading, description, link);
      target.append(article);
    });
  }
  select.addEventListener("change", display);
  display();
});