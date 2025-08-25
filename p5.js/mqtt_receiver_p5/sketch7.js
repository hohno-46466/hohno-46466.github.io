//
// sketch7.js - Line Chart (rolling history) for Ngauges values
//
// Last update: 2025-08-26(Tue) 06:01 JST / 2025-08-25(Mon) 21:01 UTC
//
// Expects globals: Ngauges, POTval[], POTmin[], POTmax[]
// Render-only: defines p5.js setup() and draw() without MQTT logic.
//

console.log("sketch7.js (line chart) loaded");

let history = [];   // history[i] = array of raw values for gauge i
let maxLen = 240;   // number of samples to keep horizontally

function setup() {
  createCanvas(820, 300);
  textFont('sans-serif');
  // init histories
  history = new Array(Ngauges).fill(null).map(() => []);
}

function draw() {
  background(250);

  // margins & plot area
  const margin = { left: 50, right: 20, top: 20, bottom: 40 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // axes
  stroke(180);
  strokeWeight(1);
  line(margin.left, height - margin.bottom, width - margin.right, height - margin.bottom); // x
  line(margin.left, margin.top, margin.left, height - margin.bottom); // y

  // push current values into history
  for (let i = 0; i < Ngauges; i++) {
    const v = POTval[i];
    if (!Number.isNaN(v)) {
      history[i].push(v);
      if (history[i].length > maxLen) history[i].shift();
    }
  }

  // draw each series
  colorMode(HSB, 360, 100, 100);
  noFill();
  strokeWeight(2);
  for (let i = 0; i < Ngauges; i++) {
    const minV = POTmin[i];
    const maxV = POTmax[i];
    const hue = (i * 60) % 360;
    stroke(hue, 80, 90);

    beginShape();
    for (let x = 0; x < history[i].length; x++) {
      const raw = history[i][x];
      let t = 0;
      if (maxV !== minV) t = (raw - minV) / (maxV - minV);
      t = constrain(t, 0, 1);
      const sx = margin.left + map(x, 0, maxLen - 1, 0, plotW);
      const sy = height - margin.bottom - t * plotH;
      vertex(sx, sy);
    }
    endShape();
  }

  // legends & labels
  colorMode(RGB, 255);
  noStroke();
  fill(0);
  textSize(13);
  textAlign(LEFT, TOP);
  text("Line Chart (rolling)  —  scaled by [min,max] per gauge", margin.left, 2);

  // series legend
  textAlign(LEFT, BOTTOM);
  let lx = margin.left; let ly = height - 10;
  for (let i = 0; i < Ngauges; i++) {
    const hue = (i * 60) % 360;
    fill(`hsla(${hue},80%,50%,1)`);
    rect(lx, ly - 12, 14, 8);
    fill(0);
    text(`G${i}`, lx + 18, ly - 12);
    lx += 50;
  }

  // current value labels at right margin
  textAlign(RIGHT, TOP);
  for (let i = 0; i < Ngauges; i++) {
    const hue = (i * 60) % 360;
    fill(`hsla(${hue},80%,50%,1)`);
    const val = POTval[i];
    text(`G${i}: ${nf(val,1,2)}  [${POTmin[i]}..${POTmax[i]}]`, width - 10, margin.top + i * 16);
  }
}
