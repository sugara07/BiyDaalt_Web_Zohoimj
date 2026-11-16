"use strict";
// Гишүүн 5: зочлох мэдээлэл; бүх газар, цаг нь жишиг.
document.addEventListener("DOMContentLoaded", async function () {
  const page = document.body.dataset.page;
  const status = document.getElementById("data-status");
  status.dataset.state = "loading";
  let info;
  try {
    const response = await fetch("../data/visit.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    info = await response.json();
    if (!info.info || !Array.isArray(info.hours) || !Array.isArray(info.spaces)) {
      throw new Error("Өгөгдөл бүрэн бус");
    }
    status.dataset.state = info.hours.length ? "success" : "empty";
    status.textContent = info.hours.length ? "Зочлох мэдээлэл ачааллаа." : "Мэдээлэл хоосон байна.";
  } catch (error) {
    status.dataset.state = "error";
    status.textContent = "Мэдээлэл татахад алдаа гарлаа. Live Server ашиглана уу.";
    return;
  }
  function element(tag, value) {
    const node = document.createElement(tag);
    node.textContent = String(value);
    return node;
  }
  if (page === "index") {
    const target = document.getElementById("visit-overview");
    target.append(element("p", "Хаяг: " + info.info.address));
    target.append(element("p", "Утас: " + info.info.phone));
    target.append(element("p", info.info.note));
  }
  if (page === "hours") {
    const target = document.getElementById("hours-body");
    const index = (new Date().getDay() + 6) % 7;
    if (!info.hours.length) { target.appendChild(element("tr", "Мэдээлэл алга.")); return; }
    info.hours.forEach(function (item, number) {
      const row = document.createElement("tr");
      if (number === index) row.style.fontWeight = "bold";
      const th = element("th", item.day + (number === index ? " (өнөөдөр)" : ""));
      th.scope = "row";
      row.append(th, element("td", item.open), element("td", item.close));
      target.appendChild(row);
    });
  }
  if (page === "spaces") {
    const target = document.getElementById("visit-spaces");
    info.spaces.forEach(function (space) {
      const article = document.createElement("article");
      article.className = "project-tile";
      article.append(element("h3", space.name), element("p", "Жишиг багтаамж: " + space.capacity + " хүн"), element("p", space.purpose));
      target.appendChild(article);
    });
  }
  if (page === "access") {
    const target = document.getElementById("access-list");
    (info.accessQuestions || []).forEach(function (question) { target.appendChild(element("li", question)); });
    const form = document.getElementById("access-form");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      document.getElementById("access-answer").textContent =
        "Лавлах асуулт: " + form.elements.need.value + ". Энэ мэдээлэл серверт илгээгдээгүй.";
    });
  }
  if (page === "planner") {
    const form = document.getElementById("visit-plan-form");
    const dateInput = document.getElementById("plan-date");
    const today = new Date();
    const formatDate = function (d) {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    };
    dateInput.min = formatDate(today);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const date = dateInput.value;
      const guests = Number(form.elements.guests.value);
      const reason = document.getElementById("plan-reason").value;
      const result = document.getElementById("visit-plan-result");
      if (date < formatDate(new Date()) || guests < 1 || guests > 40) {
        result.textContent = "Өдөр, зочдын тоог дахин шалгана уу.";
        return;
      }
      const space = info.spaces.find(function (item) { return guests <= item.capacity; });
      result.textContent = date + " · " + guests + " зочин · " + reason +
        ". Санал болгох жишиг хэсэг: " + (space ? space.name : "Бүлгийн захиалгаар лавлах") +
        ". Энэ нь бодит захиалга биш.";
    });
  }
});
