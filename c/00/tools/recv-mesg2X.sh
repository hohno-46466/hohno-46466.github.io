#!/bin/sh

# recv-mesg2.sh

# First version: 2025-03-08(Sat) 02:22 JST / 2025-03-07(Fri) 17:22 UTC
# Prev update: 2025-03-09(Sun) 06:13 JST / 2025-03-08(Sat) 21:13 UTC
# Prev update: 2025-03-16(Sun) 19:04 JST / 2025-03-16(Sun) 10:04 UTC
# Prev update: 2025-03-17(Mon) 08:39 JST / 2025-03-16(Sun) 23:39 UTC
# Prev update: 2025-03-21(Fri) 20:09 JST / 2025-03-21(Fri) 11:09 UTC
# Prev update: 2025-04-16(Wed) 14:15 JST / 2025-04-16(Wed) 05:15 UTC
# Last update: 2025-04-18(Fri) 05:33 JST / 2025-04-17(Thu) 20:33 UTC

NTPSERVER=ntp.nict.jp

XK=${1:-"#"}
TOPIC=${2:-"mynameX/WStest123"}		#XXX#
HOST=${3:-"broker.emqx.io"}
XCMD_PING="send-pingX.sh"
XCMD_OFFSET="send-offsetX.sh"

CMD0=""
STR0="0"

# ntpdig コマンドが存在するか確認
if command -v ntpdig >/dev/null 2>&1; then
    CMD0="ntpdig $NTPSERVER | awk '{printf \"%.3f\", \$4}'"
    # CMD0="ntpdig -v $NTPSERVER | grep 'offset' | sed -E 's/.*offset ([+-]?[0-9]+\\\.[0-9]+).*/\\\1/'"
    echo "(A)"

# ntpdate コマンドが存在するか確認
elif command -v ntpdate >/dev/null 2>&1; then
    # CMD0="ntpdate -q $NTPSERVER | grep offset | tail -1 | awk '{printf \"%.3f\", \$(NF-1)}'"
    CMD0="ntpdate -q $NTPSERVER | grep offset | tail -1 | sed -E 's/.*offset ([+-]?[0-9]+\\\.[-1-9]+).*/\\\1/'"
    echo "(B)"

# /usr/sbin/ntpdate コマンドが存在するか確認
elif command -v /usr/sbin/ntpdate >/dev/null 2>&1; then
    # CMD0="/usr/sbin/ntpdate -q $NTPSERVER | grep offset | tail -1 | awk '{printf \"%.3f\", \$(NF-1)}'"
    CMD0="/usr/sbin/ntpdate -q $NTPSERVER | grep offset | tail -1 | sed -E 's/.*offset ([+-]?[0-9]+\\\.[0-9]+).*/\\\1/'"
    echo "(C)"
else
    echo "Error: Neither ntpdate nor ntpdig is installed."
    exit 1
fi

echo "(1)((command:$CMD0))"
echo "(2)((ntpdiff:$STR0))"
/bin/echo -n "(3)((ntpdiff:"
STR0=$(echo "$CMD0" | sh)
echo "))"
echo "(4)((ntpdiff:$STR0))"

if [ -z "$STR0" ]; then
    echo "Command: $CMD0"
    echo "Error: The command above is not working."
    exit 1
fi

# awk にコマンドを渡して試行
awk -v CMD0="$CMD0" 'BEGIN { CMD0 | getline timediff; close(CMD0); printf "(5)((command: %s))\n(6)((ntpdiff: %s))\n", CMD0, timediff }'

z=""
[ -z "$z" ] && x=$(find . -name "$XCMD_PING" -type f -perm -100) && [ ! -z $x ] && z="$x"
[ -z "$z" ] && x=$(which "$XCMD_PING") &&  [ ! -z $x ] && z="$x"
[ -z "$x" ] && x=$(find . -name "$XCMD_PING" -type f) && [ ! -z $x ] && z="sh $x"
[ -z "$x" ] && x=$(find -L . -name "$XCMD_PING" -type f) && [ ! -z $x ] && z="sh $x"
[ -z "$z" ] && echo "NG: Can't find $XCMD_PING" && exit 1
CMD_PING="$z"

z=""
[ -z "$z" ] && x=$(find . -name "$XCMD_OFFSET" -type f -perm -100) && [ ! -z $x ] && z="$x"
[ -z "$z" ] && x=$(which "$XCMD_OFFSET") &&  [ ! -z $x ] && z="$x"
[ -z "$x" ] && x=$(find . -name "$XCMD_OFFSET" -type f) && [ ! -z $x ] && z="sh $x"
[ -z "$x" ] && x=$(find -L . -name "$XCMD_OFFSET" -type f) && [ ! -z $x ] && z="sh $x"
[ -z "$z" ] && echo "NG: Can't find $XCMD_OFFSET" && exit 2
CMD_OFFSET="$z"

echo "(Debug) [$CMD0]"
echo "(Debug) [$CMD_PING][$CMD_OFFSET]"

mosquitto_sub -t "$TOPIC/$XK" -h "$HOST" \
| while read x; do echo "$x $(date +%s.%3N)"; done \
| awk -v CMD0="$CMD0" -v CMD_PING="$CMD_PING" -v CMD_OFFSET="$CMD_OFFSET" '
BEGIN{
  myhash = "";
  magic_default = 0.3; # (2025-03-21) 試行錯誤の末とりあえず 0.3秒にした
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
      #0# magic = D3 - Dx;		#1# 本来はゼロでもおかしくない
      #0# diffD3Dx = 0 + magic;	#1# 本来はゼロでもおかしくないが magic 分だけ差分が生じる
      #0# adjust = (ntpdiff - diffD3Dx);	符号要確認
      #0# mesg = CMD_OFFSET " " ID " " adjust; # jafascript で得た時刻に adjust を加えると UTC になる(つもり)
      #
      #1# このスクリプトを動かしている機材と同じ機材上の javascript との通信なら　diffD3Dx(= D3-Dx) は
      #1# ゼロでもおかしくない．
      #1# diffD3Dx がゼロでないとしたらこれを magic として保存して他の機材の javascript との通信でも
      #1# この値を配慮する必要がある...と考えた
      #1# magic = magic_default;	# (2025-03-20) magic算出方法変更中
      #1# diffD3Dx = 0 + magic;	#1# 本来はゼロでもおかしくないが magic 分だけ差分が生じる
      #1# adjust = (ntpdiff - diffD3Dx);	# 符号要確認
      #1# mesg = CMD_OFFSET " " ID " " adjust; # jafascript で得た時刻に adjust を加えると UTC になる(つもり)
      #
      #2# シンプルに diffD3Dx はゼロだとしてしまう
      #2# その上で magic は使わない（ゼロにしておく）
      #2# このスクリプトを動かしている機材と同じ機材上の javascript との通信なので ntpdiff を使う
      diffD3Dx = 0; # ゼロにしておく
      magic = 0;    # これもゼロにしておく
      adjust = ntpdiff; # 修正値は ntpdiff そのものを採用
      mesg = CMD_OFFSET " " ID " " adjust; # jafascript で得た時刻に adjust を加えるとほぼ UTC になる
      
    } else {
      #0/1# こちら側では magic は利用してもよいがここで新たに算出し直してはいけない
      #0/1# diffD3Dx = (D3 - Dx) + magic; #（magic 算出方法変更中）
      #0/1# adjust = (ntpdiff - diffD3Dx);	# 符号要確認
      #0/1# mesg = CMD_OFFSET " " ID " " adjust;
      #
      #2# こちら側では magic は magic_default を採用
      #2# メモ：#0# や #1# の時と magic の意味が少し違う
      diffD3Dx = D3 - Dx;		# ゼロにしておく
      magic = magic_default;		# 特定の値を設定（実験の結果とりあえず 0.3秒を採用）
      adjust = ntpdiff - diffD3Dx + magic;	# 符号要確認
      mesg = CMD_OFFSET " " ID " " adjust; # jafascript で得た時刻に adjust を加えるとほぼ UTC になる
    }
    #0/1# printf "(Debug/pong) ntpdiff = %.3f, diffD3Dx = %.3f(magic = %.3f), adjust = %.3f\n", ntpdiff, diffD3Dx, magic, adjust;
    printf "(Debug/pong) ntpdiff = %.3f, diffD3Dx = %.3f, magic = %.3f, adjust = %.3f\n", ntpdiff, diffD3Dx, magic, adjust;
    if (adjust <= -0.01 || adjust >= 0.01) {
      printf "(Debug/pongB) [%s]\n", mesg;
      printf "*** system(%s) ***\n", mesg;
      system(mesg);
    }
  } else if($1 == "Hello!") {
    printf "(Debug/Hello!) (%s)\n",$0
    mesg = CMD_PING " " $2;
    printf "(Debug/Hello!) [%s]\n", mesg;
    printf "*** system(%s) ***\n", mesg;
    system(mesg);
  } else {
    printf "(Debug/others) (%s)\n",$0
  };
  fflush();
}' 

