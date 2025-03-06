// clock00new.js

// Last update: 2025-02-27(Thu) 19:22 JST / 2025-02-27(Thu) 10:22 UTC

// -----------------------------------------------------------------------------

var intervalID = 0;
var ntpOffset = 0;
var shortHash = "";

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

//
// We can set NTPoffset by using MQTT over websocket
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
var MQTTtopic = "myname/WStest123";

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
    var _nowTime  = new Date(_Time0 + (ntpOffset * 1000)); // Date(_nowMillisec)
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

    var _timeOffset = _nowTime.getTimezoneOffset();
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

    document.getElementById("RealtimeClockDisplayArea1").innerHTML = "現在時刻：" + mesgDate + " " + mesgTime1 + " (NTPoffset = " + ntpOffset + "sec) (clock00new(16)/" + shortHash + ")";
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
    document.querySelector(".container").style.backgroundColor = "darkred";
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
    // 現在時刻を取得 . ntpOffset で時差修正
    var _Time0 = Date.now();
    var currentTime = new Date(_Time0 + (ntpOffset * 1000));

    // delay_msec を取得
    var delay_msec = 1000 - currentTime.getMilliseconds();
    // あまりに「慌ただしい」ときには 1秒追加
    if (delay_msec < 50) { delay_msec += 1000; }

    console.log("Waiting for " + delay_msec + " msec.");

    // delay_msec ミリ秒後に startClock() を起動
    clearInterval(intervalID);

    setTimeout(() => {
        startClock();
        console.log("Syncing completed, Background reset.");
        document.querySelector(".container").style.backgroundColor = "#15151e"; // 元の色
    }, delay_msec);
}

// -----------------------------------------------------------------------------

// startClock() - start calling showClock(). It will be called every 1 sec.

function startClock() {
    // 1000ミリ秒ごとに showClock() を実施（showClock() の実行時間がゼロではないため実行タイミングが少しずつずれてゆく（修正案あり）
    intervalID = setInterval(showClock, 1000);	// 修正: setInterval の引数を文字列ではなく関数にする
    console.log("Let's go by startClock()");
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

// MQTT ブローカから文字列を subscribe して ntpOffset を取り出すしかけだが，接続不良時に配慮しているため長くなっている
function connectMQTT() {
    // MQTT ブローカに接続
    console.log("Attempting to connect to MQTT broker...");
    client = mqtt.connect(WSURL, {
        clientId: "mqtt_client_" + Math.random().toString(16).substr(2, 8),
        clean: true,
        N_reconnectPeriod: 0,
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
                } else {
                    console.error("Subscription error:", err);
                    setTimeout(attemptSubscribe, msec_wait4reconnect); // 10秒後に再試行
                }
            });
        }
        // 初回の subscribe を試みる
        attemptSubscribe();
        // 一定時間後に subscribe が成功しているかチェック
        subscribeTimeout = setTimeout(() => {
            if (!subscribeSuccess) {
                console.error("MQTT subscribe failed: Retrying...");
                attemptSubscribe(); // 再試行
            }
        }, msec_wait4reconnect);
    });
    
    // 接続エラーになった場合（上流のセキュリティ機構が MQTT をブロックしている場合などはエラーする）
    client.on("error", function (error) {
        console.error("MQTT WebSocket error:", error);
    });

    // MQTT 接続が切れた場合
    client.on("close", function () {
        console.warn("MQTT WebSocket connection closed. Retrying...");
        // 再接続を試行
        reconnectFailCount++;
        if (reconnectFailCount >= N_maxReconnectAttempts) {
            // 指定回数以上際接続に失敗したらとりあえず　1時間（msec_cooldownTime）は何もせずに待機
            console.error(`Exceeded max reconnect attempts (${maxReconnectAttempts}). Pausing for 1 hour.`);
            setTimeout(connectMQTT, msec_cooldownTime);
        } else {
            // 指定回数以内なら短時間（5秒間, wait4amoment）待ってから再試行
            setTimeout(connectMQTT, msec_wait4amoment);
        }
    });

    // メッセージが届いた場合の対処
    client.on("message", function (topic, payload) {
        var message = payload.toString().trim(); // 受信メッセージを文字列として取得
        console.log("Received message:", message, "from topic:", topic);
    
        // `offset = 数字.数字` の形式か確認
        const offsetMatch = message.match(/^offset\s*=\s*(-?\d+\.\d+)$/);
        if (offsetMatch) {
            let newOffset = parseFloat(offsetMatch[1]); // 数値に変換
            console.log(`Updating ntpOffset from ${ntpOffset} to ${newOffset}`);
            ntpOffset = newOffset; // 変数に代入
            return;
        }
    
        // `utc = 数字.数字` の形式か確認
        const utcMatch = message.match(/^utc\s*=\s*(-?\d+\.\d+)$/);
        if (utcMatch) {
            let utcTime = parseFloat(utcMatch[1]) * 1000; // 数値に変換し、ミリ秒単位に
            let localTime = Date.now(); // 現在のローカル時刻を取得
            let timeDifference = localTime - utcTime; // 差分を計算
    
            console.log(`UTC Time (ms): ${utcTime}, Local Time (ms): ${localTime}, Difference (ms): ${timeDifference}`);
            ntpOffset = timeDifference;
            return;
        }
    
        // `ping` メッセージ（）を受信した場合、`ping` を `pong` に変換した上で，メッセージの末尾に Date.now()/1000.0 を付加して返信
        if (message.startsWith("ping")) {
            let responseMessage = message.replace(/^ping/, "pong") + " " + (Date.now()/1000.0);
            console.log(`Sending: ${responseMessage}`);
            client.publish(topic, responseMessage); // `pong` を返信
            return;
        }

        // 指定した形式でなければエラーを出力
        console.warn("Message format invalid or not an offset/utc/ping update.");
    });
    
};

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// SHA-256 でハッシュ化する関数
// crypto.subtle.digest() が非同期処理（Promise を返す）なので、async を付ける必要がある
async function getShortHash(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase(); // 大文字に変換
    return hashHex.substring(0, 6); // 先頭6桁 (24bit)
}

// // ブラウザ用のデバイス識別情報
// function getDeviceIdentifier() {
//     return (
//         navigator.userAgent + 
//         navigator.platform + 
//         window.screen.width + "x" + window.screen.height + 
//         Intl.DateTimeFormat().resolvedOptions().timeZone
//         // + Date.now() // 現在時刻を追加
//     );
// }

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

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

async function initializeApp() {
    shortHash = await getShortHash(getDeviceIdentifier());
    console.log("Short hash (24bit):", shortHash);
    MQTTtopic = MQTTtopic + "/" + shortHash;
    console.log("MQTTbroker = " + MQTTURL + ", Topic = " + MQTTtopic) ;

    var button = document.getElementById("button");
    button.addEventListener('mousedown', mouseDown);
    button.addEventListener('mouseup', mouseUp);
    button.addEventListener('click', buttonClick);

    connectMQTT(); // 初回接続
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

initializeApp();
showClock();
syncTime();

// -----------------------------------------------------------------------------
