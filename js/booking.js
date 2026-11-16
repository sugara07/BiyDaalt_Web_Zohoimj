"use strict";
// Гишүүн 3: ширээний захиалгын демо, сервер ашиглахгүй.
document.addEventListener("DOMContentLoaded", async function () {
  const page = document.body.dataset.page;
  const status = document.getElementById("data-status");
  status.dataset.state = "loading";
  let data;
  try {
    const response = await fetch("../data/booking.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    data = await response.json();
    if (!Array.isArray(data.areas) || !Array.isArray(data.faqs)) throw new Error("Өгөгдөл дутуу");
    if (!data.areas.length && !data.faqs.length) {
      status.dataset.state = "empty";
      status.textContent = "Өгөгдөл хоосон байна.";
      return;
    }
    status.dataset.state = "success";
    status.textContent = "Мэдээлэл амжилттай ачааллаа.";
  } catch (error) {
    status.dataset.state = "error";
    status.textContent = "Мэдээлэл ачаалахад алдаа гарлаа. Live Server ашиглаж дахин үзнэ үү.";
    return;
  }

  function appendParagraph(root, text) {
    const p = document.createElement("p");
    p.textContent = text;
    root.appendChild(p);
  }
  if (page === "index") {
    const target = document.getElementById("booking-summary");
    target.replaceChildren();
    data.areas.forEach(function (area) {
      const article = document.createElement("article");
      const heading = document.createElement("strong");
      heading.textContent = area.name + " · " + area.capacity + " хүн";
      article.append(heading);
      appendParagraph(article, area.desc);
      target.appendChild(article);
    });
  }
  if (page === "seating") {
    const container = document.getElementById("seat-options");
    const output = document.getElementById("seat-result");
    if (!data.areas.length) { output.textContent = "Суудлын мэдээлэл хоосон байна."; return; }
    data.areas.forEach(function (area) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "project-pick";
      button.setAttribute("aria-pressed", "false");
      button.textContent = area.name + " · " + area.capacity + " хүн — " + area.desc;
      button.addEventListener("click", function () {
        container.querySelectorAll("button").forEach(function (other) {
          other.setAttribute("aria-pressed", "false");
        });
        button.setAttribute("aria-pressed", "true");
        output.textContent = "Сонгосон хэсэг: " + area.name + ". Бодит сул суудлын баталгаа биш.";
      });
      container.appendChild(button);
    });
  }
  if (page === "group") {
    const form = document.getElementById("group-booking-form");
    const answer = document.getElementById("group-answer");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const count = Number(form.elements.count.value);
      const budget = Number(form.elements.budget.value);
      const type = form.elements.type.value;
      if (count < 5 || count > 80 || budget < 10000 || budget > 150000) {
        answer.textContent = "Өгөгдлийн хязгаарыг шалгана уу.";
        return;
      }
      answer.textContent = type + ": " + count + " зочин × " +
        budget.toLocaleString("en-US") + "₮ = " + (count * budget).toLocaleString("en-US") +
        "₮. Энэ бол зөвхөн төсвийн үржвэр, захиалга илгээгээгүй.";
    });
  }
  if (page === "manage") {
    const form = document.getElementById("manage-booking-form");
    const result = document.getElementById("manage-result");
    const removeButton = document.getElementById("manage-delete");
    let selectedId = null;
    function getBookings() {
      const records = JSON.parse(localStorage.getItem("restaurant_bookings") || "[]");
      if (!Array.isArray(records)) throw new Error("Мэдээлэл буруу байна.");
      return records;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      removeButton.hidden = true;
      selectedId = null;
      const id = form.elements.id.value.trim();
      if (!id) { result.textContent = "Дугаар оруулна уу."; return; }
      try {
        const item = getBookings().find(function (record) { return record.id === id; });
        if (!item) { result.textContent = "Энэ браузерт ийм дугаартай захиалга олдсонгүй."; return; }
        selectedId = id;
        result.textContent = "Дугаар: " + item.id + " · " + item.date + " " + item.time +
          " · " + item.guests + " зочин. Зөвхөн төхөөрөмжид байгаа демо бүртгэл.";
        removeButton.hidden = false;
      } catch (error) { result.textContent = "Хадгалсан мэдээллийг уншиж чадсангүй."; }
    });
    removeButton.addEventListener("click", function () {
      if (!selectedId || !window.confirm("Энэ браузер дахь сонгосон бүртгэлийг устгах уу?")) return;
      try {
        const remaining = getBookings().filter(function (item) { return item.id !== selectedId; });
        localStorage.setItem("restaurant_bookings", JSON.stringify(remaining));
        result.textContent = "Энэ төхөөрөмжийн демо бүртгэлийг устгалаа. Бодит захиалгад нөлөөлөхгүй.";
        removeButton.hidden = true;
        selectedId = null;
      } catch (error) { result.textContent = "Устгах үед алдаа гарлаа."; }
    });
  }
  if (page === "faq") {
    const input = document.getElementById("booking-faq-query");
    const target = document.getElementById("booking-faq-list");
    function drawFaq() {
      target.replaceChildren();
      const query = input.value.trim().toLowerCase();
      const rows = data.faqs.filter(function (item) {
        return (item.q + " " + item.a).toLowerCase().includes(query);
      });
      if (!rows.length) { appendParagraph(target, "Тохирох асуулт олдсонгүй."); return; }
      rows.forEach(function (item) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = item.q;
        details.append(summary);
        appendParagraph(details, item.a);
        target.append(details);
      });
    }
    input.addEventListener("input", drawFaq);
    drawFaq();
  }
});
