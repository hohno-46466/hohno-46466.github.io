//
// sketch_20241115a_POTdemo4_simple.pde （テスト版）
//
// Based on: sketch_20241115a_POTdemo4.pde
// This version just subscribes MQTT and prints messages to the console.
//
// * History of the original version (sketch_20241115a_POTdemo4.pde)
//
// First version: Fri May 26 18:49:38 JST 2023 by @hohno_at_kuimc
// Previous version: Mon May 29 12:14:22 JST 2023 by @hohno_at_kuimc
// Previous version: Tue Jun  6 06:41:55 JST 2023 by @hohno_at_kuimc
// Previous version: Thu Aug 31 03:40:37 ADT 2023 by @hohno_at_kuimc
// Previous version: Fri Nov 15 07:18:48 AST 2024 by @hohno_at_kuimc
// Previous version: 2025-03-09(Sun) 20:12 JST / 2025-03-09(Sun) 11:12 UTC by @hohno_at_kuimc
// Previous version: 2025-07-11(Fri) 08:26 JST / 2025-07-10(Thu) 23:26 UTC
// Last update: 2025-08-10(Sun) 16:20 JST / 2025-08-10(Sun) 07:20 UTC
//
// * History of this version (sketch_20241115a_POTdemo4_simple.pde)
//
// First version: 2025-11-20(Thu) 17:19 JST / 2025-11-20(Thu) 08:19 UTC

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// MQTT settings
// -----------------------------------------------------------------------------

// MQTT broker's FQDN (hostname)
// final String MQTThost = "mqtt://broker.hivemq.com";
final String MQTThost = "mqtt://broker.emqx.io";
// final String MQTThost = "mqtt://localhost";

// MQTT topic
// final String MQTTtopic = "mgws2508-S999/pseudoBob99";
final String MQTTtopic = "uci/carol/test123";

// MQTT library
import mqtt.*;
MQTTClient client;

// メッセージ受信回数カウンタ（元スケッチから流用）
int _count = 0;

// -----------------------------------------------------------------------------
// settings()
// ここでは最小サイズのウィンドウだけ用意（描画はしない）
// -----------------------------------------------------------------------------

void settings() {
  size(400, 100);
}

// -----------------------------------------------------------------------------
// setup()
// MQTTブローカへ接続し、subscribe するだけ
// -----------------------------------------------------------------------------

void setup() {
  background(200);
  println("[INFO] MQTT console-only subscriber starting...");
  println("[INFO] MQTThost  = " + MQTThost);
  println("[INFO] MQTTtopic = " + MQTTtopic);

  // MQTT subscriber としての設定（元スケッチと同じ）
  client = new MQTTClient(this);
  client.connect(MQTThost);
  client.subscribe(MQTTtopic);

  println("[INFO] Connected and subscribed.");
}

// -----------------------------------------------------------------------------
// draw()
// ここでは何もしない（描画なし）
// -----------------------------------------------------------------------------

void draw() {
  // No drawing. All activity happens in messageReceived().
}

// -----------------------------------------------------------------------------
// MQTT callback functions
// -----------------------------------------------------------------------------

// messageReceived()
// 受け取ったメッセージを、そのままコンソールに出力するだけに簡略化
//
void messageReceived(String _topic, byte[] _payload) {
  String _line = new String(_payload);

  // 元スケッチのデバッグ表示に近い形を残しつつ、単純化
  println("MQTT (" + _count + "): topic = " + _topic + " : payload = \"" + _line + "\"");
  _count++;
}

// connectionLost()
// 接続が切れたら警告を出す（元スケッチと同様）
//
void connectionLost() {
  println("Warning: MQTT connection lost");
}

// -----------------------------------------------------------------------------
