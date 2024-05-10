//
// Constellation.js
// (Written in ES2015(ES6))
//
// Note:
// This JS file Constellation.js) and the corresponding HTML file Constellation.html) refer to the following pages.
// * Weekly Ascii No.1474 pp.46-51
//

// Last update: 2024-02-27(Tue) 20:23 JST / 2024-02-27(Tue) 11:23 UTC

let scene, camera, renderer, texture;
let meshes = new Array();
let starData, lineData;
const size = 10;
colorData = [[0.4, 0.6, 1], [0.4, 0.8, 1], [0.4, 1, 1], [1, 1, 0.4], [1, 0.8, 0.4], [1, 0.6, 0.4], [1, 0.4, 0.4]];

// ---------------------------------------------------------

const init = () => {
    // シーン、カメラ、レンダラーの作成
    const [ width, height ] = [ window.innerWidth - 20, window.innerHeight - 160 ];
    scene = new THREE.Scene;
    camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 50);
    camera.position.set(0, 0, 0);
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(width, height);
    document.getElementById("renderArea").appendChild(renderer.domElement);

    // テクスチャを作成
    const textureCanvas = document.createElement("canvas");
    const textureContext = textureCanvas.getContext("2d");
    [ textureCanvas.width, textureCanvas.height ] = [ 64, 64 ];
    const grad = textureContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    textureContext.fillStyle = grad;
    textureContext.beginPath();
    textureContext.moveTo(48, 32);
    for (let i = 1; i < 20; i++) {
        const angle = i * Math.PI * 2 / 20;
        const r = 16 * (i % 2) + 16;
        textureContext.lineTo(32 + r * Math.cos(angle), 32 + r * Math.sin(angle));
    }
    textureContext.fill();
    texture = new THREE.Texture(textureCanvas);
    texture.needsUpdate = true;

    // Go!
    update();
}

const readFile = file => {
    // ファイルの読み込み
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result);
    });
}

const loadData = async (files) => {
    // CSV ファイルの読み込み
    [starData, lineData] = [ [], [] ];
    for (let i = 0; i < files.length; i++) {
        const result = await readFile(files[i]);
        const rows = result.split("\n");
        var c1 = 0, c2 = 0, c3 = 0;
        for (let i = 0; i < rows.length; i++) {
            const data = rows[i].split(",");
            if (data.length == 9) {
                // 基礎データ
                c1++;
                const hip = data[0];
                const ra = Number(data[1]) + data[2] / 60 + data[3] / 3600;
                let dec0 = Number(data[5]);
                if (Number(data[4]) == 0) { dec0 *= -1; }
                const dec = dec0 + data[6] / 60 + data[7] /3600;
                const m = Number(data[8]) + 1;
                const vb = 0;
            } else if (data.length == 14) {
                // 恒星データ
                c2++;
                const hip = data[0];
                const ra  = Number(data[1]) + data[2] / 60 + data[3] / 3600;
                const dec = Number(data[4]) + data[5] / 60 + data[6] / 3600;
                const m = data[7];
                const bv =  data[11];
                starData.push({hip, ra, dec, m, bv});

            } else if (data.length == 3) {
                // 星座線
                c3++;
                lineData.push({ hip1:data[1], hip2:data[2] });
            }
        }
        console.log("DEBUG: " + files[i].name + " " + rows.length + " (" + c1 + ", " + c2 + ", " + c3 + ")");
    }
    if (starData.length > 0) { setStars(); }
}

const setStars = () => {
    // メッシュ（星、星座線）の削除
    for (const mesh of meshes) {
        mesh.geometry.dispose();
        mesh.meterial.dispose();
        scene.remove(mesh);
    }
    mesh = [];

    // 星データの変換
    const starPosData = new Map();
    const [ points, colors ] = [ new Array(10), new Array(10) ];

    for (let i = 0; i < 10; i++) {
        [ points[i], colors[i]] = [ new Array(), new Array() ];
    }

    for (let i = 0; i < starData.length; i++) {
        // 赤経、赤緯を座標に変換
        const hAngle = -15 * starData[i].ra * Math.PI/180;
        const vAngle = starData[i].dec * Math.PI/180;
        const y = size * Math.sin(vAngle);
        const x = size * Math.cos(vAngle) * Math.cos(hAngle);
        const z = size * Math.cos(vAngle) * Math.sin(hAngle);
        const pos = new THREE.Vector3(x, y, z);

        // 等級、B-V色指数をインデックスに変換
        const mIndex = Math.max(0, Math.min(9, Math.floor(starData[i].m)+1));
        const cIndex = Math.max(0, Math.min(6, Math.floor(starData[i].bv*5)+1));
        
        // 等級ごとに座標、色（RGB）をセット
        points[mIndex].push(pos);
        colors[mIndex].push(colorData[cIndex][0]);
        colors[mIndex].push(colorData[cIndex][1]);
        colors[mIndex].push(colorData[cIndex][2]);
        starPosData.set(starData[i].hip, pos);
    }

    // 星を作成
    for (let i = 0; i < 10; i++) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points[i]);
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors[i], 3));
        const material = new THREE.PointsMaterial({
            size:(10 - i) * 0.05, map:texture, vertexColors:true, opacity:1,
            transparent:true, depthTest:false, blending:THREE.AdditiveBlending
        });
        const star = new THREE.Points(geometry, material);
        scene.add(star);
        meshes.push(star);
    }

    // 星座線を作成
    for (let i = 0; i < lineData.length; i++) {
        const [hip1, hip2] = [lineData[i].hip1, lineData[i].hip2];
        const pairs = [];
        if (starPosData.has(hip1)) { pairs.push(starPosData.get(hip1)); }
        if (starPosData.has(hip2)) { pairs.push(starPosData.get(hip2)); }
        const geometry = new THREE.BufferGeometry().setFromPoints(pairs);
        const material = new THREE.LineBasicMaterial({
            color:"#CCFFFF", opacity:0.5, transparent:true, blending:THREE.AdditiveBlending
        });
        const line = new THREE.LineSegments(geometry, material);
        scene.add(line);
        meshes.push(line);
    }
}

const update = () => {
    // 視点を移動
    const vAngle = document.getElementById("va").value * Math.PI/180;
    const hAngle = document.getElementById("ha").value * Math.PI/180;
    const y = size * Math.sin(vAngle);
    const x = size * Math.cos(vAngle) * Math.cos(hAngle);
    const z = size * Math.cos(vAngle) * Math.sin(hAngle);
    camera.lookAt(new THREE.Vector3(x, y, z));

    // レンダリング
    renderer.render(scene, camera);
    window.requestAnimationFrame(update);
}

// ---------------------------------------------------------

