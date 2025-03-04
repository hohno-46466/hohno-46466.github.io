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

    document.getElementById("RealtimeClockDisplayArea1").innerHTML = "現在時刻：" + mesgDate + " " + mesgTime1 + " (NTPoffset = " + ntpOffset + "sec) (clock00new(12)/" + shortHash + ")";
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

// MQTT 経由で ntpOffset を取得するしかけ

// var consout = 'MQTT over WebSockets Test'+'<br>'
// document.body.innerHTML = consout

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
        N_reconnectFailCount = 0;

        // 接続できたが成功ではなかった場合 10秒（msec_wait4reconnect）後に再実行 
        subscribeTimeout = setTimeout(() => {
            if (!subscribeSuccess) {
                console.error("MQTT subscribe failed: Possible network restriction on WebSocket.");
            }
        }, msec_wait4reconnect);

        // subscribe する
        client.subscribe(MQTTtopic, function (err) {
            if (!err) {
                // subscribe できた場合
                console.log("Subscribed to topic:", MQTTtopic);
                subscribeSuccess = true;
                clearTimeout(subscribeTimeout);
            } else {
                // subscribe に失敗したらエラーメッセージを出力
                console.error("Subscription error:", err);
            }
        });
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
            // 指定回数以内なら一定時間（wait4amoment）待ってみる
            setTimeout(connectMQTT, msec_wait4amoment);
        }
    });

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
    
        // `ping` を受信した場合、`pong` に変換して返信
        if (message.startsWith("ping")) {
            let responseMessage = message.replace(/^ping/, "pong") + " " + Date.now()/1000.0;
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

async function getShortHash(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase(); // 大文字に変換
    return hashHex.substring(0, 6); // 先頭6桁 (24bit)
}

// ブラウザ用のデバイス識別情報
function getDeviceIdentifier() {
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
