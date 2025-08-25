//
// mqtt_receiver_p5_ws.js
//
// Last update: 2025-08-26(Tue) 06:06 JST / 2025-08-25(Mon) 21:06 UTC
//
// Purpose: MQTT over WebSocket receiver ONLY (no p5.js setup/draw here).
// Exposes Ngauges, POTval, POTmin, POTmax as globals for sketch9.js to render.
// Starts MQTT connection immediately on load.
//

// ---- Globals shared with sketch9.js ----
const Ngauges = 8;
const POTval = new Array(Ngauges).fill(0);
const POTmin = new Array(Ngauges).fill(0);
const POTmax = new Array(Ngauges).fill(256);

// ---- MQTT settings ----
const brokerURL = 'wss://test.mosquitto.org:8081/mqtt';
// const brokerURL = 'wss://localhost:9001';
const topic = 'mgws25Q2-S999/pseudoBob2';
let client = null;

function startMQTT() {
  if (client) return; // already started
  client = mqtt.connect(brokerURL);

  client.on('connect', () => {
    console.log('✅ MQTT connected:', brokerURL);
    const log = document.getElementById('messageLog');
    if (log) log.innerText = '✅ 接続成功';
    client.subscribe(topic, (err) => {
      if (!err) console.log('Subscribed:', topic);
    });
  });

  client.on('message', (_topic, message) => {
    let text = message.toString().replace(/\r/g, '').trim();
    const fields = text.split('\t');
    const log = document.getElementById('messageLog');
    if (log) log.innerText = `${_topic}: ${text}`;

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

  client.on('close', () => {
    console.warn('⚠️ MQTT connection closed');
  });

  client.on('error', (err) => {
    console.error('❌ MQTT error:', err && err.message ? err.message : err);
  });
}

// Auto-start on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startMQTT);
} else {
  startMQTT();
}
