#!/bin/sh

XK=${1:-"F19FED"}
TOPIC=${2:-"debugX/WStest123"}
HOST=${3:-"broker.emqx.io"}

echo "ping $XK $(date +%s.%3N)" | mosquitto_pub -l -t $TOPIC/$XK -h $HOST
