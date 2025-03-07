#!/bin/sh

OFFSET=${1:-"60.0"}
XK=${2:-"F19FED"}
TOPIC=${3:-"myname/WStest123"}
HOST=${4:-"broker.emqx.io"}

echo "offset = $OFFSET" | mosquitto_pub -l -t $TOPIC/$XK -h $HOST
