/* =====================================================================
   main.js ― ホームページの「動き」と「組み立て」を担当するプログラム
   ---------------------------------------------------------------------
   ※ 文章・料金・写真の変更は settings.js で行います。
     このファイルは、ふだんは触らなくて大丈夫です。
   ※ 機能を追加・変更したいときは、各ブロックの見出し【 】を目印にしてください。
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------------------------------------------------------
     【0】settings.js が読み込めているかチェック
     書き間違い（カンマ忘れなど）があると SITE が作られないので、画面に案内を出します
     ------------------------------------------------------------------- */
  if (typeof SITE === "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      document.body.innerHTML =
        '<p class="settings-error">' +
        "⚠ settings.js に書き間違いがあるようです。<br>" +
        "直前に変更した場所の「,」（カンマ）や「\"」（ダブルクォーテーション）が消えていないか確認してください。</p>";
    });
    return;
  }
  var S = SITE;
  var PAGE = document.body.getAttribute("data-page") || "home";

  /* -------------------------------------------------------------------
     【1】小さな便利道具（部品を作る関数）
     ------------------------------------------------------------------- */

  // URLが安全なものかチェック（javascript: などの危険なリンクを防ぐ＝セキュリティ対策）
  function safeUrl(url) {
    var u = String(url || "").trim();
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^[a-z0-9_\-./#?=&%]+$/i.test(u) && !/^[a-z]+:/i.test(u)) return u; // 同じサイト内のリンク
    return "#";
  }

  // 文字の中の \n を改行（<br>）にして要素に入れる。
  // textContent を使うので、文章にタグが混ざってもそのまま文字として表示される（安全）
  function setText(el, str) {
    String(str == null ? "" : str).split("\n").forEach(function (line, i) {
      if (i > 0) el.appendChild(document.createElement("br"));
      el.appendChild(document.createTextNode(line));
    });
  }

  // h("タグ名", {属性}, 中身...) で HTML の部品を作る
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === "class") el.className = v;
        else if (k === "text") setText(el, v);
        else if (k === "html") el.innerHTML = v; // ※自分で用意したアイコン(SVG)専用。settings.js の文章には使わない
        else if (k.indexOf("on") === 0) el.addEventListener(k.slice(2), v);
        else if (k === "href" || k === "src") el.setAttribute(k, safeUrl(v));
        else el.setAttribute(k, v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  // append(要素, 中身1, 中身2, ...) で、要素の中に部品を順番に入れる
  function append(el, child) {
    if (arguments.length > 2) {
      for (var j = 1; j < arguments.length; j++) append(el, arguments[j]);
      return;
    }
    if (child == null || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(el, c); }); return; }
    el.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  var C = S.contact || {};
  var lineUrl = C.line || "";
  var igUrl = C.instagramId ? "https://www.instagram.com/" + encodeURIComponent(C.instagramId) + "/" : "";
  var igDmUrl = C.instagramId ? "https://ig.me/m/" + encodeURIComponent(C.instagramId) : "";
  var telUrl = C.tel ? "tel:" + C.tel.replace(/[^0-9+]/g, "") : "";

  // メールの件名・本文のひな形（お客様が書きやすいように）
  function mailUrl(planName) {
    if (!C.email) return "";
    var subject = "撮影のご相談" + (planName ? "（" + planName + "）" : "");
    var body =
      "お名前：\nご希望のプラン：" + (planName || "") +
      "\nご希望日（第1〜第3希望）：\n撮影場所（ご自宅・神社名など）：\n人数・お子さまの年齢：\nご質問など：\n";
    return "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  // 外部サイトへのリンク（新しいタブで開く＋安全対策 noopener）
  function extLink(href, attrs) {
    attrs = attrs || {};
    attrs.href = href;
    attrs.target = "_blank";
    attrs.rel = "noopener noreferrer";
    return h.apply(null, ["a", attrs].concat([].slice.call(arguments, 2)));
  }

  // アイコン（SVG＝線で描いた絵）
  var ICON = {
    line: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8-6C21.4 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8zM8.3 13.4H6.4c-.3 0-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.3h1.4c.3 0 .5.2.5.5s-.2.5-.5.5zm2-.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.8zm4.6 0c0 .2-.1.4-.3.5h-.2c-.2 0-.3-.1-.4-.2l-2-2.7v2.4c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.1c0-.2.1-.4.3-.5h.2c.2 0 .3.1.4.2l2 2.7V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.8zm3.1-2.4c.3 0 .5.2.5.5s-.2.5-.5.5h-1.4v.9h1.4c.3 0 .5.2.5.5s-.2.5-.5.5h-1.9c-.3 0-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5h1.9c.3 0 .5.2.5.5s-.2.5-.5.5h-1.4v.9h1.4z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 6.5 12 13l8.5-6.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8"/></svg>',
  };
  function icon(name) { return h("span", { class: "icon", html: ICON[name] }); }

  // 「相談する」ボタン（LINEがあればLINE、なければお問い合わせページへ）
  function consultButton(label, planName) {
    if (lineUrl) return extLink(lineUrl, { class: "btn btn-line" }, icon("line"), label || "LINEで相談する");
    // LINE未設定のときは「LINE」と書かれたボタン名を使わず、お問い合わせページへ案内する
    if (label && label.indexOf("LINE") !== -1) label = "";
    return h("a", { class: "btn btn-primary", href: "contact.html" }, label || "お問い合わせ・ご予約");
  }

  // セクション見出し（英語の小見出し＋日本語の見出し）
  function heading(en, ja, tag) {
    return h("div", { class: "heading" },
      h("span", { class: "heading-en", text: en }),
      h(tag || "h2", { class: "heading-ja", text: ja }));
  }

  // 写真（loading="lazy" ＝ 画面に近づいてから読み込む。表示が速くなる）
  function img(src, alt, eager) {
    return h("img", { src: src, alt: alt || "", loading: eager ? "eager" : "lazy", decoding: "async" });
  }


  /* -------------------------------------------------------------------
     【2】ヘッダー（上の帯）・メニュー
     ------------------------------------------------------------------- */
  function renderHeader() {
    var mount = document.getElementById("site-header");
    if (!mount) return;
    var nav = h("nav", { class: "nav", id: "global-nav", "aria-label": "メインメニュー" },
      h("ul", null, (S.menu || []).map(function (m) {
        return h("li", null, h("a", { href: m.href, "aria-current": m.page === PAGE ? "page" : null, text: m.label }));
      })),
      h("div", { class: "nav-cta" }, consultButton())
    );
    var toggle = h("button", {
      class: "nav-toggle", type: "button", "aria-label": "メニューを開く",
      "aria-expanded": "false", "aria-controls": "global-nav",
      onclick: function () {
        var open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      },
    }, h("span"), h("span"), h("span"));

    mount.className = "site-header" + (PAGE === "home" ? " is-over-hero" : "");
    append(mount, h("div", { class: "header-inner" },
      h("a", { class: "logo", href: "index.html" },
        h("span", { class: "logo-main", text: S.name }),
        h("span", { class: "logo-sub", text: S.baseArea + "の出張撮影" })),
      toggle, nav));

    // トップページでは、少しスクロールしたら帯に背景色をつける
    if (PAGE === "home") {
      var onScroll = function () { mount.classList.toggle("is-scrolled", window.scrollY > 40); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    // メニューのリンクを押したら、スマホのメニューを閉じる
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) document.body.classList.remove("nav-open");
    });
  }


  /* -------------------------------------------------------------------
     【3】フッター（一番下の帯）・スマホ用の固定ボタン
     ------------------------------------------------------------------- */
  function snsLinks() {
    var list = [];
    if (lineUrl) list.push(extLink(lineUrl, { class: "sns sns-line", "aria-label": "LINE公式アカウント" }, icon("line")));
    if (igUrl) list.push(extLink(igUrl, { class: "sns sns-ig", "aria-label": "Instagram" }, icon("instagram")));
    if (C.email) list.push(h("a", { class: "sns", href: mailUrl(), "aria-label": "メール" }, icon("mail")));
    return h("div", { class: "sns-list" }, list);
  }

  function renderFooter() {
    var mount = document.getElementById("site-footer");
    if (!mount) return;
    mount.className = "site-footer";
    append(mount,
      // フッター上の「ご予約・ご相談」帯（お問い合わせページ以外で表示）
      PAGE !== "contact" ? h("section", { class: "cta-band" },
        h("div", { class: "container" },
          h("p", { class: "cta-band-en", text: "Contact" }),
          h("h2", { text: "撮影のご予約・ご相談はお気軽に" }),
          h("p", { text: "「まだ日程が決まっていない」「料金だけ知りたい」なども大歓迎です。" }),
          h("div", { class: "btn-row" },
            consultButton(),
            h("a", { class: "btn btn-outline", href: "schedule.html" }, icon("calendar"), "空き状況を見る")))) : null,
      h("div", { class: "footer-inner container" },
        h("div", { class: "footer-brand" },
          h("p", { class: "logo-main", text: S.name }),
          h("p", { class: "footer-desc", text: S.nameJa }),
          h("p", { class: "footer-desc", text: "拠点：" + S.baseArea + "　対応：" + ((S.area && S.area.main) || []).join("・") + "ほか" }),
          snsLinks()),
        h("ul", { class: "footer-nav" },
          (S.menu || []).map(function (m) { return h("li", null, h("a", { href: m.href, text: m.label })); }),
          h("li", null, h("a", { href: "privacy.html", text: "プライバシーポリシー" })))),
      h("p", { class: "copyright", text: "© " + new Date().getFullYear() + " " + S.name })
    );

    // スマホで画面下に常に出るボタン（依頼しやすくするため）
    if (PAGE !== "contact") {
      document.body.appendChild(h("div", { class: "fixed-cta" },
        lineUrl
          ? extLink(lineUrl, { class: "fixed-cta-main" }, icon("line"), "LINEで相談")
          : h("a", { class: "fixed-cta-main", href: "contact.html" }, icon("mail"), "お問い合わせ"),
        h("a", { class: "fixed-cta-sub", href: "schedule.html" }, icon("calendar"), "空き状況")));
    }
  }


  /* -------------------------------------------------------------------
     【4】下層ページの共通タイトル部分（ページ名＋パンくずリスト）
     パンくずリスト＝「ホーム ＞ 撮影プラン」のような現在地の表示
     ------------------------------------------------------------------- */
  function pageHeader(en, ja, lead) {
    return h("header", { class: "page-header" },
      h("div", { class: "container" },
        h("nav", { class: "breadcrumb", "aria-label": "現在地" },
          h("a", { href: "index.html", text: "ホーム" }), h("span", { "aria-hidden": "true", text: " / " }), h("span", { text: ja })),
        heading(en, ja, "h1"),
        lead ? h("p", { class: "page-lead", text: lead }) : null));
  }


  /* -------------------------------------------------------------------
     【5】スライドショー（トップの大きな写真）
     ------------------------------------------------------------------- */
  function slideshow() {
    var slides = S.slides || [];
    var wrap = h("section", { class: "hero", "aria-label": "メイン写真" });
    var track = h("div", { class: "hero-slides" });
    var dots = h("div", { class: "hero-dots" });
    var items = slides.map(function (s, i) {
      var item = h("div", { class: "hero-slide" + (i === 0 ? " is-active" : "") }, img(s.src, s.alt, i === 0));
      track.appendChild(item);
      dots.appendChild(h("button", {
        type: "button", class: i === 0 ? "is-active" : "", "aria-label": (i + 1) + "枚目の写真を表示",
        onclick: function () { go(i); restart(); },
      }));
      return item;
    });
    if (items[0]) items[0].querySelector("img").setAttribute("fetchpriority", "high");

    var current = 0, timer = null;
    function go(n) {
      if (!items.length) return;
      items[current].classList.remove("is-active");
      dots.children[current].classList.remove("is-active");
      current = (n + items.length) % items.length;
      items[current].classList.add("is-active");
      dots.children[current].classList.add("is-active");
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { go(current + 1); }, (S.slideSeconds || 5) * 1000);
    }
    // 他のタブを見ている間は止める（電池・通信の節約）
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clearInterval(timer); else restart();
    });
    // スマホで左右にスワイプしたら切り替え
    var startX = null;
    track.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (startX == null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    });
    if (items.length > 1) restart();

    append(wrap, track,
      h("div", { class: "hero-text" },
        h("h1", { class: "hero-title", text: S.catchcopy }),
        h("p", { class: "hero-sub", text: S.subcopy }),
        h("div", { class: "btn-row" },
          consultButton("LINEで気軽に相談"),
          h("a", { class: "btn btn-ghost", href: "plan.html", text: "撮影プランを見る" }))),
      items.length > 1 ? dots : null,
      h("a", { class: "hero-scroll", href: "#concept", "aria-label": "下へスクロール" }, h("span", { text: "Scroll" })));
    return wrap;
  }


  /* -------------------------------------------------------------------
     【6】よく使う部品：プランのカード・ギャラリー・お客様の声・対応エリア
     ------------------------------------------------------------------- */
  function planCards() {
    return h("div", { class: "plan-cards" }, (S.plans || []).map(function (p) {
      return h("a", { class: "plan-card", href: "plan.html#" + p.id },
        h("div", { class: "plan-card-img" }, img(p.image, p.name + "の撮影例")),
        h("div", { class: "plan-card-body" },
          h("span", { class: "plan-en", text: p.en }),
          h("h3", { text: p.name }),
          h("p", { class: "price" }, h("span", { class: "price-num", text: p.price }), h("span", { class: "price-unit", text: p.priceNote })),
          h("span", { class: "more", text: "詳しく見る →" })));
    }));
  }

  // ギャラリー（filterable = 絞り込みボタンを付けるか）
  function galleryGrid(list, filterable) {
    var all = list;
    var grid = h("div", { class: "gallery-grid" });
    function draw(cat) {
      grid.innerHTML = "";
      var shown = all.filter(function (g) { return !cat || g.category === cat; });
      shown.forEach(function (g, i) {
        grid.appendChild(h("button", {
          type: "button", class: "gallery-item", "aria-label": (g.alt || "写真") + "を拡大",
          onclick: function () { openLightbox(shown, i); },
        }, img(g.src, g.alt)));
      });
    }
    draw(null);
    if (!filterable) return grid;

    var bar = h("div", { class: "filter-bar", role: "group", "aria-label": "撮影ジャンルで絞り込み" });
    var cats = [{ id: null, label: "すべて" }].concat(S.categories || []);
    cats.forEach(function (c, i) {
      bar.appendChild(h("button", {
        type: "button", class: "filter-btn", "aria-pressed": i === 0 ? "true" : "false", text: c.label,
        onclick: function (e) {
          [].forEach.call(bar.children, function (b) { b.setAttribute("aria-pressed", "false"); });
          e.currentTarget.setAttribute("aria-pressed", "true");
          draw(c.id);
        },
      }));
    });
    return h("div", null, bar, grid);
  }

  // 写真を大きく表示する画面（ライトボックス）
  var lb = null;
  function openLightbox(list, index) {
    if (!lb) {
      lb = {};
      lb.img = h("img", { alt: "" });
      lb.cap = h("p", { class: "lb-caption" });
      lb.root = h("div", { class: "lightbox", role: "dialog", "aria-modal": "true", "aria-label": "写真の拡大表示" },
        h("button", { type: "button", class: "lb-close", "aria-label": "閉じる", text: "×", onclick: closeLightbox }),
        h("button", { type: "button", class: "lb-prev", "aria-label": "前の写真", text: "‹", onclick: function () { lbGo(-1); } }),
        h("figure", null, lb.img, lb.cap),
        h("button", { type: "button", class: "lb-next", "aria-label": "次の写真", text: "›", onclick: function () { lbGo(1); } }));
      lb.root.addEventListener("click", function (e) { if (e.target === lb.root) closeLightbox(); });
      document.addEventListener("keydown", function (e) {
        if (!lb.root.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") lbGo(1);
        if (e.key === "ArrowLeft") lbGo(-1);
      });
      document.body.appendChild(lb.root);
    }
    lb.list = list; lb.index = index; lb.opener = document.activeElement;
    lbShow();
    lb.root.classList.add("is-open");
    document.body.classList.add("no-scroll");
    lb.root.querySelector(".lb-close").focus();
  }
  function lbShow() {
    var g = lb.list[lb.index];
    lb.img.setAttribute("src", safeUrl(g.src));
    lb.img.setAttribute("alt", g.alt || "");
    lb.cap.textContent = g.alt || "";
  }
  function lbGo(d) { lb.index = (lb.index + d + lb.list.length) % lb.list.length; lbShow(); }
  function closeLightbox() {
    lb.root.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (lb.opener) lb.opener.focus();
  }

  function voicesSection() {
    var v = S.voices || [];
    if (!v.length) return null; // 1件もなければ表示しない
    return h("section", { class: "section section-tint" },
      h("div", { class: "container" },
        heading("Voice", "お客様の声"),
        h("div", { class: "voice-list" }, v.map(function (x) {
          return h("figure", { class: "voice" },
            h("blockquote", { text: x.text }),
            h("figcaption", { text: x.name + (x.plan ? "（" + x.plan + "）" : "") }));
        }))));
  }

  function areaSection() {
    var a = S.area || {};
    return h("section", { class: "section" },
      h("div", { class: "container narrow" },
        heading("Area", "対応エリア"),
        h("ul", { class: "area-list" }, (a.main || []).map(function (x) { return h("li", { text: x }); })),
        h("p", { class: "center", text: a.text })));
  }

  function flowList() {
    return h("ol", { class: "flow" }, (S.flow || []).map(function (f, i) {
      return h("li", null,
        h("span", { class: "flow-num", text: "STEP " + (i + 1) }),
        h("h3", { text: f.title }),
        h("p", { text: f.text }));
    }));
  }


  /* -------------------------------------------------------------------
     【7】各ページの中身
     ページごとに関数が分かれています。ページを増やすときはここに追加します
     ------------------------------------------------------------------- */
  var PAGES = {};

  // ---- トップページ ----
  PAGES.home = function () {
    var H = S.home || {};
    return [
      slideshow(),
      h("section", { class: "section concept", id: "concept" },
        h("div", { class: "container narrow center" },
          h("span", { class: "heading-en", text: "Concept" }),
          h("h2", { class: "concept-title", text: H.conceptTitle }),
          h("p", { class: "concept-text", text: H.conceptText }),
          h("a", { class: "text-link", href: "about.html", text: "カメラマンについて →" }))),
      h("section", { class: "section section-tint" },
        h("div", { class: "container" },
          heading("Reason", "選ばれる3つの理由"),
          h("div", { class: "reasons" }, (H.reasons || []).map(function (r, i) {
            return h("div", { class: "reason" },
              h("span", { class: "reason-num", text: "0" + (i + 1) }),
              h("h3", { text: r.title }), h("p", { text: r.text }));
          })))),
      h("section", { class: "section" },
        h("div", { class: "container" },
          heading("Plan", "撮影プラン"),
          planCards(),
          h("p", { class: "center" }, h("a", { class: "btn btn-outline", href: "plan.html", text: "料金・プランの詳細" })))),
      h("section", { class: "section section-tint" },
        h("div", { class: "container" },
          heading("Gallery", "撮影事例"),
          galleryGrid((S.gallery || []).slice(0, 6), false),
          h("p", { class: "center" }, h("a", { class: "btn btn-outline", href: "gallery.html", text: "もっと見る" })))),
      voicesSection(),
      h("section", { class: "section" },
        h("div", { class: "container narrow" },
          heading("Flow", "撮影の流れ"), flowList())),
      areaSection(),
      (S.news || []).length ? h("section", { class: "section section-tint" },
        h("div", { class: "container narrow" },
          heading("News", "お知らせ"),
          h("ul", { class: "news" }, S.news.slice(0, 3).map(function (n) {
            return h("li", null, h("time", { text: n.date }), h("p", { text: n.text }));
          })))) : null,
    ];
  };

  // ---- 自己紹介 ----
  PAGES.about = function () {
    var A = S.about || {};
    return [
      pageHeader("About", "自己紹介"),
      h("section", { class: "section" },
        h("div", { class: "container about" },
          h("div", { class: "about-img" }, img(A.image, A.imageAlt, true)),
          h("div", { class: "about-text" },
            h("p", { class: "about-name" }, h("span", { text: "Photographer" }), S.photographer),
            (A.greeting || []).map(function (p) { return h("p", { text: p }); })))),
      h("section", { class: "section section-tint" },
        h("div", { class: "container" },
          heading("Policy", "大切にしていること"),
          h("div", { class: "reasons" }, (A.values || []).map(function (v) {
            return h("div", { class: "reason" }, h("h3", { text: v.title }), h("p", { text: v.text }));
          })))),
      h("section", { class: "section" },
        h("div", { class: "container narrow" },
          heading("Profile", "プロフィール"),
          h("dl", { class: "profile" }, (A.profile || []).map(function (r) {
            return [h("dt", { text: r.label }), h("dd", { text: r.value })];
          })))),
      areaSection(),
    ];
  };

  // ---- 撮影プラン ----
  PAGES.plan = function () {
    return [
      pageHeader("Plan & Price", "撮影プラン・料金", "すべてのプランに、色補正済みの全データ納品が含まれます。"),
      h("nav", { class: "plan-index container", "aria-label": "プラン一覧" },
        (S.plans || []).map(function (p) { return h("a", { href: "#" + p.id, text: p.name }); })),
      (S.plans || []).map(function (p, i) {
        return h("section", { class: "section plan-detail" + (i % 2 ? " section-tint" : ""), id: p.id },
          h("div", { class: "container plan-row" + (i % 2 ? " reverse" : "") },
            h("div", { class: "plan-img" }, img(p.image, p.name + "の撮影例")),
            h("div", { class: "plan-body" },
              h("span", { class: "plan-en", text: p.en }),
              h("h2", { text: p.name }),
              h("p", { class: "price" }, h("span", { class: "price-num", text: p.price }), h("span", { class: "price-unit", text: p.priceNote })),
              h("p", { text: p.lead }),
              h("ul", { class: "check-list" }, (p.details || []).map(function (d) { return h("li", { text: d }); })),
              p.recommend ? h("p", { class: "note-box", text: "💡 " + p.recommend }) : null,
              h("div", { class: "btn-row" },
                consultButton("このプランを相談する", p.name),
                C.email ? h("a", { class: "btn btn-outline", href: mailUrl(p.name) }, icon("mail"), "メールで相談") : null))));
      }),
      h("section", { class: "section" },
        h("div", { class: "container narrow" },
          heading("Option", "オプション・出張費"),
          h("table", { class: "price-table" }, h("tbody", null, (S.options || []).map(function (o) {
            return h("tr", null, h("th", { scope: "row", text: o.name }), h("td", { text: o.price }));
          }))),
          h("ul", { class: "notes" }, (S.planNotes || []).map(function (n) { return h("li", { text: n }); })))),
    ];
  };

  // ---- 撮影事例 ----
  PAGES.gallery = function () {
    return [
      pageHeader("Gallery", "撮影事例", "写真をタップすると大きく表示されます。"),
      h("section", { class: "section" }, h("div", { class: "container" }, galleryGrid(S.gallery || [], true))),
      voicesSection(),
    ];
  };

  // ---- スケジュール ----
  PAGES.schedule = function () {
    var SC = S.schedule || {};
    return [
      pageHeader("Schedule", "スケジュール・空き状況", "ご予約の目安：撮影希望日の1〜2か月前がおすすめです。"),
      h("section", { class: "section" },
        h("div", { class: "container narrow" },
          (SC.availability || []).length ? h("table", { class: "price-table availability" },
            h("thead", null, h("tr", null, h("th", { scope: "col", text: "月" }), h("th", { scope: "col", text: "空き状況" }), h("th", { scope: "col", text: "備考" }))),
            h("tbody", null, SC.availability.map(function (a) {
              var cls = /満|終了/.test(a.status) ? "full" : /わずか|少/.test(a.status) ? "few" : "ok";
              return h("tr", null, h("th", { scope: "row", text: a.month }),
                h("td", null, h("span", { class: "badge badge-" + cls, text: a.status })), h("td", { text: a.note }));
            }))) : null,
          // Googleカレンダー（URLが設定されているときだけ表示）
          SC.calendarUrl && /^https:\/\/calendar\.google\.com\//.test(SC.calendarUrl)
            ? h("div", { class: "calendar-wrap" }, h("iframe", {
                src: SC.calendarUrl, title: "撮影スケジュールのカレンダー", loading: "lazy",
                referrerpolicy: "no-referrer", frameborder: "0" }))
            : null,
          h("p", { class: "center", text: SC.message }),
          h("p", { class: "center" }, consultButton("空き状況を問い合わせる")))),
      h("section", { class: "section section-tint" },
        h("div", { class: "container narrow" }, heading("Flow", "ご予約から納品までの流れ"), flowList())),
    ];
  };

  // ---- よくある質問 ----
  PAGES.faq = function () {
    return [
      pageHeader("FAQ", "よくある質問"),
      h("section", { class: "section" },
        h("div", { class: "container narrow" },
          h("div", { class: "faq" }, (S.faq || []).map(function (f) {
            return h("details", null, h("summary", { text: f.q }), h("p", { text: f.a }));
          })),
          h("p", { class: "center" }, "ほかにも気になることがあれば、お気軽にどうぞ。"),
          h("p", { class: "center" }, consultButton("質問してみる")))),
      h("section", { class: "section section-tint" },
        h("div", { class: "container narrow" }, heading("Flow", "撮影の流れ"), flowList())),
    ];
  };

  // ---- お問い合わせ ----
  PAGES.contact = function () {
    var cards = [];
    if (lineUrl) cards.push(h("div", { class: "contact-card recommend" },
      h("span", { class: "tag", text: "いちばん早い・おすすめ" }),
      h("h2", null, icon("line"), "LINEで相談"),
      h("p", { text: "友だち追加して、メッセージを送るだけ。写真の雰囲気などもお気軽にご相談ください。" }),
      extLink(lineUrl, { class: "btn btn-line" }, "LINEで友だち追加")));
    if (igDmUrl) cards.push(h("div", { class: "contact-card" },
      h("h2", null, icon("instagram"), "Instagram DM"),
      h("p", { text: "Instagramからダイレクトメッセージでもご相談いただけます。" }),
      extLink(igDmUrl, { class: "btn btn-outline" }, "DMを送る")));
    if (C.email) cards.push(h("div", { class: "contact-card" },
      h("h2", null, icon("mail"), "メール"),
      h("p", { text: "ボタンを押すと、必要な項目が入った下書きが開きます。" }),
      h("a", { class: "btn btn-outline", href: mailUrl() }, "メールを作成する"),
      h("p", { class: "small", text: C.email })));
    if (telUrl) cards.push(h("div", { class: "contact-card" },
      h("h2", null, icon("tel"), "お電話"),
      h("p", { text: "撮影中は出られないことがあります。折り返しご連絡します。" }),
      h("a", { class: "btn btn-outline", href: telUrl, text: C.tel })));
    if (!cards.length) cards.push(h("p", { class: "center", text: "お問い合わせ窓口は現在準備中です。" }));

    return [
      pageHeader("Contact", "お問い合わせ・ご予約", "ご予約・ご相談は無料です。お返事は24時間以内を目安にしています。"),
      h("section", { class: "section" },
        h("div", { class: "container" },
          h("div", { class: "contact-cards" }, cards),
          C.hours ? h("p", { class: "center small", text: C.hours }) : null)),
      h("section", { class: "section section-tint" },
        h("div", { class: "container narrow" },
          heading("Point", "お問い合わせの際にお知らせください"),
          h("ul", { class: "check-list" },
            ["お名前", "ご希望のプラン", "ご希望日（第1〜第3希望）", "撮影場所（ご自宅・神社名など）", "人数・お子さまの年齢", "ご質問・ご要望"]
              .map(function (t) { return h("li", { text: t }); })),
          h("p", { class: "small" }, "いただいた個人情報は、",
            h("a", { href: "privacy.html", text: "プライバシーポリシー" }), "に沿って大切に取り扱います。"))),
    ];
  };

  // ---- プライバシーポリシー ----
  PAGES.privacy = function () {
    return [
      pageHeader("Privacy Policy", "プライバシーポリシー"),
      h("section", { class: "section" },
        h("div", { class: "container narrow prose" },
          h("p", { text: S.name + "（以下「当方」）は、お客様の個人情報を以下のとおり大切に取り扱います。" }),
          (S.privacy || []).map(function (p) { return [h("h2", { text: p.title }), h("p", { text: p.text })]; }))),
    ];
  };

  // ---- 404（ページが見つからない） ----
  PAGES.notfound = function () {
    return [
      pageHeader("404 Not Found", "ページが見つかりません", "お探しのページは移動または削除された可能性があります。"),
      h("section", { class: "section" }, h("p", { class: "center" }, h("a", { class: "btn btn-primary", href: "index.html", text: "ホームへ戻る" }))),
    ];
  };


  /* -------------------------------------------------------------------
     【8】検索エンジン向けの情報（構造化データ）
     Googleに「秩父市の出張撮影のお店です」「よくある質問です」と正確に伝えるための情報
     ------------------------------------------------------------------- */
  function addJsonLd(obj) {
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  }
  function structuredData() {
    var base = String(S.url || "").replace(/\/?$/, "/");
    var sameAs = [igUrl, lineUrl].filter(Boolean);
    var biz = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: S.name,
      alternateName: S.nameJa,
      description: (S.subcopy || "").replace(/\n/g, " "),
      url: base,
      image: base + "images/ogp.jpg",
      address: { "@type": "PostalAddress", addressLocality: "秩父市", addressRegion: "埼玉県", addressCountry: "JP" },
      areaServed: ((S.area && S.area.main) || []).map(function (x) { return { "@type": "City", name: x }; }),
      founder: { "@type": "Person", name: S.photographer, jobTitle: "フォトグラファー" },
      makesOffer: (S.plans || []).map(function (p) {
        return { "@type": "Offer", name: p.name + "出張撮影", price: String(p.price).replace(/[^0-9]/g, ""), priceCurrency: "JPY" };
      }),
    };
    if (C.tel) biz.telephone = C.tel;
    if (C.email) biz.email = C.email;
    if (sameAs.length) biz.sameAs = sameAs;
    if (PAGE === "home") addJsonLd(biz);

    if (PAGE === "faq") addJsonLd({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: (S.faq || []).map(function (f) {
        return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } };
      }),
    });
  }


  /* -------------------------------------------------------------------
     【9】ページを組み立てる（ここから実行が始まります）
     ------------------------------------------------------------------- */
  function init() {
    renderHeader();
    var main = document.getElementById("main");
    if (main && PAGES[PAGE]) append(main, PAGES[PAGE]());
    renderFooter();
    structuredData();

    // URLに #newborn などが付いていたら、その場所までスクロール
    if (location.hash) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) setTimeout(function () { target.scrollIntoView(); }, 50);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
