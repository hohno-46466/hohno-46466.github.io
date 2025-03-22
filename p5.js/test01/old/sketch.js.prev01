let currentColor;
let x = 0;

function setup() {
  const container = document.getElementById("canvas-container");
  const w = container.clientWidth;
  const h = container.clientHeight;

  let canvas = createCanvas(w, h);
  canvas.parent("canvas-container");

  currentColor = color(255, 0, 0); // 初期色：赤

  // ボタンのクリックイベント設定
  const btn = document.getElementById("change-color-btn");
  btn.addEventListener("click", () => {
    // ランダムな色に変更
    currentColor = color(random(255), random(255), random(255));
  });
}

function draw() {
  background(240);
  fill(currentColor);
  noStroke();
  ellipse(x, height / 2, 40, 40);
  x += 2;
  if (x > width) x = 0;
}
