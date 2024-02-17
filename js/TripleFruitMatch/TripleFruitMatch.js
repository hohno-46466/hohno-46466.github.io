//
// template.js
// (Written in ES2015(ES6))
//
// Note:
// This JS file (template.js) and the corresponding HTML file (template.html) refer to the following pages.
// * Weekly Ascii No.1475 pp.42-47
//

// Last update: Thu Feb 15 06:22:59 JST 2024

let canvas, context;
let masu, blocks;
let startTime, score, status_;
let target = null, offset;
let _debugCnt = 0;
let _mwX = 80; _mwY = 80;
const code = [  "0x1F347", "0x1F348", "0x1F349", "0x1F34A", "0x1F34D", "0x1F352", "0x1F95D" ];

// let _counter1 = 0, _counter2 = 0;
// const [width, height] = [800, 600]; // [500, 600];

// ---------------------------------------------------------

class Block {
    constructor(x) {
        this.x = x * _mwX;
        this.y = -_mwY;
        this.mX = x;
        this.mY = -1;
        this.type = Math.floor(Math.random() * code.length);
        this.status = "fall";
        masu[this.mX][0] = -1;
    }
    
    fall() {
        this.y += 8; //8
        if (Math.floor(this.y/_mwY) == this.mY + 1) {
            if (this.mY > -1) {
                masu[this.mX][this.mY] = null
            }
            this.mY++;
            masu[this.mX][this.mY] = this;
        }
    }

    draw() {
        [ context.fillStyle, context.font] = [ "#000000", "50px sans-serif" ];
        [ context.textAlign, context.textBaseline ] = ["center", "middle"];
        const text = String.fromCodePoint(code[this.type]);
        context.clearRect(this.x, this.y, _mwX, _mwY);  //XXX//
        context.fillText(text, this.x + _mwX/2, this.y + _mwY/2);
    }
}

const init = () => {
    // キャンバスの取得
    canvas = document.getElementById("myCanvas");  // キャンバスの取得
    context = canvas.getContext("2d");
    // [canvas.width,canvas.height] = [width,height]; // キャンバスのサイズを設定

    // mouse down
    canvas.addEventListener("mousedown", event => {
        [ x, y ] = [ Math.floor(event.offsetX/_mwX), Math.floor(event.offsetY/_mwY) ];
        if (status_ == "ready") {
            target = masu[x][y];
            offset = { x:event.offsetX - target.x, y:event.offsetY - target.y }
        }
    });

    // mouse move
    canvas.addEventListener("mousemove", event => {
        [ x, y ] = [ Math.floor(event.offsetX/_mwX), Math.floor(event.offsetY/_mwY) ];
        console.log(x + ":" + y)
        if ((status_ == "ready") && (target != null)) {
            if ((Math.abs(target.mX - x) == 1) && (target.mY == y)) {
                target.x = event.offsetX - offset.x;
            } else if ((Math.abs(target.mY - y) == 1) && (target.mX == x)) {
                target.y = event.offsetY - offset.y;
            }
        }
    });

    // mouse up
    canvas.addEventListener("mouseup", event => {
        [ x, y ] = [ Math.floor(event.offsetX/_mwX), Math.floor(event.offsetY/_mwY) ];
        if ((status_ == "ready") && (target != null)) {            
            if (((Math.abs(target.mX - x) == 1) && (target.mY == y))
             || ((Math.abs(target.mY - y) == 1) && (target.mX == x)) ) {
                const [ b1, b2 ] = [ masu[x][y], masu[target.mX][target.mY]];
                [b1.type, b2.type] = [b2.type, b1.type];
                if (!checkMatch()) {
                    [ b1.type, b2.type ] = [ b2.type, b1.type ];
                }
            }
            [ target.x, target.y ] = [ target.mX * _mwX, target.mY * _mwY] ;
            target = null;
        }            
    });
    
    // mouse leave
    canvas.addEventListener("mouseleave", event => {
        if (target != null) {
            [ target.x, target.y ] = [target.mX * _mwX, target.mY * _mwY];
            target = null;
        }
    });

    initGame();
    update();
}


const initGame = () => {
    [ masu, blocks ] = [ [], [] ];
    for (let x = 0; x < 8; x++) {
        masu[x] = new Array(8).fill(null);
    }
    [ startTime, score, status_, target ] = [ null, 0, "fall", null];
    context.clearRect(0, 0, canvas.width, canvas.height); //XXX//
}

const match3Blocks = (x1, y1, x2, y2, x3, y3) => {
    let match = false;
    const [ b1, b2, b3 ] = [ masu[x1][y1], masu[x2][y2], masu[x3][y3] ];
    if ((b1.type == b2.type) && (b2.type == b3.type)) {
        [ b1.status, b2.status, b3.status ] = [ "match", "match", "match" ];
        match = true;
    }
    return match;
}

const checkMatch = () => {
    let check = false;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 6; j++) {
            if (match3Blocks(j, i, j+1, i, j+2, i)) { check = true; }
            if (match3Blocks(i, j, i, j+1, i, j+2)) { check = true; }
        }
    }
    return check;
}

const update = () => {

    _debugCnt++;

    // if (_debugCnt < 250) { console.log("DEBUG(" + _debugCnt + "): update()"); }

    // ブロックの消去・追加
    // if (_debugCnt < 10) { console.log("DEBUG(" + _debugCnt + "):   erase"); }
    for (let i = blocks.length - 1; i >= 0; i--) {
        if (blocks[i].status == "match") {
            masu[blocks[i].mX][blocks[i].mY] = null;
            blocks.splice(i, 1);
            if (startTime != null) {
                score += 10;
            }
        }
    }
    for (let x = 0; x < 8; x++) {
        if (masu[x][0] == null) {
            blocks.push(new Block(x));
        }
    }

    // ブロックの落下・描画
    // if (_debugCnt < 10) { console.log("DEBUG(" + _debugCnt + "):   draw"); }
    context.clearRect(0, 0, canvas.with, canvas.height);
    blocks.forEach(block => {
        if (block.mY > -1) {
            block.status = "ready";
        }
        if ((block.mY < 7) && (masu[block.mX][block.mY+1] == null)) {
            block.status = "fall";
        }
        if (block.status == "fall") {
            block.fall();
        }
        block.draw();
    });
    
    context.strokeStyle = "#000000";
    context.strokeRect(0, 0, _mwX*8, _mwY*8);
    for (let i = 1; i < 8; i++) {
        context.strokeRect(i*_mwX, 0, 0, _mwY*8);
        context.strokeRect(0, i*_mwY, _mwX*8, 0);
    }
    context.clearRect(0, 0, canvas.with, canvas.height);

    // マッチチェック
    // if (_debugCnt < 10) { console.log("DEBUG(" + _debugCnt + "):   match heck"); }
    let cnt = 0;
    for (let x = 0; x < 8; x++) {
        if ((masu[x].includes(null)) || (masu[x].includes(-1))) {
            cnt++;
        }
    }
    if (cnt == 0) {
        status_ = "fall";
        if (!checkMatch()) {
            status_ = "ready";
            if (startTime == null) {
                startTime = Date.now();
            }
        }
    }

    // スコア・残り時間の表示
    // if (_debugCnt < 10) { console.log("DEBUG(" + _debugCnt + "):   score & time left"); }
    document.getElementById("score").innerText = score;
    let time = 300;
    if (startTime != null) {
        time = time - Math.floor((Date.now() - startTime)/1000);
    }
    if (time < 0) {
        [ status_, time ] = [ "end", "GAME OVER" ];
    }
    document.getElementById("time").innerText = time;

    window.requestAnimationFrame(update); // アニメーションを実行
}

// ---------------------------------------------------------
