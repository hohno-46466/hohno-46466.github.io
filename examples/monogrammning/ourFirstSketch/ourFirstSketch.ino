//
// ourFirstSketch.ino
//

void setup() {
  Serial.begin(57600);
}

void loop() {
  Serial.print("Hello, World!\t");
  Serial.println(millis());
  delay(1000);
}
