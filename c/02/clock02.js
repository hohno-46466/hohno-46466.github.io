// clock02.js

// First version: Sun Aug 20 00:55:05 ADT 2023

// See also:
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
// https://beta-notes.way-nifty.com/blog/2020/03/post-ebcf2e.html for websocket related codings
// https://www.nishishi.com/javascript-tips/realtime-clock-setinterval.html   
// https://web-dev.tech/front-end/javascript/digital-clock/


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
//    mosquitto_pub -l -t hohno/wstest01 -h broker.hivemq.com
//

// -----------------------------------------------------------------------------

// const WSURL = 'ws://broker.hivemq.com:8000/mqtt'
// const WSURL = 'wss://broker.hivemq.com:8004/mqtt'
// const WSURL = 'ws://test.mosquitto.org:8081'
// const WSURL = 'wss://test.mosquitto.org:8884'
const WSURL = 'ws://test.mosquitto.org:8081'

const MQTTtopic = 'hohno/wstest01'

// -----------------------------------------------------------------------------

var intervalID = 0
var ntpOffset = 0

// -----------------------------------------------------------------------------

// setZero2() - zero padding (for two digits)
// setZero3() - zero padding (for three digits)

function setZero2(x) {
    var _ret = x
    if (x < 10) { _ret = "0" + _ret }
    return _ret
}

function setZero3(x) {
    var _ret = x
    if (x < 100) { _ret = "0" + _ret }
    if (x < 10)  { _ret = "0" + _ret } 
    return _ret
}

// -----------------------------------------------------------------------------

// showClock() - display digital clock

function showClock() {
    var _Time0  = Date.now()
    // _Time0 += ntpOffset
    var _nowTime  = new Date(_Time0 + (ntpOffset * 1000)) ; // Date(_nowMillisec)
    var _dow3 = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")

    var _nowYear  = setZero2(_nowTime.getFullYear())
    var _nowMonth = setZero2(_nowTime.getMonth()+1)
    var _nowDate  = setZero2(_nowTime.getDate())
    var _nowDow   = _nowTime.getDay()
    var mesgDate = _nowYear + "-" + _nowMonth + "-" + _nowDate + "(" + _dow3[_nowDow] + ")"
    
    var _nowHour  = setZero2(_nowTime.getHours())
    var _nowMin   = setZero2(_nowTime.getMinutes())
    var _nowSec   = setZero2(_nowTime.getSeconds())
    var _nowMsec  = setZero3(_nowTime.getMilliseconds())
    var mesgTime1 = _nowHour + ":" + _nowMin + ":" + _nowSec
    var mesgTime2 = "." + _nowMsec
    var mesgTime = mesgTime1 + mesgTime2

    var _timeOffset = _nowTime.getTimezoneOffset()
    var mesgTimeOffset = "UTC"
    if (_timeOffset > 0) {
        mesgTimeOffset = mesgTimeOffset + "+" + _timeOffset/60
    } else if (_timeOffset < 0) {
        mesgTimeOffset = mesgTimeOffset + "" + _timeOffset/60
    }

    var _nowUTCyear  = setZero2(_nowTime.getUTCFullYear())
    var _nowUTCmonth = setZero2(_nowTime.getUTCMonth()+1)
    var _nowUTCdate  = setZero2(_nowTime.getUTCDate())
    var _nowUTCdow   = _nowTime.getUTCDay()
    var mesgUTCdate = _nowUTCyear + "-" + _nowUTCmonth + "-" + _nowUTCdate + "(" + _dow3[_nowUTCdow] + ")"
    
    var _nowUTChour  = setZero2(_nowTime.getUTCHours())
    var _nowUTCmin   = setZero2(_nowTime.getUTCMinutes())
    var _nowUTCsec   = setZero2(_nowTime.getUTCSeconds())
    var _nowUTCmsec  = setZero3(_nowTime.getUTCMilliseconds())
    var mesgUTCtime1 = _nowUTChour + ":" + _nowUTCmin + ":" + _nowUTCsec
    var mesgUTCtime2 = "." + _nowUTCmsec
    var mesgUTCTime = mesgUTCtime1 + mesgUTCtime2

    document.getElementById("RealtimeClockDisplayArea1").innerHTML = "現在時刻：" + mesgDate + " " + mesgTime1 + " (NTPoffset = " + ntpOffset + "sec)"
    document.getElementById("RealtimeClockDisplayArea2").innerHTML = "ＵＴＣ　：" + mesgUTCdate + " " + mesgUTCtime1
    // myDate.innerHTML = mesgDate
    // myTime.innerHTML = mesgTime1
    // console.log(mesgDate)
    // console.log(mesgTime)
    document.querySelector(".clock-date").innerText = mesgDate
    document.querySelector(".clock-time1").innerText = mesgTime1
    document.querySelector(".clock-time2").innerText = mesgTime2
    document.querySelector(".clock-timezone").innerText = mesgTimeOffset
}

// -----------------------------------------------------------------------------

// mouseDown()   - mouse button pressed
// mouseUp()     - mouse button released
// buttonClock() - mouse button clicked

function mouseDown() {
    // console.log("mouseDown()")
    clearInterval(intervalID)
    console.log("clock stopped.")
}

function mouseUp() {
    // console.log("mouseUp()")
    console.log("clock restarted.")
    syncTime()
}

function buttonClick() {
    // console.log("buttonClick()")
}

// -----------------------------------------------------------------------------

// syncTime() - wait for several sub-seconds to synchronize time

function syncTime() {
    var _Time0 = Date.now()
    var currentTime = new Date(_Time0 + (ntpOffset * 1000)) 
    var delay_msec = 1000 - currentTime.getMilliseconds()
    if (delay_msec < 50) { delay_msec += 1000 }
    // delay_msec -= 10; // offset
    console.log("Waiting for " + delay_msec + "msec.")
    clearInterval(intervalID)
    setTimeout(startClock, delay_msec)
}

// -----------------------------------------------------------------------------

// startClock() - start calling showClock(). It will be called every 1sec.

function startClock() {
    intervalID = setInterval('showClock()', 1000)
    console.log("Let's go by startClock()")
}

// -----------------------------------------------------------------------------

// var consout = 'MQTT over WebSockets Test'+'<br>'
// document.body.innerHTML = consout

var client = mqtt.connect(WSURL)

client.subscribe(MQTTtopic) // subscribe Topic

client.on('message', function(topic, payload) {
        var _text = payload.toString()
        var _words = _text.split('=') //(/[ \t]/)
        var _key = _words[0].trim()
        var _val = _words[1]
        if (_key == "offset") {
            var _newOffset = Number(_val.trim().split(' ')[0])
            if (_newOffset != ntpOffset) {
                ntpOffset = _newOffset
                syncTime()
            }
        }
        _mesg = "key=[" + _key + "] val=[" + _val + "] -> ntpOffset=[" + ntpOffset + "]"
        console.log(_mesg)
    }
)

// -----------------------------------------------------------------------------

var button = document.getElementById("button")
button.addEventListener('mousedown', mouseDown)
button.addEventListener('mouseup', mouseUp)
button.addEventListener('click', buttonClick)

showClock()
syncTime()

// -----------------------------------------------------------------------------
