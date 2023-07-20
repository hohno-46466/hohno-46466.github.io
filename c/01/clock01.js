// clock01.js

// First version: Thu Jul 13 21:38:56 JST 2023
// Last update: Mon Jul 17 17:39:07 JST 2023
var interval;
var ntpOffset = getNTPoffset();

function setZero2(x){
    var _ret = x;
    if (x < 10) { _ret = "0" + _ret; }
    return _ret;
}

function setZero3(x) {
    var _ret = x;
    if (x < 100) { _ret = "0" + _ret; }
    if (x < 10)  { _ret = "0" + _ret; } 
    return _ret;
}


function getNTPoffset() {
    return 0; // -300; // in millisec
}


function showClock() {
    var _Time0  = Date.now();
    _Time0 += ntpOffset;
    var _nowTime  = new Date(_Time0); // Date(_nowMillisec);
    var _dow3 = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");

    var _nowYear  = setZero2(_nowTime.getFullYear());
    var _nowMonth = setZero2(_nowTime.getMonth());
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
    var mesgToffset = "UTC"
    if (_timeOffset > 0) {
        mesgToffset = mesgToffset + "+" + _timeOffset/60;
    } else if (_timeOffset < 0) {
        mesgToffset = mesgToffset + "" + _timeOffset/60;
    }

    var _nowUTCyear  = setZero2(_nowTime.getUTCFullYear());
    var _nowUTCmonth = setZero2(_nowTime.getUTCMonth());
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

    document.getElementById("RealtimeClockDisplayArea1").innerHTML = "現在時刻：" + mesgDate + " " + mesgTime1;
    document.getElementById("RealtimeClockDisplayArea2").innerHTML = "ＵＴＣ　：" + mesgUTCdate + " " + mesgUTCtime1;
    // myDate.innerHTML = mesgDate;
    // myTime.innerHTML = mesgTime1;
    // console.log(mesgDate);
    // console.log(mesgTime);
    document.querySelector(".clock-date").innerText = mesgDate;
    document.querySelector(".clock-time1").innerText = mesgTime1;
    document.querySelector(".clock-time2").innerText = mesgTime2;
    document.querySelector(".clock-timezone").innerText = mesgToffset;
}

function startClock() {
    interval = setInterval('showClock()', 1000);
    console.log("Go!")
}

function mouseDown() {
    // console.log("mouseDown()");
    clearInterval(interval);
    console.log("clock stopped.");

}

function mouseUp() {
    // console.log("mouseUp()");
    console.log("clock restarted.");
    syncTime();
}

function buttonClick() {
    // console.log("buttonClick()");
}

function syncTime() {
    var _Time0 = Date.now();
    _Time0 += ntpOffset;
    var currentTime = new Date(_Time0); // Date(_nowMillisec);
    // var currentTime = new Date();
    var delay_msec = 1000 - currentTime.getMilliseconds();
    if (delay_msec < 50) { delay_msec += 1000; }
    // delay_msec -= 10; // offset
    console.log("Waiting for " + delay_msec + "msec.");
    setTimeout(startClock, delay_msec);
}


var button = document.getElementById("button");
button.addEventListener('mousedown', mouseDown);
button.addEventListener('mouseup', mouseUp);
button.addEventListener('click', buttonClick);

showClock();
syncTime();

