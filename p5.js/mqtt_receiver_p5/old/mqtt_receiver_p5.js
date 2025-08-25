// mqtt_receiver_p5.js
const Ngauges = 5;
const POTval = new Array(Ngauges).fill(0);
const POTmin = new Array(Ngauges).fill(0);
const POTmax = new Array(Ngauges).fill(256);

const brokerURL = 'ws://localhost:9001';
const topic = 'mgws25Q2-S999/pseudoBob1';
let client;

function setupMQTT() {
  client = mqtt.connect(brokerURL);

  client.on('connect', () => {
    console.log('✅ Connected to MQTT broker');
    document.getElementById("messageLog").innerText = "✅ 接続成功";
    client.subscribe(topic, (err) => {
      if (!err) {
        console.log('📡 Subscribed to', topic);
      }
    });
  });

  client.on('message', (topic, message) => {
    let text = message.toString().replace(/\r/g, '').trim();
    const fields = text.split('\t');
    document.getElementById("messageLog").innerText = `📨 ${topic}: ${text}`;

    for (let i = 0; i < Ngauges && i < fields.length; i++) {
      const parts = fields[i].split('/');
      if (parts.length === 1) {
        let val = parseFloat(parts[0]);
        if (!isNaN(val)) POTval[i] = val;
      } else if (parts.length === 2) {
        let val = parseFloat(parts[0]);
        let max = parseFloat(parts[1]);
        if (!isNaN(val)) POTval[i] = val;
        if (!isNaN(max)) POTmax[i] = max;
      } else if (parts.length >= 3) {
        let val = parseFloat(parts[0]);
        let min = parseFloat(parts[1]);
        let max = parseFloat(parts[2]);
        if (!isNaN(val)) POTval[i] = val;
        if (!isNaN(min)) POTmin[i] = min;
        if (!isNaN(max)) POTmax[i] = max;
      }
    }
  });
}

function setup() {
  createCanvas(640, 240);
  setupMQTT();
}
