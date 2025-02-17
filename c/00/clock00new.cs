// clock.js

// -----------------------------------------------------------------------------

var intervalID = 0;
var ntpOffset = 0;

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
    var _Time0  = Date.now();
    var _nowTime  = new Date(_Time0 + (ntpOffset * 1000)); // Date(_nowMillisec)
    var _dow3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    var _nowYear  = _nowTime.getFullYear();  // 修正: getFullYear() に setZero2 を適用しない
    var _nowMonth = setZero2(_nowTime.getMonth() + 1);
    var _nowDate  = setZero2(_nowTime.getDate());
    var _nowDow   = _nowTime.getDay();
    var mesgDate = _nowYear + "-" + _nowMonth + "-" + _nowDate + "(" + _dow3[_nowDow] + ")";

    var _nowHour  = setZero2(_nowTime.getHours());
    var _nowMin   = setZero2(_nowTime.getMinutes());
    var _nowSec   = setZero2(_nowTime.getSeconds());
    var _nowMsec  = setZero3(_nowTime.getMilliseconds());
    var mesgTime1 = _nowHour + ":" + _nowMin + ":" + _nowSec;
    var mesgTime2 = "." + _nowMsec;
    var mesgTime = mesgTime1 + mesgTime2;

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

    document.getElementById("RealtimeClockDisplayArea1").innerHTML = "現在時刻：" + mesgDate + " " + mesgTime1 + " (NTPoffset = " + ntpOffset + "sec)";
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
    console.log("clock stopped.");
}

function mouseUp() {
    console.log("clock restarted.");
    startClock(); // 修正: 先に startClock() を呼ぶ
    syncTime();
}

function buttonClick() {
    // console.log("buttonClick()")
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
        console.log("Syncing completed, starting clock.");
        startClock();
    }, delay_msec);
}

// -----------------------------------------------------------------------------

// startClock() - start calling showClock(). It will be called every 1 sec.

function startClock() {
    intervalID = setInterval(showClock, 1000); // 修正: setInterval の引数を文字列ではなく関数にする
    console.log("Let's go by startClock()");
}

// -----------------------------------------------------------------------------

var button = document.getElementById("button");
button.addEventListener('mousedown', mouseDown);
button.addEventListener('mouseup', mouseUp);
button.addEventListener('click', buttonClick);

showClock();
syncTime();

// -----------------------------------------------------------------------------
