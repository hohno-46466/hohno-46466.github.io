#!/bin/sh

# send-offset.sh

# Last update: 2025-03-13(Thu) 23:23 JST / 2025-03-13(Thu) 14:23 UTC

XK=${1:-"F19FED"}
OFFSET=${2:-"60.0"}
TOPIC=${3:-"mynameX/WStest123"}
HOST=${4:-"broker.emqx.io"}

echo "offset = $OFFSET" | mosquitto_pub -l -t "$TOPIC/$XK" -h "$HOST"
