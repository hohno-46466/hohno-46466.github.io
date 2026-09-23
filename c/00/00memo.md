## clock00new の動作

#### Last update: 2026-09-24(Thu) 07:19 JST / 2026-09-23(Wed) 22:19 UTC

1. 標準動作

  - https:// ... /c/00/clock00new.html -- clock00new.js を利用

  -  備考：<body>タグ末尾の script1.src で 'clock00new.js' を設定している

1. デバッグ用途

  - https:// ... /c/00/debugX.html -- debugX.js を利用

  - 備考：<body>タグ末尾の script1.src で 'debugX.js' を設定している

1. 色変化なし（時刻同期時に背景色を変化させない）

  - https:// ... /c/00/clock00new-nocolor.html

  - https:// ... /c/00/clock00new.html?nocolor

1. css を使わない

  - https:// ... /c/00/clock00new-nocss.html

  - https:// ... /c/00/clock00new.html?nocss

1. js を使わない

  - https:// ... /c/00/clock00new-nojs.html

  - https:// ... /c/00/clock00new.html?nojs

1. js も css も使わない

  - https:// ... /c/00/clock00new-nojs-nocss.html

  - https:// ... /c/00/clock00new.html?nojs&nocss


```
    ./00
     ├──  00memo.md
     ├──  JS/
     │   ├──  loadmqtt.js
     │   ├──  mqtt.min.js
     │   └──  safereload.js
     ├──  clock00.css -> clock00new.css
     ├──  clock00.html -> clock00new.html
     ├──  clock00.js -> clock00new.js
     ├──  clock00new-nocolor.html -> clock00new.html
     ├──  clock00new-nocss.html -> clock00new.html
     ├──  clock00new-nojs-nocss.html -> clock00new.html
     ├──  clock00new-nojs.html -> clock00new.html
     ├──  clock00new.css
     ├──  clock00new.html
     ├──  clock00new.js
     ├──  debugX.html
     ├──  debugX.js
     ├──  index.html -> clock00.html
     └──  tools/
         ├──  00memo.txt
         ├──  chk-mesg.sh
         ├──  chk-mesgX.sh
         ├──  recv-mesg2.sh
         ├──  recv-mesg2X.sh
         ├──  send-offset.sh
         ├──  send-offsetX.sh
         ├──  send-ping.sh
         └──  send-pingX.sh

```
