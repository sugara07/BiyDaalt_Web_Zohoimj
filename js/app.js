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
// ==========================================================================
// Хоолны карт эсвэл зураг дээр дарахад тусдаа цонх нээх ухаалаг функц
// ==========================================================================
document.addEventListener("DOMContentLoaded", function() {
    const foodModal = document.getElementById("foodModal");
    const closeModal = document.getElementById("closeModal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const modalPrice = document.getElementById("modalPrice");

    // Хоолны мэдээллийн сан
    const foodData = {
        buuz: { title: "Уламжлалт Монгол Бууз", img: "img/buuz.svg", price: "9,500", desc: "Гар аргаар татсан шинэхэн үхэр болон хонины махтай, дотроо халуун шүүстэй, ууранд жигнэж болгосон уламжлалт Монгол бууз. (5 ширхэг)" },
        khuushuur: { title: "Шүүслэг Халуун Хуушуур", img: "img/khuushuur.svg", price: "10,500", desc: "Амтлаж татсан үхрийн махыг нимгэн элдэж тосонд хайрсан халуун, шүүслэг амтат хуушуур. (3 ширхэг)" },
        tsuivan: { title: "Гэрийн Элдсэн Цуйван", img: "img/tsuivan.svg", price: "14,000", desc: "Гар аргаар элдэж ууранд жигнэж хэрчсэн гурил, халуун гал дээр шарсан шинэ мах, сонгино, ногоотой цуйван." },
        khorkhog: { title: "Торгон Шүүстэй Хорхог", img: "img/khorkhog.svg", price: "38,000", desc: "Улайсгасан чулуугаар битүү саванд жигнэж хийсэн уламжлалт тансаг зоог. Халуун чулуугаар гар амраахад тохиромжтой. (2-3 хүнд)" }
    };

    // Вэб хуудас дээрх БҮХ зургуудыг (img) барьж аваад дарах үйлдэл тохируулах
    document.querySelectorAll('img').forEach(img => {
        // Зөвхөн манай 4 хоолны зураг дээр хулгана очиход гар шиг дүрс гаргана
        let src = img.getAttribute('src') || '';
        if (src.includes('buuz') || src.includes('khuushuur') || src.includes('tsuivan') || src.includes('khorkhog')) {
            img.style.cursor = 'pointer';
            
            img.addEventListener('click', function(e) {
                e.preventDefault(); // Үндсэн линк, шилжилтийг зогсооно
                
                let key = '';
                if (src.includes('buuz')) key = 'buuz';
                else if (src.includes('khuushuur')) key = 'khuushuur';
                else if (src.includes('tsuivan')) key = 'tsuivan';
                else if (src.includes('khorkhog')) key = 'khorkhog';

                if (key && foodData[key]) {
                    modalImg.src = foodData[key].img;
                    modalTitle.innerText = foodData[key].title;
                    modalDescription.innerText = foodData[key].desc;
                    modalPrice.innerText = foodData[key].price;
                    
                    foodModal.style.display = "flex"; // Цонхыг нээх
                }
            });
        }
    });

    // (X) товчлуур дээр дарахад хаах
    if(closeModal) {
        closeModal.addEventListener('click', function() {
            foodModal.style.display = "none";
        });
    }

    // Цонхны гадна талын харанхуй дэвсгэр дээр дарахад хаагдах
    window.addEventListener('click', function(event) {
        if (event.target == foodModal) {
            foodModal.style.display = "none";
        }
    });
});
