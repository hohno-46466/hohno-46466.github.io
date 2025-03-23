// No.005
let x = 0;
let currentColor;
let speed = 2;
let labelText = '';

function setup() {
  const container = document.getElementById("canvas-container");
  const w = container.clientWidth;
  const h = container.clientHeight;

  let canvas = createCanvas(w, h);
  canvas.parent("canvas-container");

  currentColor = color(255, 100, 100);

  // スライダーとその表示
  const slider = document.getElementById("speed-slider");
  const display = document.getElementById("speed-display");

  slider.addEventListener("input", () => {
    speed = Number(slider.value);
    display.textContent = slider.value;

    // セレクタ側の選択肢を自動で更新しない（独立制御）
  });

  // セレクタ（select）によるスピード制御
  const select = document.getElementById("speed-select");
  select.addEventListener("change", () => {
    speed = Number(select.value);
    slider.value = select.value; // スライダーも連動更新
    display.textContent = select.value;
  });

  // テキスト入力によるラベル更新
  const labelInput = document.getElementById("label-input");
  labelInput.addEventListener("input", () => {
    labelText = labelInput.value;
  });
}

function draw() {
  background(240);
  fill(currentColor);
  noStroke();
  ellipse(x, height / 2, 40, 40);
  x += speed;

  // ラベルを表示
  fill(0);
  textAlign(CENTER);
  text(labelText, width / 2, height - 10);

  if (x > width) x = 0;
}
