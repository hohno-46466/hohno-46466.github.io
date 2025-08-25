#!/bin/sh

MQTT_BROKER=localhost
MQTT_BROKER=test.mosquitto.org

while [ 1 ]; do echo; sleep 0.5; done |
awk '
  BEGIN{N=36; p=2*3.141592/N}
  {
    x=NR%N; a=-250; b=250; c=(b-a)/2;
    printf "%d/%d/%d\t%d/%d/%d\t%d/%d/%d\t%d/%d/%d\t%d/%d/%d\t%d/%d/%d\t%d/%d/%d\t%d/%d/%d\n",
      c*sin(p*(x+0)),a,b,
      c*sin(p*(x+1)),a,b,
      c*sin(p*(x+2)),a,b,
      c*sin(p*(x+3)),a,b,
      c*sin(p*(x+4)),a,b,
      c*sin(p*(x+5)),a,b,
      c*sin(p*(x+6)),a,b,
      c*sin(p*(x+7)),a,b;
    fflush();
  }' |
mosquitto_pub -l -t mgws25Q2-S999/pseudoBob2 -h $MQTT_BROKER

