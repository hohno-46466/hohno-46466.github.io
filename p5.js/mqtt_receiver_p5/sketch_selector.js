//
// sketch_selector.js
//
// Last update: 2025-08-28(Thu) 10:27 JST / 2025-08-28(Thu) 01:27 UTC
//
// 目的:
// - p5.js のスケッチをプルダウンで選択・切り替えするための共通JS
// - 既定は「変更時にページをリロード」方式（安定）
// - URLパラメータ ?sketch= と localStorage('selectedSketch') を利用して選択状態を保持
//
// 再利用方法:
//   1) index.html に <select id="sketchSelect"> を置き、<option value="sketch6.js">…</option> のような選択肢をを並べる
//   2) index.html の </body> 直前で本ファイルを読み込む:
//        <script src="sketch_selector.js"></script>
//   3) p5 スケッチは index.html 側で本JSが選んだファイル名を用いて読み込む（本JSが自動で読み込み）
//
// 備考:
// - RELOAD_ON_CHANGE=true の場合、切り替えは location.href の更新で行う（確実）
// - RELOAD_ON_CHANGE=false にすると、ページをリロードせず動的差し替えモード（p5グローバル掃除つき）
//   ※動的差し替えは環境差で不安定になることがあるため、既定は true を推奨

(() => {
  'use strict';

  const RELOAD_ON_CHANGE = true; // ← 必要なら false にして動的切替に変更

  // id="sketchSelect" な <select> を取得
  function getSelectEl() {
    return document.getElementById('sketchSelect');
  }

  // <select> に value が存在するか確認
  function optionExists(selectEl, value) {
    return Array.from(selectEl.options).some(opt => opt.value === value);
  }

  // 現在の選択を保存
  function saveSelection(value) {
    try {
      localStorage.setItem('selectedSketch', value);
    } catch (_e) {}
  }

  // 保存された選択を取得（URL > localStorage の優先順位）
  function loadSavedSelection() {
    const url = new URL(location.href);
    const urlVal = url.searchParams.get('sketch');
    if (urlVal) return urlVal;
    try {
      const stored = localStorage.getItem('selectedSketch');
      if (stored) return stored;
    } catch (_e) {}
    return null;
  }

  // URL の ?sketch= を設定してリロード
  function reloadWithSketch(value) {
    const url = new URL(location.href);
    url.searchParams.set('sketch', value);
    location.href = url.toString();
  }

  // ---- 動的差し替えモード（RELOAD_ON_CHANGE=false のときだけ使用） ----
  // 補足：sketch*.js は global mode で書かれているので seutp() や draw() が
  // 　　　Window オブジェクトのプロパティとして登録されている．
  function cleanupP5Globals() {
    // p5.js が使う代表的な関数のリスト
    const fns = [
      'preload','setup','draw','remove',
      'windowResized','mousePressed','mouseReleased','mouseMoved','mouseDragged',
      'keyPressed','keyReleased','touchStarted','touchMoved','touchEnded'
    ];
    // 関数が存在したら消去．ダメなら undefined を代入して無効化
    for (const k of fns) {
      if (typeof window[k] === 'function') {
        try { delete window[k]; } catch (_) { window[k] = undefined; }
      }
    }
    // window._setupDone を消去
    try { delete window._setupDone; } catch(_) {}
  }

  // ---- 動的差し替えモード（RELOAD_ON_CHANGE=false のときだけ使用） ----
  function loadSketchDynamically(file) {
    // 既存の p5 スケッチを終了
    if (typeof window.remove === 'function') {
      try { window.remove(); } catch (e) { console.warn('p5 remove() failed:', e); }
    }
    // 既存の動的スクリプトを削除
    const old = document.getElementById('dynamicSketch');
    if (old) old.remove();
    // p5 のグローバル関数を掃除
    cleanupP5Globals();
    // 新しいスケッチを読み込む
    const s = document.createElement('script');
    s.id = 'dynamicSketch';
    s.src = file + '?v=' + Date.now(); // キャッシュ回避
    document.body.appendChild(s);
  }

  // 初期ロード処理
  function init() {
    const selectEl = getSelectEl();
    if (!selectEl) {
      console.error('sketch_selector.js: #sketchSelect が見つかりません');
      return;
    }

    // 保存値に合わせてセレクタを設定し、スケッチを読み込む
    const saved = loadSavedSelection();
    const initial = (saved && optionExists(selectEl, saved)) ? saved : selectEl.value;
    // セレクタの表示を合わせる
    selectEl.value = initial;

    if (RELOAD_ON_CHANGE) {
      // リロード方式: 初期ロードでも選択スケッチを読み込む
      const s = document.createElement('script');
      s.id = 'dynamicSketch';
      s.src = initial + '?v=' + Date.now();
      document.body.appendChild(s);
    } else {
      // 動的差し替え方式
      loadSketchDynamically(initial);
    }

    // 変更時のハンドラ
    selectEl.addEventListener('change', function() {
      const value = this.value;
      saveSelection(value);
      if (RELOAD_ON_CHANGE) {
        reloadWithSketch(value); // ← ここでページ再読み込み
      } else {
        loadSketchDynamically(value);   // ← リロードなしで差し替え
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

