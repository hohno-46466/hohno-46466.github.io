//
// sketch_20241115a_POTdemo4.pde （テスト版）
//

// First version: Fri May 26 18:49:38 JST 2023 by @hohno_at_kuimc
// Previous version: Mon May 29 12:14:22 JST 2023 by @hohno_at_kuimc
// Previous version: Tue Jun  6 06:41:55 JST 2023 by @hohno_at_kuimc
// Previous version: Thu Aug 31 03:40:37 ADT 2023 by @hohno_at_kuimc
// Previous version: Fri Nov 15 07:18:48 AST 2024 by @hohno_at_kuimc
// Previous version: 2025-03-09(Sun) 20:12 JST / 2025-03-09(Sun) 11:12 UTC by @hohno_at_kuimc
// Last update: 2025-07-11(Fri) 08:26 JST / 2025-07-10(Thu) 23:26 UTC

// -----------------------------------------------------------------------------

// If you have not yet installed the MQTT library, please install the MQTT library
// (MQTT library for Processing based on the Eclipse Paho project) using the Library Manager.

// Go to [Sketch] -> [Import Library] -> [Manage Libraries] then search for "MQTT"

// -----------------------------------------------------------------------------

// Number of gauges
int Ngauges = 3;            // Number of gauges

// -----------------------------------------------------------------------------

// Potentiometer values

// float POTval[] = new float[Ngauges];
// float POTmax[] = new float[Ngauges];
// float POTmin[] = new float[Ngauges];

// 仮データ
float[] POTval = {20.0, 0.0, 70.0, 30.0, 60.0};
// float[] POTmin = {0.0, 0.0, 0.0, -10.0, 0.0};
float[] POTmin = {0.0, 0.0, 0.0, 0.0, 0.0};
// float[] POTmax = {1200.0, 20.0, 100.0, 40.0, 100.0};
float[] POTmax = {256.0, 256.0, 256.0, 256.0, 256.0};

// -----------------------------------------------------------------------------

// MQTT broker's FQDN (hostname)
// final String MQTThost = "mqtt://broker.hivemq.com";
final String MQTThost = "mqtt://broker.emqx.io";
// final String MQTThost = "mqtt://localhost";

// MQTT topic
// final String MQTTtopic = "mgws2411-999/pseudoBob1";
// final String MQTTtopic = "mgws2507-999/pseudoBob1";
// final String MQTTtopic = "mgws25Q2-S999/pseudoBob1";
final String MQTTtopic = "mgws2508-S999/pseudoBob1";

// Prepare MQTT class object
import mqtt.*;
MQTTClient client;

// -----------------------------------------------------------------------------

// Prepare Font object
PFont font;

//  overlap rate
final float overlapRate = 0.40;   // ゲージ同士の重なり具合を指定．0.0~0.5くらいの値がよい．単にゲージを並べるだけなら 0.0 でよい．

// Screen size
final int screenWidth = 450;      // ゲージを内包する長方形区画の幅．実際のこのアプリの幅はこの値の Ngauges 倍になるから「重なり分」を引いた値になる
final int screenHeight = 300;      // ゲージを内包する長方形区画の高さ

// Design of the gauge
final int arcStart = (90 + 45);                    // ゲージの開始角度（「3時」の位置を基準に時計回りの角度で指定）
final int arcEnd   = (360 + 45);                   // ゲージの終了角度
final int arcSize  = arcEnd - arcStart;            // ゲージを形作る円弧の角度

final int gaugeCenterX = int(screenWidth * 0.5);   // ゲージの中心位置（水平方向）
final int gaugeCenterY = int(screenHeight * 0.5);  // ゲージの中心位置（垂直方向）labelPos
final int outerDiameter = int(screenHeight * 0.7); // ゲージの外径
final int innerDiameter = int(screenHeight * 0.4); // ゲージの内径

final int labelPosX0 = int(screenWidth * 0.50);    // ラベル表示位置の中心位置（水平方向）
final int labelPosY0 = int(screenHeight * 0.80);   // ラベル表示位置の中心位置（垂直方向）

// final int labelPosX1 = int(screenWidth * 0.50); // ラベル表示位置の中心位置（水平方向）
// final int labelPosY1 = int(screenHeight * 0.85);// ラベル表示位置の中心位置（垂直方向）
final int labelPosX1 = int(screenWidth * 0.50);    // ラベル表示位置の中心位置（水平方向）
final int labelPosY1 = int(screenHeight * 0.53);   // ラベル表示位置の中心位置（垂直方向）

// final int labelPosX2 = int(screenWidth * 0.40); // ラベル表示位置の中心位置（水平方向）
// final int labelPosY2 = int(screenHeight * 0.69);// ラベル表示位置の中心位置（垂直方向）
final int labelPosX2 = int(screenWidth * 0.42);    // ラベル表示位置の中心位置（水平方向）
final int labelPosY2 = int(screenHeight * 0.66);   // ラベル表示位置の中心位置（垂直方向）

// final int labelPosX3 = int(screenWidth * 0.60);  // ラベル表示位置の中心位置（水平方向）
// final int labelPosY3 = int(screenHeight * 0.69); // ラベル表示位置の中心位置（垂直方向）
final int labelPosX3 = int(screenWidth * 0.59);     // ラベル表示位置の中心位置（水平方向）
final int labelPosY3 = int(screenHeight * 0.66);    // ラベル表示位置の中心位置（垂直方向）

// final int labelPosX4 = int(screenWidth * 0.50);  // ラベル表示位置の中心位置（水平方向）
// final int labelPosY4 = int(screenHeight * 0.35); // ラベル表示位置の中心位置（垂直方向）
final int labelPosX4 = int(screenWidth * 0.50);     // ラベル表示位置の中心位置（水平方向）
final int labelPosY4 = int(screenHeight * 0.36);    // ラベル表示位置の中心位置（垂直方向）

// -----------------------------------------------------------------------------

// Colors
// 背景色と基本色
final color colorBG    = color(200, 200, 200);   // 背景色：灰   // Background Gray
final color colorDG    = color(64, 64, 64);      // 色指定：濃灰 // Dark Gray
final color colorWhite = color(255, 255, 255);   // 色指定：白   // White
final color colorBlack = color(0, 0, 0);         // 色指定：黒   // Black

// 識別しやすい色
final color colorRED    = color(255, 0, 0);      // 色指定：赤 // Red
final color colorGREEN  = color(0, 255, 0);      // 色指定：緑 // Green
final color colorBLUE   = color(0, 0, 255);      // 色指定：青 // Blue
final color colorYELLOW = color(255, 255, 0);    // 色指定：黄 // Yellow
final color colorORANGE = color(255, 165, 0);    // 色指定：橙 // Orange
final color colorPURPLE = color(128, 0, 128);    // 色指定：紫 // Purple
final color colorCYAN   = color(0, 255, 255);    // 色指定：水色 // Cyan
final color colorPINK   = color(255, 105, 180);  // 色指定：桃 // Pink

// カラーテーブル
final color colors[] = {
  colorRED, colorORANGE, colorGREEN, colorBLUE,
  colorPURPLE, colorCYAN, colorPINK, colorYELLOW, colorDG
};

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// Settings()
//
void settings() {
  float rate;
  if (Ngauges <= 1) {
    rate = 1.0;
    Ngauges = 1;
  } else {
    rate = Ngauges - overlapRate * (Ngauges - 1);
  }
  println("Debug: " + "rate = " + rate + ", screenWidth = " + screenWidth * rate);
  size(int(screenWidth * rate), screenHeight);
}

// -----------------------------------------------------------------------------

// setup()
//
void setup() {
  
  // for(int i = 0; i < Ngauges; i++) {
  //   POTval[i] = i+1; POTmax[i] = Ngauges; POTmin[i] = 0;
  // }
  
  // 背景色の指定
  background(colorBG);

  // フォントの設定
  // font = createFont("NotoSansOriya", 24);
  font = createFont("Century Gothic", 24);
  textFont(font);
  textAlign(CENTER);

  // MQTT subscriber としての設定
  client = new MQTTClient(this);
  client.connect(MQTThost);
  client.subscribe(MQTTtopic);

  strokeWeight(2);
  
  for (int i = 0; i < Ngauges; i++) {
    if (POTmax[i] == 0.0) {POTmax[i] = 255.0; }
  }
}

// -----------------------------------------------------------------------------

// draw()
//
void draw() {
  // 背景色と stroke の設定
  //（POTval[] の値をテキストとして書き出す前に、テキストを書き出す領域を背景色で塗りつぶしておく必要があるので，
  // draw() を呼び出すごとに画面全体を背景色で塗りつぶしている）
  background(colorBG);
  stroke(colorBlack);
  
  int _nc = colors.length;
  for (int i = 0; i < Ngauges; i++) {
    gauge(i, colors[i % _nc]);
  }
}

// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// gauge()
// 役割: id 番目のゲージを、指定色 colorX でドーナツ状に描画する
// 入力: id = ゲージ番号 (0..Ngauges-1), colorX = 塗り色
// 参照する大域変数の例:
//   - Ngauges
//   - POTval[], POTmin[], POTmax[]
//   - overlapRate (0.0..1.0) : 横方向の重なり率
//   - arcSize (度数) : ゲージのスイープ角 (例: 270)
//   - screenWidth, screenHeight : 全体レイアウト用
//   - font : テキスト描画用
// 備考:
//   - できるだけ副作用を減らすため、pushStyle()/popStyle() で描画状態を隔離
//   - ゼロ割り/異常値を丁寧にハンドリング
// -----------------------------------------------------------------------------
void gauge(int id, color colorX) {
  // --- 安全策: id の範囲をチェック（想定外アクセスを防止）
  if (id < 0 || id >= Ngauges) return;

  // --- レイアウト関連: 位置とサイズを決める -----------------------------
  // 横方向に「やや重ねて」並べる。pitch は隣のゲージ中心間の距離。
  // overlapRate=0 なら全幅に Ngauges 等間隔, 1.0 に近いほど強く重なる
  float baseW   = screenWidth;        // 1つの基準幅（必要なら調整）
  float baseH   = screenHeight;       // 描画高さ
  float pitch   = baseW * (1.0 - overlapRate);  // 中心の間隔
  float cx      = (baseW * 0.5) + id * pitch;   // ゲージ中心X
  float cy      = baseH * 0.55;                 // ゲージ中心Y（やや下寄せ）
  float rOuter  = min(baseW, baseH) * 0.42;     // 外半径（画面比で決定）
  float rInner  = rOuter * 0.62;                // 内半径（リングの太さを決める）

  // --- スケール（角度）設定 ---------------------------------------------
  // 開始角とスイープ角。慣例的に左下(225°)〜右下(315°)あたりを使うと
  // 文字が重なりにくい。ここでは 135° 開始で 270° スイープにしている。
  float startDeg = 135;               // 開始角 [deg]
  float sweepDeg = arcSize;           // スイープ角 [deg]（大域変数を利用）
  float startRad = radians(startDeg);
  float sweepRad = radians(sweepDeg);

  // --- 値の取り出しと防御的プログラミング -------------------------------
  float rawMin = POTmin[id];
  float rawMax = POTmax[id];
  float rawVal = POTval[id];

  // NaN/Inf を避け、min/max の異常を補正
  if (!Float.isFinite(rawMin)) rawMin = 0;
  if (!Float.isFinite(rawMax)) rawMax = 255;
  if (!Float.isFinite(rawVal)) rawVal = 0;

  // min > max の場合は入れ替える（データ源のミス防止）
  if (rawMin > rawMax) {
    float tmp = rawMin; rawMin = rawMax; rawMax = tmp;
  }

  // スパン計算（ゼロ割りを避ける）
  float span = rawMax - rawMin;
  if (span == 0) span = 1;

  // 正規化（0..1 に丸め、はみ出しはクリップ）
  float norm = (rawVal - rawMin) / span;
  norm = constrain(norm, 0, 1);

  // 正規化値から現在角度を算出
  float theta = startRad + sweepRad * norm;

  // --- 描画: スタイルはローカルに閉じる ----------------------------------
  pushStyle();

  // 背景（全スイープのトラック）を薄色で描画
  noStroke();
  fill(230); // 背景トラックの塗り（明るいグレー）※テーマに合わせて変更
  arc(cx, cy, rOuter*2, rOuter*2, startRad, startRad + sweepRad, PIE);

  // 現在値部分を指定色で上書き
  fill(colorX); // 指定色
  // 値が 0 のとき arc() が極小になってチラつくのを防ぐ
  if (norm > 0.0001f) {
    arc(cx, cy, rOuter*2, rOuter*2, startRad, theta, PIE);
  }

  // 内側の穴（背景色）を塗ってドーナツ状に
  fill(0, 0); // 透明にしたい場合は erase() を使う方法もあるが、ここは背景色で
  // ※ 背景が単色なら bgColor を使う。ここでは画面クリアが背景色として仮定されるため、
  //    内部を「背景色」で塗り戻したい場合は fill(bgColor) に差し替える。
  //    デモ用に明示的に背景色を指定するなら以下のように:
  // fill(colorBG);
  noStroke();
  ellipse(cx, cy, rInner*2, rInner*2);

  // 外周/内周の輪郭（視認性向上）
  noFill();
  stroke(0, 60);  // 薄めの線
  strokeWeight(1.5);
  ellipse(cx, cy, rOuter*2, rOuter*2);
  ellipse(cx, cy, rInner*2, rInner*2);

  // --- 目盛（任意）：0%, 25%, 50%, 75%, 100% に短い目盛線 ---------------
  // 課題用のサンプルとして入れておく（重いようならオフに）
  int tickCount = 4; // 0%と100%は外枠で代用、内部は 25/50/75 の3本
  stroke(0, 60);
  strokeWeight(2);
  for (int t = 1; t <= tickCount; t++) {
    float tn = t / float(tickCount + 1); // 0..1 の中間点
    float ang = startRad + sweepRad * tn;
    // 極座標→直交座標へ変換
    float x1 = cx + cos(ang) * (rOuter - 4);
    float y1 = cy + sin(ang) * (rOuter - 4);
    float x2 = cx + cos(ang) * (rOuter - 12);
    float y2 = cy + sin(ang) * (rOuter - 12);
    line(x1, y1, x2, y2);
  }

  // --- テキスト描画（現在値 / min / max / パーセンテージなど） ----------
  // 見やすさのため等幅フォント推奨（font が等幅でない場合は別フォント用意）
  textAlign(CENTER, CENTER);
  fill(20);
  textFont(font);

  // 現在値：中央やや上
  String sVal = nf(rawVal, 0, 1); // 小数1桁表示（整数なら 1 -> 0 に）
  textSize(24);
  text(sVal, cx, cy - rInner * 0.2);

  // min/max：中央やや下（小さめ）
  textSize(12);
  String sMin = "min " + nf(rawMin, 0, 1);
  String sMax = "max " + nf(rawMax, 0, 1);
  text(sMin + "  |  " + sMax, cx, cy + rInner * 0.35);

  // パーセンテージ：下部
  textSize(12);
  String sPct = nf(norm * 100, 0, 1) + "%";
  text(sPct, cx, cy + rInner * 0.60);

  popStyle();
}

/*

// Draw a gauge

void gauge(int _gaugeID, color _colorX) { 
  int _offsetX = 0;
  int _offsetY = 0; 
  
  if ((_gaugeID <= 0) || (_gaugeID >= Ngauges)){
    _offsetX = 0;
  } else {
    _offsetX = int(screenWidth * (1.0 - overlapRate) * _gaugeID);
  }

  // float 型の大域変数 POTval[], POTmin[], POTmz[] から int 型の局所変数 _val を求める
  int _val = int((POTval[_gaugeID]-POTmin[_gaugeID])/(POTmax[_gaugeID]-POTmin[_gaugeID])*255.0);
  _val = (_val < 0) ? 0 : (_val > 255) ? 255 : _val;
  _val = round(map(_val, 0, 255, 0, arcSize));

  // ゲージの地の色を描く
  fill(colorWhite);
  arc(_offsetX + gaugeCenterX, _offsetY + gaugeCenterY, outerDiameter, outerDiameter, radians(arcStart), radians(arcEnd));

  // ゲージのうち色を変える部分を指定色で上塗りする
  fill(_colorX);
  arc(_offsetX + gaugeCenterX, _offsetY + gaugeCenterY, outerDiameter, outerDiameter, radians(arcStart), radians(arcEnd - (arcSize - _val)));

  // ここまで描いた円弧の中央部を背景色で上塗りし（くり抜いて）円弧状のバーにする
  fill(colorBG);
  noStroke(); // ← 重要
  ellipse(_offsetX + gaugeCenterX, _offsetY + gaugeCenterY, innerDiameter, innerDiameter);
  
  // ゲージの輪郭を線で結ぶ
  drawGaugeOutline(_offsetX, _offsetY);
  
  // 数値ラベルの描画
  drawLabeles(_gaugeID, _offsetX, _offsetY);
}

void drawGaugeOutline(int _offsetX, int _offsetY) {
  float x1, x2, y1, y2;
  // ゲージを太線で囲む（これ，もっとスマートにできないんだろうか...）
  
  // まず、外側はすでに太線で描かれているという前提で，とりあえず内側を太線で描く
  stroke(colorBlack);
  arc(_offsetX + gaugeCenterX, _offsetY + gaugeCenterY, innerDiameter, innerDiameter, radians(arcStart), radians(arcEnd));
   
  // ゲージの円弧の端を結ぶ
  // 太い帯状の円弧部分の最初と最後も太線で結ぶため面倒なことをしている．
  // もっと賢い方法があれば教えて！
  x1 = _offsetX + gaugeCenterX + innerDiameter/2 * cos(radians(arcStart));
  y1 = _offsetY + gaugeCenterY + innerDiameter/2 * sin(radians(arcStart));
  x2 = _offsetX + gaugeCenterX + outerDiameter/2 * cos(radians(arcStart));
  y2 = _offsetY + gaugeCenterY + outerDiameter/2 * sin(radians(arcStart));
  line(x1, y1, x2, y2);
  x1 = _offsetX + gaugeCenterX + innerDiameter/2 * cos(radians(arcEnd));
  y1 = _offsetY + gaugeCenterY + innerDiameter/2 * sin(radians(arcEnd));
  x2 = _offsetX + gaugeCenterX + outerDiameter/2 * cos(radians(arcEnd));
  y2 = _offsetY + gaugeCenterY + outerDiameter/2 * sin(radians(arcEnd));
  line(x1, y1, x2, y2);
}

void drawLabeles(int _gaugeID, int _offsetX, int _offsetY) {
  
  // POTval[_gaugeID] をテキストとしてとして書き出す // Write out POTval[_gaugeID] as text
  fill(colorBlack);
 
  // フォントサイズ
  float currentSize = g.textSize; // 現在のフォントサイズを取得
  textSize(currentSize * 0.75); // フォントサイズを半分に変更
  
  String formattedText;
  
  // 計測値  
  formattedText = String.format("%.1f", POTval[_gaugeID]); 
  textAlign(CENTER, BASELINE);
  text(formattedText, _offsetX + labelPosX0, _offsetY + labelPosY0);
  
  formattedText = String.format("%.1f%%", (POTval[_gaugeID]-POTmin[_gaugeID])/(POTmax[_gaugeID]-POTmin[_gaugeID])*100.0); 
  textAlign(CENTER, BASELINE);
  text(formattedText, _offsetX + labelPosX1, _offsetY + labelPosY1);
  
  // String formattedText;
  // formattedText = String.format("%.1f (%.1f%%)", POTval[_gaugeID], (POTval[_gaugeID]-POTmin[_gaugeID])/(POTmax[_gaugeID]-POTmin[_gaugeID])*100.0); 
  // textAlign(CENTER, BASELINE);
  // text(formattedText, _offsetX + labelPosX1, _offsetY + labelPosY1);
  
  textSize(currentSize * 0.45); // フォントサイズを半分に変更
  
  // Lower Limit / 最小値
  formattedText = String.format("%.1f", POTmin[_gaugeID]);
  textAlign(LEFT, BASELINE);
  text(formattedText, _offsetX + labelPosX2, _offsetY + labelPosY2);
  
  // Upper Limit / 最大値
  formattedText = String.format("%.1f", POTmax[_gaugeID]);
  textAlign(RIGHT, BASELINE);
  text(formattedText, _offsetX + labelPosX3, _offsetY + labelPosY3);
  
  // Center Value / 中央値
  formattedText = String.format("%.1f", (POTmin[_gaugeID]+POTmax[_gaugeID])/2.0);
  textAlign(CENTER, BASELINE);
  text(formattedText, _offsetX + labelPosX4, _offsetY + labelPosY4);
  
  // Recover default values / もとの値に戻す
  textAlign(LEFT, BASELINE);
  textSize(currentSize); // フォントサイズをもとのサイズに変更
}
*/

// -----------------------------------------------------------------------------

// MQTT message handling functions

// messageReceivedX()
//
int _count = 0;
void messageReceivedX(String _topic, byte[] _payload) {
  // println("new message: " + _topic + " - " + new String(_payload));
  String _line = new String(_payload);
  String[] _words = _line.split("\\s+");
  int _n = _words.length;
  println("DEBUG: (" + _count + ") _topic = " + _topic + " : got " + _n + " words");
  _count++;
  for (int i = 0; i < Ngauges; i++) {
    if (i < _n) {
      POTval[i] = int(_words[i]);
      if (POTmax[i] == 0.0) {POTmax[i] = 255.0; }
    }
  }
}

// messageReceived()
//
void messageReceived(String _topic, byte[] _payload) {
  String _line = new String(_payload);
  String[] _words = _line.split("\\s+");
  int _n = _words.length;
  if ((_count % 100) == 0) { println("DEBUG: (" + _count + ") _topic = " + _topic + " : got " + _n + " words");}
  _count++;
  for (int i = 0; i < Ngauges; i++) {
    if (i < _n) {
      if (_words[i].contains("/")) {
        String[] fraction = _words[i].split("/");
        if (fraction.length == 2) {
          // 現在値/最大値 の形式
          try {
            POTval[i] = float(fraction[0]);
            POTmin[i] = 0.0;
            POTmax[i] = float(fraction[1]);
          } catch (NumberFormatException e) {
            println("WARNING: Invalid fraction format: " + _words[i]);
            POTval[i] = 0.0;
            POTmin[i] = 0.0;
            POTmax[i] = 255.0;
          }
        } else if (fraction.length == 3) {
          // 現在値/最小値/最大値 の形式
          try {
            POTval[i] = float(fraction[0]);
            POTmin[i] = float(fraction[1]);
            POTmax[i] = float(fraction[2]);
          } catch (NumberFormatException e) {
            println("WARNING: Invalid fraction format: " + _words[i]);
            POTval[i] = 0.0;
            POTmin[i] = 0.0;
            POTmax[i] = 255.0;
          }
        } else {
          println("WARNING: Unexpected fraction format: " + _words[i]);
          POTval[i] = 0;
          POTmin[i] = 0.0;
          POTmax[i] = 255.0;
        }
      } else {
        // 従来の数値形式
        try {
          POTval[i] = float(_words[i]);
          POTmin[i] = 0.0;
          POTmax[i] = 255.0;
        } catch (NumberFormatException e) {
          println("WARNING: Invalid number format: " + _words[i]);
          POTval[i] = 0;
          POTmin[i] = 0.0;
          POTmax[i] = 255.0;
        }
      }
    }
  }
}

// connectionLost()
// XXX // *** 特に何もしていない / nothing to do ***
//
void connectionLost() {
  println("Warning: connection lost");
}

// -----------------------------------------------------------------------------
