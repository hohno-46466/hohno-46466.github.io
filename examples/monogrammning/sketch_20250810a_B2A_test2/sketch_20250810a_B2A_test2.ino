//
// sketch_20250810b_B2Atest2.ino
// 
// Last update: 2025-08-10(Sun) 07:49 JST / 2025-08-09(Sat) 22:49 UTC by @hohno_at_kuimc
// Last update: 2025-08-10(Sun) 22:10 JST / 2025-08-10(Sun) 13:10 UTC by @hohno_at_kuimc
// Last update: 2025-08-11(Mon) 07:03 JST / 2025-08-10(Sun) 22:03 UTC by @hohno_at_kuimc
//
// Serial ポートから行単位で最大 6個の整数（signed long相当）を読み込む
// 整数1〜整数6 はタブ区切り
// 整数1 - 13番ピンのLED（0 - OFF, それ以外 - ON）
// 整数2 - ４番ピンのLED（同上）
// 整数3 - 10番ピンのON/OFF（同上）
// 整数4 - 5番ピンの圧電ブザーの周波数
// 整数5 - 5番ピンの圧電ブザーの鳴動時間（ミリ秒）
// 整数6 - 5番ピンの圧電ブザーを繰り返し鳴動させる場合の無音時間（ミリ秒）、ゼロなら繰り返さない
//
const int pinLED0 = 13, pinLED1 = 4, pinExt0 = 10, pinBuzzer = 5;
bool toneActive = false;
unsigned long toneEndAt = 0, toneRestartAt = 0;
long val[6] = {0, 0, 0, 0, 0, 0};

void setup() {
  Serial.begin(57600);
  Serial.print("#debug:\tHello, mgws2508! A message from GBKA.\n");
  pinMode(pinLED0, OUTPUT);
  pinMode(pinLED1, OUTPUT);
  pinMode(pinExt0, OUTPUT);
  pinMode(pinBuzzer, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    String str = Serial.readStringUntil('\n');
    int n;
    long tmpVal[6] = {0, 0, 0, 0, 0, 0};
    // Serial.print("#debug:\t["); Serial.print(str); Serial.print("]\n");

    if ((n = sscanf(str.c_str(), "%ld %ld %ld %ld %ld %ld", &tmpVal[0], &tmpVal[1], &tmpVal[2], &tmpVal[3], &tmpVal[4], &tmpVal[5])) >= 1) {
      // シリアルポートから読み込んだ行に 1個以上のデータがある場合
      // n は sscanf() のフォーマット文字列中の要素（変換指定子）数を超えることはないので、
      // 変換指定子の数と val[] のサイズと tmpVal[] のサイズが一致しているので黙認。
      // n が 変換指定子の数より小さい場合は、tmpVal[n] 以降の値はゼロだが、val[n] 以降には以前の値が残る。
      for (int i = 0; i < n; i++) {
        val[i] = tmpVal[i];
      }
 
      Serial.print("#debug:\t");    // デバッグ行を出力（Bob が喜ぶかも）
      Serial.print(millis());
      for (int i = 0; i < n; i++) {
          Serial.print("\t"); Serial.print(val[i]); 
      }
      Serial.println();

      digitalWrite(pinLED0, (val[0] != 0) ? HIGH : LOW);
      digitalWrite(pinLED1, (val[1] != 0) ? HIGH : LOW);
      digitalWrite(pinExt0, (val[2] != 0) ? HIGH : LOW);
      if (val[3] == 0) {
        noTone(pinBuzzer);      // 音を止める
        toneActive = false;
      } else {
        requestTone((unsigned int)val[3], (unsigned long)val[4], (unsigned long)val[5]);
      }
    }
  }
  // 音を止める/再開するタイミングを監視

  if (toneActive && (long)(millis() - toneEndAt) >= 0) {
    // 音が出ている間に millis() が toneEndAt を超えたら音を止める
    noTone(pinBuzzer);      // 音を止める
    toneActive = false;
  } else if (!toneActive && (toneRestartAt > 0) && (long)(millis() - toneRestartAt) >= 0) {
    // 音が出ていない間に millis() が toneRestartAt を超えたら再び requestTone() を呼ぶ
    requestTone((unsigned int)val[3], (unsigned long)val[4], (unsigned long)val[5]);
    toneActive = true;
  }
}

#define BIG_ENOUGH  (2000000000UL)

void requestTone(unsigned int freqHz, unsigned long duration1Ms, unsigned long duration2Ms) {
  if (!toneActive) {
    // Serial.print("#debug:\trequestTone("); Serial.print(freqHz); Serial.print(","); Serial.print(duration1Ms); Serial.print(","); Serial.print(duration2Ms);Serial.println(");");
    tone(pinBuzzer, freqHz);             // 非ブロッキングで音を出す
    toneEndAt = millis() + duration1Ms;  // 自分で停止時刻/再開時刻を管理
    toneRestartAt = millis() + duration1Ms + ((duration2Ms == 0) ? BIG_ENOUGH : duration2Ms);
    // duration2Ms がゼロの場合は、繰り返さないのではなく、繰り返しまでの時間を極端に長くしている（約580時間）
    toneActive = true;
  }
}