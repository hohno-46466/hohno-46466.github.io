// sketch8b.js - Diverging Bar Chart with fixed horizontal axis at Y=0 (center baseline)
// 要件: POTval[i] = 0.00 が常に「水平線」（X軸）上に来る。
// 正の値は水平線より上へ、負の値は水平線より下へ伸びる。
// スケールは上側: 0..POTmax[i]、下側: 0..|POTmin[i]| で独立に正規化。
// p5.js レンダのみ（MQTT ロジックは含まない）。

console.log("sketch8b.js (diverging bar chart with fixed baseline) loaded");

function setup() {
  createCanvas(720, 280);
  textFont('sans-serif');
}

function draw() {
  background(245);
  drawDivergingBarsFixedBaseline();
}

function drawDivergingBarsFixedBaseline() {
  // プロット領域
  const margin = { left: 56, right: 24, top: 18, bottom: 48 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  // const topY = margin.top;
  const topY = margin.top + 20;   // タイトル分の余白を追加

  const bottomY = height - margin.bottom;

  // 固定の水平線（Y=0 を表すX軸）= プロット中央
  const baselineY = (topY + bottomY) / 2;

  // 軸の描画
  stroke(180);
  strokeWeight(1);
  // y軸
  line(margin.left, topY, margin.left, bottomY);
  // x軸（水平線＝0）
  line(margin.left, baselineY, width - margin.right, baselineY);

  // バー幾何
  const slotW = plotW / Ngauges;
  const barW = slotW * 0.55;

  colorMode(HSB, 360, 100, 100);
  textAlign(CENTER, TOP);
  noStroke();

  // 上下の描画可能高さ（基準線から上/下）
  const posCap = baselineY - topY;
  const negCap = bottomY - baselineY;

  for (let i = 0; i < Ngauges; i++) {
    const min = POTmin[i];
    const max = POTmax[i];
    const val = POTval[i];

    const cx = margin.left + slotW * i + slotW / 2;
    const x = cx - barW / 2;

    // 色
    const hue = (i * 60) % 360;
    fill(hue, 70, 90);

    if (val >= 0) {
      // 0..max を 0..posCap にマップ（max <= 0 の時は描画なし）
      let h = 0;
      if (max > 0) {
        let t = val / max;
        t = constrain(t, 0, 1);
        h = t * posCap;
      }
      rect(x, baselineY - h, barW, h);
    } else {
      // 0..|min| を 0..negCap にマップ（min >= 0 の時は描画なし）
      let h = 0;
      if (min < 0) {
        let t = (-val) / (-min); // |val| / |min|
        t = constrain(t, 0, 1);
        h = t * negCap;
      }
      rect(x, baselineY, barW, h);
    }

    // 値ラベル
    fill(0);
    textSize(11);
    const labelY = (val >= 0) ? (baselineY - 14) : (baselineY + 4);
    text(`${nf(val, 1, 2)}`, cx, labelY);

    // 最小/最大ラベル
    textSize(10);
    text(`min:${min}  max:${max}`, cx, bottomY + 6);
  }

  // タイトル
  colorMode(RGB, 255);
  fill(0);
  textAlign(LEFT, TOP);
  textSize(14);
  text("Diverging Bar (fixed horizontal axis at 0: positive up / negative down)", margin.left, 4);
}
