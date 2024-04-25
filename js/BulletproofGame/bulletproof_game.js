//
// bulletproof_game.js
// (Written in ES2015(ES6))
//
// Note:
// This JS file (bulletproof_game.js) and the corresponding HTML file (bulletproof_game.html) refer to the following pages.
// * Weekly Ascii No.1386 pp.40-45
//

// Last update: Thu Jun 30 17:09:03 JST 2022

let canvas, context;
const [width, height] = [1024, 768]; // [800, 600]; // [500, 600];
const stars = new Array();
let points = new Array();
let shots = new Array();
let px,py,time = 0;
let startTime, prevTime, elapsedTime;
let status = "ready";
let _debugCnt = 0;
let _dateNow = 0;

class Shot {
    //
    constructor(type,x = 0,y = 0,angle = 0,delay = 0) {
	this.type = type;  // point: 出現ポイント，shot: 弾丸
	this.x = Math.floor(Math.random() * (width - 50)) + 25;
	this.y = Math.floor(Math.random() * (height - 50)) + 25;
	this.r = width / 2;
	if (type == "shot") { [this.x,this.y,this.r] = [x,y,10]; }
	this.angle = angle;
	this.delay = delay;
    }
    update() {
	if (this.type == "point") {
	    // 出現ポイントの縮小，描画
	    this.r -= this.r / 20;
	    drawCircle(this.x, this.y, this.r, null, "cyan");

	} else if (this.type == "shot") {
	    // 弾丸の移動，描画
	    this.delay--;
	    if (this.delay < 0) {
		this.x += Math.cos(this.angle) * 2;
		this.y += Math.sin(this.angle) * 2;
		drawCircle(this.x, this.y, this.r, "lightyellow", "lime");
	    }
	}
    }
}

const init = () => {
    // キャンバスの取得
    canvas = document.getElementById("space");  // キャンバスの取得
    context = canvas.getContext("2d");
    [canvas.width,canvas.height] = [width,height]; // キャンバスのサイズを設定
    context.lineWidth = 4;
    // マウスイベントの登録
    canvas.addEventListener("click",startGame);      // クリックしたとき
    canvas.addEventListener("mousemove",movePlayer); // マウスを動かしたとき
    // 星を作成
    for (let i=0; i<100; i++) {
	const x = Math.random() * width;
	const y = Math.random() * height;
	const r = Math.random() * 1.5;
	stars.push({x:x,y:y,r:r});
    }
    update();
}

const startGame = event => {
    // ゲーム開始
    if (status != "play") {
   	[points.shots] = [[], []];
	_dateNow = Date.now();
	[startTime,prevTime,elapsedTime] = [_dateNow,_dateNow,0];
	movePlayer(event);
	status = "play";
	// _debugCnt = 0;
    }
}

const movePlayer = event => {
    // プレイヤーの移動
    const canvasRect = canvas.getBoundingClientRect();
    px = event.clientX - canvasRect.left;
    py = event.clientY - canvasRect.top - 10;
}


const update = () => {
    // 宇宙空間を描画
    context.fillStyle = "rgba(0,0,0,0.5)";
    context.fillRect(0,0,canvas.width, canvas.height);
    for (const star of stars) {
	if (Math.random() > 0.1) { drawCircle(star.x,star.y,star.r,"white"); }
    }

    // 出現ポイントの発生、プレイヤーの描画
    if (status == "play") {
	// 経過時間，タイムの取得
	_dateNow = Date.now();
	elapsedTime += _dateNow - prevTime;

	// 出現ポイントの発生
	if (elapsedTime > 1000) {
	    // console.log("points.push() " + elapsedTime + " (" + (_dateNow - prevTime) + " = " + _dateNow + " - " + prevTime + ")");
	    elapsedTime = 0;
	    points.push(new Shot("point"));
	}
	[prevTime,time] = [_dateNow, _dateNow - startTime];

	// プレイヤーの描画
	const shape = [[0,10],[20,20],[0,-20],[-20,20]];
	context.fillStyle = "tomato";
	context.beginPath();
	context.moveTo(px + shape[0][0], py + shape[0][1]);
	for (let i = 1; i < shape.length; i++) {
		context.lineTo(px + shape[i][0], py + shape[i][1]);
	}
	context.fill();
    }

    // 出現ポイントの更新
    for(let i = points.length - 1; i >= 0; i--) {
	if (points[i].r <= 1) {
	    // 弾丸を発射
	    console.log("弾丸を発射");
	    const [x,y] = [points[i].x, points[i].y];
	    let angle = 0;
	    if ((time/1000 > 20) && (Math.random() > 0.5)) {
		// 渦巻
		for (let j = 0; j < 64; j++) {
		    angle += Math.PI*2 / 18;
		    shots.push(new Shot("shot",x,y,angle,63-j))
		}
	    } else if ((time/1000 > 10) && (Math.random() > 0.5)) {
		// 円形
		for (let j = 0; j < 16; j++) {
		    angle += Math.PI*2 / 16;
		    shots.push(new Shot("shot",x,y,angle));
		}
	    } else {
		// ランダムに5個
		for (let j = 0; j < 5; j++) {
		    angle += Math.PI*2 * Math.random();
		    shots.push(new Shot("shot",x,y,angle))
		}
	    }
	    points.splice(i,1);
	} else {
	    points[i].update();
	}
    }

    // 弾丸の更新，当たり判定
    for(let i = shots.length - 1; i >= 0; i--) {
	shots[i].update();
	let [x,y,r] = [shots[i].x, shots[i].y, shots[i].r];
	if (Math.hypot(px-x,py-y) < 20) {
		status = "end";
	}
	if ((x < -r) || (x > width + r) || (y < -r) || (y > height+r)) {
		shots.splice(i,1);
	}
    }

    // タイムの表示
    drawText(`TIME : ${(time/1000).toFixed(1)} ${_debugCnt}`,5,5,20,"white","left","top"); _debugCnt++;

    // ゲームオーバーの表示
    if (status == "end") {
	//
	drawText("GAMEOVER", width/2, height/2 - 30, 50, "red");
	drawText("Click here to retry", width/2, height/2 + 20, 30, "red");

    // スタートの表示
    } else if (status == "ready") {
	//
	drawText("Click here to start", width/2, height/2 + 20, 30 , "red");
    }

    window.requestAnimationFrame(update); // アニメーションを実行
}


const drawCircle = (x, y,r,color1,color2 = null) => {
    // 円の描画
    context.fillStyle = color1;
    context.strokeStyle = color2;
    context.beginPath();
    context.arc(x,y,r,0,Math.PI*2);
    if (color2 != null) context.stroke(); // 円の枠線を描く
    if (color1 != null) context.fill();   // 円を塗りつぶす
}

const drawText = (text,x,y,size,color,align = "center",base = "middle") => {
    // テキストの描画
    context.font = `${size}px Arial Black`;
    context.textAlign = align;   // 文字の左右の配置
    context.textBaseline = base; // 文字の基準線
    context.fillStyle = color;
    context.fillText(text,x,y);
}
