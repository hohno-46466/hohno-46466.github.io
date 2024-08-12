//
// sketch_20230529a_POTdemo3.pde
//

// The first version: Fri May 26 18:49:38 JST 2023 by @hohno_at_kuimc
// The previous version: Mon May 29 12:14:22 JST 2023 by @hohno_at_kuimc
// The latest version: Tue Jun  6 06:41:55 JST 2023 by @hohno_at_kuimc

// -----------------------------------------------------------------------------

// Prepare MQTT class object
import mqtt.*;
MQTTClient client;

// Font
PFont font;

// MQTT host and topic
final String MQTThost = "mqtt://broker.hivemq.com";
// final String MQTThost = "mqtt://localhost";
final String MQTTtopic = "UCI2023/POTdemo2";

// Number of guages
final int Nguages = 3;            // ゲージの数

// Potentiometer value(s)
float POTval[] = {0.0, 0.0, 0.0}; // 表示する値を格納．Nguages個の初期値が必要

//  overlap rate
final float overlapRate = 0.35;   // ゲージ同士の重なり具合を指定．0.0~0.5くらいの値がよい．単にゲージを並べるだけなら 0.0 でよい．

// Screen size
final int screenWidth = 450;      // ゲージを内包する長方形区画の幅．実際のこのアプリの幅はこの値の Nguages 倍になるから「重なり分」を引いた値になる
final int screenHight = 300;      // ゲージを内包する長方形区画の高さ



// Colors
final color colorBG    = color(200, 200, 200);    // 背景色：灰
final color colorBlack = color(0, 0, 0);          // 色指定：黒
final color colorWhite = color(255, 255, 255);    // 色指定：白
final color colorRED   = color(255, 0, 0);        // 色指定：赤 
final color colorGREEN = color(0, 255, 0);        // 色指定：緑
final color colorBLUE  = color(0, 0, 255);        // 色指定：青

// Design of the guage
final int arcStart = (90 + 45);                   // ゲージの開始角度（「3時」の位置を基準に時計回りの角度で指定）
final int arcEnd   = (360 + 45);                  // ゲージの終了角度
final int arcSize  = arcEnd - arcStart;           // ゲージを形作る円弧の角度

final int centerX = int(screenWidth * 0.5);       // ゲージの中心位置（水平方向）
final int centerY = int(screenHight * 0.5);       // ゲージの中心位置（垂直方向）
final int outerDiameter = int(screenHight * 0.7); // ゲージの外径
final int innerDiameter = int(screenHight * 0.4); // ゲージの内径

final int textPosX = int(screenWidth * 0.5);      // テキスト表示位置の中心位置（水平方向）
final int textPosY = int(screenHight * 0.8);      // テキスト表示位置の中心位置（垂直方向）



// -----------------------------------------------------------------------------

// Settings()
//
void settings() {
  float rate;
  if (Nguages <= 2) {
    // Nguage は固定値なので，以下の if文は dead code と言わてしまっているが，
    // 将来 Nguages を不用意に変更してしまった時の安全策なので警告を気にしてはいけない
    rate = 2.0;
  } else {
    rate = 3.0 - overlapRate * (Nguages - 1);
  }
  println(rate + ", " + screenWidth * rate);
  size(int(screenWidth * rate), screenHight);
}

// -----------------------------------------------------------------------------

// setup()
//
void setup() {
  // 背景色の指定
  background(colorBG);

  // フォントの設定
  font = createFont("CenturyGothic", 24);
  textFont(font);
  textAlign(CENTER);

  // MQTT subscriber としての設定
  client = new MQTTClient(this);
  client.connect(MQTThost);
  client.subscribe(MQTTtopic);

  strokeWeight(2);
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
  
  guage(0, colorRED);
  guage(1, colorGREEN);
  guage(2, colorBLUE);
}

// -----------------------------------------------------------------------------

// Draw a guage
//
void guage(int guageID, color colorX) {
  
  int _offsetX = 0;
  int _offsetY = 0; 
  
  if ((guageID <= 0) || (guageID >= 3)){
    _offsetX = 0;
  } else {
    _offsetX = int(screenWidth * (1.0 - overlapRate) * guageID);
  }

  // float 型の帯域変数 POTval[guageID] から int 型の局所変数 _val を求める
  int _val = int(POTval[guageID]);
  _val = (_val < 0) ? 0 : (_val > 255) ? 255 : _val;
  _val = round(map(_val, 0, 255, 0, arcSize));

  // ゲージ（幅のある円弧部分）の地の色を描画
  fill(colorWhite);
  arc(_offsetX + screenWidth/2, _offsetY + screenHight/2, outerDiameter, outerDiameter, radians(arcStart), radians(arcEnd));

  // ゲージのうち色を変える部分を指定色で上塗りする
  fill(colorX);
  arc(_offsetX + screenWidth/2, _offsetY + screenHight/2, outerDiameter, outerDiameter, radians(arcStart), radians(arcEnd - (arcSize - _val)));

  // ここまで描いた円弧の中央部を背景色で上塗りする（円弧の中央部分をくり抜く）
  fill(colorBG);
  noStroke(); // ← 重要
  ellipse(_offsetX + screenWidth/2, _offsetY + screenHight/2, innerDiameter, innerDiameter);

  // ゲージを太線で囲む（これ，もっとスマートにできないんだろうか...）
  // まず、外側はすでに太線で描かれているので，とりあえず内側を太線で描く
  stroke(colorBlack);
  arc(_offsetX + screenWidth/2, _offsetY + screenHight/2, innerDiameter, innerDiameter, radians(arcStart), radians(arcEnd));
  // 太い帯状の円弧部分の最初と最後も太線で結ぶため面倒なことをしている．
  // もっと賢い方法があれば教えて！
  float x1, x2, y1, y2;
  x1 = _offsetX + centerX + innerDiameter/2 * cos(radians(arcStart));
  y1 = _offsetY + centerY + innerDiameter/2 * sin(radians(arcStart));
  x2 = _offsetX + centerX + outerDiameter/2 * cos(radians(arcStart));
  y2 = _offsetY + centerY + outerDiameter/2 * sin(radians(arcStart));
  line(x1, y1, x2, y2);
  x1 = _offsetX + centerX + innerDiameter/2 * cos(radians(arcEnd));
  y1 = _offsetY + centerY + innerDiameter/2 * sin(radians(arcEnd));
  x2 = _offsetX + centerX + outerDiameter/2 * cos(radians(arcEnd));
  y2 = _offsetY + centerY + outerDiameter/2 * sin(radians(arcEnd));
  line(x1, y1, x2, y2);

  // POTval[guageID] をテキストとしてとして書き出す
  fill(colorBlack);
  text(round(POTval[guageID]), _offsetX + textPosX, _offsetY + textPosY);
}

// -----------------------------------------------------------------------------

// MQTT message handling functions

// messageReceived()
// XXX // *** 要改訂 ***
//
void messageReceived(String topic, byte[] payload) {
  // println("new message: " + topic + " - " + new String(payload));
  String _str = new String(payload);
  if (_str != null) {
    // XXX // 以下は要修正
    _str = trim(_str);
    println("DEBUG: " + _str);
    POTval[0] = int(_str);
    POTval[1] = int(_str) + 32;
    POTval[2] = int(_str) + 64;
  }
}

// connectionLost()
// XXX // *** 特に何もしていない ***
//
void connectionLost() {
  println("Warning: connection lost");
}

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
