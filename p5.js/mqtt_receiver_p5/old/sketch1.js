// sketch.js
function draw() {
  background(240);
  for (let i = 0; i < Ngauges; i++) {
    drawGauge(i);
  }
}

function drawGauge(i) {
  const cx = width / Ngauges * (i + 0.5);
  const cy = height / 2;
  const radius = 60;
  const arcSize = PI; // half circle

  const min = POTmin[i];
  const max = POTmax[i];
  const val = POTval[i];

  if (max === min) {
    drawGaugeOutline(cx, cy, radius, arcSize, color(150), 0);
    return;
  }

  let normVal = (val - min) / (max - min);
  normVal = constrain(normVal, 0, 1);
  let angle = normVal * arcSize;

  drawGaugeOutline(cx, cy, radius, arcSize, color(0, 128, 255), angle);

  fill(0);
  noStroke();
  textSize(12);
  text(`val=${val}`, cx, cy + radius + 12);
  text(`min=${min}`, cx, cy + radius + 28);
  text(`max=${max}`, cx, cy + radius + 44);
}

function drawGaugeOutline(x, y, r, arcSize, col, valArc) {
  noFill();
  stroke(200);
  strokeWeight(8);
  arc(x, y, r * 2, r * 2, PI, PI + arcSize);

  stroke(col);
  strokeWeight(8);
  arc(x, y, r * 2, r * 2, PI, PI + valArc);
}
