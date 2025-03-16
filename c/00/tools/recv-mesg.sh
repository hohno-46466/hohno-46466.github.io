#!/bin/sh

# recv-mesg.sh

# First version: 2025-03-08(Sat) 02:22 JST / 2025-03-07(Fri) 17:22 UTC
# Last update: 2025-03-09(Sun) 06:13 JST / 2025-03-08(Sat) 21:13 UTC

XK=${1:-"#"}
TOPIC=${2:-"myname/WStest123"}
HOST=${3:-"broker.emqx.io"}
XCMD1="send-ping.sh"
XCMD2="send-offset.sh"
XCMD0A="ntpdate -q ntp.nict.jp | grep offset | tail -1 | awk '{printf \"%.3f\", \$(NF-1)}'"
XCMD0B="/usr/sbin/ntpdig ntp.nict.jp | awk '{printf \"%.3f\", \$4}'"

# ntpdig コマンドが存在するか確認
if command -v ntpdig &> /dev/null; then
    CMD0="ntpdig ntp.nict.jp | awk '{printf \"%.3f\", \$4}'"
# ntpdate コマンドが存在するか確認
elif command -v ntpdate &> /dev/null; then
    CMD0="ntpdate -q ntp.nict.jp | grep offset | tail -1 | awk '{printf \"%.3f\", \$(NF-1)}'"
# /usr/sbin/ntpdig コマンドが存在するか確認
elif command -v /usr/sbin/ntpdate &> /dev/null; then
    CMD0="/usr/sbin/ntpdate -q ntp.nict.jp | grep offset | tail -1 | awk '{printf \"%.3f\", \$(NF-1)}'"
else
    echo "Error: Neither ntpdate nor ntpdig is installed."
    exit 1
fi

# # awk にコマンドを渡して実行
# awk -v command="$CMD0" 'BEGIN {
#     command | getline timediff
#     close(command)
#     printf "%s\n",timediff
# }'
# exit 

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

echo "(Debug) [$CMD0]"
echo "(Debug) [$CMD1][$CMD2]"

mosquitto_sub -t "$TOPIC/$XK" -h "$HOST" \
| while read x; do echo "$x $(date +%s.%3N)"; done \
| awk -v CMD0="$CMD0" -v CMD1="$CMD1" -v CMD2="$CMD2" '
BEGIN{
  myhash = "";
  adjval = 0;
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
  printf "(Debug) myhash = %s, adjval = %s\n", myhash, adjval;
}
{
  # printf "(Debug/Debug) [%s]\n", $0;
  if($1 == "pong") {
    T1 = ($3 + $5)/2;
    T2 = $4 - T1;
    if ($2 == myhash) {
      command = CMD0
      command | getline ntpdiff;
      # 重要：ntpdiff の値が正ならローカルPCは NTPサーバより遅れて（NTPサーバの方が進んで）いる
      # 重要：ntpdiff の値が負ならローカルPCは NTPサーバより進んで（NTPサーバの方が遅れて）いる
      close(command);
      printf "(Debug/pongA) ntpdiff = %.3f, T2 = %.3f, adjval(ntpdiff-T2) = %.3f -> ", ntpdiff, T2, adjval;
      adjval = -1 * T2 + ntpdiff;
      printf "adjval = %.3f\n", adjval;
    } 
    # T3 = $4 - ($3 + $5)/2 - 0.3;
    T3 = T2 + adjval;
    T4 = -1 * T3;
    mesg = CMD2 " " $2 " " T4;
    printf "(Debug/pongB) ntpdiff = %.3f, T2 = %s, adjval(ntpdiff-T2) = %.3f (T3 = T2 + adjval, T4 = -T3)\n", ntpdiff, T2, adjval;
    printf "(Debug/pongB) (%s) => (T1:%.3f) (T2:%.3f) (adjval:%.3f) (T3:%.3f) (T4:%.3f)\n", $0, T1, T2, adjval, T3, T4;
    if (T4 <= -0.01 || T4 >= 0.01) {
      printf "(Debug/pongB) [%s]\n", mesg;
      system(mesg);
    }
  } else if($1 == "Hello!") {
    printf "(Debug/Hello!) (%s)\n",$0
    mesg = CMD1 " " $2;
    printf "(Debug/Hello!) [%s]\n", mesg;
    system(mesg);
  } else {
    printf "(Debug/others) (%s)\n",$0
  };
  fflush();
}' 
