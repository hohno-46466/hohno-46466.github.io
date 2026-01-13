// DRV8835 based DC motor controller over serial line

// sketch_20260106a_DRV8835test3.ino

// First version: 2026-01-06(Tue) 06:06 JST / 2026-01-05(Mon) 21:06 UTC
// Prev update:
// Last update: 2026-01-06(Tue) 08:42 JST / 2026-01-05(Mon) 23:42 UTC

// DRV8835使用ステッピング&DCモータードライバーモジュール
// https://akizukidenshi.com/catalog/g/g109848/
// Ain1/Bin1   Ain1/Bin2
//   L(0)        L(0)     - 空転
//   L(0)      H(1..255)  - 逆転 
// H(1..255)     L(0)     - 正転
// H(1..255)   H(1..255)  - ブレーキ

// 6足歩行ロボットの場合
//（注意：2台のモータが向かい合って配置されているため、モータの回転方向と本体への影響（移動方向）が左右で逆になる）
// Ch_A - 本体左側のモータを駆動。正転(in1,in2)=(H,L)させると左側は後進、逆転(L,H)させると左側は前進
// Ch_B - 本体右側のモータを駆動。正転(in1,in2)=(H,L)させると右側は前進、逆転(L,H)させると右側は後進

// センサーシールド回路図 - https://drive.google.com/file/d/1erhKv9kpwKOFMZAiXznhUlrNIuRQtW2i/view?usp=sharing
// A0 - VR（可変抵抗器）
// A4 - SW（押しボタン）
// PWM pins - 3,5,6,9,10,11

// ピン番号
const int pinVR = A0, pinSW = A4;
const int pinAin1 = 5, pinAin2 = 6, pinBin1 = 10, pinBin2 = 11;
const int pinLED = 13;
// フラグ類
boolean prevSW = false;
boolean ch_A = false, ch_B = false;;
int testMode = 0, prevMode = -1;
// 現在の値と以前の値
int valX = 0, prevX = -1;

int val0 = -1, val1 = -1, val2 = -1;

void motorCtrl(int ch, int val) {
    int _val1, _val2;
    if (ch == 1) {      // Ch_A (Left)
      if (val > 0) {
        // 左モータ逆転 → 左側前進
        _val1 = 0;
        _val2 = val; if (_val2 > 255) { val2 = 255; }
      } else if (val < 0) {
        // 左モータ正転 → 左側後進
        _val1 = -val; if (_val1 > 255) { _val1 = 255; }
        _val2 = 0;  
      } else {
        // 左モータ停止
        _val1 = 0;
        _val2 = 0;
      } 
      analogWrite(pinAin1, _val1); analogWrite(pinAin2, _val2); 

    } else if (ch == 2) { // Ch_B (Right)
      if (val > 0) {
        // 右モータ正転 → 右側前進
        _val1 = val; if (_val1 > 255) { _val1 = 255; }
        _val2 = 0;
      } else if (val < 0) {
        // 右モータ逆転 → 右側後進
        _val1 = 0;
        _val2 = -val; if (_val2 > 255) { _val2 = 255; } 
      } else {
        // 右モータ停止
        _val1 = 0;
        _val2 = 0;
      }
      analogWrite(pinBin1, _val1); analogWrite(pinBin2, _val2);       
    }
}

void motorStop() {
  // Serial.println("CH.A/B\tBREAK\tBREAK");
  analogWrite(pinAin1, 255); analogWrite(pinAin2, 255);  
  analogWrite(pinBin1, 255); analogWrite(pinBin2, 255); 
}

void setup() {
  Serial.begin(57600);
  pinMode(pinSW, INPUT_PULLUP);
  pinMode(pinLED, OUTPUT);
  Serial.println();
  Serial.println("# Hello, Let's go!");
}

void loop() {
  static int _prev0 = -1, _prev1 = -1, _prev2 = -1;
  if (Serial.available() > 0) {
    String str = Serial.readStringUntil('\n');
    int n, _tmpV0 = 0, _tmpV1 = 0, _tmpV2 = 0;
    // Serial.print("# debug: ["); Serial.print(str); Serial.println("]");

    if ((n = sscanf(str.c_str(), "%d %d %d", &_tmpV0, &_tmpV1, &_tmpV2)) >= 1) {
      val0 = _tmpV0;
      if (n >= 2) {
        val1 = _tmpV1;
      }
      if (n >= 3) {
        val2 = _tmpV2;
      } 
      /*
      Serial.print("#debug: val\t");
      Serial.print(val0); Serial.print("\t");
      Serial.print(val1); Serial.print("\t");
      Serial.print(val2); Serial.println();
      */
    }
  }

  if (digitalRead(pinSW) == LOW) {
    motorStop(); 
  } else {
    if (val0 == 0) {
      // 両足とも駆動
      // 補足：(val1 * val2) > 0 なら前進または後進。(val1 * val2) < 0 ならその場回転
      motorCtrl(1, val1);
      motorCtrl(2, val2);
      if ((_prev1 != val1) || (_prev2 != val2)) {
        Serial.print("CH.A/B:\t"); Serial.print(val1); Serial.print("\t"); Serial.println(val2);
        _prev1 = val1;
        _prev2 = val2;
      }
    } else if (val0 == 1) {
      // 左足のみ駆動（右足は直前の動作を維持）
      // 補足：右足が静止している状態であれば、val1 > 0 で右回転、val1 < 0 で左回転
      motorCtrl(1, val1);
      if (_prev1 != val1) {
        Serial.print("CH.A:\t"); Serial.println(val1);      
        _prev1 = val1;
      }
    } else if (val0 == 2) {
      // 右足のみ駆動（左足は直前の動作を維持）
      // 補足：左足が静止している状態であれば、val1 > 0 で左回転、val < 0 で右回転
      motorCtrl(2, val1);
      if ((_prev2 != val1)){       
        Serial.print("CH.B:\t"); Serial.println(val1);
        _prev2 = val1;
      }
    } else {
      motorStop();
    }
  } 

  delay(200);
}
