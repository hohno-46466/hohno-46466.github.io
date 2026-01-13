// DRV8835 based DC motor controller

// sketch_20251228a_DRV8835test1 → sketch_20260104a_DRV8835test2

// Prev update: 2025-12-29(Mon) 05:59 JST / 2025-12-28(Sun) 20:59 UTC
// Last update: 2026-01-04(Sun) 12:11 JST / 2026-01-04(Sun) 03:11 UTC

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
boolean ch_A = false, ch_B = false;
int testMode = 0, prevMode = -1;
// 現在の値と以前の値
int valX = 0, prevX = -1;

void setup() {
  Serial.begin(57600);
  pinMode(pinSW, INPUT_PULLUP);
  pinMode(pinLED, OUTPUT);
  Serial.println();
  Serial.println("# Hello, Let's go!");
}

void loop() {
  if ((digitalRead(pinSW) == LOW) && (prevSW == false)) {
    // 押しボタンスイッチを押した時 prevSW が false だと testMode の値は
    // 0 → 1 → ... → 4 → 0 → 1 → ... と変化する
    prevSW = true; // スイッチを押し続けた時に testMode がどんどん変化することを阻止するためのフラグ
    testMode++; testMode %= 5;
    if ((testMode == 1) || (testMode == 2)) {
      // testMode が 1 か 2 なら、以後の操作は ch_A, ch_B ともに有効 
      ch_A = true; ch_B = true;      
    } else if (testMode == 3) {
      // testMode が 3 なら、以後の操作は ch_A にのみ有効
      ch_A = true; ch_B = false;
    } else if (testMode == 4) {
      // testMode が 4 なら、以後の操作は ch_B にのみ有効
      ch_A = false; ch_B = true;
    } else {
      // testMode が上記以外なら（実際には 0）、ch_A, ch_B ともに無効
      ch_A = false; ch_B = false;
    }
    if (testMode != prevMode) {
      // testMode が変化したら新しい値を表示する
      Serial.print("New Mode "); Serial.print(testMode); Serial.print(" (");
      Serial.print("ch_A = "); Serial.print(ch_A ? "ON" : "OFF"); Serial.print(", "); 
      Serial.print("ch_B = "); Serial.print(ch_B ? "ON" : "OFF"); Serial.println(")");
      prevMode = testMode;
    }
  } else if (digitalRead(pinSW) == HIGH) {
    // 押しボタンが押されていない状態ではここで prevSW が false になり、次の押下を受け付ける状態になる
    // （一度指を離さないと testMode は更新できない）
    prevSW = false; 
  }

  // 以後の動作の基準になる valX の値を VR（可変抵抗器）の値から生成
  // 補足：valX の値は、正負で駆動するモータを選択（正なら右側（Ch_B）、負なら左側（Ch_A）を選択）し、
  // その値の絶対値がモータの回転速度に反映される
  int valVR = analogRead(pinVR);  // valVR の値は、0..1023
  valX = (valVR >= 640) ? ((valVR - 640) / 2 * 1.3) : (valVR <= 384) ? -((384 - valVR) / 2 * 1.3) : 0;
  // 384  < valVR <   640：VR のノブが中点付近の場合、valX の値はゼロになる
  //   0 <= valVR <=  384：VR のノブを中点付近から左に回すと valX の値は負になり、左に回すほどその値の絶対値は大きくなる
  // 640 <= valVR <= 1023：VR のノブを中点付近から右に回すと valX の値は正になり、右に回すほどその値は大きくなる

  if (testMode == 0) {
    digitalWrite(pinLED, HIGH);   // testMode が 0 の時だけ LED を点灯する
    // testMode が 0 の場合は、左右のモータをいずれも「ブレーキ」に設定
    analogWrite(pinAin1, 255);  analogWrite(pinAin2, 255);
    analogWrite(pinBin1, 255);  analogWrite(pinBin2, 255);
    if (prevX != valX) {
      // 前回の valX と今回の valX が異なっていたらメッセージを出力
      Serial.print("Mode: ");      
      Serial.print(testMode);
      Serial.print("\tch_A - BREAK,\tch_B - BREAK,\t(valX = ");
      Serial.print(valX); Serial.println(")");
      prevX = valX; // prevX を更新
    }

  } else if ((testMode == 1) || (testMode == 2)) {
    // testMode が 1（前進or後進） または 2（その場転回）の場合
    // 注意：6足歩行ロボットは、左右のモータが逆向きに取り付けられているので、
    // 二つのモータを同じ向きに回転させた時には「その場回転」、互いに逆向きに回転させた時には、
    // 「前進または後進」となる
    digitalWrite(pinLED, LOW);
    int valA1, valA2, valB1, valB2;
    if (valX > 0) {
      valA1 = 0, valA2 = valX;    // 左側モータ逆転 → 左側前進 
      if (testMode == 2) {
        // testMode が 2 なら、本体はその場で回転（時計回り）
        valB1 = 0; valB2 = valX;  // 右側モータ逆転 → 右側後進
      } else {
        // testMode が 2 でなければ本体を前進させる
        valB1 = valX; valB2 = 0;  // 右側モータ正転 → 右側前進    
      }       
    } else if (valX < 0){
      valA1 = -valX; valA2 = 0;   // 左側モータ正転 → 左側後進
      if (testMode == 2) {
        // testMode が 2 なら、本体はその場で回転(反時計回り)
        valB1 = -valX; valB2 = 0; // 右側モータ正転 → 右側前進
      } else {
        // testMode が 2 でなければ本体を後進させる
        valB1 = 0; valB2 = -valX; // 右側モータ逆転 → 右側後進         
      }      
    } else {
      // valX がゼロ（可変抵抗器のノブが「だいたい」中央付近）なら左右ともに「空転」状態にする
      valA1 = 0; valA2 = 0;
      valB1 = 0; valB2 = 0;
    }
    // valA1, valA2, valB1, valB2 をモータの回転速度に反映させる
    analogWrite(pinAin1, valA1);  analogWrite(pinAin2, valA2);
    analogWrite(pinBin1, valB1);  analogWrite(pinBin2, valB2);
    if (prevX != valX) {
      Serial.print("Mode: ");
      Serial.print(testMode);
      Serial.print("\tch_A - "); Serial.print(valA1); Serial.print("/"); Serial.print(valA2);
      Serial.print(",\tch_B - "); Serial.print(valB1); Serial.print("/"); Serial.print(valB2);
      Serial.print("\t(valX = "); Serial.print(valX);  Serial.println(")");
      prevX = valX; // prevX を更新 
    }

  } else {
    // testMode が 0, 1, 2 以外（つまり 3 or 4）の場合は、valX の値をもとに ch_A, ch_B を操作
    digitalWrite(pinLED, LOW);    
    boolean mesg_printed = false; // 改行制御のためのフラグ
    if (prevX != valX) {
      Serial.print("Mode: ");
      Serial.print(testMode);
    }
    if (valX > 0) {
      // valX の値が正なら「時計回り」（CW）  
      if (ch_A) {
      // （6足歩行ロボットの場合）本体左側のモータ（Ch.A）を逆転させると本体左側は前進し、
      // 本体右側を軸にして時計回りに回転する   
        analogWrite(pinAin1, 0);  analogWrite(pinAin2, valX);  
        analogWrite(pinBin1, 0);  analogWrite(pinBin2, 0);                
        if (prevX != valX) {
          Serial.print("\tch_A - CW "); Serial.print(valX); Serial.print(",");
          mesg_printed = true;
        }
      }
      if (ch_B) {
      // （6足歩行ロボットの場合）右側のモータ（Ch.B）のモータの取り付け位置は左側とは逆なので、
      // 右側のモータを逆転させると本体右側は後進し、本体左側を軸にして時計回りに回転する
        analogWrite(pinAin1, 0);  analogWrite(pinAin2, 0);           
        analogWrite(pinBin1, 0);  analogWrite(pinBin2, valX);
        if (prevX != valX) {
          Serial.print("\tch_B - CW "); Serial.print(valX); Serial.print(",");
          mesg_printed = true;
        }
      }

    } else if (valX < 0) {
      // valX の値が負なら「反時計回り」（CCW）
      if (ch_A) {
      //（6足歩行ロボットの場合）本体左側のモータ（Ch.A）を正転させると本体左側は後進し、
      // 本体右側を軸にして反時計回りに回転する        
        analogWrite(pinAin1, -valX);  analogWrite(pinAin2, 0);
        analogWrite(pinBin1, 0);      analogWrite(pinBin2, 0);        
        if (prevX != valX) {
          Serial.print("\tch_A - CCW "); Serial.print(-valX); Serial.print(",");
          mesg_printed = true;
        }
      }
      if (ch_B) {
      //（6足歩行ロボットの場合）右側のモータ（Ch.B）のモータの取り付け位置は左側とは逆なので、
      // 右側のモータを正転させると本体右側は前進し、本体左側を軸にして反時計回りに回転する
        analogWrite(pinAin1, 0);      analogWrite(pinAin2, 0);  
        analogWrite(pinBin1, -valX);  analogWrite(pinBin2, 0);
        if (prevX != valX) {
          Serial.print("\tch_B - CCW "); Serial.print(-valX); Serial.print(",");
          mesg_printed = true;
        }
      }

    } else {  // valX == 0
      // valX の値がゼロならブレーキをかけて停止（BREAK）
      if (ch_A) {
        analogWrite(pinAin1, 255);  analogWrite(pinAin2, 255);
        if (prevX != valX) {
          Serial.print("\tch_A - BREAK,");
          mesg_printed = true;
        }
      }
      if (ch_B) {
        analogWrite(pinBin1, 255);  analogWrite(pinBin2, 255);
        if (prevX != valX) {
          Serial.print("\tch_B - BREAK,");
          mesg_printed = true;
        }
      } 
    } 
    if (mesg_printed) {
      // ここまででメッセージを出力していたら valX の値を表示してから改行
      Serial.print("\t(valX = "); Serial.print(valX); Serial.println(")");
    } 
    prevX = valX; // prevX を更新
  }

  delay(100);
}
