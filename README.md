# Хөх тэнгэр — F.ITM202 веб хөгжүүлэлт

Энэ бол **6 гишүүн × 5 хуудас = 30 HTML хуудастай** Монгол хоолны сэдэвт сургалтын веб төсөл. **Бодит ресторан биш.** Хаяг, үнэ, хүргэлт, ажиллах цаг, суудал, жорын хэмжээ нь жишиг бөгөөд сервертэй холбогдсон бодит үйлчилгээ байхгүй.

## Ажиллуулах
1. GitHub repository-г `git clone` хийж VS Code дээр нээнэ.
2. VS Code-ийн **Live Server**-ээр `index.html`-ийг нээнэ. Эсвэл `python -m http.server 8000` ажиллуулаад `http://localhost:8000` хаягаар орно.
3. **file:// гэж шууд нээхгүй** — `fetch()`-ээр JSON файлууд ачаалдаг тул HTTP сервер хэрэгтэй.
4. Нүүр хуудасны "Багийн зургаан хэсэг" холбоосоор бүх хуудсанд орж болно. `sitemap.html` дээр бүх 30 хуудасны жагсаалт бий.

## 6 хүний үүрэг
| Гишүүн / холбоотой branch | Хариуцах 5 хуудас | JS / JSON |
| --- | --- | --- |
| 1 · home-sugara | index, about, news, contact, sitemap | js/home-news.js, data/home-news.json, хуучин js/app.js |
| 2 · services-amraa | services/index, delivery, catering, offers, feedback | js/services.js, js/services-data.js, data/service-guide.json |
| 3 · booking-javkhlantugs | booking/index, seating, group, manage, faq | js/booking.js, data/booking.json |
| 4 · menu-davkhar | menu/index, compare, ingredients, favorites, seasonal | js/menu.js, data/menu.json |
| 5 · visit-javhaa | visit/index, hours, spaces, access, planner | js/visit.js, data/visit.json |
| 6 · culture-sarka | culture/index, recipes, sourcing, etiquette, stories | js/culture.js, data/culture.json |

Бүтцийн дэлгэрэнгүй, хариуцлагын баталгаажуулалт: [docs/team-responsibilities.md](docs/team-responsibilities.md).

## HTML / CSS / JavaScript
- **HTML5, CSS3, Vanilla JavaScript**; Bootstrap, React, jQuery зэрэг UI framework ашиглаагүй.
- CSS: `css/style.css`, `css/services.css`, `css/project.css`, `css/project-bridge.css`.
- Responsive: утас / таблет / компьютерийн breakpoint болон уян хатан Flexbox/Grid.
- Хөдөлгөөн: CSS `transition` ба `@keyframes`; хөдөлгөөн багасгах тохиргоотой.
- AJAX + JSON: бүлэг тус бүр `fetch()`-ээр төслийн `data/*.json` файлуудыг уншина. Ачаалж буй, амжилттай, хоосон, алдаатай төлөвийг ялгана.
- `localStorage`: ширээний захиалгын жишээ, дуртай хоолын сонголтыг **зөвхөн тухайн браузер** хадгална.

## Чухал хязгаарлалт
`Ширээ захиалах`, `хадгалах`, `захиалга шалгах` гэсэн үйлдэл нь **сургалтын демо**. Бодит ресторан, төлбөр, серверийн баталгаат бүртгэлтэй холбогдоогүй. Хоолны аллерген, жор, байршлын жишээ нь бодит зөвлөгөө эсвэл үйлчилгээний баталгаа биш.

## Үе шат / Нотолгоо
- **Бие даалт 1**: JS холбохгүй HTML/CSS хувилбарыг `submission/phase1-static` branch-д тусад нь хадгална.
- **Бие даалт 2**: `main` branch — интерактив HTML/CSS/JS/JSON.
- [docs/test-checklist.md](docs/test-checklist.md) — бодитоор бөглөх туршилтын хүснэгт.
- [docs/change-log.md](docs/change-log.md) — өөрчлөлтийн бүртгэл.
- [docs/research-sources.md](docs/research-sources.md) — судалгааны эх сурвалж.

## Хувийн ажил ба AI
Энэ 30 хуудасны өргөтгөлд AI туслах хэрэгсэл ашигласан. Branch нэр нь эцсийн хувийн авторшипыг батлахгүй. Гишүүн тус бүр өөрийн кодыг уншиж тайлбарлаж, шаардлагатай засвар хийж, туршилт нотолгоогоо өөрөө бүрдүүлнэ. Бусдын кодыг өөрийн бие даасан лаборатори гэж танилцуулж болохгүй.
