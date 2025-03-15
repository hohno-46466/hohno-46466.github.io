//
// loadmqtt.js
//

function loadScript(primaryUrl, fallbackUrl, localPath) {
    var script = document.createElement("script");
    script.src = primaryUrl;
    script.onload = function () {
        console.log(`Loaded script: ${primaryUrl}`);
    };
    script.onerror = function () {
        console.log(`Failed to load script: ${primaryUrl}, trying fallback...`);
        var fallbackScript = document.createElement("script");
        fallbackScript.src = fallbackUrl;
        fallbackScript.onload = function () {
            console.log(`Loaded fallback script: ${fallbackUrl}`);
        };
        fallbackScript.onerror = function () {
            console.log(`Fallback failed. Loading local script: ${localPath}`);
            var localScript = document.createElement("script");
            localScript.src = localPath;
            document.head.appendChild(localScript);
        };
        document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
}

// メインのCDN URL
const primaryScriptUrl = "https://cdn.jsdelivr.net/npm/mqtt/dist/mqtt.min.js";
// フォールバック CDN URL
const fallbackScriptUrl = "https://unpkg.com/mqtt/dist/mqtt.min.js";
// ローカルのフォールバックパス
const localScriptPath = "MQTT/mqtt.min.js";

// スクリプトをロード
loadScript(primaryScriptUrl, fallbackScriptUrl, localScriptPath);

