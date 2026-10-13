"use strict";
(() => {
  const form = document.getElementById("booking-form");
  const dateInput = document.getElementById("booking-date");
  const result = document.getElementById("booking-result");
  if (!form || !dateInput || !result) return;

  // Set the minimum date in the visitor's own local timezone.
  const today = new Date();
  const currentDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
  dateInput.min = currentDate;
  dateInput.addEventListener("input", () => dateInput.setCustomValidity(""));

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // No backend: never claim the booking was sent.
    if (dateInput.value < currentDate) {
      dateInput.setCustomValidity("Өнөөдрөөс өмнөх огноо сонгох боломжгүй.");
      dateInput.reportValidity();
      return;
    }
    dateInput.setCustomValidity("");
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const heading = document.createElement("h3");
    heading.textContent = "✓ Мэдээллийн тойм (демо)";
    const rows = [
      ["Нэр", data.get("name")],
      ["Утас", data.get("phone")],
      ["Огноо", data.get("date")],
      ["Цаг", data.get("time")],
      ["Хүний тоо", data.get("guests")],
      ["Суудал", data.get("zone")],
      ["Төрсөн өдөр", data.has("bday") ? "Тийм" : "Үгүй"],
      ["Нэмэлт хүсэлт", data.get("note") || "Байхгүй"]
    ];
    const nodes = [heading];
    for (const [label, value] of rows) {
      const line = document.createElement("p");
      line.textContent = label + ": " + value;
      nodes.push(line);
    }
    const note = document.createElement("p");
    note.textContent = "Энэ мэдээллийг серверт илгээгээгүй, хадгалаагүй. Захиалга баталгаажаагүй.";
    const strong = document.createElement("strong");
    strong.textContent = note.textContent;
    note.replaceChildren(strong);
    nodes.push(note);
    result.replaceChildren(...nodes);
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
})();