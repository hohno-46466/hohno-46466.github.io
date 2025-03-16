#!/bin/sh

# recv-mesg2.sh

# First version: 2025-03-08(Sat) 02:22 JST / 2025-03-07(Fri) 17:22 UTC
# Prev update: 2025-03-09(Sun) 06:13 JST / 2025-03-08(Sat) 21:13 UTC
# Prev update: 2025-03-16(Sun) 19:04 JST / 2025-03-16(Sun) 10:04 UTC
# Last update: 2025-03-17(Mon) 08:39 JST / 2025-03-16(Sun) 23:39 UTC

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
  magic = 0;
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
  command = CMD0
  command | getline ntpdiff;
  printf "(Debug) myhash = %s, ntpdiff = %s\n", myhash, ntpdiff;
}
{
  # printf "(Debug/Debug) [%s]\n", $0;
  if($1 == "pong") {
    ID = $2;
    D1 = "(N/A)";
    D2 = $3;
    D3 = $4;
    D4 = $5;
    Dx = (D2 + D4) / 2;
    printf "(Debug/pong) (%s)->[%s][%.3f][%.3f][%.3f][%.3f][%.3f]\n",$0,ID,D1,D2,D3,D4,Dx;
    if ($2 == myhash) {
      command = CMD0
      command | getline ntpdiff;
      # 重要：ntpdiff の値が正ならローカルPCは NTPサーバより遅れて（NTPサーバの方が進んで）いる
      # 重要：ntpdiff の値が負ならローカルPCは NTPサーバより進んで（NTPサーバの方が遅れて）いる
      close(command);
      # このスクリプトを動かしている機材と同じ機材上の javascript との通信なら　diffD3Dx(= D3-Dx) はゼロでもおかしくない
      # diffD3Dx がゼロでないとしたらこれを magic として保存して他の機材の javascript との通信でもこの値を配慮する必要がある...と考えた
      magic = D3 - Dx;		# 本来はゼロでもおかしくない
      diffD3Dx = 0; #  + magic;	# 本来はゼロでもおかしくないが magic 分だけ差分が生じる（magic加算停止中）
      adjust = (ntpdiff - diffD4Dx);	# 符号要確認
      mesg = CMD2 " " ID " " adjust; # jafascript で得た時刻に ntpdiff を加えると UTC になる(つもり)
    } else {
      # こちら側では magic は計算してはいけない
      diffD3Dx = (D3 - Dx); # + magic; #（magic 加算停止中）
      adjust = (ntpdiff - diffD3Dx);	# 符号要確認
      mesg = CMD2 " " ID " " adjust;
    }
    printf "(Debug/pong) ntpdiff = %.3f, diffD3Dx = %.3f(magic = %.3f), adjust = %.3f\n", ntpdiff, diffD3Dx, magic, adjust;
    if (adjust <= -0.01 || adjust >= 0.01) {
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
