//
// safereload.js
//

// 定期的に Javascript を読み込み直すしかけ
// 今は 10分毎だが安定したら 30分か60分毎でよいかと

msec_wait4reload = 5000;    // 5秒
let msec_wait4online = 35000;   // 35秒
let msec_nextReload = 595000;   // 595秒
console.log("safeReload() function has started... (" + Date.now() / 1000 + ")");

function safeReload() {
    let container = document.querySelector(".clock-container");
    if (navigator.onLine) {
        // インターネット接続があれば 5秒後にリロードする 
        console.log("Internet is available. Reloading...");
        container.style.backgroundColor = "#15151e"; 
        setTimeout(() => { location.reload(); }, msec_wait4reload); // 5秒後 // 5 seconds
    } else {
        // インターネット接続がなければ 35秒間待機
        console.log("Internet is offline. Skipping reload.");
        container.style.backgroundColor = "darkred"; 
        setTimeout(safeReload, msec_wait4online); // 35秒後に再試行 // Will execute after 35 seconds.
    }
}
// 次のリロードは 10分後（以前は 3分後だった．徐々に延長中）
setTimeout(() => { safeReload(); }, msec_nextReload); // 10分(595+5=600sec)ごとにリロードを試行
console.log(`safeReload() will be executed every ${msec_nextReload+msec_wait4reload/1000}(== ${msec_nextReload/1000}+${msec_wait4reload/1000}) seconds`);
