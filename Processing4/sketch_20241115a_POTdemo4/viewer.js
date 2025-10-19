'use strict';

/* =========================================================
   viewer.js - PDEファイル閲覧＆公開支援スクリプト
   ---------------------------------------------------------
   役割:
     - PDEファイルを読み込んでブラウザに表示
     - 行番号付きで見やすいコードビューを提供
     - Download / Open raw / Open raw (UTF-8) 機能を提供
     - UTF-8強制表示で文字化けを防止可能に
   設計方針:
     - 管理は HTML 中の data-pde 属性で一元化
     - シンプル設計＋学習教材としてわかりやすく
     - コメント多めで保守・拡張しやすく
   ========================================================= */


/**
 * ▼ index.html 内の <body data-pde="..."> から PDEファイル名を取得
 *   - viewer.js の中で直接ファイル名を書き換える必要がなくなる
 *   - スケッチ公開ごとに index.html 側でファイル名をカンタン指定
 */
const pdeFileName = document.body.dataset.pde;


/**
 * HTML解析完了後（DOM構築完了）にメイン処理を開始
 * ※ <script defer> を使うが、安全のため DOMContentLoaded で初期化
 */
document.addEventListener('DOMContentLoaded', init);


/**
 * 初期化処理エントリーポイント
 * PDEファイル名が定義されていればページ構築を開始
 */
function init() {
  if (!pdeFileName) {
    console.error('viewer.js: data-pde 属性で PDEファイル名を指定してください');
    return;
  }

  // タイトルとヘッダの表示を整理（ファイル名と同一にする）
  setPageTitleAndHeading(pdeFileName);

  // Download / Raw / UTF-8 Raw ボタンの動作を設定
  setupActionButtons(pdeFileName);

  // PDEファイルを読み込み、ページ内に展開
  loadAndRenderPde(pdeFileName);
}


/**
 * ページの <title> と <h1> を PDEファイル名に統一
 * @param {string} filename - PDEファイル名
 */
function setPageTitleAndHeading(filename) {
  document.getElementById('page-title').textContent = filename;
  document.getElementById('main-heading').textContent = filename;
}


/**
 * Download / Open raw / Open raw (UTF-8) 各ボタンの初期化
 * @param {string} filename - 対象PDEファイル名
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
 * PDEファイルを読み込み、コードビューを生成し、UTF-8 Rawボタンも完成させる
 * @param {string} filename - PDEファイル名
 */
function loadAndRenderPde(filename) {
  const codeArea = document.getElementById('code');
  const utf8Button = document.getElementById('open-utf8-link');

  fetch(filename)
    .then(response => {
      if (!response.ok) throw new Error('PDEファイルの取得に失敗しました');
      return response.text();
    })
    .then(text => {
      // --- UTF-8 Rawを実装（Blob経由でUTF-8明示して表示） ---
      if (utf8Button) {
        utf8Button.addEventListener('click', () => openRawUtf8(text));
      }

      // --- PDE本文を行番号付きで表示 ---
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
 * @param {string} text - PDEの本文
 */
function openRawUtf8(text) {
  const blob = new Blob([text], { type: 'text/plain; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  // 一部ブラウザでは即 revoke すると読めなくなるので遅延解除
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}


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
