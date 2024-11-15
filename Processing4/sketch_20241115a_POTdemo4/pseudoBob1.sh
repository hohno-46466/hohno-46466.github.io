#!/bin/sh

TOPIC="mgws2411-999/pseudoBob1"
BROKER="broker.emqx.io"

x=0;
while [ 1 ]; do x=$(($x + 1)); echo $x; sleep 0.1; done \
| awk '{x=$1;y=($1*10)%256;z=255-x;w=255-y; printf "%d %d %d %d\n", x,y,z,w; fflush()}' \
| mosquitto_pub -l -t "$TOPIC" -h "$BROKER"

