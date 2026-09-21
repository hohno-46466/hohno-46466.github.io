#!/bin/sh

# chk-mesg.sh

# First version: 2025-03-11(Tue) 05:01 JST / 2025-03-10(Mon) 20:01 UTC
# Prev update:   2026-08-24(Mon) 23:32 JST / 2026-08-24(Mon) 14:32 UTC
# Last update:   2026-09-18(Fri) 00:18 JST / 2026-09-17(Thu) 15:18 UTC

XK=${1:-"#"}
TOPIC=${2:-"myname/WStest123"}
HOST=${3:-"broker.emqx.io"}

#X# XCMD1="send-ping.sh"
#X# XCMD2="send-offset.sh"

#X# # 以下の順番で CMD1 と CMD2 を設定
#X# # 1. カレント配下の実行可能ファイル
#X# # 2. PATH上のコマンド
#X# # 3. カレント配下の通常ファイル (sh経由で実行)
#X# # 4. シンボリックリンク先も含めて探索 (sh経由で実行)
#X# # 5. エラーチェック

#X# z=""
#X# [ -z "$z" ] && x=$(find . -name "$XCMD1" -type f -perm -100) && [ -n "$x" ] && z="$x"
#X# [ -z "$z" ] && x=$(which "$XCMD1" 2>/dev/null) && [ -n "$x" ] && z="$x"
#X# [ -z "$z" ] && x=$(find . -name "$XCMD1" -type f) && [ -n "$x" ] && z="sh $x"
#X# [ -z "$z" ] && x=$(find -L . -name "$XCMD1" -type f) && [ -n "$x" ] && z="sh $x"
#X# [ -z "$z" ] && echo "NG: Can't find $XCMD1" && exit 1
#X# CMD1="$z"
#X# 
#X# z=""
#X# [ -z "$z" ] && x=$(find . -name "$XCMD2" -type f -perm -100) && [ -n "$x" ] && z="$x"
#X# [ -z "$z" ] && x=$(which "$XCMD2" 2>/dev/null) && [ -n "$x" ] && z="$x"
#X# [ -z "$z" ] && x=$(find . -name "$XCMD2" -type f) && [ -n "$x" ] && z="sh $x"
#X# [ -z "$z" ] && x=$(find -L . -name "$XCMD2" -type f) && [ -n "$x" ] && z="sh $x"
#X# [ -z "$z" ] && echo "NG: Can't find $XCMD2" && exit 1
#X# CMD2="$z"

#X# # echo "[$CMD1][$CMD2]"
#X# # exit

echo "Debug: Topic = [$TOPIC]"
echo "Debug:    XK = [$XK]"
echo "Debug: Host  = [$HOST]"

mosquitto_sub -t "$TOPIC/$XK" -h "$HOST" \
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
  fflush();
}'

exit

