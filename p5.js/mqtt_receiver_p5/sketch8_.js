//
// sketch8.js - Bar Chart visualization for Ngauges values
//
// Expects globals: Ngauges, POTval[], POTmin[], POTmax[]
// Render-only: defines p5.js setup() and draw() without MQTT logic.
//

console.log("sketch8.js (bar chart) loaded");

function setup() {
  createCanvas(700, 260);
  textFont('sans-serif');
}

function draw() {
  background(245);
  drawBars();
}

function drawBars() {
  // Plot area margins
  const margin = { left: 50, right: 20, top: 20, bottom: 50 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // Axis
  stroke(180);
  strokeWeight(1);
  line(margin.left, height - margin.bottom, width - margin.right, height - margin.bottom); // x-axis
  line(margin.left, margin.top, margin.left, height - margin.bottom); // y-axis

  // Bar geometry
  const slotW = plotW / Ngauges;
  const barW = slotW * 0.6;

  // Color: use HSB for distinct bars
  colorMode(HSB, 360, 100, 100);
  textAlign(CENTER, TOP);
  textSize(12);
  noStroke();

  for (let i = 0; i < Ngauges; i++) {
    const min = POTmin[i];
    const max = POTmax[i];
    const val = POTval[i];

    // Avoid divide by zero
    let t = 0;
    if (max !== min) {
      t = (val - min) / (max - min);
    }
    t = constrain(t, 0, 1);

    const cx = margin.left + slotW * i + slotW / 2;
    const barH = t * plotH;
    const x = cx - barW / 2;
    const y = height - margin.bottom - barH;

    // Fill color by index
    const hue = (i * 60) % 360;
    fill(hue, 70, 90);
    rect(x, y, barW, barH);

    // Labels
    fill(0);
    textSize(11);
    text(`${nf(val, 1, 2)}`, cx, y - 16);                // value above bar
    textSize(10);
    text(`min:${min} max:${max}`, cx, height - margin.bottom + 6); // min/max below bar
  }

  // Title
  colorMode(RGB, 255);
  fill(0);
  textAlign(LEFT, BOTTOM);
  textSize(14);
  text("Bar Chart (POTval scaled by [min, max])", margin.left, margin.top - 6 + 10);
}
