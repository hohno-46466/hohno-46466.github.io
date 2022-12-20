//
// our3rdSketch.ino
//

// Last update: Thu Nov 17 17:17:17 JST 2022

const int buttonPin = 6;

void setup() {
  Serial.begin(57600);
  pinMode(buttonPin, INPUT);
  randomSeed(micros());
}

void loop() {
  static int num = 100;
  Serial.print("Hello, World!"); Serial.print("\t");
  Serial.print(millis());      Serial.print("\t");
  Serial.print((digitalRead(buttonPin) == HIGH) ? "ON" : "OFF"); Serial.print("\t");
  Serial.print(num); Serial.println();
  num += random(-50,50);
  delay(200);
}
