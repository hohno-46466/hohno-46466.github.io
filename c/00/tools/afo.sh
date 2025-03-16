#!/bin/bash

# ntpdate コマンドが存在するか確認
if command -v ntpdate &> /dev/null; then
    CMD="ntpdate -q ntp.nict.jp | grep offset | tail -1 | awk '{printf \"%.3f\", \$(NF-1)}'"
# ntpdate がない場合、ntpdig コマンドが存在するか確認
elif command -v /usr/sbin/ntpdig &> /dev/null; then
    CMD="/usr/sbin/ntpdig ntp.nict.jp | awk '{printf \"%.2f\", \$4}'"
else
    echo "Error: Neither ntpdate nor ntpdig is installed."
    exit 1
fi

echo "[$CMD]"

# awk にコマンドを渡して実行
awk -v command="$CMD" 'BEGIN {
    command | getline timediff
    close(command)
    printf "%s\n",timediff
}'
