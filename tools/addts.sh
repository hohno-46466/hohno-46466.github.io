#!/bin/sh
# Prev updated: Fri Jul  8 19:16:09 JST 2022
# Last updated: Wed Aug 10 20:53:13 JST 2022

date=date; type gdate > /dev/null 2>&1 && date=gdate # alias date=gdate # On Mac, gdate can be found in coreutils
sed=sed;   type gsed  > /dev/null 2>&1 && sed=gsed   # alias sed=gsed

[ "x$TSKEY" = "x" ] && TSKEY='$USER-$$'
cat -u "$@" | $sed -u -e "s/'/'\"'\"'/g" -e "s/^/'/" -e "s/$/'/" -e 's/^/echo "'$TSKEY'\t$('$date' +%s.%3N\)\t"/' | /bin/sh

exit $?

# Note: To avoid command injection attacks, the options for the above sed command are somewhat complicated as follows:
# -e "s/'/'\"'\"'/g"  - replace all「'」with「'"'"'」
# -e "s/^/'/"         - add「'」at the top of the line. All of「'」in the line are treated as「"'"」
# -e "s/$/'/"         - add a「'」at the end of the line.
# -e 's/^/echo "'$TSKEY'\t$('$date' +%s.%3N\)\t"/' - "Keyword(TAB)Time(TAB)"」will be added at the top of the line


# 注意：コマンドインジェクションを回避するため、上記の sed コマンドのオプションは以下のように少々複雑になっている：
# -e "s/'/'\"'\"'/g"  - 全ての「'」を「'"'"'」に置換する
# -e "s/^/'/"         - 行頭に「'」を追加. これにより行中の全ての「'」は「"'"」として扱われる
# -e "s/$/'/"         - 行末に「'」を追加する
# -e 's/^/echo "'$TSKEY'\t$('$date' +%s.%3N\)\t"/' - 行頭に「"キーワード(TAB)時刻(TAB)"」を追加する
