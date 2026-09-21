#!/bin/sh

# recv-mesg2X.sh

# First version: 2025-03-08(Sat) 02:22 JST / 2025-03-07(Fri) 17:22 UTC
# Prev update: 2025-03-09(Sun) 06:13 JST / 2025-03-08(Sat) 21:13 UTC
# Prev update: 2025-03-16(Sun) 19:04 JST / 2025-03-16(Sun) 10:04 UTC
# Prev update: 2025-03-17(Mon) 08:39 JST / 2025-03-16(Sun) 23:39 UTC
# Prev update: 2025-03-21(Fri) 20:09 JST / 2025-03-21(Fri) 11:09 UTC
# Prev update: 2025-04-18(Fri) 07:43 JST / 2025-04-17(Thu) 22:43 UTC
# Prev update: 2026-08-25(Tue) 05:10 JST / 2026-08-24(Mon) 20:10 UTC
# Last update: 2026-09-17(Thu) 15:45 JST / 2026-09-17(Thu) 06:45 UTC

# ------------------------------------------------------------------------------

NTPSERVER=ntp.nict.jp

XK=${1:-"#"}
TOPIC=${2:-"mynameX/WStest123"}		#XXX#
HOST=${3:-"broker.emqx.io"}

# 以下の順番で xxx_SENDPING と xxx_SENDOFFSET を調べ，CMD_SENDPING と CMD_SENDOFFSET を設定

xxx_SENDPING="send-pingX.sh"
xxx_SENDOFFSET="send-offsetX.sh"

# 1. カレント配下の実行可能ファイル
# 2. PATH上のコマンド
# 3. カレント配下の通常ファイル (sh経由で実行)
# 4. シンボリックリンク先も含めて探索 (sh経由で実行)
# 5. エラーチェック

z=""
[ -z "$z" ] && x=$(find . -name "$xxx_SENDPING" -type f -perm -100) && [ -n "$x" ] && z="$x"
[ -z "$z" ] && x=$(which "$xxx_SENDPING" 2>/dev/null) && [ -n "$x" ] && z="$x"
[ -z "$z" ] && x=$(find . -name "$xxx_SENDPING" -type f) && [ -n "$x" ] && z="sh $x"
[ -z "$z" ] && x=$(find -L . -name "$xxx_SENDPING" -type f) && [ -n "$x" ] && z="sh $x"
[ -z "$z" ] && echo "NG: Can't find $xxx_SENDPING" && exit 1
CMD_SENDPING="$z"

z=""
[ -z "$z" ] && x=$(find . -name "$xxx_SENDOFFSET" -type f -perm -100) && [ -n "$x" ] && z="$x"
[ -z "$z" ] && x=$(which "$xxx_SENDOFFSET" 2>/dev/null) && [ -n "$x" ] && z="$x"
[ -z "$z" ] && x=$(find . -name "$xxx_SENDOFFSET" -type f) && [ -n "$x" ] && z="sh $x"
[ -z "$z" ] && x=$(find -L . -name "$xxx_SENDOFFSET" -type f) && [ -n "$x" ] && z="sh $x"
[ -z "$z" ] && echo "NG: Can't find $xxx_SENDOFFSET" && exit 1
CMD_SENDOFFSET="$z"

# CMD_GETOFFSET を設定

if command -v sntp >/dev/null 2>&1; then
    # バックスラッシュのエスケープ地獄を避けた記述
    CMD_GETOFFSET="sntp $NTPSERVER 2>&1 | awk 'index(\$0, \"+/-\") {for(i=1;i<=NF;i++) if(\$i ~ /^[+-][0-9]/) {print \$i; exit}}'"

else
    echo "Error: sntp is not installed."
    exit 1
fi

echo "(0) 2026-09-17 version"
echo "(1)((command(sh): $CMD_GETOFFSET))"
_STR=$(eval "$CMD_GETOFFSET")
echo "(2)((NTPoffset: $_STR))"

if [ -z "$_STR" ]; then
    echo "Command: $CMD_GETOFFSET"
    echo "Error: The command above is not working."
    exit 1
fi

# echo "(3) ---"
# echo "(4) ---"

# awk にコマンドを渡して試行
awk -v CMD_GETOFFSET="$CMD_GETOFFSET" '
BEGIN {
  CMD_GETOFFSET | getline timediff; close(CMD_GETOFFSET);
  printf "(3)((command(awk): %s))\n", CMD_GETOFFSET;
  printf "(4)((NTPoffset: %s))\n", timediff;
}'

# awk にコマンドを渡して試行
awk -v CMD_GETOFFSET="$CMD_GETOFFSET" '
BEGIN {
  CMD_GETOFFSET | getline timediff; close(CMD_GETOFFSET);
  printf "(5)((command(awk): %s))\n", CMD_GETOFFSET;
  printf "(6)((NTPoffset: %s))\n", timediff;
}'

# echo "(Debug) CMD_GETOFFSET: [$CMD_GETOFFSET]"
# echo "(Debug) CMD_SENDPING:  [$CMD_SENDPING]"
# echo "(Debug) CMD_SENDOFFSET:[$CMD_SENDOFFSET]"
# 
# #X#
# exit 9999

# ------------------------------------------------------------------------------

mosquitto_sub -t "$TOPIC/$XK" -h "$HOST" \
| while read x; do echo "$x $(date +%s.%3N)"; done \
| awk -v CMD_GETOFFSET="$CMD_GETOFFSET" -v CMD_SENDPING="$CMD_SENDPING" -v CMD_SENDOFFSET="$CMD_SENDOFFSET" '
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
  command = CMD_GETOFFSET
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
      command = CMD_GETOFFSET
      command | getline ntpdiff;
      # 重要：ntpdiff の値が正ならローカルPCは NTPサーバより遅れて（NTPサーバの方が進んで）いる
      # 重要：ntpdiff の値が負ならローカルPCは NTPサーバより進んで（NTPサーバの方が遅れて）いる
      close(command);
      #0# magic = D3 - Dx;		#1# 本来はゼロでもおかしくない
      #0# diffD3Dx = 0 + magic;	#1# 本来はゼロでもおかしくないが magic 分だけ差分が生じる
      #0# adjust = (ntpdiff - diffD3Dx);	符号要確認
      #0# mesg = CMD_SENDOFFSET " " ID " " adjust; # jafascript で得た時刻に adjust を加えると UTC になる(つもり)
      #
      #1# このスクリプトを動かしている機材と同じ機材上の javascript との通信なら　diffD3Dx(= D3-Dx) は
      #1# ゼロでもおかしくない．
      #1# diffD3Dx がゼロでないとしたらこれを magic として保存して他の機材の javascript との通信でも
      #1# この値を配慮する必要がある...と考えた
      #1# magic = magic_default;	# (2025-03-20) magic算出方法変更中
      #1# diffD3Dx = 0 + magic;	#1# 本来はゼロでもおかしくないが magic 分だけ差分が生じる
      #1# adjust = (ntpdiff - diffD3Dx);	# 符号要確認
      #1# mesg = CMD_SENDOFFSET " " ID " " adjust; # jafascript で得た時刻に adjust を加えると UTC になる(つもり)
      #
      #2# シンプルに diffD3Dx はゼロだとしてしまう
      #2# その上で magic は使わない（ゼロにしておく）
      #2# このスクリプトを動かしている機材と同じ機材上の javascript との通信なので ntpdiff を使う
      diffD3Dx = 0; # ゼロにしておく
      magic = 0;    # これもゼロにしておく
      adjust = ntpdiff; # 修正値は ntpdiff そのものを採用
      mesg = CMD_SENDOFFSET " " ID " " adjust; # jafascript で得た時刻に adjust を加えるとほぼ UTC になる
      
    } else {
      #0/1# こちら側では magic は利用してもよいがここで新たに算出し直してはいけない
      #0/1# diffD3Dx = (D3 - Dx) + magic; #（magic 算出方法変更中）
      #0/1# adjust = (ntpdiff - diffD3Dx);	# 符号要確認
      #0/1# mesg = CMD_SENDOFFSET " " ID " " adjust;
      #
      #2# こちら側では magic は magic_default を採用
      #2# メモ：#0# や #1# の時と magic の意味が少し違う
      diffD3Dx = D3 - Dx;		# ゼロにしておく
      magic = magic_default;		# 特定の値を設定（実験の結果とりあえず 0.3秒を採用）
      adjust = ntpdiff - diffD3Dx + magic;	# 符号要確認
      mesg = CMD_SENDOFFSET " " ID " " adjust; # jafascript で得た時刻に adjust を加えるとほぼ UTC になる
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
    mesg = CMD_SENDPING " " $2;
    printf "(Debug/Hello!) [%s]\n", mesg;
    printf "*** system(%s) ***\n", mesg;
    system(mesg);
  } else {
    printf "(Debug/others) (%s)\n",$0
  };
  fflush();
}' 

