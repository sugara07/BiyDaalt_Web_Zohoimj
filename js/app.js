
"use strict";

(() => {
    const form = document.getElementById("booking-form");
    const dateInput = document.getElementById("booking-date");
    const result = document.getElementById("booking-result");
    const menu = document.getElementById("menu");
    const submitButton = form?.querySelector('button[type="submit"]');

    if (!submitButton || !dateInput || !result || !menu) return;

    const STORAGE_KEY = "restaurant_bookings";

    let bookingId = null;
    let menuReady = false;
    let cart;
    let cartList;
    let totalLabel;
    let message;

    const foods = [];

    // Өнөөдрийн огноо
    function getToday() {
        const d = new Date();

        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0")
        ].join("-");
    }

    dateInput.min = getToday();

    // Мөнгөний формат
    function money(value) {
        return value.toLocaleString("en-US") + "₮";
    }

    // Захиалгыг браузерт хадгалах
    function readBookings() {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(data)) {
            throw new Error("Хадгалсан мэдээлэл буруу байна.");
        }

        return data;
    }

    // Хоолны тоо ширхэг сонгох товч
    function addFood(parent, name, price) {
        const food = {
            name: name,
            price: price,
            quantity: 0
        };

        const box = document.createElement("div");
        box.style.cssText =
            "display:flex;align-items:center;gap:12px;margin:12px 0;";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.setAttribute("aria-label", name + " хасах");

        const count = document.createElement("strong");
        count.textContent = "0";

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute("aria-label", name + " нэмэх");

        [minus, plus].forEach(btn => {
            btn.style.cssText =
                "padding:7px 14px;cursor:pointer;" +
                "border:1px solid #ccc;border-radius:8px;";
        });

        minus.addEventListener("click", () => {
            if (food.quantity > 0) {
                food.quantity--;
                count.textContent = food.quantity;
                updateCart();
            }
        });

        plus.addEventListener("click", () => {
            if (food.quantity < 20) {
                food.quantity++;
                count.textContent = food.quantity;
                updateCart();
            }
        });

        box.append(minus, count, plus);
        parent.appendChild(box);

        food.counter = count;
        foods.push(food);
    }

    // Хоолны цэсийг захиалгатай холбох
    function prepareMenu() {
        if (menuReady) return;

        // Бууз, хуушуур, цуйван, хорхог
        document.querySelectorAll("#menu .food-card")
            .forEach(card => {

                const name = card.querySelector(
                    "figcaption span:first-child"
                ).textContent.trim();

                const priceText = card.querySelector(
                    ".price"
                ).textContent;

                const price = Number(
                    priceText.replace(/[^\d]/g, "")
                );

                addFood(card, name, price);
            });

        // Ундаа, шөл, амттан
        const table = document.querySelector(
            "#menu .more-menu table"
        );

        if (table) {
            const heading = document.createElement("th");
            heading.textContent = "Захиалах";
            heading.scope = "col";

            table.querySelector("thead tr").appendChild(heading);

            table.querySelectorAll("tbody tr").forEach(row => {
                const cells = row.querySelectorAll("td");

                const name = cells[0].textContent.trim();
                const price = Number(
                    cells[2].textContent.replace(/[^\d]/g, "")
                );

                const cell = document.createElement("td");
                row.appendChild(cell);

                addFood(cell, name, price);
            });
        }

        // Сагсны хэсэг
        cart = document.createElement("div");
        cart.style.cssText =
            "padding:25px;margin-top:30px;" +
            "border:1px solid #ddd;border-radius:15px;";

        const title = document.createElement("h2");
        title.textContent = "Таны хоолны захиалга";

        cartList = document.createElement("div");

        totalLabel = document.createElement("h3");
        totalLabel.textContent = "Нийт үнэ: 0₮";

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.className = "btn";
        saveButton.textContent = "Хоолны захиалга хадгалах";

        message = document.createElement("p");
        message.setAttribute("role", "status");

        cart.append(
            title,
            cartList,
            totalLabel,
            saveButton,
            message
        );

        const wrap = menu.querySelector(".wrap") || menu;
        wrap.appendChild(cart);

        saveButton.addEventListener("click", saveFoodOrder);

        menuReady = true;
    }

    // Нийт үнэ бодох
    function updateCart() {
        let total = 0;

        cartList.replaceChildren();

        foods.forEach(food => {
            if (food.quantity > 0) {
                const subtotal = food.price * food.quantity;
                total += subtotal;

                const line = document.createElement("p");

                line.textContent =
                    food.name + " x " + food.quantity +
                    " = " + money(subtotal);

                cartList.appendChild(line);
            }
        });

        if (total === 0) {
            cartList.textContent = "Хоол сонгоогүй байна.";
        }

        totalLabel.textContent = "Нийт үнэ: " + money(total);

        return total;
    }

    // Ширээ захиалах
    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const data = new FormData(form);
        const name = data.get("name").trim();
        const phone = data.get("phone").trim();

        result.hidden = false;
        if (name.length < 2 || phone.replace(/[^0-9]/g, "").length < 6) {
            result.textContent = "Жишээ нэрээ бүтэн оруулж, утсандаа дор хаяж 6 цифр бичнэ үү.";
            return;
        }

        const selectedDate = new Date(
            data.get("date") + "T" + data.get("time")
        );

        if (Number.isNaN(selectedDate.getTime()) ||
            selectedDate <= new Date()) {
            result.textContent = "Ирээдүйн огноо, цаг сонгоно уу.";
            return;
        }

        const id = Date.now().toString(36) +
            Math.random().toString(36).slice(2, 7);

        const booking = {
            id: id,
            name: name,
            phone: phone,
            date: data.get("date"),
            time: data.get("time"),
            guests: data.get("guests"),
            zone: data.get("zone"),
            birthday: data.has("bday"),
            note: data.get("note") || "",
            foods: [],
            total: 0
        };

        try {
            const bookings = readBookings();
            bookings.push(booking);

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(bookings)
            );

        } catch (error) {
            result.textContent = "Демо захиалгыг браузерт хадгалж чадсангүй.";
            return;
        }

        bookingId = id;

        result.textContent =
            "Демо захиалга энэ браузерт хадгалагдлаа. " +
            "Дугаар: #" + id +
            ". Одоо хоолоо сонгоно уу.";
        const lookupLink = document.createElement("a");
        lookupLink.href = "booking/manage.html?id=" + encodeURIComponent(id);
        lookupLink.textContent = "Энэ захиалгыг шалгах";
        result.append(" ", lookupLink);

        prepareMenu();

        // Өмнөх сонголтуудыг цэвэрлэх
        foods.forEach(food => {
            food.quantity = 0;
            food.counter.textContent = "0";
        });

        message.textContent = "";
        updateCart();

        // Хоолны цэс рүү шилжих
        menu.scrollIntoView();
    });
    submitButton.disabled = false;

    // Хоолны захиалгыг хадгалах
    function saveFoodOrder() {
        if (!bookingId) return;

        const selected = foods
            .filter(food => food.quantity > 0)
            .map(food => ({
                name: food.name,
                price: food.price,
                quantity: food.quantity
            }));

        if (selected.length === 0) {
            message.textContent = "Эхлээд хоолоо сонгоно уу.";
            return;
        }

        try {
            const bookings = readBookings();

            const booking = bookings.find(
                b => b.id === bookingId
            );

            if (!booking) {
                throw new Error("Ширээний захиалга олдсонгүй.");
            }

            booking.foods = selected;
            booking.total = updateCart();

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(bookings)
            );

            message.textContent =
                "Хоолны сонголт энэ браузерт хадгалагдлаа. " +
                "Нийт: " + money(booking.total);

        } catch (error) {
            message.textContent =
                "Алдаа: " + error.message;
        }
    }
})();

// Холбоо барих маягтын HTML шалгалтыг браузер дээр туршина.
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const subject = contactForm.elements.subject.value;
        const result = document.getElementById("contact-result");
        result.textContent = subject + " сэдвийн маягт шалгагдлаа. Таны бичсэн мэдээллийг энэ хуудсанд хадгалаагүй.";
    });
    contactForm.querySelector('button[type="submit"]').disabled = false;
}


// Хоолны зургийг дарахад дэлгэрэнгүй мэдээлэл харуулах
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("foodModal");
    const closeButton = document.getElementById("closeModal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const modalPrice = document.getElementById("modalPrice");

    if (!modal || !closeButton) return;

    const details = {
        buuz: "Үхэр, хонины мах, сонгиноор амталж, ууранд жигнэсэн уламжлалт бууз. 5 ширхэг.",
        khuushuur: "Нимгэн элдсэн гурилд амталсан мах хийж, тосонд шарсан шүүслэг хуушуур. 3 ширхэг.",
        tsuivan: "Гар аргаар элдсэн гурил, мах, сонгино, ногоотой цуйван.",
        khorkhog: "Халуун чулуу ашиглан битүү саванд болгосон хонины махтай хорхог. 2–3 хүнд."
    };

    let previousFocus = null;

    function openFood(card, image, key) {
        previousFocus = document.activeElement;
        modalImg.src = image.getAttribute("src");
        modalImg.alt = image.alt;
        modalTitle.textContent = card.querySelector("figcaption span").textContent.trim();
        modalDescription.textContent = details[key];
        modalPrice.textContent = card.querySelector(".price").textContent.trim();
        modal.hidden = false;
        closeButton.focus();
    }

    function closeFood() {
        modal.hidden = true;
        if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }
    }

    document.querySelectorAll("#menu .food-card").forEach(function (card) {
        const image = card.querySelector("img");
        if (!image) return;
        const match = image.getAttribute("src").match(/\/(buuz|khuushuur|tsuivan|khorkhog)\.svg$/);
        if (!match) return;
        const key = match[1];

        image.style.cursor = "pointer";
        image.addEventListener("click", function () {
            openFood(card, image, key);
        });

        // Гараас удирдахад зориулсан товч
        const button = document.createElement("button");
        button.type = "button";
        button.className = "food-detail-btn";
        button.textContent = "Дэлгэрэнгүй харах";
        button.addEventListener("click", function () {
            openFood(card, image, key);
        });
        card.querySelector("p").after(button);
    });

    closeButton.addEventListener("click", closeFood);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) closeFood();
    });

    document.addEventListener("keydown", function (event) {
        if (modal.hidden) return;
        if (event.key === "Escape") closeFood();
        if (event.key === "Tab") {
            event.preventDefault();
            closeButton.focus();
        }
    });
});
