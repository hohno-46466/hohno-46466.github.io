// sketch8a.js - Diverging Bar Chart (0 as baseline, bars grow up/down)
// Expects globals: Ngauges, POTval[], POTmin[], POTmax[]
// p5.js render-only (no MQTT logic).
// Baseline (y=0) is positioned according to 0's relative location within [min, max].

console.log("sketch8a.js (diverging bar chart) loaded");

function setup() {
  createCanvas(720, 280);
  textFont('sans-serif');
}

function draw() {
  background(245);
  drawDivergingBars();
}

function drawDivergingBars() {
  // Plot area margins
  const margin = { left: 56, right: 24, top: 18, bottom: 48 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const topY = margin.top;
  const bottomY = height - margin.bottom;

  // Axes
  stroke(180);
  strokeWeight(1);
  // y-axis
  line(margin.left, topY, margin.left, bottomY);
  // x-axis will be drawn per gauge as baseline (y=0)

  const slotW = plotW / Ngauges;
  const barW = slotW * 0.55;

  colorMode(HSB, 360, 100, 100);
  textAlign(CENTER, TOP);
  noStroke();

  for (let i = 0; i < Ngauges; i++) {
    const min = POTmin[i];
    const max = POTmax[i];
    const val = POTval[i];

    // Guard: if range is zero, skip drawing the bar (nothing to scale)
    if (max === min) {
      // draw label placeholders
      fill(0);
      textSize(10);
      const cx = margin.left + slotW * i + slotW / 2;
      text(`min=${min} max=${max}`, cx, bottomY + 6);
      continue;
    }

    // Baseline Y (value 0) mapped inside [min..max]
    let t0 = (0 - min) / (max - min); // 0..1 from min(bottom) to max(top) in value space
    t0 = constrain(t0, 0, 1);
    const baselineY = bottomY - t0 * plotH;

    // Draw baseline
    stroke(200);
    strokeWeight(1);
    line(margin.left, baselineY, width - margin.right, baselineY);

    // Positioning for bar i
    const cx = margin.left + slotW * i + slotW / 2;
    const x = cx - barW / 2;

    // Positive extent capacity (from baseline up to top)
    const posCap = baselineY - topY;     // pixels available upwards
    // Negative extent capacity (from baseline down to bottom)
    const negCap = bottomY - baselineY;  // pixels available downwards

    noStroke();
    const hue = (i * 60) % 360;

    if (val >= 0) {
      // Scale positive value within [0..max]
      let tv = 0;
      if (max !== 0) tv = (val - 0) / (max - 0);
      tv = constrain(tv, 0, 1);
      const h = tv * posCap;
      fill(hue, 70, 90);
      rect(x, baselineY - h, barW, h);
    } else {
      // Scale negative value within [min..0]  (val is negative or <0 region)
      let tv = 0;
      if (min !== 0) tv = (0 - val) / (0 - min);  // magnitude relative to negative span
      tv = constrain(tv, 0, 1);
      const h = tv * negCap;
      fill(hue, 70, 90);
      rect(x, baselineY, barW, h);
    }

    // Value label
    fill(0);
    textSize(11);
    const labelY = (val >= 0) ? (baselineY - 14) : (baselineY + 4);
    text(`${nf(val, 1, 2)}`, cx, labelY);

    // Min/Max label
    textSize(10);
    text(`min:${min}  max:${max}`, cx, bottomY + 6);
  }

  // Title
  colorMode(RGB, 255);
  fill(0);
  textAlign(LEFT, TOP);
  textSize(14);
  text("Diverging Bar Chart (0 as baseline; positive up / negative down)", margin.left, 4);
}
