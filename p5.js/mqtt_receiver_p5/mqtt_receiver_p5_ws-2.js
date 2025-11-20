//
// mqtt_receiver_p5_ws-2.js
//
// Last update: 2025-08-26(Tue) 06:06 JST / 2025-08-25(Mon) 21:06 UTC
//
// Purpose: MQTT over WebSocket receiver ONLY (no p5.js setup/draw here).
// Exposes Ngauges, POTval, POTmin, POTmax as globals for sketch9.js to render.
// Starts MQTT connection immediately on load.
//

// ---- Globals shared with sketch9.js ----
const Ngauges = 4;
const POTval = new Array(Ngauges).fill(0);
const POTmin = new Array(Ngauges).fill(0);
const POTmax = new Array(Ngauges).fill(256);

// ---- MQTT settings ----
const brokerURL = 'wss://test.mosquitto.org:8081/mqtt';
// const brokerURL = 'wss://broker.hivemq.com:8884/mqtt';
// const brokerURL = 'wss://broker.emqx.io:8084/mqtt';
// const brokerURL = 'ws://localhost:9001';

// const topic = 'mgws25Q2-S999/pseudoBob1';
const topic = 'mgws25Q2-S999/pseudoBob2';

let client = null;

// ==== 追加: 接続パラメータを可変にするため、現在値を変数化 ====
let currentBroker = brokerURL;  // 既存の brokerURL を初期値として流用
let currentTopic  = topic;      // 既存の topic も流用

// ==== 追加: クリーン切断 ====
function stopMQTT() {
  if (client) {
    try {
      client.end(true);  // force close, 即切断
    } catch (e) {
      console.warn('MQTT end error:', e);
    }
    client = null;
  }
}

// ==== 変更: startMQTT で currentBroker/currentTopic を使用 ====
function startMQTT() {
  if (client) return;
  client = mqtt.connect(currentBroker);

  client.on('connect', () => {
    console.log('✅ MQTT connected:', currentBroker);
    const log = document.getElementById('messageLog');
    if (log) log.innerText = '✅ 接続成功';

    // 画面反映
    const tEl = document.getElementById("mqtt_topic");
    const bEl = document.getElementById("mqtt_broker");
    if (tEl) tEl.innerText = currentTopic;
    if (bEl) bEl.innerText = currentBroker;

    client.subscribe(currentTopic, (err) => {
      if (!err) console.log('📡 Subscribed:', currentTopic);
    });
  });

  // on message...
  client.on('message', (_topic, message) => {
    let text = message.toString().replace(/\r/g, '').trim();
    const fields = text.split('\t');
    const log = document.getElementById('messageLog');
    // if (log) log.innerText = `${_topic}: ${text}`;
    if (log) log.innerText = `Message: ${text}`;

    for (let i = 0; i < Ngauges && i < fields.length; i++) {
      const parts = fields[i].split('/');
      if (parts.length === 1) {
        const v = parseFloat(parts[0]);
        if (!isNaN(v)) POTval[i] = v;
      } else if (parts.length === 2) {
        const v = parseFloat(parts[0]);
        const mx = parseFloat(parts[1]);
        if (!isNaN(v)) POTval[i] = v;
        if (!isNaN(mx)) POTmax[i] = mx;
      } else if (parts.length >= 3) {
        const v = parseFloat(parts[0]);
        const mn = parseFloat(parts[1]);
        const mx = parseFloat(parts[2]);
        if (!isNaN(v))  POTval[i] = v;
        if (!isNaN(mn)) POTmin[i] = mn;
        if (!isNaN(mx)) POTmax[i] = mx;
      }
    }
  });

  // on close...
  client.on('close', () => {
    console.warn('⚠️  MQTT connection closed');
  });

  // on error...
  client.on('error', (err) => {
    console.error('❌ MQTT error:', err && err.message ? err.message : err);
  });
}

// ==== 追加: 再起動（任意で broker/topic を更新可能） ====
function restartMQTT({ broker, topic } = {}) {
  if (broker) currentBroker = broker;
  if (topic)  currentTopic  = topic;
  stopMQTT();
  startMQTT();
}

// ==== 追加: トピックだけ差し替えて再購読したい場合 ====
function resubscribe(newTopic) {
  if (!client) return;
  try {
    client.unsubscribe(currentTopic, () => {
      currentTopic = newTopic;
      client.subscribe(currentTopic, (err) => {
        if (!err) {
          console.log('📡 Re-subscribed:', currentTopic);
          const tEl = document.getElementById("mqtt_topic");
          if (tEl) tEl.innerText = currentTopic;
        }
      });
    });
  } catch (e) {
    console.warn('unsubscribe/subscribe error:', e);
  }
}

// ==== 追加: グローバルに操作APIを出しておく（UIから呼べるように） ====
window.MQTTControl = {
  startMQTT,
  stopMQTT,
  restartMQTT,
  resubscribe,
  setParams: (broker, topic) => {
    if (broker) currentBroker = broker;
    if (topic)  currentTopic  = topic;
  },
  getParams: () => ({ broker: currentBroker, topic: currentTopic })
};


// Auto-start on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startMQTT);
} else {
  startMQTT();
}
