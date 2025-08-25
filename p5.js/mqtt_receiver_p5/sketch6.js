//
// sketch6.js - Radar (Spider) Chart for Ngauges values
//
// Last update: 2025-08-26(Tue) 06:01 JST / 2025-08-25(Mon) 21:01 UTC
//
// Expects globals: Ngauges, POTval[], POTmin[], POTmax[]
// Render-only: defines p5.js setup() and draw() without MQTT logic.
//

console.log("sketch6.js (radar) loaded");

function setup() {
  createCanvas(560, 520);
  textFont('sans-serif');
}

function draw() {
  background(252);
  translate(width/2, height/2 + 10);

  const radius = min(width, height) * 0.35;
  const spokes = Ngauges;
  const angleStep = TWO_PI / spokes;

  // normalize values 0..1 per gauge
  let tvals = new Array(Ngauges).fill(0);
  for (let i = 0; i < Ngauges; i++) {
    const minV = POTmin[i];
    const maxV = POTmax[i];
    let t = 0;
    if (maxV !== minV) t = (POTval[i] - minV) / (maxV - minV);
    tvals[i] = constrain(t, 0, 1);
  }

  // grid (polygons)
  stroke(225);
  noFill();
  const rings = 4;
  for (let r = 1; r <= rings; r++) {
    const rr = (r / rings) * radius;
    beginShape();
    for (let i = 0; i < spokes; i++) {
      const a = -HALF_PI + i * angleStep;
      vertex(rr * cos(a), rr * sin(a));
    }
    endShape(CLOSE);
  }

  // spokes
  for (let i = 0; i < spokes; i++) {
    const a = -HALF_PI + i * angleStep;
    line(0, 0, radius * cos(a), radius * sin(a));
  }

  // labels
  textAlign(CENTER, CENTER);
  fill(0);
  noStroke();
  for (let i = 0; i < spokes; i++) {
    const a = -HALF_PI + i * angleStep;
    const lx = (radius + 18) * cos(a);
    const ly = (radius + 18) * sin(a);
    text(`G${i}`, lx, ly);
  }

  // polygon for values
  colorMode(HSB, 360, 100, 100);
  fill(210, 80, 85, 0.35); // translucent fill
  stroke(210, 80, 70);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < spokes; i++) {
    const a = -HALF_PI + i * angleStep;
    const rr = tvals[i] * radius;
    vertex(rr * cos(a), rr * sin(a));
  }
  endShape(CLOSE);
  colorMode(RGB, 255);

  // dots and numeric labels
  fill(0);
  noStroke();
  textSize(12);
  for (let i = 0; i < spokes; i++) {
    const a = -HALF_PI + i * angleStep;
    const rr = tvals[i] * radius;
    const x = rr * cos(a);
    const y = rr * sin(a);
    fill(30);
    circle(x, y, 6);
    fill(0);
    text(`${nf(POTval[i],1,2)}`, x, y - 12);
  }

  // title
  resetMatrix();
  fill(0);
  textAlign(CENTER, TOP);
  textSize(14);
  text("Radar Chart (current values scaled by [min, max])", width/2, 8);
}
