# Хөх тэнгэр — F.ITM202 веб хөгжүүлэлтийн багийн төсөл

Монгол уламжлалт хоолны тухай **6 гишүүний 30 үндсэн HTML хуудас** бүхий сургалтын веб төсөл. Жорын дэлгэрэнгүй `recipedelge.html` нь нэмэлт хуудас тул repository-д **31 HTML файл** байна. Бодит ресторан биш; үнэ, хаяг, утас, танхим, цаг, захиалга сургалтын жишээ.

## Нээх
1. Repository-г VS Code дээр нээнэ.
2. **Live Server** ашиглан `index.html`-ийг нээнэ. Эсвэл `python -m http.server 8000` ажиллуулаад `http://localhost:8000` хаягаар нээнэ.
3. JSON ачаалдаг учир `file://` протоколоор шууд нээхэд `fetch()` ажиллахгүй байж болно.
4. `sitemap.html`-ээс 30 үндсэн хуудас, нэмэлт жорын хуудсыг нээж болно.

## Гишүүн бүрийн 5 гол хуудас
| Чиглэл | 5 хуудас | JavaScript / JSON |
| --- | --- | --- |
| Нүүр (home-sugara) | `index.html`, `about.html`, `news.html`, `contact.html`, `sitemap.html` | `js/app.js`, `js/home-news.js`, `data/home-news.json` |
| Үйлчилгээ (services-amraa) | `services/index.html`, `delivery.html`, `catering.html`, `offers.html`, `feedback.html` | `js/services.js`, `js/services-data.js`, `data/service-guide.json` |
| Захиалга (booking-javkhlantugs) | `booking/index.html`, `seating.html`, `group.html`, `manage.html`, `faq.html` | `js/booking.js`, `data/booking.json` |
| Цэс (PR #5 · Davkharbayr) | `menu/index.html`, `dish.html`, `compare.html`, `ingredients.html`, `sets.html` | `js/menu.js`, `data/menu.json` |
| Зочлох (visit-javhaa) | `visit/index.html`, `hours.html`, `spaces.html`, `access.html`, `planner.html` | `js/visit.js`, `data/visit.json` |
| Соёл (sarangerelbatmunkh089-web) | `cultureint.html`, `cooking.html`, `recipe.html`, `media.html`, `terminology.html` | `js/culture.js`, `data/culture.json` |
Нэмэлт: `recipedelge.html` — жорын дэлгэрэнгүй.

Гишүүдийн нэр, оюутны код болон хуудасны хариуцлагыг `docs/team-responsibilities.md`-д баталгаажуулах шаардлагатай.

## Бүтэц ба технологи
- HTML5, CSS3, Vanilla JavaScript ашиглан боловсруулсан. React, Bootstrap, jQuery, Font Awesome зэрэг бэлэн UI сан ашиглахгүй.
- Нийтлэг `css/style.css`, үйлчилгээний `css/services.css`, бусад бүлгийн `css/project.css`, холбогч `css/project-bridge.css`, цэсийн `css/menu.css`, соёлын `css/buuz.css`.
- Бүлгүүдийн JSON өгөгдөл `fetch()`-ээр ачаалагддаг; UI-д loading/success/empty/error үеийг ялгана.
- Responsive media queries; `@keyframes`, transition, хөдөлгөөн багасгах тохиргоо.
- `restaurant_bookings` нь зөвхөн тухайн браузерын localStorage дахь демо захиалга; бодит ресторан руу мэдээлэл илгээхгүй. Цэсийн хайлт, харьцуулалт нь JSON файлаас ачаалдаг.

## Шалгалт ба өгөгдөл
- Файлын холбоос, JS синтакс, JSON бүтцийг шалгах: `node tests/check-site.mjs` (npm install шаардлагагүй).
- 360px, 768px, 1280px өргөнд браузерын туршилт хийж, screenshot болон үр дүнг `docs/test-checklist.md`-д бүртгэхээр төлөвлөсөн.
- `docs/change-log.md` — багийн өөрчлөлт, `docs/research-sources.md` — судалгааны холбоос.
- **Бие даалт 1**: `submission/phase1-static` — 30 үндсэн HTML/CSS-only хувилбарыг тусад нь хадгалах зорилготой. **Бие даалт 2**: `main` — интерактив хувилбар.
