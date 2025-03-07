#!/bin/sh

XK=${1:-"#"}
TOPIC=${2:-"myname/WStest123"}
HOST=${3:-"broker.emqx.io"}

mosquitto_sub -t "$TOPIC/$XK" -h "$HOST" \
| while read x; do echo "$x $(date +%s.%3N)"; done \
| awk '
{
  if($1 == "pong"){
    printf "(%s) (%.3f) (%.3f) %f.3\n", $0, ($3+$5)/2, $4-($3+$5)/2, $4-($3+$5)/2-0.3
  } else {
    printf "[%s]\n",$0
  };
  fflush();
}' 

