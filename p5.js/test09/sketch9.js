
// sketch.js (for the "gauge" demonstration)

// First version: 2025-03-17(Mon) 20:55 JST / 2025-03-17(Mon) 11:55 UTC

// ---------------------------------------------------------

// Number of gauges
// let Ngauges = 5;

// ---------------------------------------------------------

// 仮データ
// let POTval = [20, 50, 70, 30, 60];
// let POTmin = [0, 0, 0, -10, 0];
// let POTmax = [100, 100, 100, 40, 100];

// ---------------------------------------------------------

let overlapRate = 0.40;
let gaugeWidth = 450;
let gaugeHeight = 300;

let arcStart = (90 + 45); // -135;
let arcEnd = (360 + 45);  //135;
let arcSize = arcEnd - arcStart;

let gaugeCenterX = (gaugeWidth * 0.5);
let gaugeCenterY = (gaugeHeight * 0.5);
let outerDiameter = (gaugeHeight * 0.7);
let innerDiameter = (gaugeHeight * 0.4);

let labelPosX0 = (gaugeWidth * 0.50);    // ラベル表示位置の中心位置（水平方向）
let labelPosY0 = (gaugeHeight * 0.8);    // ラベル表示位置の中心位置（垂直方向）

let labelPosX1 = (gaugeWidth * 0.50);    // ラベル表示位置の中心位置（水平方向）
let labelPosY1 = (gaugeHeight * 0.53);   // ラベル表示位置の中心位置（垂直方向）
// let labelPosX1 = (gaugeWidth * 0.52); // ラベル表示位置の中心位置（水平方向）
// let labelPosY1 = (gaugeHeight * 0.51);// ラベル表示位置の中心位置（垂直方向）
// let labelPosX1 = gaugeCenterX + 10;
// let labelPosY1 = gaugeCenterY + 5;

let labelPosX2 = (gaugeWidth * 0.42);    // ラベル表示位置の中心位置（水平方向）
let labelPosY2 = (gaugeHeight * 0.66);   // ラベル表示位置の中心位置（垂直方向）
// let labelPosX2 = gaugeCenterX - 40;
// let labelPosY2 = gaugeCenterY + 50;

let labelPosX3 = (gaugeWidth * 0.59);    // ラベル表示位置の中心位置（水平方向）
let labelPosY3 = (gaugeHeight * 0.66);   // ラベル表示位置の中心位置（垂直方向）
// let labelPosX3 = gaugeCenterX + 40;
// let labelPosY3 = gaugeCenterY + 50;

let labelPosX4 = (gaugeWidth * 0.50);    // ラベル表示位置の中心位置（水平方向）
let labelPosY4 = (gaugeHeight * 0.36);   // ラベル表示位置の中心位置（垂直方向）
// let labelPosX4 = gaugeCenterX; 
// let labelPosY4 = gaugeCenterY - 40;

// ---------------------------------------------------------

// color() は setup() と draw() の内部（これらから呼ばれる関数内を含む）でしか
// 利用できないそうなので苦しいことをしている

let gaugeColors;	// 中身は setup() の先頭で gaugeColors = setupGaugeColors() を実行して設定

let colorBG, colorDG, colorWhite, colorBlack; 
let colorRED, colorGREEN, colorBLUE, colorYELLOW, colorORANGE;
let colorPURPLE, colorCYAN, colorPINK   ;

function setupAllColors() {
  //
  // 以下の ColorXX はすべて大域変数
  // 背景色と基本色
  colorBG     = color(200, 200, 200);  // 背景色：灰   // Background Gray
  colorDG     = color(64, 64, 64);     // 色指定：濃灰 // Dark Gray
  // 識別しやすい色
  colorWhite  = color(255, 255, 255);  // 色指定：白   // White
  colorBlack  = color(0, 0, 0);        // 色指定：黒   // Black
  colorRED    = color(255, 0, 0);      // 色指定：赤   // Red
  colorGREEN  = color(0, 255, 0);      // 色指定：緑   // Green
  colorBLUE   = color(0, 0, 255);      // 色指定：青   // Blue
  colorYELLOW = color(255, 255, 0);    // 色指定：黄   // Yellow
  colorORANGE = color(255, 165, 0);    // 色指定：橙   // Orange
  colorPURPLE = color(128, 0, 128);    // 色指定：紫   // Purple
  colorCYAN   = color(0, 255, 255);    // 色指定：水色 // Cyan
  colorPINK   = color(255, 105, 180);  // 色指定：桃   // Pink
}

function setupGaugeColors() {

  // Gauge の色を並べた配列を返す
  return([ colorRED, colorORANGE, colorGREEN, colorBLUE,
    colorPURPLE, colorCYAN, colorPINK, colorYELLOW, colorDG ]);
}

// ---------------------------------------------------------

function setup() {
  setupAllColors();
  gaugeColors = setupGaugeColors();
  rate = Ngauges - overlapRate * (Ngauges - 1);
  createCanvas(gaugeWidth*rate, gaugeHeight);
  background(colorBG);
  stroke(colorBlack);
}

// ---------------------------------------------------------

function draw() {
  let nc = gaugeColors.length;
  for (let i = 0; i < Ngauges; i++) {
    gauge(i, i % nc);
  }
}

// ---------------------------------------------------------

function gauge(_gaugeID, _colorID) {
  // 表示位置を決定
  let _offsetX = (_gaugeID <= 0) ? 0 : Math.floor(gaugeWidth * (1.0 - overlapRate) * _gaugeID);
  let _offsetY = 0;

  // float 型の大域変数 POTval[], POTmin[], POTmz[] から int 型の局所変数 _val を求める
  let _val = (POTval[_gaugeID] - POTmin[_gaugeID]) / (POTmax[_gaugeID] - POTmin[_gaugeID]) * 255.0;
  _val = constrain(Math.round(map(_val, 0, 255, 0, arcSize)), 0, 255);

  // ゲージの地の色を描く
  fill(colorWhite);
  arc(_offsetX + gaugeCenterX, _offsetY + gaugeCenterY, outerDiameter, outerDiameter, radians(arcStart), radians(arcEnd));

  // ゲージのうち色を変える部分を指定色で上塗りする
  fill(gaugeColors[_colorID]);
  arc(_offsetX + gaugeCenterX, _offsetY + gaugeCenterY, outerDiameter, outerDiameter, radians(arcStart), radians(arcEnd - (arcSize - _val)));

  // ここまで描いた円弧の中央部を背景色で上塗りし（くり抜いて）円弧状のバーにする
  fill(colorBG);
  noStroke();
  ellipse(_offsetX + gaugeCenterX, _offsetY + gaugeCenterY, innerDiameter, innerDiameter);

  // ゲージの輪郭を線で結ぶ
  drawGaugeOutline(_offsetX, _offsetY);

  // 数値ラベルを描画する
  drawLabels(_gaugeID, _offsetX, _offsetY);
}

// ---------------------------------------------------------

function drawGaugeOutline(_offsetX, _offsetY) {
  let _x1, _x2, _y1, _y2;

  // ゲージの円弧部分を線で描く
  stroke(colorBlack);
  arc(_offsetX + gaugeCenterX, _offsetY + gaugeCenterY, innerDiameter, innerDiameter, radians(arcStart), radians(arcEnd));

  // ゲージの円弧の端を線で結ぶ
  _x1 = _offsetX + gaugeCenterX + innerDiameter/2 * cos(radians(arcStart));
  _y1 = _offsetY + gaugeCenterY + innerDiameter/2 * sin(radians(arcStart));
  _x2 = _offsetX + gaugeCenterX + outerDiameter/2 * cos(radians(arcStart));
  _y2 = _offsetY + gaugeCenterY + outerDiameter/2 * sin(radians(arcStart));
  line(_x1, _y1, _x2, _y2);
  _x1 = _offsetX + gaugeCenterX + innerDiameter/2 * cos(radians(arcEnd));
  _y1 = _offsetY + gaugeCenterY + innerDiameter/2 * sin(radians(arcEnd));
  _x2 = _offsetX + gaugeCenterX + outerDiameter/2 * cos(radians(arcEnd));
  _y2 = _offsetY + gaugeCenterY + outerDiameter/2 * sin(radians(arcEnd));
  line(_x1, _y1, _x2, _y2);
}

// ---------------------------------------------------------

function drawLabels(_gaugeID, _offsetX, _offsetY) {
  fill(colorBlack);

  // フォントサイズ
  let _fontSize1 = 18;
  textSize(_fontSize1 * 0.8);
 
  // 計測値
  textAlign(CENTER, BASELINE);
  let valueText = `${POTval[_gaugeID].toFixed(1)}`;
  text(valueText, _offsetX + labelPosX0, _offsetY + labelPosY0);
  valueText = `${((POTval[_gaugeID] - POTmin[_gaugeID]) / (POTmax[_gaugeID] - POTmin[_gaugeID]) * 100.0).toFixed(1)}%`;
  text(valueText, _offsetX + labelPosX1, _offsetY + labelPosY1);

  // フォントサイズ
  let _fontSize2 = 16;
  textSize(_fontSize2 * 0.8);
 
  // Lower Limit / 最小値 
  textAlign(LEFT, BASELINE);
  text(POTmin[_gaugeID].toFixed(1), _offsetX + labelPosX2, _offsetY + labelPosY2);

  // Upper Limit / 最大値
  textAlign(RIGHT, BASELINE);
  text(POTmax[_gaugeID].toFixed(1), _offsetX + labelPosX3, _offsetY + labelPosY3);

  // Center Value / 中央値
  textAlign(CENTER, BASELINE);
  text(((POTmin[_gaugeID] + POTmax[_gaugeID]) / 2).toFixed(1), _offsetX + labelPosX4, _offsetY + labelPosY4);

  // Recover default value / もとの値に戻す
  textSize(_fontSize2);
}

// ---------------------------------------------------------

