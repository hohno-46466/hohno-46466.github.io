#!/bin/sh
ntpdate -q ntp.nict.jp 2> /dev/null               |
egrep 'adjust time server'                        |
tail -1                                           |        
sed -e 's/^.*offset //'                           |
awk '{printf "offset = %5.3f\n", $1; fflush()}'   |
mosquitto_pub -l -t myname/wstest123 -h broker.emqx.io

