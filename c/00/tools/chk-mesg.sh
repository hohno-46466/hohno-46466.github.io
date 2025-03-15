#!/bin/sh

# recv-mesg.sh

# First version: 2025-03-11(Tue) 05:01 JST / 2025-03-10(Mon) 20:01 UTC
# Last update: 

XK=${1:-"#"}
TOPIC=${2:-"myname/WStest123"}
HOST=${3:-"broker.emqx.io"}
XCMD1="send-ping.sh"
XCMD2="send-offset.sh"

z=""
[ -z "$z" ] && x=$(find . -name "$XCMD1" -type f -perm -100) && [ ! -z $x ] && z="$x"
[ -z "$z" ] && x=$(which "$XCMD1") &&  [ ! -z $x ] && z="$x"
[ -z "$x" ] && x=$(find . -name "$XCMD1" -type f) && [ ! -z $x ] && z="sh $x"
[ -z "$x" ] && x=$(find -L . -name "$XCMD1" -type f) && [ ! -z $x ] && z="sh $x"
[ -z "$z" ] && echo "NG: Can't find $XCMD1" && exit 1
CMD1="$z"

z=""
[ -z "$z" ] && x=$(find . -name "$XCMD2" -type f -perm -100) && [ ! -z $x ] && z="$x"
[ -z "$z" ] && x=$(which "$XCMD2") &&  [ ! -z $x ] && z="$x"
[ -z "$x" ] && x=$(find . -name "$XCMD2" -type f) && [ ! -z $x ] && z="sh $x"
[ -z "$x" ] && x=$(find -L . -name "$XCMD2" -type f) && [ ! -z $x ] && z="sh $x"
[ -z "$z" ] && echo "NG: Can't find $XCMD1" && exit 2
CMD2="$z"

# echo "[$CMD1][$CMD2]"
# exit

mosquitto_sub -t "$TOPIC/$XK" -h "$HOST" \

exit
| awk '
{
  if (length($2) == 6 && $2 ~ /^[0-9A-F]{6}$/) {
    x = $2;
    printf "%s: %s\n", x, $0;
  } else {
    if (x == "") {
      printf "------? %s\n", $0;
    } else {
      printf "%s? %s\n", x, $0;
    }
  }
}'

exit

