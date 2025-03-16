#!/bin/bash

if command -v ntpdig &> /dev/null; then
    CMD0="ntpdig ntp.nict.jp | awk '{printf \"%.2f\", \$4}'"
elif command -v ntpdate &> /dev/null; then
    CMD0="ntpdate -q ntp.nict.jp | grep offset | tail -1 | awk '{printf \"%.3f\", \$(NF-1)}'"
elif command -v /usr/sbin/ntpdate &> /dev/null; then
    CMD0="/usr/sbin/ntpdate -q ntp.nict.jp | grep offset | tail -1 | awk '{printf \"%.3f\", \$(NF-1)}'"
else
    echo "Error: Neither ntpdate nor ntpdig is installed."
    exit 1
fi

echo "[$CMD0]"

# awk にコマンドを渡して実行
awk -v command="$CMD0" 'BEGIN {
    command | getline timediff
    close(command)
    printf "%s\n",timediff
}'
