let buuz = 0;
let huushuur = 0;

function updateResult() {
  let total = buuz + huushuur;
  let buuzPercent = 50;
  let huushuurPercent = 50;

  if (total > 0) {
    buuzPercent = Math.round(buuz / total * 100);
    huushuurPercent = 100 - buuzPercent;
  }

  document.getElementById("buuzCount").textContent = buuz;
  document.getElementById("huushuurCount").textContent = huushuur;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("buuzPercent").textContent = buuzPercent + "%";
  document.getElementById("huushuurPercent").textContent = huushuurPercent + "%";
  document.getElementById("buuzBar").style.width = buuzPercent + "%";
  document.getElementById("huushuurBar").style.width = huushuurPercent + "%";
}

document.getElementById("buuzButton").addEventListener("click", function () {
  buuz++;
  updateResult();
});

document.getElementById("huushuurButton").addEventListener("click", function () {
  huushuur++;
  updateResult();
});

document.getElementById("resetButton").addEventListener("click", function () {
  buuz = 0;
  huushuur = 0;
  updateResult();
});

updateResult();
