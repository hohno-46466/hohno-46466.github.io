//
// sketch_20250809a_MQTT_console_echo.pde
//
// Last update: 2025-08-09(Sat) 09:58 JST / 2025-08-09(Sat) 00:58 UTC by @hohno_at_kuimc
//

// Prepare MQTT class object

import mqtt.*;
MQTTClient client;

// MQTT broker's FQDN (hostname)
final String MQTThost = "mqtt://broker.emqx.io";

// MQTT topic
final String MQTTtopic = "mgws2508-S999/pseudoBob1";

//
// -----------------------------------------------------------------------------
//

// データを受け取る配列

int Ngauges = 3;

float[] POTval = {20.0, 30.0, 40.0, 50.0, 60.0};
float[] POTmin = {0.0, 0.0, 0.0, 0.0, 0.0};
float[] POTmax = {256.0, 256.0, 256.0, 256.0, 256.0};

//
// -----------------------------------------------------------------------------
//

void settings() {
  size(200,100);
}

void setup() {
  // MQTT subscriber としての設定
  client = new MQTTClient(this);
  client.connect(MQTThost);
  client.subscribe(MQTTtopic);
  
  for (int i = 0; i < Ngauges; i++) {
    if (POTmax[i] == 0.0) {POTmax[i] = 255.0; }
  }
}

void draw() {
  // client.loop();
}

//
// -----------------------------------------------------------------------
//

// MQTT message handling functions

int _count = 0;

void messageReceived(String _topic, byte[] _payload) {
  String _line = new String(_payload);
  String[] _words = _line.split("\\s+");
  int _n = _words.length;
  println("DEBUG: (" + _count + ") _topic = " + _topic + " : got \"" + _line + "\"");
  _count++;

  for (int i = 0; i < Ngauges; i++) {
    if (i < _n) {
      POTval[i] = int(_words[i]);
      // if (POTmax[i] == 0.0) {POTmax[i] = 255.0; }
    }
  }
}

void connectionLost() {
  println("Warning: connection lost");
}

//
// -----------------------------------------------------------------------
//

