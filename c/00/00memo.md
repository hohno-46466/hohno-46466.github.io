## clock00new の動作

1. 標準動作

- https:// ... /c/00/clock00new.html - 標準動作

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
.
├── JS
│   ├── loadmqtt.js
│   ├── mqtt.min.js
│   └── safereload.js
├── clock00.css -> clock00new.css
├── clock00.html -> clock00new.html
├── clock00.js -> clock00new.js
├── clock00new-nocolor.html -> clock00new.html
├── clock00new-nocss.html -> clock00new.html
├── clock00new-nojs-nocss.html -> clock00new.html
├── clock00new-nojs.html -> clock00new.html
├── clock00new.css
├── clock00new.html
├── clock00new.js
├── index.html -> clock00.html
└── tools
    ├── 00memo.txt
    ├── chk-mesg.sh
    ├── chk-mesgX.sh
    ├── recv-mesg2.sh
    ├── recv-mesg2.sh.prev
    ├── recv-mesg2X-prev.sh
    ├── recv-mesg2X.sh
    ├── send-offset.sh
    ├── send-offsetX.sh
    ├── send-ping.sh
    └── send-pingX.sh
```
