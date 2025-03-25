// clock00new.js
// No.042
// Prev update: 2025-02-27(Thu) 19:22 JST / 2025-02-27(Thu) 10:22 UTC
// Prev update: 2025-03-08(Sat) 02:52 JST / 2025-03-07(Fri) 17:52 UTC
// Prev update: 2025-03-13(Thu) 22:40 JST / 2025-03-13(Thu) 13:40 UTC
// Prev update: 2025-03-17(Mon) 09:08 JST / 2025-03-17(Mon) 00:08 UTC
// Prev update: 2025-03-21(Fri) 20:15 JST / 2025-03-21(Fri) 11:15 UTC
// Last update: 2025-03-23(Sun) 13:00 JST / 2025-03-23(Sun) 04:00 UTC

// -----------------------------------------------------------------------------

var intervalID = 0;
var ClockOffset = 0;
var lastUpdateOfClockOffset = 0;
var shortHash = "";

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

//
// We can set ClockOffset by using MQTT over websocket
//
// message format: "offset = value" 
//
// The value is the number of seconds expressed in fixed-point format
// The value must be negative if the result of ntpdate is negative.
//
//  $ ntpdate -q ntp.nict.jp 2> /dev/null               |
//    egrep 'adjust time server'                        |
//    tail -1                                           |        
//    sed -e 's/^.*offset //'                           |
//    awk '{printf "offset = %5.3f\n", $1; fflush()}'   |
//    mosquitto_pub -l -t hohno-46466/wstest01 -h broker.hivemq.com
//

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// hivemq.com は最近応答性が悪い（制限している？）
// const WSURL = 'ws://broker.hivemq.com:8000/mqtt'
// const WSURL = 'wss://broker.hivemq.com:8004/mqtt'

// mosquitto.org は wss:// をサポートしていない
// const WSURL = 'ws://test.mosquitto.org:8081'
// const WSURL = "ws://test.mosquitto.org:8080/mqtt"; // MQTT WebSocket URL

// emqx.io は wss:// を提供しているが実験的用途に限定されている
const WSURL = "wss://broker.emqx.io:8084/mqtt"; // HiveMQ の WebSocket (SSL)
const MQTTURL = "broker.emqx.io";

// 購読するトピック
// const MQTTtopic = 'hohno-46466/wstest01'
const MQTTtopicZero = "myname/WStest123";
var MQTTtopic = MQTTtopicZero;

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// setZero2() - zero padding (for two digits)
// setZero3() - zero padding (for three digits)

function setZero2(x) {
    return x.toString().padStart(2, "0");
}

function setZero3(x) {
    return x.toString().padStart(3, "0");
}

// -----------------------------------------------------------------------------

// showClock() - display digital clock

function showClock() {
    var _Time0    = Date.now();
    var _nowTime  = new Date(_Time0 + (ClockOffset * 1000)); // Date(_nowMillisec)
    var _dow3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    var _nowYear  = _nowTime.getFullYear();	// 修正: getFullYear() に setZero2 を適用しない
    var _nowMonth = setZero2(_nowTime.getMonth() + 1);
    var _nowDate  = setZero2(_nowTime.getDate());
    var _nowDow   = _nowTime.getDay();
    var mesgDate  = _nowYear + "-" + _nowMonth + "-" + _nowDate + "(" + _dow3[_nowDow] + ")";

    var _nowHour  = setZero2(_nowTime.getHours());
    var _nowMin   = setZero2(_nowTime.getMinutes());
    var _nowSec   = setZero2(_nowTime.getSeconds());
    var _nowMsec  = setZero3(_nowTime.getMilliseconds());
    var mesgTime1 = _nowHour + ":" + _nowMin + ":" + _nowSec;
    var mesgTime2 = "." + _nowMsec;
    var mesgTime  = mesgTime1 + mesgTime2;

    var _timeOffset = -1 * _nowTime.getTimezoneOffset();
    var mesgTimeOffset = "UTC";
    if (_timeOffset > 0) {
        mesgTimeOffset += "+" + _timeOffset / 60;
    } else if (_timeOffset < 0) {
        mesgTimeOffset += _timeOffset / 60;
    }

    var _nowUTCyear  = _nowTime.getUTCFullYear(); // 修正: getUTCFullYear() に setZero2 を適用しない
    var _nowUTCmonth = setZero2(_nowTime.getUTCMonth() + 1);
    var _nowUTCdate  = setZero2(_nowTime.getUTCDate());
    var _nowUTCdow   = _nowTime.getUTCDay();
    var mesgUTCdate = _nowUTCyear + "-" + _nowUTCmonth + "-" + _nowUTCdate + "(" + _dow3[_nowUTCdow] + ")";

    var _nowUTChour  = setZero2(_nowTime.getUTCHours());
    var _nowUTCmin   = setZero2(_nowTime.getUTCMinutes());
    var _nowUTCsec   = setZero2(_nowTime.getUTCSeconds());
    var _nowUTCmsec  = setZero3(_nowTime.getUTCMilliseconds());
    var mesgUTCtime1 = _nowUTChour + ":" + _nowUTCmin + ":" + _nowUTCsec;
    var mesgUTCtime2 = "." + _nowUTCmsec;
    var mesgUTCTime = mesgUTCtime1 + mesgUTCtime2;

    document.getElementById("RealtimeClockDisplayArea1").innerHTML = "現在時刻：" + mesgDate + " " + mesgTime1
    + " (ClockOffset=" + ClockOffset.toFixed(3) + "sec(" + ((ClockOffset > 0.0) ? "遅延補正中" : (ClockOffset < 0.0) ? "先行補正中" : "--") + "))(clock00new(42/" + shortHash + ")";
    document.getElementById("RealtimeClockDisplayArea2").innerHTML = "ＵＴＣ　：" + mesgUTCdate + " " + mesgUTCtime1;
    
    document.querySelector(".clock-date").innerText = mesgDate;
    document.querySelector(".clock-time1").innerText = mesgTime1;
    document.querySelector(".clock-time2").innerText = mesgTime2;
    document.querySelector(".clock-timezone").innerText = mesgTimeOffset;
}

// -----------------------------------------------------------------------------

// mouseDown() - mouse button pressed
// mouseUp() - mouse button released
// buttonClock() - mouse button clicked

function mouseDown() {
    clearInterval(intervalID);
    console.log("Clock stopped. Background set to darkred.");
    document.querySelector(".clock-container").style.backgroundColor = "darkred";
}

function mouseUp() {
    console.log("clock restarted.");
    // startClock(); // 修正: 先に startClock() を呼ぶ
    syncTime();
}

function buttonClick() {
    // console.log("buttonClick()");
}

// -----------------------------------------------------------------------------

// syncTime() - wait for several sub-seconds to synchronize time
function syncTime() {
    document.querySelector(".clock-container").style.backgroundColor = "darkgreen";

    // 現在時刻を取得 . ClockOffset で時差修正
    var _Time0 = Date.now();
    var currentTime = new Date(_Time0 + (ClockOffset * 1000));

    // delay_msec を取得
    var delay_msec = 1000 - currentTime.getMilliseconds();
    // あまりに「慌ただしい」ときには 1秒追加
    if (delay_msec < 50) { delay_msec += 1000; }

    console.log(`Waiting for ${delay_msec} msec.`);

    // delay_msec ミリ秒後に startClock() を起動
    clearInterval(intervalID);

    setTimeout(() => {
        startClock();
        console.log("Syncing completed, Background reset.");
        document.querySelector(".clock-container").style.backgroundColor = "#15151e"; // 元の色
    }, delay_msec);
}

// -----------------------------------------------------------------------------

// startClock() - start calling showClock(). It will be called every 1 sec.

function startClockOld() {
    // 1000ミリ秒ごとに showClock() を実施（showClock() の実行時間がゼロではないため実行タイミングが少しずつずれてゆく（修正案あり）
    intervalID = setInterval(showClock, 1000);	// 修正: setInterval の引数を文字列ではなく関数にする
    console.log("Let's go by startClock()");
}

function startClock() {
    function tick() {
        showClock();
        const now = Date.now() + (ClockOffset * 1000);
        const delay = 1000 - (now % 1000); // 次の秒の開始までの時間
        setTimeout(tick, delay);
    }
    tick();
    console.log("Clock started with precise timing.");
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// MQTT 経由でメッセージを受けとり対応する動作をするしかけ

var N_reconnectFailCount = 0;
const N_maxReconnectAttempts = 5;
const msec_wait4amoment = 5000;
const msec_cooldownTime = 3600000;
const msec_wait4reconnect = 10000;
var client = null;

// MQTT ブローカから文字列を subscribe して ClockOffset を取り出すしかけだが，接続不良時に配慮しているため長くなっている
function connectMQTT() {
    // MQTT ブローカに接続
    console.log("Attempting to connect to MQTT broker...");
    client = mqtt.connect(WSURL, {
        clientId: "mqtt_client_" + Math.random().toString(16).substr(2, 8),
        clean: true,
        reconnectPeriod: 0,
    });

    let subscribeTimeout = null;
    let subscribeSuccess = false;

    // 接続できた場合
    client.on("connect", function () {
        console.log("Connected to MQTT broker:", WSURL);
        N_reconnectFailCount = 0; // 失敗カウントをリセット
        subscribeSuccess = false; // 初期状態では subscribe に成功していない

        // attemptSubscribe() を用意
        function attemptSubscribe() {
            client.subscribe(MQTTtopic, function (err) {
                if (!err) {
                    console.log("Subscribed to topic:", MQTTtopic);
                    subscribeSuccess = true; // 成功フラグをセット
                    let responseMessage = "Hello! " + shortHash + " " + (Date.now()/1000.0);
                    console.log("Sending:", responseMessage);
                    client.publish(MQTTtopic, responseMessage);
        
                } else {
                    console.log("Subscription error:", err);
                    setTimeout(attemptSubscribe, msec_wait4reconnect); // 10秒後に再試行
                }
            });
        }
        // 初回の subscribe を試みる
        attemptSubscribe();
        // 一定時間後に subscribe が成功しているかチェック
        subscribeTimeout = setTimeout(() => {
            if (!subscribeSuccess) {
                console.log("MQTT subscribe failed: Retrying...");
                attemptSubscribe(); // 再試行
            }
        }, msec_wait4reconnect);
    });
    
    // 接続エラーになった場合（上流のセキュリティ機構が MQTT をブロックしている場合などはエラーする）
    client.on("error", function (error) {
        console.log("MQTT WebSocket error:", error);
    });

    // MQTT 接続が切れた場合
    client.on("close", function () {
        console.log("MQTT WebSocket connection closed. Retrying...");
        // 再接続を試行
        N_reconnectFailCount++;
        if (N_reconnectFailCount >= N_maxReconnectAttempts) {
            // 指定回数以上際接続に失敗したらとりあえず　1時間（msec_cooldownTime）は何もせずに待機
            console.log(`Exceeded max reconnect attempts (${maxReconnectAttempts}). Pausing for 1 hour.`);
            setTimeout(connectMQTT, msec_cooldownTime);
        } else {
            // 指定回数以内なら短時間（5秒間, wait4amoment）待ってから再試行
            setTimeout(connectMQTT, msec_wait4amoment);
        }
    });

    // メッセージが届いた場合の対処
    client.on("message", function (topic, payload) {
        var message = payload.toString().trim(); // 受信メッセージを文字列として取得
        console.log(`Received message: ${message} from topic: ${topic}`);
    
        // `offset = 数字.数字` の形式か確認
        const offsetMatch = message.match(/^offset\s*=\s*(-?\d+\.\d+)$/);
        if (offsetMatch) {
            let localTime = Date.now(); // 現在のローカル時刻を取得
            let newOffset = 0.0;
            let magicOffset = 0.0; // 0.3   // magic!! // (2025-03-21: 試行錯誤の結果 0 に戻した．まもなく廃止する予定)
            if ((localTime - lastUpdateOfClockOffset) > 1000) {     // 1000 は暫定値
                newOffset = parseFloat(offsetMatch[1]);           // 数値に変換
                console.log(`Updating ClockOffset from ${ClockOffset.toFixed(3)} to ${(newOffset+magicOffset).toFixed(3)} (${newOffset.toFixed(3)} + ${magicOffset.toFixed(3)})`);
                ClockOffset = (newOffset + magicOffset); // 変数に代入
                syncTime();
                lastUpdateOfClockOffset = localTime;
            } else {
                let _debug = localTime - lastUpdateOfClockOffset;
                // console.log(`Updating ClockOffset from ${ClockOffset.toFixed(3)} to ${newOffset}.toFixed(3) has been cancelled. (Debug: ${localTime} - ${lastUpdateOfClockOffset} = ${_debug}) due to excessive access.`);
                console.log(`Updating ClockOffset from ${ClockOffset.toFixed(3)} to ${(newOffset+magicOffset).toFixed(3)} (${newOffset.toFixed(3)} + ${magicOffset.toFixed(3)}) due to excessive (${_debug}ms) access.`);
            }
            return;
        }
    
        // `utc = 数字.数字` の形式か確認
        const utcMatch = message.match(/^utc\s*=\s*(-?\d+\.\d+)$/);
        if (utcMatch) {
            let localTime = Date.now(); // 現在のローカル時刻を取得
            let utcTime = 0;
            let timeDifference = 0;
            if (localTime - lastUpdateOfClockOffset > 1000) {     // 1000 は暫定値
                utcTime = parseFloat(utcMatch[1]) * 1000;       // 数値に変換し、ミリ秒単位に
                timeDifference = localTime - utcTime; // 差分を計算
                console.log(`UTC Time (ms): ${utcTime}, Local Time (ms): ${localTime}, Difference (ms): ${timeDifference}`);
                ClockOffset = timeDifference;
                syncTime();     // 2025-03-13 追加
                lastUpdateOfClockOffset = Date.now;
            } else {
                console.log(`UTC Time (ms): ${utcTime}, Local Time (ms): ${localTime}, Difference (ms): ${timeDifference} but has been cancelled due to excessive access.`);
            }
            return;
        }
    
        // `ping` メッセージ（）を受信した場合、`ping` を `pong` に変換した上で，メッセージの末尾に Date.now()/1000.0 を付加して返信
        if (message.startsWith("ping")) {
            document.querySelector(".clock-container").style.backgroundColor = "darkblue";
            let responseMessage = message.replace(/^ping/, "pong") + " " + (Date.now()/1000.0);
            console.log("Sending:", responseMessage);
            client.publish(topic, responseMessage); // `pong` を返信
            return;
        }

        if (message.startsWith("Hello!") || message.startsWith("pong")) {
            // just ignore this
            return;
        }

        // 指定した形式でなければエラーを出力
        console.log(`Message format invalid or not an offset/utc/ping update. (${message})`);
    });
    
};

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// SHA-256 でハッシュ化する関数（uuid が使えないので悪戦苦闘）
// crypto.subtle.digest() が非同期処理（Promise を返す）なので、async を付ける必要がある
async function getShortHash(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase(); // 大文字に変換
    return hashHex.substring(0, 6); // 先頭6桁 (24bit)
}

// ランダムな数値が欲しくて悪戦苦闘
async function getCanvasFingerprint() {
    // `canvas fingerprinting` を利用
    const canvas = document.createElement("canvas");    // この関数内で使用する canvas 要素を作る
    const ctx = canvas.getContext("2d");                // 2D描画用のコンテキストを取得
    ctx.textBaseline = "top";                           // テキストの基準線を top に設定
    ctx.font = "14px 'Arial'";                          // フォントの種類とサイズを設定
    ctx.fillStyle = "#000000"; // 一貫性を持たせるためにフォント色を指定    
    ctx.fillText("Hello, fingerprint!", 2, 2);          // キャンバス上にテキストを描画
    return canvas.toDataURL("image/png"); // 画像データとして取得（フォーマット指定）
}

// ブラウザ用のデバイス識別情報（その１）
async function getDeviceIdentifier() {
    // 基本的なデバイス情報
    let deviceInfo = [
        navigator.userAgent,
        navigator.platform,
        window.screen.width + "x" + window.screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone
    ];

    // `deviceMemory`（RAMサイズ）と `hardwareConcurrency`（CPUコア数）を追加
    if (navigator.deviceMemory) {
        deviceInfo.push("RAM:" + navigator.deviceMemory);
    }
    if (navigator.hardwareConcurrency) {
        deviceInfo.push("CPU:" + navigator.hardwareConcurrency);
    }
    // キャンバスフィンガープリントを取得（非同期）
    deviceInfo.push(await getCanvasFingerprint());
    
    // SHA-256 でハッシュ化して識別子を生成
    // getShortHash() 中の crypto.subtle.digest() の処理を待つために getShortHash() は async 宣言しており，呼び出し側は await が必要
    // (async を使った関数は Promise を返す．この場合，await しないと正しい値を取得できない)
    return await getShortHash(deviceInfo.join("|"));
}

// ブラウザ用のデバイス識別情報（その２）
function getDeviceIdentifier2() {
    return (
        navigator.userAgent + 
        navigator.platform + 
        window.screen.width + "x" + window.screen.height + 
        Intl.DateTimeFormat().resolvedOptions().timeZone
        // + Date.now() // 現在時刻を追加
    );
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

async function initializeApp() {
    const deviceID = await getDeviceIdentifier();
    shortHash = await getShortHash(deviceID);
    console.log("Short hash (24bit):", shortHash);
    MQTTtopic = MQTTtopicZero + "/" + shortHash;
    console.log(`MQTTbroker = ${MQTTURL}, Topic = ${MQTTtopic}`) ;

    var button = document.getElementById("button1");
    button.addEventListener('mousedown', mouseDown);
    button.addEventListener('mouseup', mouseUp);
    button.addEventListener('click', buttonClick);

    document.getElementById("button2").addEventListener("click", function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
    
    let attempts = 0;
    let maxAttempts = 20; // 500ms * 20 = 最大10秒間リトライ

    let checkMqtt = setInterval(() => {
        if (typeof mqtt !== "undefined") {
            clearInterval(checkMqtt);
            console.log("MQTT library is ready. Connecting...");
            connectMQTT();
        } else {
            attempts++;
            console.log(`MQTT is not defined yet. Retrying... (${attempts}/${maxAttempts})`);
            if (attempts >= maxAttempts) {
                clearInterval(checkMqtt);
                console.log("MQTT failed to load after multiple attempts.");
            }
        }
    }, 500);
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

initializeApp();
showClock();
syncTime();

// -----------------------------------------------------------------------------


