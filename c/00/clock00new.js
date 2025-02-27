// clock00new.js

// Last update: 2025-02-27(Thu) 19:22 JST / 2025-02-27(Thu) 10:22 UTC

// -----------------------------------------------------------------------------

var intervalID = 0;
var ntpOffset = 0;

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

// const WSURL = 'ws://broker.hivemq.com:8000/mqtt'
// const WSURL = 'wss://broker.hivemq.com:8004/mqtt'
// const WSURL = 'ws://test.mosquitto.org:8081'

// const WSURL = 'ws://test.mosquitto.org:8080/mqtt'
// const MQTTtopic = 'hohno-46466/wstest01'

// const WSURL = "ws://test.mosquitto.org:8080/mqtt"; // MQTT WebSocket URL
// const MQTTtopic = "myname/wstest123"; // 購読するトピック

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

    var _nowYear  = _nowTime.getFullYear(); // 修正: getFullYear() に setZero2 を適用しない
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

    document.getElementById("RealtimeClockDisplayArea1").innerHTML = "現在時刻：" + mesgDate + " " + mesgTime1 + " (NTPoffset = " + ntpOffset + "sec) (clock00new(9))";
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
    var _Time0 = Date.now();
    var currentTime = new Date(_Time0 + (ntpOffset * 1000));
    var delay_msec = 1000 - currentTime.getMilliseconds();
    if (delay_msec < 50) { delay_msec += 1000; }

    console.log("Waiting for " + delay_msec + " msec.");
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
    intervalID = setInterval(showClock, 1000); // 修正: setInterval の引数を文字列ではなく関数にする
    console.log("Let's go by startClock()");
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// var consout = 'MQTT over WebSockets Test'+'<br>'
// document.body.innerHTML = consout

// const WSURL = "ws://test.mosquitto.org:8080/mqtt"; // WebSocket URL
const WSURL = "wss://broker.emqx.io:8084/mqtt"; // HiveMQ の WebSocket (SSL)
const MQTTtopic = "myname/wstest123"; // 購読するトピック

var reconnectFailCount = 0;
const maxReconnectAttempts = 5;
const retryDelay = 5000;
const cooldownTime = 3600000;
var client = null;
var ntpOffset = 0; // オフセット変数を定義

function connectMQTT() {
    console.log("Attempting to connect to MQTT broker...");
    client = mqtt.connect(WSURL, {
        clientId: "mqtt_client_" + Math.random().toString(16).substr(2, 8),
        clean: true,
        reconnectPeriod: 0,
    });

    let subscribeTimeout = null;
    let subscribeSuccess = false;

    client.on("connect", function () {
        console.log("Connected to MQTT broker:", WSURL);
        reconnectFailCount = 0;

        subscribeTimeout = setTimeout(() => {
            if (!subscribeSuccess) {
                console.error("MQTT subscribe failed: Possible network restriction on WebSocket.");
            }
        }, 10000);

        client.subscribe(MQTTtopic, function (err) {
            if (!err) {
                console.log("Subscribed to topic:", MQTTtopic);
                subscribeSuccess = true;
                clearTimeout(subscribeTimeout);
            } else {
                console.error("Subscription error:", err);
            }
        });
    });

    client.on("error", function (error) {
        console.error("MQTT WebSocket error:", error);
    });

    client.on("close", function () {
        console.warn("MQTT WebSocket connection closed. Retrying...");

        reconnectFailCount++;
        if (reconnectFailCount >= maxReconnectAttempts) {
            console.error(`Exceeded max reconnect attempts (${maxReconnectAttempts}). Pausing for 1 hour.`);
            setTimeout(connectMQTT, cooldownTime);
        } else {
            setTimeout(connectMQTT, retryDelay);
        }
    });

    client.on("message", function (topic, payload) {
        var message = payload.toString().trim(); // 受信メッセージを文字列として取得
        console.log("Received message:", message, "from topic:", topic);

        // `offset = 数字.数字` の形式か確認
        const match = message.match(/^offset\s*=\s*(-?\d+\.\d+)$/);
        if (match) {
            let newOffset = parseFloat(match[1]); // 数値に変換
            console.log(`Updating ntpOffset from ${ntpOffset} to ${newOffset}`);
            ntpOffset = newOffset; // 変数に代入
        } else {
            console.warn("Message format invalid or not an offset update.");
        }
    });
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

var button = document.getElementById("button");
button.addEventListener('mousedown', mouseDown);
button.addEventListener('mouseup', mouseUp);
button.addEventListener('click', buttonClick);

// 初回接続
connectMQTT();

showClock();
syncTime();

// -----------------------------------------------------------------------------
