//
// sketch_20250810a_B2Atest1.ino
// 
// Last update: 2025-08-10(Sun) 07:49 JST / 2025-08-09(Sat) 22:49 UTC
//
const int pinLED = 4, pinExt = 10, pinBuzzer = 5;
// unsigned long toneStartTime = 0;
// unsigned long toneDuration = 0;
bool toneActive = false;
unsigned long toneEndAt = 0;
int val1 = 0, val2 = 0, val3 = 0, val4 = 0;

void setup() {
  Serial.begin(57600);
  Serial.print("#debug:\tHello, mgws2508! A message from GBKA.\n");
  pinMode(pinLED, OUTPUT);
  pinMode(pinExt, OUTPUT);
  pinMode(pinBuzzer, OUTPUT);
}

void loop() {
  static unsigned long lastRequest = 0;
  if (Serial.available() > 0) {
    String str = Serial.readStringUntil('\n');
    int n, tmpV1 = 0, tmpV2 = 0, tmpV3 = 0, tmpV4 = 0;
    // Serial.print("#debug str\t["); Serial.print(str); Serial.println("]");

    if ((n = sscanf(str.c_str(), "%d %d %d %d", &tmpV1, &tmpV2, &tmpV3, &tmpV4)) >= 1) {
      // シリアルポートから読み込んだ行に 1個以上のデータがある場合
      val1 = tmpV1;
      if (n >= 2) { val2 = tmpV2; } // シリアルポートから読み込んだ行に 2個以上のデータがある場合
      if (n >= 3) { val3 = tmpV3; } // シリアルポートから読み込んだ行に 3個以上のデータがある場合
      if (n >= 4) { val4 = tmpV4; } // シリアルポートから読み込んだ行に 4個以上のデータがある場合
      Serial.print("#debug:\t");    // デバッグ行を出力（Bob が喜ぶかも）
      Serial.print(millis()); Serial.print("\t");
      Serial.print(val1); Serial.print("\t");
      Serial.print(val2); Serial.print("\t");
      Serial.print(val3); Serial.print("\t");
      Serial.print(val4); Serial.println();

      digitalWrite(pinLED, (val1 != 0) ? HIGH : LOW);
      digitalWrite(pinExt, (val2 != 0) ? HIGH : LOW);
      if (val3 == 0) {
        noTone(pinBuzzer);      // 音を止める
        toneActive = false;
      } else {
        Serial.print("#debug: requestTone("); Serial.print(val3); Serial.print(","); Serial.print(val4); Serial.println(");");
        requestTone((unsigned int)val3, (unsigned long)val4);
        lastRequest = millis();
      }
    }
  }
  // 音を止めるタイミングを監視
  if (toneActive && (long)(millis() - toneEndAt) >= 0) {
    noTone(pinBuzzer);      // 音を止める
    toneActive = false;
  }
}

void requestTone(unsigned int freqHz, unsigned long durationMs) {
  if (!toneActive) {
    tone(pinBuzzer, freqHz);            // 非ブロッキングで開始
    toneEndAt = millis() + durationMs;  // 自分で停止時刻を管理
    toneActive = true;
  }
}