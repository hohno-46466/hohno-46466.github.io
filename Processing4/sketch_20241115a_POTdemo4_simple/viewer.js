'use strict';

/* =========================================================
   viewer.js - 対象ファイル閲覧＆公開支援スクリプト
   Last update: 2025-10-20(Mon) 06:27 JST / 2025-10-19(Sun) 21:27 UTC by @hohno_at_kuimc
   ---------------------------------------------------------
   役割:
     - 対象ファイルを読み込んでブラウザに表示
     - 行番号付きで見やすいコードビューを提供
     - Download / Open raw / Open raw (UTF-8) 機能を提供
     - UTF-8強制表示で文字化けを防止可能に
   設計方針:
     - 管理は HTML 中の data-file 属性で一元化
     - シンプル設計＋学習教材としてわかりやすく
     - コメント多めで保守・拡張しやすく
   ========================================================= */


/**
 * ▼ index.html 内の <body data-file="..."> から 対象ファイル名を取得
 *   - viewer.js の中で直接ファイル名を書き換える必要がなくなる
 *   - スケッチ公開ごとに index.html 側でファイル名をカンタン指定
 */
const dataFileName = document.body.dataset.file;


/**
 * HTML解析完了後（DOM構築完了）にメイン処理を開始
 * ※ <script defer> を使うが、安全のため DOMContentLoaded で初期化
 */
document.addEventListener('DOMContentLoaded', init);


/**
 * 初期化処理エントリーポイント
 * 対象ファイル名が定義されていればページ構築を開始
 */
function init() {
  if (!dataFileName) {
    console.error('viewer.js: data-file 属性で 対象ファイル名を指定してください');
    return;
  }

  // タイトルとヘッダの表示を整理（ファイル名と同一にする）
  setPageTitleAndHeading(dataFileName);

  // Download / Raw / UTF-8 Raw ボタンの動作を設定
  setupActionButtons(dataFileName);

  // 対象ファイルを読み込み、ページ内に展開
  loadAndRenderData(dataFileName);
}


/**
 * ページの <title> と <h1> を 対象ファイル名に統一
 * @param {string} filename - 対象ファイル名
 */
function setPageTitleAndHeading(filename) {
  document.getElementById('page-title').textContent = filename;
  document.getElementById('main-heading').textContent = filename;
}


/**
 * Download / Open raw / Open raw (UTF-8) 各ボタンの初期化
 * @param {string} filename - 対象ファイル名
 */
function setupActionButtons(filename) {
  const downloadLink = document.getElementById('download-link');
  const openRawLink  = document.getElementById('open-raw-link');

  // 「Open raw」＝生ファイルを新しいタブで開く（文字化けの可能性あり）
  if (openRawLink) {
    openRawLink.href = filename;
  }

  // 「Download」＝保存（download属性対応ブラウザ中心）
  if (downloadLink) {
    downloadLink.href = filename;
    downloadLink.setAttribute('download', filename);

    // 古いブラウザへのフォールバック対応
    downloadLink.addEventListener('click', (event) => {
      if (!('download' in HTMLAnchorElement.prototype)) {
        event.preventDefault();
        fetch(filename)
          .then(response => response.blob())
          .then(blob => triggerTempDownload(blob, filename))
          .catch(err => alert('ダウンロードに失敗しました: ' + err));
      }
    });
  }
}


/**
 * 対象ファイルを読み込み、コードビューを生成し、UTF-8 Rawボタンも完成させる
 * @param {string} filename - 対象ファイル名
 */
function loadAndRenderData(filename) {
  const codeArea = document.getElementById('code');
  const utf8Button = document.getElementById('open-utf8-link');

  fetch(filename)
    .then(response => {
      if (!response.ok) throw new Error('対象ファイルの取得に失敗しました');
      return response.text();
    })
    .then(text => {
      // --- UTF-8 Rawを実装（Blob経由でUTF-8明示して表示） ---
      if (utf8Button) {
        utf8Button.addEventListener('click', () => openRawUtf8(text));
      }

      // --- 対象ファイル本文を行番号付きで表示 ---
      codeArea.innerHTML = ''; // 初期の「読み込み中」を削除
      text.split('\n').forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'line';
        div.dataset.line = index + 1;
        // 空行は普通にtextContent=""だと高さ0になるため、\u00A0（NBSP）を使って確保
        div.textContent = line || '\u00A0';
        codeArea.appendChild(div);
      });
    })
    .catch(err => {
      codeArea.textContent = '読み込みエラー: ' + err;
    });
}


/**
 * 生テキストを UTF-8 明示として新規タブ表示（Raw安全版）
 * @param {string} text - 対象ファイル本文
 */
function openRawUtf8(text) {
  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>Raw UTF-8 View</title>
      <style>
        body {
          font-family: monospace;
          font-size: 14px;
          white-space: pre;
          margin: 1em;
          background: #f8f8f8;
        }
      </style>
    </head>
    <body>${text.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</body>
    </html>`;
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
function openRawUtf8(text) {
  const blob = new Blob([text], { type: 'text/plain; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  // 一部ブラウザでは即 revoke すると読めなくなるので遅延解除
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
u*/


/**
 * ダウンロード属性が効かない古いブラウザ向けフォールバック処理
 * @param {Blob} blob - ダウンロード対象
 * @param {string} filename - 保存ファイル名
 */
function triggerTempDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
