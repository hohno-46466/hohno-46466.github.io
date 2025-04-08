// No.017
const version = "No.017";
const client = mqtt.connect('ws://localhost:9001');

client.on('connect', () => {
  console.log('MQTT connected');
  client.subscribe("WStest/" + version + "/ctrl");
});

let shapeTypeList = [];

client.on('message', (topic, message) => {
  const payload = message.toString().trim();
  const parts = payload.split("\t");
  if (parts.length === 7 && parts[0] === version) {
    let shapeIndex = Number(parts[1]);
    shapeIndex = constrain(shapeIndex, 0, shapeTypeList.length - 1);
    shapeType = shapeTypeList[shapeIndex];
    speed = Number(parts[2]);
    pos = Number(parts[3]);
    r = Number(parts[4]);
    g = Number(parts[5]);
    b = Number(parts[6]);
    document.getElementById("shape-select").value = shapeType;
    document.getElementById("speed-slider").value = speed;
    document.getElementById("pos-slider").value = pos;
    document.getElementById("r-slider").value = r;
    document.getElementById("g-slider").value = g;
    document.getElementById("b-slider").value = b;
    console.log("updated from MQTT:", payload);

  } else if (parts.length === 2 && parts[0] === version) {
    labelText = parts[1];
    document.getElementById("label-input").value = labelText;
    console.log("label updated from MQTT:", labelText);
  }
});

client.on('error', (err) => {
  console.error('MQTT error:', err);
});

client.on('close', () => {
  console.warn('MQTT connection closed');
});

client.on('reconnect', () => {
  console.warn('MQTT reconnecting...');
});

client.on('offline', () => {
  console.warn('MQTT client is offline');
});

let x = 0;
let pos = 50;
let min = 0;
let max = 100;
let labelText = '';
let shapeType = 'circle';
let r = 255, g = 0, b = 0;
let speed = 2;

function publishState() {
  if (client.connected) {
    const topic = "WStest/" + version;
    const shapeIndex = shapeTypeList.indexOf(shapeType);
    const payload = version + "\t" + shapeIndex + "\t" + speed + "\t" + pos + "\t" + r + "\t" + g + "\t" + b;
    console.log(payload);
    client.publish(topic, payload);
  }
}

function setup() {
  const container = document.getElementById("canvas-container");
  const w = container.clientWidth;
  const h = container.clientHeight;

  let canvas = createCanvas(w, h);
  canvas.parent("canvas-container");

  const labelInput = document.getElementById("label-input");
  labelInput.addEventListener("input", () => {
    labelText = labelInput.value;
  });

  const shapeSelect = document.getElementById("shape-select");
  shapeTypeList = Array.from(shapeSelect.options).map(option => option.value);
  shapeSelect.addEventListener("change", () => {
    shapeType = shapeSelect.value;
    publishState();
  });

  const posSlider = document.getElementById("pos-slider");
  posSlider.addEventListener("input", () => {
    pos = Number(posSlider.value);
    publishState();
  });

  const speedSlider = document.getElementById("speed-slider");
  speedSlider.addEventListener("input", () => {
    speed = Number(speedSlider.value);
    publishState();
  });

  const rSlider = document.getElementById("r-slider");
  const gSlider = document.getElementById("g-slider");
  const bSlider = document.getElementById("b-slider");

  rSlider.addEventListener("input", () => { r = Number(rSlider.value); publishState();});
  gSlider.addEventListener("input", () => { g = Number(gSlider.value); publishState();});
  bSlider.addEventListener("input", () => { b = Number(bSlider.value); publishState();});
}

function draw() {
  background(240);
  fill(r, g, b);
  noStroke();

  const xpos = x;
  const ypos = map(pos, min, max, height * 0.1, height * 0.9);

  if (shapeType === 'circle') {
    ellipse(xpos, ypos, 40, 40);
  } else if (shapeType === 'rect') {
    rectMode(CENTER);
    rect(xpos, ypos, 40, 40);
  } else if (shapeType === 'triangle') {
    triangle(
      xpos, ypos - 30,
      xpos - 25, ypos + 20,
      xpos + 25, ypos + 20
    );
  } else if (shapeType === 'hexagon' || shapeType === 'octagon') {
    const sides = shapeType === 'hexagon' ? 6 : 8;
    const radius = 25;
    beginShape();
    for (let i = 0; i < sides; i++) {
      let angle = TWO_PI * i / sides;
      let vx = xpos + radius * cos(angle);
      let vy = ypos + radius * sin(angle);
      vertex(vx, vy);
    }
    endShape(CLOSE);
  }

  fill(0);
  textAlign(CENTER);
  text(labelText, width / 2, height - 10);

  x += speed;
  if (x > width + 20) x = -20;
}
