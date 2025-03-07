#!/bin/sh

# recv-mesg.sh

# First version: 2025-03-08(Sat) 02:22 JST / 2025-03-07(Fri) 17:22 UTC

XK=${1:-"#"}
TOPIC=${2:-"myname/WStest123"}
HOST=${3:-"broker.emqx.io"}

mosquitto_sub -t "$TOPIC/$XK" -h "$HOST" \
| while read x; do echo "$x $(date +%s.%3N)"; done \
| awk '
{
  if($1 == "pong") {
    T1 = ($3+$5)/2;
    T2 = $4-($3+$5)/2;
    T3 = $4-($3+$5)/2-0.3;
    printf "%s (%.3f) (%.3f) %f.3\n", $0, T1, T2, T3;
    mesg = "sh ./send-offset.sh " $2 -T3;
    printf "(%s)\n", mesg;
    # system(mesg);
  } else if($1 == "Hello!") {
    mesg = "sh ./send-ping.sh " $2;
    printf "(%s)\n", mesg;
    system(mesg);
  } else {
    printf "[%s]\n",$0
  };
  fflush();
}' 
