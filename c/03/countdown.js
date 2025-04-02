//
// countdown.js
// No.011
// First version: 2025-04-01(Tue) 21:12 JST / 2025-04-01(Tue) 12:12 UTC
//

document.addEventListener('DOMContentLoaded', () => {
    countdown();
});

function countdown() {

    // メッセージ
    const message1 = 'Time Remaining Until Retirement';
    const message3 = 'Hello, my new world!';
    const messagex = 'test test test';

    // ターゲット時刻
    const targetTime = new Date('2026-04-01T00:00:00+09:00');

    // 要素取得
    const d0Elem = document.querySelector('.d0');
    const h1Elem = document.querySelector('.h1');
    const h2Elem = document.querySelector('.h2');
    const m1Elem = document.querySelector('.m1');
    const m2Elem = document.querySelector('.m2');
    const s1Elem = document.querySelector('.s1');
    const s2Elem = document.querySelector('.s2');
    const s3Elem = document.querySelector('.s3');
    const mxElem = document.querySelector('.mx');
    const container1 = document.querySelector('.container1');
    const container3 = document.querySelector('.container3');

    const udElem = document.querySelector('.ud');
    const uhElem = document.querySelector('.uh');
    const umElem = document.querySelector('.um');
    const uxElem = document.querySelector('.ux');
    const usElem = document.querySelector('.us');

   // メッセージ更新
    container1.textContent = message1;
    container3.textContent = message3;
    udElem.textContent = "days";
    uhElem.textContent = "hrs";
    umElem.textContent = "min";
    uxElem.textContent = ".";
    usElem.textContent = "sec";

    function updateCountdown() {
        const now = new Date();
        let diff = targetTime - now;
        if (diff < 0) diff = 0;

        const ms = diff % 1000;
        const totalSeconds = Math.floor(diff / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const days = Math.floor(totalSeconds / (3600 * 24));

        const h1 = Math.floor(hours / 10);
        const h2 = hours % 10;
        const m1 = Math.floor(minutes / 10);
        const m2 = minutes % 10;
        const s1 = Math.floor(seconds / 10);
        const s2 = seconds % 10;
        const s3 = Math.floor(ms / 100);

        d0Elem.textContent = days;
        h1Elem.textContent = h1;
        h2Elem.textContent = h2;
        m1Elem.textContent = m1;
        m2Elem.textContent = m2;
        s1Elem.textContent = s1;
        s2Elem.textContent = s2;
        s3Elem.textContent = s3;
        mxElem.textContent = "(as of " + now + ")";

    }

    // フルスクリーン切り替え関数
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // bodyクリック時にフルスクリーン切り替え
    document.body.addEventListener('click', toggleFullscreen);

    updateCountdown();
    setInterval(updateCountdown, 100);
};
