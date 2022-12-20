//
// ourNextSketch.ino
//

// Last update: Thu Nov 17 17:14:59 JST 2022

const int buttonPin = 6;

void setup() {
  Serial.begin(57600);
  pinMode(buttonPin, INPUT);
}

void loop() {
  Serial.print("Hello, World!"); Serial.print("\t");
  Serial.print(millis());      Serial.print("\t");
  Serial.print((digitalRead(buttonPin) == HIGH) ? "ON" : "OFF"); Serial.println();
  delay(200);
}
