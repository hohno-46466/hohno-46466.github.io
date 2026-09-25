
メモ

前々回更新：2025-06-06(Fri) 05:37 JST / 2025-06-05(Thu) 20:37 UTC

前回更新：2026-05-17(Sun) 07:27 JST / 2026-05-16(Sat) 22:27 UTC

最終更新：2026-09-24(Thu) 07:50 JST / 2026-09-23(Wed) 22:50 UTC

(1) メッセージを受け取って時刻同期を支援するメインスクリプト
　　クラウド上のどこか1ヶ所で動いている必要がある
```
recv-mesg2.sh   - X なし系（「Xあり」「Xなし」については後述）
recv-mesg2X.sh  - X あり系
```

(2) 動作確認用スクリプト
　　どこでいくつ動かしてもよい 
```
chk-mesg.sh
chk-mesgX.sh
```

(3) recv-mesg*.sh が呼び出すスクリプト その１
```
send-offset.sh
send-offsetX.sh
```

(4) recv-mesg*.sh が呼び出すスクリプト その２
```
send-ping.sh
send-pingX.sh
```

・参考１：X ありスクリプトと X なしスクリプトの違いは利用する MQTT のトピックの違い

内部から別のシェルスクリプトを呼び出す際，recv-mesg.sh は Xなしなので X なし系スクリプトを呼び出し，recv-mesg2X.sh は Xありなので Xあり系スクリプトを呼び出している．

・参考２：https://hohno-46466.github.io/c/00/index.html は X ありなのか X なしなのか

index.html は，clock00new.html へのシンボリックリンクであり，clock00new.html はその内部で clock00new.js を定期的にリロードしている．
　clock00new.js の冒頭にバージョン名や MQTT Topic が書かれているので，ここを書き換えれば一定期間後には全ての利用者に最新のバージョン名や MQTT Topic が適切に反映される．

debugX.html の場合も debugX.js を必要に応じて変更すれば一定時間後に適切に反映される．


・補足１：send-ping.sh と send-pingX.sh の違い
```
$ diff -U0 send-ping.sh send-pingX.sh
--- send-ping.sh	2025-03-07 19:53:42
+++ send-pingX.sh	2026-09-21 16:43:13
@@ -4 +4 @@
-TOPIC=${2:-"myname/WStest123"}
+TOPIC=${2:-"debugX/WStest123"}
```

・補足２：（X ありの例．myname ではなく mynameX になっている）：
```
　　$ grep myname clock00new.js 
　　const MQTTtopicZero = "mynameX/WStest123";
```

・参考３：https://hohno-46466.github.io/c/00/index.html は定期的に時刻同期を試みる．その際，時刻同期開始のタイミングで画面の背景が緑色になり，応答を得たタイミングで青色になる．手動でリロードした場合も同じ．画面の背景が緑色になるものの，青色にはならない場合は，recv-mesg*.sh が動作していない可能性が高い．
recv-mesg*.sh はどこで動かしても無問題．たくさん起動することは推奨しないが可能なので，応答がないと思ったらとりあえず手元の安定した機材で起動しておくとよい．

-EOF-
