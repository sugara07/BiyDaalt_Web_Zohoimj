# Лабораторийн ажил 4 — CSS хөдөлгөөн

- Хичээл: F.ITM202 Веб хөгжүүлэлт
- Баг: Хөх тэнгэр
- Оюутан: А.Сугар-Очир (B252270076)
- Хариуцсан хуудас: `news.html`
- CSS: `css/lab4-animation.css`
- Салбар: `feature/home-sugara`

## Зорилго
Хоол хүргэлтийн аяллын жишээ дүрслэлээр ойр ба холын хөдөлгөөн, өдөр шөнийн мөчлөгийг үзүүлнэ. Энэ нь бодит хүргэлт хянах систем биш.

## Хөдөлгөөн
| Элемент | Keyframes | Хугацаа |
| --- | --- | --- |
| Тэнгэр | lab4DayNight | 16s, 1s delay |
| Нар, сар, од | lab4Sun, lab4Night | 16s, 1s delay |
| Уулс | lab4Move | 24s |
| Мод, замын зураас | lab4Move | 6s |
| Машин | lab4Drive | 0.65s |

Давхаргууд ижил зайг өөр хугацаанд туулна. Ойрын давхарга дөрөв дахин хурдан. HTML/CSS ашигласан, үндсэн хөдөлгөөнд JavaScript шаардлагагүй. Checkbox ашиглан animation-play-state-ийг paused болгоно. Hover/focus transition, 768px/480px media query, prefers-reduced-motion дэмжинэ.

## Ажиллуулах
Repository-г VS Code дээр нээж news.html дээр Open with Live Server сонгоно. Хамгаалалтад хугацааны утгыг өөрчилж, checkbox, Tab, жижиг дэлгэц, reduced motion-ийг туршина.

## Эх сурвалж
- https://www.w3schools.com/css/css3_animations.asp
- https://www.w3schools.com/css/css3_transitions.asp
- https://www.w3schools.com/css/css3_2dtransforms.asp
- https://www.w3schools.com/css/css_rwd_mediaqueries.asp

Шалгалтын дараа main-ийн шинэ news.html-д зөвхөн Lab 4-ийн section, CSS холбоос, lab4-updates id-г нэгтгэж, бусад JS/JSON болон нийтлэг CSS-г хэвээр үлдээнэ.
