//
// Spirograph.js
// (Written in ES2015(ES6))
//
// Note:
// This JS file (Spirograph.js) and the corresponding HTML file (Spirograph.html) refer to the following pages.
// * Weekly Ascii No.1116 (See also: https://ascii.jp/elem/000/001/443/1443136/)
//

// FIrst version: 2024-02-20(Tue) 23:17 JST
// Last update: 2024-03-02(Sat) 15:32 JST / 2024-03-02(Sat) 06:32 UTC

let canvas, context;      // キャンバス
let timer;                // タイマー
let linecolor;            // 描画色
let ox, oy;               // 描画開始座標
let rc, x0, y0;           // 定円の半径（歯車数）、中心座標
let rm, laps;             // 動円の半径（歯車数）、周回数
let rd;                   // 描画点の半径
let i;                    // 回転角

const rad = Math.PI/180;  // radian
const step = 2;           // 回転角のステップ数

// ---------------------------------------------------------

function initCanvas() {
    canvas = document.getElementById("Spirograph");
    context = canvas.getContext("2d");
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 120;
}

function spiro() {
    // 定円の歯車数、動円の歯車数、描画点の半径
    rc = Number(document.getElementById("rc").value);
    rm = Number(document.getElementById("rm").value);
    rd = Number(document.getElementById("rd").value);

    // 周回数
    laps = rm / gcd(rc, rm);

    // 定円の中心座標
    x0 = Math.floor(Math.random() * (canvas.width - 2 * rc)) + rc;
    y0 = Math.floor(Math.random() * (canvas.height - 2 * rc)) + rc;

    // 描画開始座標
    ox = x0 + rc - rm + rd;
    oy = y0;

    // 描画色
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    linecolor = "rgb(" + r + "," + g + "," + b + ")";

    // 描画開始
    i = 0;
    timer = setInterval(draw, 0);
    document.getElementById("status").innerHTML = "drawing... ";
    document.getElementById("draw").disabled = true;
}

function draw() {
    // angle, x, y を設定
    var angle = i * rad;
    var x = x0 + (rc - rm) * Math.cos(angle) + rd * Math.cos(((rc - rm) / rm) * angle);
    var y = y0 + (rc - rm) * Math.sin(angle) - rd * Math.sin(((rc - rm) / rm) * angle);

    // (ox, oy) から (x, y) まで線を引く
    context.beginPath();
    context.strokeStyle = linecolor;
    context.moveTo(ox, oy);
    context.lineTo(x, y);
    context.stroke();
    // console.log("debug: " + ox + ", " + oy + ", " + x + ", " + y + " (" + linecolor + ")");

    // ox, oy を更新
    ox = x;
    oy = y;

    // 回転角を更新
    i = i + step;

    // 回転角が 動円の周回数*360 をこえたら描画終了
    if (i > laps * 360) {
        // 描画終了
        clearInterval(timer);
        // 終了（complete）を表示
        document.getElementById("status").innerHTML = "complete";
        // drawボタンを有効にする
        document.getElementById("draw").disabled = false;
    } else {
        // 現在の周回数を表示
        document.getElementById("status").innerHTML = "drawing... " + Math.floor(i / 360) + "/" +laps;
    }
}

function gcd(a, b) {
  if (b == 0) {
    return a;
  } else {
    return gcd(b, a % b);
  }
}

// ---------------------------------------------------------
