#!/bin/sh
# Last update: 2025-07-30(Wed) 08:36 JST / 2025-07-29(Tue) 23:36 UTC by hohno.46466@gmail.com
TSKEY=${1:-${TSKEY:-"$(whoami)-$$"}}
while IFS= read -r line; do printf "$TSKEY\t$(date +%s.%3N)\t$line\n"; done 
