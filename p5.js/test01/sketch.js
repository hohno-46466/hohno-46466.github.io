let x = 0;
let currentColor;
let speed = 2;

function setup() {
  const container = document.getElementById("canvas-container");
  const w = container.clientWidth;
  const h = container.clientHeight;

  let canvas = createCanvas(w, h);
  canvas.parent("canvas-container");

  currentColor = color(255, 0, 0); // 初期色：赤

  // ボタンのクリックイベント
  document.getElementById("change-color-btn").addEventListener("click", () => {
    currentColor = color(random(255), random(255), random(255));
  });

  // フォームの入力イベント
  document.getElementById("speed-input").addEventListener("input", (event) => {
    speed = Number(event.target.value);
  });
}

function draw() {
  background(240);
  fill(currentColor);
  noStroke();
  ellipse(x, height / 2, 40, 40);
  x += speed;
  if (x > width) x = 0;
}
