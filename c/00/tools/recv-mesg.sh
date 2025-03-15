#!/bin/sh

# recv-mesg.sh

# First version: 2025-03-08(Sat) 02:22 JST / 2025-03-07(Fri) 17:22 UTC
# Last update: 2025-03-09(Sun) 06:13 JST / 2025-03-08(Sat) 21:13 UTC

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

echo "[$CMD1][$CMD2]"
# exit

mosquitto_sub -t "$TOPIC/$XK" -h "$HOST" \
| while read x; do echo "$x $(date +%s.%3N)"; done \
| awk '
BEGIN{
  myhash = "";
  adjval = 0;
  xxx = 0.5;
  for (i = 1; i <= ARGC; i++) {
    if (ARGV[i] ~ /^--myhash=/) {
      split(ARGV[i], arr, "=");
      myhash = arr[2];
      break;
    }
  } 
  if (myhash == "") {
    if (ENVIRON["MYHASHVAL"] != "") {
      myhash = ENVIRON["MYHASHVAL"];
    } else {
      myhash = "123456";
    }
  }
  printf "(!!)myhash = %s, adjval = %s\n", myhash, adjval;
}
{
  if($1 == "pong") {
    T1 = ($3+$5)/2;
    T2 = $4 - T1;
    if ($2 == myhash) {
      printf "(!!)adjval = %s -> ", adjval;
      adjval = -1 * T2;
      printf "%s\n", adjval;
    } else {
      # T3 = $4 - ($3+$5)/2 - 0.3;
      T3 = T2 + adjval;
      T4 = -1 * T3;
      mesg = "'"$CMD2"' " $2 " " T4;
      printf "(%s) => (%.3f) (%.3f) (%f.3)\n", $0, T1, T2, T3;
      if (T4 <= -0.1 || T4 >= 0.1) {
        printf "(!!)[%s]\n", mesg;
        system(mesg);
      }
    } 
  } else if($1 == "Hello!") {
    printf "(%s)\n",$0
    mesg = "'"$CMD1"' " $2;
    printf "(!!)[%s]\n", mesg;
    system(mesg);
  } else {
    printf "(%s)\n",$0
  };
  fflush();
}' 
