// sketch.js - no-overlap layout with explicit radius & gap
console.log("sketch.js (no-overlap) loaded");

function draw() {
  background(240);
  for (let i = 0; i < Ngauges; i++) {
    drawGauge(i);
  }
}

function drawGauge(i) {
  const r = 60;          // gauge radius
  const gap = 20;        // horizontal gap between gauges

  // total width of all gauges plus gaps, then center on canvas
  const total = Ngauges * (2 * r) + (Ngauges - 1) * gap;
  const startX = (width - total) / 2 + r;        // center of first gauge
  const cx = startX + i * (2 * r + gap);
  const cy = height / 2;
  const arcSize = PI;

  const min = POTmin[i];
  const max = POTmax[i];
  const val = POTval[i];

  if (max === min) {
    drawGaugeOutline(cx, cy, r, arcSize, color(150), 0);
    drawLabels(cx, cy, r, val, min, max);
    return;
  }

  let normVal = (val - min) / (max - min);
  normVal = constrain(normVal, 0, 1);
  let angle = normVal * arcSize;

  drawGaugeOutline(cx, cy, r, arcSize, color(0, 128, 255), angle);
  drawLabels(cx, cy, r, val, min, max);
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

function drawLabels(cx, cy, r, val, min, max) {
  fill(0);
  noStroke();
  textSize(12);
  text(`val=${val}`, cx, cy + r + 12);
  text(`min=${min}`, cx, cy + r + 28);
  text(`max=${max}`, cx, cy + r + 44);
}
