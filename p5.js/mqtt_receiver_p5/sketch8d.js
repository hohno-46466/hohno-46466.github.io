//
// sketch8d.js - 棒グラフ（0 を基準の水平線）+ 色覚多様性パレット + タイトル余白
//
// Prev update: 2025-08-25(Mon) 21:43 JST / 2025-08-25(Mon) 12:43 UTC
// Last update: 2025-08-26(Tue) 06:01 JST / 2025-08-25(Mon) 21:01 UTC
//
// 変更点：
//  - 0 を基準線（プロット中央の水平線）として、正は上方向、負は下方向に伸ばす
//  - タイトルと描画領域の間に 1 行分の余白を追加
//  - Okabe–Ito パレット（色覚多様性に配慮した固定色）を使用
//  - 値ラベルは視認性のため「棒の外側」に配置：
//      * POTval[i] > 0 の場合：0 の水平線より「下側」に表示
//      * POTval[i] < 0 の場合：0 の水平線より「上側」に表示
//    （これにより、濃い色の棒に黒文字が重なって読みにくくなる問題を回避）
// 前提：グローバルに Ngauges, POTval[], POTmin[], POTmax[] が存在する（MQTT ロジックは別ファイル）

console.log("sketch8d.js (diverging + Okabe–Ito, JP comments) loaded");

let PALETTE = [];

function setup() {
  createCanvas(720, 300);
  textFont('sans-serif');
  colorMode(RGB, 255);

  // Okabe–Ito パレット（RGB）
  PALETTE = [
    color(0, 0, 0),         // 黒
    color(230, 159, 0),     // オレンジ
    color(86, 180, 233),    // 空色
    color(0, 158, 115),     // 青緑
    color(240, 228, 66),    // 黄
    color(0, 114, 178),     // 青
    color(213, 94, 0),      // 朱色
    color(204, 121, 167)    // 赤紫
  ];
}

function draw() {
  background(245);
  drawDivergingBarsFixedBaseline();
}

function drawDivergingBarsFixedBaseline() {
  // 描画マージン
  const margin = { left: 56, right: 24, top: 18, bottom: 50 };
  // タイトル分の余白（約 1 行）
  const topY = margin.top + 20;
  const bottomY = height - margin.bottom;
  const plotW = width - margin.left - margin.right;

  // 0 を表す水平線（基準線）：プロット中央
  const baselineY = (topY + bottomY) / 2;

  // 軸
  stroke(180);
  strokeWeight(1);
  // 縦軸
  line(margin.left, topY, margin.left, bottomY);
  // 横軸（0 の水平線）
  line(margin.left, baselineY, width - margin.right, baselineY);

  // 棒の配置
  const slotW = plotW / Ngauges;
  const barW = slotW * 0.55;

  noStroke();
  textAlign(CENTER, TOP);

  // 0 から上下方向の描画可能高さ
  const posCap = baselineY - topY;      // 上方向の余白
  const negCap = bottomY - baselineY;   // 下方向の余白

  for (let i = 0; i < Ngauges; i++) {
    const min = POTmin[i];
    const max = POTmax[i];
    const val = POTval[i];

    const cx = margin.left + slotW * i + slotW / 2;
    const x = cx - barW / 2;

    // パレットの色
    fill(PALETTE[i % PALETTE.length]);

    if (val >= 0) {
      // [0..max] → [0..posCap] に正規化（max <= 0 のときは高さ 0）
      let h = 0;
      if (max > 0) {
        let t = val / max;
        t = constrain(t, 0, 1);
        h = t * posCap;
      }
      rect(x, baselineY - h, barW, h);
    } else {
      // [0..|min|] → [0..negCap] に正規化（min >= 0 のときは高さ 0）
      let h = 0;
      if (min < 0) {
        let t = (-val) / (-min);
        t = constrain(t, 0, 1);
        h = t * negCap;
      }
      rect(x, baselineY, barW, h);
    }

    // 値ラベル（棒の外側に配置して視認性を確保）
    fill(0);
    textSize(11);
    if (val > 0) {
      // 正の値 → 基準線の下側に表示（棒に重ならないように）
      textAlign(CENTER, TOP);
      text(`${nf(val, 1, 2)}`, cx, baselineY + 4);
    } else if (val < 0) {
      // 負の値 → 基準線の上側に表示（棒に重ならないように）
      textAlign(CENTER, BOTTOM);
      text(`${nf(val, 1, 2)}`, cx, baselineY - 4);
    } else {
      // val == 0 → 基準線に一致（見やすさ優先で上側に表示）
      textAlign(CENTER, BOTTOM);
      text(`${nf(val, 1, 2)}`, cx, baselineY - 4);
    }

    // min/max ラベル
    textAlign(CENTER, TOP);
    textSize(10);
    text(`min:${min}  max:${max}`, cx, bottomY + 6);
  }

  // タイトル
  fill(0);
  textAlign(LEFT, TOP);
  textSize(14);
  text("棒グラフ（基準線: POTval=0.00, Okabe–Ito パレット対応）", 12, 4);
}
