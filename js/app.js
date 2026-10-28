
"use strict";

(() => {
    const form = document.getElementById("booking-form");
    const dateInput = document.getElementById("booking-date");
    const result = document.getElementById("booking-result");
    const menu = document.getElementById("menu");

    if (!form || !dateInput || !result || !menu) return;

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

        const count = document.createElement("strong");
        count.textContent = "0";

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";

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

        const selectedDate = new Date(
            data.get("date") + "T" + data.get("time")
        );

        if (Number.isNaN(selectedDate.getTime()) ||
            selectedDate <= new Date()) {
            alert("Ирээдүйн огноо, цаг сонгоно уу.");
            return;
        }

        const id = Date.now().toString(36) +
            Math.random().toString(36).slice(2, 7);

        const booking = {
            id: id,
            name: data.get("name"),
            phone: data.get("phone"),
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
            alert("Хадгалахад алдаа гарлаа: " + error.message);
            return;
        }

        bookingId = id;

        result.hidden = false;
        result.textContent =
            "Ширээний захиалгын хүсэлт хадгалагдлаа! " +
            "Дугаар: #" + id +
            ". Одоо хоолоо сонгоно уу.";

        prepareMenu();

        // Өмнөх сонголтуудыг цэвэрлэх
        foods.forEach(food => {
            food.quantity = 0;
            food.counter.textContent = "0";
        });

        message.textContent = "";
        updateCart();

        // Хоолны цэс рүү шилжих
        menu.scrollIntoView({
            behavior: "smooth"
        });
    });

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
                "✓ Хоолны захиалга хадгалагдлаа! " +
                "Нийт: " + money(booking.total);

        } catch (error) {
            message.textContent =
                "Алдаа: " + error.message;
        }
    }
})();
