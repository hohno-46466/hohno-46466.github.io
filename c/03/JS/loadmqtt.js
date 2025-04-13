//
// loadmqtt.js
//

// メインのCDN URL
const primaryScriptUrl = "https://cdn.jsdelivr.net/npm/mqtt/dist/mqtt.min.js";
// フォールバック CDN URL
const fallbackScriptUrl = "https://unpkg.com/mqtt/dist/mqtt.min.js";
// ローカルのフォールバックパス
const localScriptPath = "JS/mqtt.min.js";

function loadScript(url, onLoad) {
    var script = document.createElement("script");
    script.src = url;
    script.onload = function () {
        console.log(`Loaded script: ${url}`);
        if (onLoad) onLoad();
    };
    script.onerror = function () {
        console.warn(`Failed to load script: ${url}`);
    };
    document.head.appendChild(script);
}

// まずローカルの `JS/mqtt.min.js` を即座にロード
loadScript(localScriptPath, function () {
    console.log("Using local mqtt.min.js. Now checking CDN versions...");

    // ここから非同期でCDNのスクリプトを試す
    fetch(primaryScriptUrl, { method: "HEAD" })
        .then(response => {
            if (response.ok) {
                console.log("Primary CDN available. Loading...");
                loadScript(primaryScriptUrl, function () {
                    console.log("Switched to Primary CDN version of mqtt.min.js");
                });
            } else {
                throw new Error("Primary CDN not available");
            }
        })
        .catch(() => {
            fetch(fallbackScriptUrl, { method: "HEAD" })
                .then(response => {
                    if (response.ok) {
                        console.log("Fallback CDN available. Loading...");
                        loadScript(fallbackScriptUrl, function () {
                            console.log("Switched to Fallback CDN version of mqtt.min.js");
                        });
                    } else {
                        throw new Error("Fallback CDN not available");
                    }
                })
                .catch(() => {
                    console.warn("All CDN versions failed. Using local mqtt.min.js.");
                });
        });
});
