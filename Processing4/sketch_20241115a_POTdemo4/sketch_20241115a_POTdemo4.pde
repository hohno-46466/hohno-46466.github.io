//
// sketch_20241115a_POTdemo4.pde
//

// First version: Fri May 26 18:49:38 JST 2023 by @hohno_at_kuimc
// Previous version: Mon May 29 12:14:22 JST 2023 by @hohno_at_kuimc
// Previous version: Tue Jun  6 06:41:55 JST 2023 by @hohno_at_kuimc
// Previous version: Thu Aug 31 03:40:37 ADT 2023 by @hohno_at_kuimc
// Previous version: Fri Nov 15 07:18:48 AST 2024 by @hohno_at_kuimc
// Last update: 2025-03-09(Sun) 20:12 JST / 2025-03-09(Sun) 11:12 UTC by @hohno_at_kuimc

// -----------------------------------------------------------------------------

// If you have not yet installed the MQTT library, please install the MQTT library
// (MQTT library for Processing based on the Eclipse Paho project) using the Library Manager.

// Go to [Sketch] -> [Import Library] -> [Manage Libraries] then search for "MQTT"

// ------------------------------------------------------------------20-----------

// Number of guages
int Nguages = 3;            // Number of guages

// -----------------------------------------------------------------------------

// MQTT broker's FQDN (hostname)
// final String MQTThost = "mqtt://broker.hivemq.com";
// final String MQTThost = "mqtt://broker.emqx.io";
final String MQTThost = "mqtt://localhost";

// MQTT topic
final String MQTTtopic = "mgws2411-999/pseudoBob1";

// -----------------------------------------------------------------------------

// Prepare MQTT class object
import mqtt.*;
MQTTClient client;

// Prepare Font object
PFont font;

// Potentiometer values
float POTval[] = new float[Nguages];
float POTfull[] = new float[Nguages];

//  overlap rate
final float overlapRate = 0.35;   // ゲージ同士の重なり具合を指定．0.0~0.5くらいの値がよい．単にゲージを並べるだけなら 0.0 でよい．

// Screen size
final int screenWidth = 450;      // ゲージを内包する長方形区画の幅．実際のこのアプリの幅はこの値の Nguages 倍になるから「重なり分」を引いた値になる
final int screenHight = 300;      // ゲージを内包する長方形区画の高さ


// Colors
final color colorBG    = color(200, 200, 200);    // 背景色：灰 // Background Gray
final color colorDG    = color(64, 64, 64);    // 色指定：濃灰 // Dark Gray
final color colorBlack = color(0, 0, 0);          // 色指定：黒 // Black
final color colorWhite = color(255, 255, 255);    // 色指定：白 // White
final color colorRED   = color(255, 0, 0);        // 色指定：赤 // Red
final color colorGREEN = color(0, 255, 0);        // 色指定：緑 // Green
final color colorBLUE  = color(0, 0, 255);        // 色指定：青 // Blue
final color colors[] = {colorRED, colorGREEN, colorBLUE, colorDG};

// Design of the guage
final int arcStart = (90 + 45);                   // ゲージの開始角度（「3時」の位置を基準に時計回りの角度で指定）
final int arcEnd   = (360 + 45);                  // ゲージの終了角度
final int arcSize  = arcEnd - arcStart;           // ゲージを形作る円弧の角度

final int centerX = int(screenWidth * 0.5);       // ゲージの中心位置（水平方向）
final int centerY = int(screenHight * 0.5);       // ゲージの中心位置（垂直方向）
final int outerDiameter = int(screenHight * 0.7); // ゲージの外径
final int innerDiameter = int(screenHight * 0.4); // ゲージの内径

final int textPosX1 = int(screenWidth * 0.5);      // テキスト表示位置の中心位置（水平方向）
final int textPosY1 = int(screenHight * 0.8);      // テキスト表示位置の中心位置（垂直方向）
final int textPosX2 = int(screenWidth * 0.6);      // テキスト表示位置の中心位置（水平方向）
final int textPosY2 = int(screenHight * 0.8);      // テキスト表示位置の中心位置（垂直方向）

// -----------------------------------------------------------------------------

// Settings()
//
void settings() {
  float rate;
  if (Nguages <= 1) {
    rate = 1.0;
    Nguages = 1;
  } else {
    rate = Nguages - overlapRate * (Nguages - 1);
  }
  println("Debug: " + "rate = " + rate + ", screenWidth = " + screenWidth * rate);
  size(int(screenWidth * rate), screenHight);
}

// -----------------------------------------------------------------------------

// void setupX() {
//   String[] fontList = PFont.list();
//   for (int i = 0; i < fontList.length; i++) {
//     println(fontList[i]);
//   }
//   noLoop();
//}

// -----------------------------------------------------------------------------

// setup()
//
void setup() {
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
  
  for (int i = 0; i < Nguages; i++) {
    if (POTfull[i] == 0.0) {POTfull[i] = 255.0; }
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
  for (int i = 0; i < Nguages; i++) {
    guage(i, colors[i % _nc]);
  }
}

// -----------------------------------------------------------------------------

// Draw a guage
//
void guage(int guageID, color colorX) {
  
  int _offsetX = 0;
  int _offsetY = 0; 
  
  if ((guageID <= 0) || (guageID >= Nguages)){
    _offsetX = 0;
  } else {
    _offsetX = int(screenWidth * (1.0 - overlapRate) * guageID);
  }

  // float 型の大域変数 POTval[guageID] から int 型の局所変数 _val を求める
  int _val = int(POTval[guageID]/POTfull[guageID]*255.0);
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

  // POTval[guageID] をテキストとしてとして書き出す // Write out POTval[guageID] as text
  fill(colorBlack);
  String formattedText = String.format("%.2f (%.2f%%)", POTval[guageID], POTval[guageID]/POTfull[guageID]*100.0); 
  text(formattedText, _offsetX + textPosX1, _offsetY + textPosY1);
  // text(round(POTval[guageID]), _offsetX + textPosX1, _offsetY + textPosY1);
  // text("(99%)", _offsetX + textPosX2, _offsetY + textPosY2);
}

// -----------------------------------------------------------------------------

// MQTT message handling functions

// messageReceived()
//
void messageReceivedX(String topic, byte[] payload) {
  // println("new message: " + topic + " - " + new String(payload));
  String _line = new String(payload);
  String[] _words = _line.split("\\s+");
  int _n = _words.length;
  println("DEBUG: topic = " + topic + " : got " + _n + " words");
  for (int i = 0; i < Nguages; i++) {
    if (i < _n) {
      POTval[i] = int(_words[i]);
      if (POTfull[i] == 0.0) {POTfull[i] = 255.0; }
    }
  }
}

void messageReceived(String topic, byte[] payload) {
  String _line = new String(payload);
  String[] _words = _line.split("\\s+");
  int _n = _words.length;
  println("DEBUG: topic = " + topic + " : got " + _n + " words");
  for (int i = 0; i < Nguages; i++) {
    if (i < _n) {
      if (_words[i].contains("/")) {
        // 分子/分母 の形式
        String[] fraction = _words[i].split("/");
        if (fraction.length == 2) {
          try {
            POTval[i] = float(fraction[0]);
            POTfull[i] = float(fraction[1]);
          } catch (NumberFormatException e) {
            println("WARNING: Invalid fraction format: " + _words[i]);
            POTval[i] = 0;
            POTfull[i] = 255.0;
          }
        } else {
          println("WARNING: Unexpected fraction format: " + _words[i]);
          POTval[i] = 0;
          POTfull[i] = 255.0;
        }
      } else {
        // 従来の数値形式
        try {
          POTval[i] = float(_words[i]);
          POTfull[i] = 255.0;
        } catch (NumberFormatException e) {
          println("WARNING: Invalid number format: " + _words[i]);
          POTval[i] = 0;
          POTfull[i] = 255.0;
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
