"use strict";
/*
  Үйлчилгээний хуудсуудын демо логик.
  Бүх маягт зөвхөн хөтөч дээр ажиллана — сервер рүү мэдээлэл илгээхгүй.
*/
(() => {
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* ---------- Туслах функцууд ---------- */
  const todayValue = () => {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-");
  };

  const showResult = (box, title, rows, note, isError = false) => {
    if (!box) return;
    const nodes = [];
    const heading = document.createElement("h3");
    heading.textContent = title;
    nodes.push(heading);

    for (const [label, value] of rows) {
      const line = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = label + ": ";
      line.append(strong, document.createTextNode(value === "" || value == null ? "—" : String(value)));
      nodes.push(line);
    }

    if (note) {
      const line = document.createElement("p");
      line.className = "result-note";
      line.textContent = note;
      nodes.push(line);
    }

    box.classList.toggle("is-error", isError);
    box.replaceChildren(...nodes);
    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        /* Доорх хуучин арга руу шилжинэ. */
      }
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    area.remove();
    return copied;
  };

  /* ---------- Огнооны доод хязгаар ---------- */
  const minDate = todayValue();
  qsa('input[type="date"][data-today-min]').forEach((input) => {
    input.min = minDate;
    input.addEventListener("input", () => input.setCustomValidity(""));
  });

  /* ---------- Хүргэлтийн бүс шалгах ---------- */
  const ZONES = {
    "Сүхбаатар дүүрэг": { zone: "I бүс", fee: "3,000₮", min: "25,000₮", time: "30–40 мин", free: true },
    "Чингэлтэй дүүрэг": { zone: "I бүс", fee: "3,000₮", min: "25,000₮", time: "30–40 мин", free: true },
    "Баянзүрх дүүрэг (1–5 хороо)": { zone: "II бүс", fee: "5,000₮", min: "30,000₮", time: "40–55 мин", free: true },
    "Хан-Уул дүүрэг": { zone: "II бүс", fee: "5,000₮", min: "30,000₮", time: "40–55 мин", free: true },
    "Баянзүрх дүүрэг (6–15 хороо)": { zone: "III бүс", fee: "7,000₮", min: "35,000₮", time: "55–70 мин", free: false },
    "Сонгинохайрхан дүүрэг": { zone: "III бүс", fee: "7,000₮", min: "35,000₮", time: "55–70 мин", free: false },
    "Налайх дүүрэг": { zone: "IV бүс", fee: "Тохиролцоно", min: "50,000₮", time: "60–90 мин", free: false },
    "Багануур дүүрэг": { zone: "IV бүс", fee: "Тохиролцоно", min: "50,000₮", time: "60–90 мин", free: false }
  };

  const zoneForm = document.getElementById("zone-form");
  const zoneResult = document.getElementById("zone-result");

  if (zoneForm && zoneResult) {
    const zoneSelect = zoneForm.querySelector('select[name="zone"]');

    zoneForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!zoneForm.reportValidity()) return;

      const data = ZONES[zoneSelect.value];
      if (!data) {
        showResult(
          zoneResult,
          "Бүс олдсонгүй",
          [["Сонгосон дүүрэг", zoneSelect.value]],
          "Дүүргээ дахин сонгоно уу.",
          true
        );
        return;
      }

      const freeNote = data.free
        ? "80,000₮-өөс дээш захиалгад энэ бүсэд хүргэлт үнэгүй."
        : "Энэ бүсэд үнэгүй хүргэлтийн нөхцөл үйлчлэхгүй.";

      showResult(
        zoneResult,
        data.zone + " — " + zoneSelect.value,
        [
          ["Хүргэлтийн төлбөр", data.fee],
          ["Захиалгын доод дүн", data.min],
          ["Хүлээгдэх хугацаа", data.time]
        ],
        freeNote + " Хугацаа нь цаг агаар, замын нөхцөлөөс хамаарч өөрчлөгдөж болно."
      );
    });

    zoneSelect.addEventListener("change", () => {
      zoneResult.hidden = true;
    });
  }

  /* ---------- Арга хэмжээний хүсэлтийн маягт ---------- */
  const cateringForm = document.getElementById("catering-form");
  const cateringResult = document.getElementById("catering-result");

  if (cateringForm && cateringResult) {
    const dateInput = cateringForm.querySelector('input[name="date"]');
    dateInput.addEventListener("input", () => dateInput.setCustomValidity(""));

    cateringForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (dateInput.value && dateInput.value < minDate) {
        dateInput.setCustomValidity("Өнөөдрөөс өмнөх огноо сонгох боломжгүй.");
        dateInput.reportValidity();
        return;
      }
      dateInput.setCustomValidity("");
      if (!cateringForm.reportValidity()) return;

      const data = new FormData(cateringForm);
      const diets = data.getAll("diet[]");
      const budget = data.get("budget");

      showResult(
        cateringResult,
        "✓ Хүсэлтийн тойм (демо)",
        [
          ["Нэр", data.get("name")],
          ["Утас", data.get("phone")],
          ["И-мэйл", data.get("email")],
          ["Байгууллага", data.get("company") || "Байхгүй"],
          ["Арга хэмжээ", data.get("eventType")],
          ["Огноо", data.get("date")],
          ["Эхлэх цаг", data.get("time")],
          ["Зочдын тоо", data.get("guests")],
          ["Байршил", data.get("venue")],
          ["Үйлчилгээний хэлбэр", data.get("serviceStyle")],
          ["Хоолны чиглэл", diets.length ? diets.join(", ") : "Сонгоогүй"],
          ["Төсөв", budget === "Зөвлөлдөх" ? "Зөвлөлдөх" : budget],
          ["Нэмэлт тайлбар", data.get("note") || "Байхгүй"]
        ],
        "Энэ мэдээллийг серверт илгээгээгүй, хадгалаагүй. Хүсэлт бодитоор бүртгэгдээгүй."
      );
    });
  }

  /* ---------- Купон код ---------- */
  const COUPONS = {
    BUUZ10: {
      title: "Бүх захиалгад 10% хямдрал",
      condition: "30,000₮-өөс дээш захиалгад",
      expiry: "2026.12.31"
    },
    FREEDEL: {
      title: "Хүргэлтийн төлбөр үнэгүй",
      condition: "I–III бүсэд 50,000₮-өөс дээш захиалгад",
      expiry: "2026.11.30"
    },
    EVENT20: {
      title: "Арга хэмжээний захиалгад 20% хямдрал",
      condition: "50-аас дээш зочны арга хэмжээнд",
      expiry: "2026.12.15"
    },
    FIRST5: {
      title: "Шинэ хэрэглэгчийн 5,000₮ бонус",
      condition: "Анхны захиалга 20,000₮-өөс дээш бол",
      expiry: "2026.12.31"
    }
  };

  const couponForm = document.getElementById("coupon-form");
  const couponResult = document.getElementById("coupon-result");

  if (couponForm && couponResult) {
    const codeInput = couponForm.querySelector('input[name="code"]');

    codeInput.addEventListener("input", () => {
      codeInput.value = codeInput.value.toUpperCase().replace(/\s+/g, "");
      codeInput.setCustomValidity("");
    });

    couponForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!couponForm.reportValidity()) return;

      const code = codeInput.value.trim().toUpperCase();
      const coupon = COUPONS[code];

      if (!coupon) {
        showResult(
          couponResult,
          "Купон код хүчингүй",
          [["Оруулсан код", code || "—"]],
          "Код буруу эсвэл хугацаа дууссан байна. Дээрх купонуудаас кодоо хуулж аваад дахин оролдоно уу.",
          true
        );
        return;
      }

      showResult(
        couponResult,
        "✓ Купон идэвхтэй",
        [
          ["Код", code],
          ["Урамшуулал", coupon.title],
          ["Нөхцөл", coupon.condition],
          ["Хүчинтэй хугацаа", coupon.expiry]
        ],
        "Код нь сургалтын демо. Бодит захиалгад ашиглагдахгүй."
      );
    });

    qsa(".copy-btn").forEach((button) => {
      const original = button.textContent;
      button.addEventListener("click", async () => {
        const code = button.dataset.code || "";
        const copied = await copyText(code);
        button.textContent = copied ? "Хуулагдлаа ✓" : "Код: " + code;
        button.classList.toggle("is-done", copied);
        clearTimeout(button._timer);
        button._timer = setTimeout(() => {
          button.textContent = original;
          button.classList.remove("is-done");
        }, 2200);
      });
    });
  }

  /* ---------- Одны үнэлгээ ---------- */
  qsa(".rating").forEach((group) => {
    const valueLabel = group.closest(".rating-group")?.querySelector(".rg-value");
    group.addEventListener("change", () => {
      const checked = group.querySelector("input:checked");
      group.dataset.value = checked ? checked.value : "0";
      if (valueLabel) {
        valueLabel.textContent = checked ? checked.value + " / 5" : "Сонгоогүй";
      }
    });
  });

  /* ---------- Санал хүсэлтийн маягт ---------- */
  const feedbackForm = document.getElementById("feedback-form");
  const feedbackResult = document.getElementById("feedback-result");

  if (feedbackForm && feedbackResult) {
    const starText = (value) => {
      const count = Number(value) || 0;
      return count
        ? count + " / 5  " + "★".repeat(count) + "☆".repeat(5 - count)
        : "Өгөөгүй";
    };

    feedbackForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!feedbackForm.reportValidity()) return;

      const data = new FormData(feedbackForm);
      showResult(
        feedbackResult,
        "✓ Үнэлгээний тойм (демо)",
        [
          ["Хоолны амт", starText(data.get("taste"))],
          ["Хүргэлтийн хурд", starText(data.get("speed"))],
          ["Үйлчилгээний соёл", starText(data.get("service"))],
          ["Төрөл", data.get("type")],
          ["Захиалгын дугаар", data.get("order") || "Байхгүй"],
          ["Нэр", data.get("name")],
          ["И-мэйл", data.get("email")],
          ["Утас", data.get("phone") || "Байхгүй"],
          ["Дахин захиалах", data.get("recommend")],
          ["Сэтгэгдэл", data.get("message")]
        ],
        "Энэ мэдээллийг серверт илгээгээгүй, хадгалаагүй. Маягт бодитоор бүртгэгдээгүй."
      );
    });
  }
})();
