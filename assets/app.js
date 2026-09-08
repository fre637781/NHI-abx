/* 抗微生物劑健保給付規定查詢 — app
   資料來源優先序：data/antimicrobials.json（可被匯入工具更新）→ window.NHI_DATA（file:// 後援） */
(function () {
  "use strict";

  var FLAG_DEFS = [
    { id: "priorAuth",       label: "需事前審查" },
    { id: "cultureRequired", label: "需檢驗／培養佐證" },
    { id: "specialist",      label: "需專科醫師" },
    { id: "inpatientOnly",   label: "以住院為主" }
  ];

  var state = { data: null, q: "", cats: [], funds: [], flags: [], sort: "category", expanded: false };
  var el = {};

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    ["q","clearBtn","catChips","fundChips","flagChips","count","sort","expandAll",
     "printBtn","results","empty","dataNotice","noticeStatus","noticeText",
     "sourceLine","metaLine","sectionName","themeToggle"].forEach(function (k) { el[k] = $(k); });
  }

  /* ---------- 資料載入 ---------- */
  function loadData() {
    return fetch("data/antimicrobials.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .catch(function () {
        if (window.NHI_DATA) return window.NHI_DATA;
        throw new Error("無法載入資料檔");
      });
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function highlight(text, terms) {
    var out = esc(text);
    if (!terms.length) return out;
    terms.forEach(function (t) {
      if (t.length < 1) return;
      var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function drugNames(item) {
    return (item.drugs || []).map(function (d) {
      return [d.generic, d.zh].concat(d.brands || []).filter(Boolean).join(" ");
    }).join(" ");
  }

  function haystack(item) {
    if (item._hay) return item._hay;
    item._hay = [
      item.title, item.summary, item.section || "", drugNames(item),
      (item.provisions || []).join(" "), (item.tags || []).join(" "), item.note || ""
    ].join(" ").toLowerCase();
    return item._hay;
  }

  function catLabel(id) {
    var c = (state.data.categories || []).filter(function (x) { return x.id === id; })[0];
    return c ? c.label : id;
  }
  function fundLabel(id) {
    var f = (state.data.fundingTypes || []).filter(function (x) { return x.id === id; })[0];
    return f ? f.label : id;
  }

  /* ---------- 篩選 ---------- */
  function terms() {
    return state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  }

  function matches(item) {
    if (state.cats.length && state.cats.indexOf(item.category) < 0) return false;
    if (state.funds.length && state.funds.indexOf(item.funding) < 0) return false;
    for (var i = 0; i < state.flags.length; i++) {
      if (!(item.flags && item.flags[state.flags[i]])) return false;
    }
    var t = terms();
    if (!t.length) return true;
    var hay = haystack(item);
    return t.every(function (w) { return hay.indexOf(w) >= 0; });
  }

  function filtered() {
    var list = (state.data.items || []).filter(matches);
    if (state.sort === "title") {
      list.sort(function (a, b) { return a.title.localeCompare(b.title, "zh-Hant"); });
    } else if (state.sort === "section") {
      list.sort(function (a, b) {
        var as = a.section || "￿", bs = b.section || "￿";
        return as.localeCompare(bs, undefined, { numeric: true });
      });
    } else {
      var order = (state.data.categories || []).map(function (c) { return c.id; });
      list.sort(function (a, b) {
        var d = order.indexOf(a.category) - order.indexOf(b.category);
        return d !== 0 ? d : a.title.localeCompare(b.title, "zh-Hant");
      });
    }
    return list;
  }

  /* ---------- 繪製 ---------- */
  function chip(label, active, count) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("aria-pressed", active ? "true" : "false");
    b.innerHTML = esc(label) + (count != null ? '<span class="n">' + count + "</span>" : "");
    return b;
  }

  function renderChips() {
    el.catChips.innerHTML = "";
    (state.data.categories || []).forEach(function (c) {
      var n = (state.data.items || []).filter(function (i) { return i.category === c.id; }).length;
      if (!n) return;
      var b = chip(c.label, state.cats.indexOf(c.id) >= 0, n);
      b.addEventListener("click", function () { toggle(state.cats, c.id); render(); });
      el.catChips.appendChild(b);
    });

    el.fundChips.innerHTML = "";
    (state.data.fundingTypes || []).forEach(function (f) {
      var n = (state.data.items || []).filter(function (i) { return i.funding === f.id; }).length;
      if (!n) return;
      var b = chip(f.label, state.funds.indexOf(f.id) >= 0, n);
      b.addEventListener("click", function () { toggle(state.funds, f.id); render(); });
      el.fundChips.appendChild(b);
    });

    el.flagChips.innerHTML = "";
    FLAG_DEFS.forEach(function (f) {
      var n = (state.data.items || []).filter(function (i) { return i.flags && i.flags[f.id]; }).length;
      if (!n) return;
      var b = chip(f.label, state.flags.indexOf(f.id) >= 0, n);
      b.addEventListener("click", function () { toggle(state.flags, f.id); render(); });
      el.flagChips.appendChild(b);
    });
  }

  function toggle(arr, v) {
    var i = arr.indexOf(v);
    if (i >= 0) arr.splice(i, 1); else arr.push(v);
    syncUrl();
  }

  function cardHtml(item, t) {
    var badges = '<span class="badge cat">' + esc(catLabel(item.category)) + "</span>";
    if (item.section) {
      badges += '<span class="badge sec">' + esc(item.section) + "</span>";
    } else if (item.sectionConfidence === "na") {
      if (item.sectionLabel) badges += '<span class="badge">' + esc(item.sectionLabel) + "</span>";
    } else {
      badges += '<span class="badge todo" title="此項條號尚未與官方檔案核對">條號待核對</span>';
    }
    if (item.funding && item.funding !== "nhi") {
      badges += '<span class="badge">' + esc(fundLabel(item.funding)) + "</span>";
    }
    if (item.flags && item.flags.priorAuth) badges += '<span class="badge pa">事前審查</span>';

    var brands = (item.drugs || []).map(function (d) { return (d.brands || []).join("／"); })
      .filter(Boolean).join("、");

    var html = "";
    html += '<summary>';
    html += '<div class="card-top">' + badges + "</div>";
    html += "<h2>" + highlight(item.title, t) + "</h2>";
    html += '<p class="summary-text">' + highlight(item.summary, t) + "</p>";
    if (brands) html += '<p class="brands">常見商品名：' + highlight(brands, t) + "</p>";
    html += "</summary>";

    html += '<div class="card-body">';
    if ((item.drugs || []).length) {
      html += "<h3>成分／品項</h3><ul class=\"drug-list\">";
      item.drugs.forEach(function (d) {
        var line = d.generic + (d.zh ? "（" + d.zh + "）" : "");
        if ((d.brands || []).length) line += " — " + d.brands.join("、");
        html += "<li>" + highlight(line, t) + "</li>";
      });
      html += "</ul>";
    }
    if ((item.provisions || []).length) {
      html += "<h3>給付要點</h3><ol>";
      item.provisions.forEach(function (p) { html += "<li>" + highlight(p, t) + "</li>"; });
      html += "</ol>";
    }
    var fl = item.flags || {};
    var active = FLAG_DEFS.filter(function (f) { return fl[f.id]; });
    if (active.length) {
      html += "<h3>條件標記</h3><ul class=\"tag-list\">";
      active.forEach(function (f) { html += "<li>" + esc(f.label) + "</li>"; });
      html += "</ul>";
    }
    if ((item.tags || []).length) {
      html += '<h3 style="margin-top:12px">關鍵字</h3><ul class="tag-list">';
      item.tags.forEach(function (g) { html += "<li>" + highlight(g, t) + "</li>"; });
      html += "</ul>";
    }
    if (item.note) html += '<p class="card-note">備註：' + highlight(item.note, t) + "</p>";
    if (!item.sourceConfirmed) {
      html += '<p class="card-note">本項內容尚未與官方檔案逐字核對，請以健保署公告原文為準。</p>';
    }
    html += "</div>";
    return html;
  }

  function render() {
    var list = filtered(), t = terms();
    el.results.innerHTML = "";

    var lastCat = null;
    list.forEach(function (item) {
      if (state.sort === "category" && item.category !== lastCat) {
        lastCat = item.category;
        var h = document.createElement("p");
        h.className = "group-head";
        h.textContent = catLabel(item.category);
        el.results.appendChild(h);
      }
      var d = document.createElement("details");
      d.className = "card";
      d.id = "item-" + item.id;
      if (state.expanded || t.length) d.open = state.expanded;
      d.innerHTML = cardHtml(item, t);
      el.results.appendChild(d);
    });

    var total = (state.data.items || []).length;
    el.count.textContent = list.length === total
      ? "共 " + total + " 項"
      : "符合 " + list.length + " 項（全部 " + total + " 項）";
    el.empty.hidden = list.length !== 0;
    renderChipsActiveState();
  }

  function renderChipsActiveState() {
    var groups = [
      [el.catChips, state.cats, (state.data.categories || []).filter(function (c) {
        return (state.data.items || []).some(function (i) { return i.category === c.id; }); }).map(function (c) { return c.id; })],
      [el.fundChips, state.funds, (state.data.fundingTypes || []).filter(function (f) {
        return (state.data.items || []).some(function (i) { return i.funding === f.id; }); }).map(function (f) { return f.id; })],
      [el.flagChips, state.flags, FLAG_DEFS.filter(function (f) {
        return (state.data.items || []).some(function (i) { return i.flags && i.flags[f.id]; }); }).map(function (f) { return f.id; })]
    ];
    groups.forEach(function (g) {
      var nodes = g[0].querySelectorAll(".chip");
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].setAttribute("aria-pressed", g[1].indexOf(g[2][i]) >= 0 ? "true" : "false");
      }
    });
  }

  function renderMeta() {
    var m = state.data.meta || {};
    if (m.sectionName) el.sectionName.textContent = m.sectionName;
    var imported = m.status === "imported";
    el.noticeStatus.textContent = imported
      ? "資料版本：" + (m.version || "官方匯入")
      : (m.statusLabel || "種子資料（未經官方檔案核對）");
    el.noticeText.textContent = m.notice || "";
    if (imported) {
      el.dataNotice.style.background = "var(--accent-soft)";
      el.dataNotice.style.borderColor = "var(--accent)";
      el.dataNotice.style.color = "var(--accent)";
    }
    if (m.source && m.source.url) {
      el.sourceLine.innerHTML = "官方來源：<a href=\"" + esc(m.source.url) +
        "\" target=\"_blank\" rel=\"noopener noreferrer\">" + esc(m.source.name || m.source.url) + "</a>";
    }
    el.metaLine.textContent = [
      m.version ? "資料版本 " + m.version : null,
      m.effectiveDate ? "生效日 " + m.effectiveDate : null,
      m.generatedAt ? "整理日期 " + m.generatedAt : null
    ].filter(Boolean).join("　·　");
  }

  /* ---------- 網址同步 ---------- */
  function syncUrl() {
    var p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.cats.length) p.set("cat", state.cats.join(","));
    if (state.funds.length) p.set("fund", state.funds.join(","));
    if (state.flags.length) p.set("flag", state.flags.join(","));
    var s = p.toString();
    history.replaceState(null, "", s ? "?" + s : location.pathname);
  }

  function readUrl() {
    var p = new URLSearchParams(location.search);
    state.q = p.get("q") || "";
    state.cats = (p.get("cat") || "").split(",").filter(Boolean);
    state.funds = (p.get("fund") || "").split(",").filter(Boolean);
    state.flags = (p.get("flag") || "").split(",").filter(Boolean);
    el.q.value = state.q;
  }

  /* ---------- 事件 ---------- */
  function bind() {
    var timer;
    el.q.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.q = el.q.value; syncUrl(); render(); }, 120);
    });
    el.clearBtn.addEventListener("click", function () {
      state.q = ""; state.cats = []; state.funds = []; state.flags = [];
      el.q.value = ""; syncUrl(); render(); el.q.focus();
    });
    el.sort.addEventListener("change", function () { state.sort = el.sort.value; render(); });
    el.expandAll.addEventListener("click", function () {
      state.expanded = !state.expanded;
      el.expandAll.textContent = state.expanded ? "全部收合" : "全部展開";
      render();
    });
    el.printBtn.addEventListener("click", function () { window.print(); });
    el.themeToggle.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("nhi-abx-theme", next); } catch (e) {}
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== el.q) { e.preventDefault(); el.q.focus(); el.q.select(); }
      if (e.key === "Escape" && document.activeElement === el.q) { el.q.blur(); }
    });
  }

  function initTheme() {
    try {
      var saved = localStorage.getItem("nhi-abx-theme");
      if (saved) document.documentElement.setAttribute("data-theme", saved);
    } catch (e) {}
  }

  /* ---------- 啟動 ---------- */
  cacheEls();
  initTheme();
  loadData().then(function (data) {
    state.data = data;
    readUrl();
    renderMeta();
    renderChips();
    bind();
    render();
  }).catch(function (err) {
    el.noticeStatus.textContent = "資料載入失敗";
    el.noticeText.textContent = err.message +
      "：若以 file:// 直接開啟，請確認 data/antimicrobials.js 存在，或改用本機伺服器（python3 -m http.server）。";
  });
})();
