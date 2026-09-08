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

  var state = { data: null, q: "", cats: [], funds: [], flags: [],
              firstLineOnly: false, showDeleted: false,
              sort: "section", expanded: false, firstLine: null };
  var el = {};

  function $(id) { return document.getElementById(id); }

  /* 附表一：第一線抗微生物製劑索引（key 為小寫成分名） */
  function buildFirstLineIndex(meta) {
    var idx = {};
    var fl = (meta && meta.firstLine) || {};
    ["oral", "injection"].forEach(function (route) {
      (fl[route] || []).forEach(function (d) {
        if (d.deleted) return;
        var key = String(d.name || "").toLowerCase().trim();
        if (!key) return;
        if (!idx[key]) idx[key] = { name: d.name, routes: [], note: d.note || "" };
        idx[key].routes.push(route === "oral" ? "口服" : "注射");
      });
    });
    return idx;
  }

  function firstLineHit(item) {
    if (!state.firstLine) return null;
    var hits = [];
    (item.drugs || []).forEach(function (d) {
      var name = String(d.generic || "").toLowerCase();
      Object.keys(state.firstLine).forEach(function (k) {
        if (name === k || name.split(" + ").indexOf(k) >= 0 ||
            name.split(" ")[0] === k) {
          if (hits.indexOf(state.firstLine[k].name) < 0) hits.push(state.firstLine[k].name);
        }
      });
    });
    return hits.length ? hits : null;
  }

  function cacheEls() {
    ["q","clearBtn","catChips","fundChips","flagChips","count","sort","expandAll",
     "printBtn","results","empty","dataNotice","noticeStatus","noticeText",
     "sourceLine","metaLine","sectionName","themeToggle","extraChips",
     "firstLinePanel","firstLineTitle","flOral","flInj"].forEach(function (k) { el[k] = $(k); });
  }

  /* ---------- 資料載入 ---------- */
  function loadData() {
    // 單檔打包版（dist/artifact.html）已內嵌資料，不需再發出網路請求
    if (window.NHI_BUNDLED && window.NHI_DATA) {
      return Promise.resolve(window.NHI_DATA);
    }
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

  function provisionText(item) {
    return (item.provisions || []).map(function (p) {
      return typeof p === "string" ? p : (p && p.text) || "";
    }).join(" ");
  }

  function haystack(item) {
    if (item._hay) return item._hay;
    item._hay = [
      item.title, item.summary, item.section || "", drugNames(item),
      provisionText(item), (item.tags || []).join(" "), item.note || "",
      (item.revisions || []).join(" "), item.groupTitle || ""
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
    if (item.isHeader) return false;                       // 節標題以群組標頭呈現
    if (item.deleted && !state.showDeleted) return false;
    if (state.firstLineOnly && !firstLineHit(item)) return false;
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

  /* 條號依各層級數值比較，避免 10.10 排在 10.2 之前 */
  function sectionCompare(a, b) {
    var pa = String(a || "").split("."), pb = String(b || "").split(".");
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var na = parseInt(pa[i], 10), nb = parseInt(pb[i], 10);
      if (isNaN(na)) return -1;
      if (isNaN(nb)) return 1;
      if (na !== nb) return na - nb;
    }
    return 0;
  }

  function filtered() {
    var list = (state.data.items || []).filter(matches);
    if (state.sort === "title") {
      list.sort(function (a, b) { return a.title.localeCompare(b.title, "zh-Hant"); });
    } else if (state.sort === "section") {
      list.sort(function (a, b) { return sectionCompare(a.section, b.section); });
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

    var fundGroup = el.fundChips.closest ? el.fundChips.closest(".filter-group") : null;
    if (fundGroup) fundGroup.hidden = el.fundChips.children.length < 2;

    el.extraChips.innerHTML = "";
    var nFirst = (state.data.items || []).filter(function (i) {
      return !i.isHeader && firstLineHit(i); }).length;
    if (nFirst) {
      var fb = chip("含第一線品項", state.firstLineOnly, nFirst);
      fb.addEventListener("click", function () {
        state.firstLineOnly = !state.firstLineOnly; syncUrl(); render();
      });
      el.extraChips.appendChild(fb);
    }
    var nDel = (state.data.items || []).filter(function (i) { return i.deleted; }).length;
    if (nDel) {
      var db = chip("顯示已刪除條項", state.showDeleted, nDel);
      db.addEventListener("click", function () {
        state.showDeleted = !state.showDeleted; syncUrl(); render();
      });
      el.extraChips.appendChild(db);
    }

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
    var fl = firstLineHit(item);
    var badges = '<span class="badge cat">' + esc(catLabel(item.category)) + "</span>";
    if (item.section) {
      badges += '<span class="badge sec">' + esc(item.section) + "</span>";
    } else if (item.sectionConfidence === "na") {
      if (item.sectionLabel) badges += '<span class="badge">' + esc(item.sectionLabel) + "</span>";
    } else {
      badges += '<span class="badge todo" title="此項條號尚未與官方檔案核對">條號待核對</span>';
    }
    if (item.deleted) badges += '<span class="badge todo">本項已刪除</span>';
    if (fl) badges += '<span class="badge first" title="列於附表一：' + esc(fl.join("、")) +
                      '">第一線</span>';
    if (item.funding && item.funding !== "nhi") {
      badges += '<span class="badge">' + esc(fundLabel(item.funding)) + "</span>";
    }
    if (item.flags && item.flags.priorAuth) badges += '<span class="badge pa">事前審查</span>';

    var brands = (item.drugs || []).map(function (d) { return (d.brands || []).join("／"); })
      .filter(Boolean).join("、");

    var html = "";
    html += "<summary>";
    html += '<div class="card-top">' + badges + "</div>";
    html += "<h2>" + highlight(item.title, t) + "</h2>";
    if (item.summary) html += '<p class="summary-text">' + highlight(item.summary, t) + "</p>";
    if (brands) html += '<p class="brands">品名：' + highlight(brands, t) + "</p>";
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
    var provs = item.provisions || [];
    if (provs.length) {
      html += "<h3>" + (item.limited ? "限用於下列情形" : "條文內容") + "</h3>";
      html += '<ul class="prov-list">';
      provs.forEach(function (p) {
        var text = typeof p === "string" ? p : p.text;
        var lvl = typeof p === "string" ? 0 : (p.level || 0);
        html += '<li class="lv' + lvl + '">' + highlight(text, t) + "</li>";
      });
      html += "</ul>";
    }
    if (fl) {
      html += '<p class="firstline-note">附表一第一線抗微生物製劑：' +
              esc(fl.join("、")) + "</p>";
    }
    var flags = item.flags || {};
    var active = FLAG_DEFS.filter(function (f) { return flags[f.id]; });
    if (active.length) {
      html += "<h3>條件標記</h3><ul class=\"tag-list\">";
      active.forEach(function (f) { html += "<li>" + esc(f.label) + "</li>"; });
      html += "</ul>";
    }
    if ((item.revisions || []).length) {
      html += '<p class="revisions">修訂沿革：' + esc(item.revisions.join("、")) + "</p>";
    }
    if (item.note) html += '<p class="card-note">備註：' + highlight(item.note, t) + "</p>";
    if (item.sourceConfirmed === false) {
      html += '<p class="card-note">本項內容尚未與官方檔案逐字核對，請以健保署公告原文為準。</p>';
    }
    html += "</div>";
    return html;
  }

  function render() {
    var list = filtered(), t = terms();
    el.results.innerHTML = "";

    var lastGroup = null;
    list.forEach(function (item) {
      var gkey = state.sort === "section" ? (item.group || "")
               : state.sort === "category" ? item.category : null;
      if (gkey !== null && gkey !== lastGroup) {
        lastGroup = gkey;
        var h = document.createElement("p");
        h.className = "group-head";
        h.textContent = state.sort === "section"
          ? (item.group ? item.group + "　" + (item.groupTitle || "") : "")
          : catLabel(item.category);
        if (h.textContent.trim()) el.results.appendChild(h);
      }
      var d = document.createElement("details");
      d.className = "card" + (item.deleted ? " is-deleted" : "");
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
    var extra = el.extraChips.querySelectorAll(".chip");
    var extraState = [];
    if ((state.data.items || []).some(function (i) { return !i.isHeader && firstLineHit(i); }))
      extraState.push(state.firstLineOnly);
    if ((state.data.items || []).some(function (i) { return i.deleted; }))
      extraState.push(state.showDeleted);
    for (var e = 0; e < extra.length; e++) {
      extra[e].setAttribute("aria-pressed", extraState[e] ? "true" : "false");
    }
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

  function renderFirstLinePanel() {
    var fl = (state.data.meta || {}).firstLine;
    if (!fl || !(fl.oral || []).length) return;
    el.firstLinePanel.hidden = false;
    if (fl.title) el.firstLineTitle.textContent = fl.title;
    [["oral", el.flOral], ["injection", el.flInj]].forEach(function (pair) {
      var node = pair[1];
      node.innerHTML = "";
      (fl[pair[0]] || []).forEach(function (d) {
        var li = document.createElement("li");
        li.textContent = d.name + (d.note ? "（" + d.note + "）" : "");
        if (d.deleted) li.style.textDecoration = "line-through";
        node.appendChild(li);
      });
    });
  }

  /* ---------- 網址同步 ---------- */
  function syncUrl() {
    var p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.cats.length) p.set("cat", state.cats.join(","));
    if (state.funds.length) p.set("fund", state.funds.join(","));
    if (state.flags.length) p.set("flag", state.flags.join(","));
    if (state.firstLineOnly) p.set("first", "1");
    if (state.showDeleted) p.set("del", "1");
    var s = p.toString();
    history.replaceState(null, "", s ? "?" + s : location.pathname);
  }

  function readUrl() {
    var p = new URLSearchParams(location.search);
    state.q = p.get("q") || "";
    state.cats = (p.get("cat") || "").split(",").filter(Boolean);
    state.funds = (p.get("fund") || "").split(",").filter(Boolean);
    state.flags = (p.get("flag") || "").split(",").filter(Boolean);
    state.firstLineOnly = p.get("first") === "1";
    state.showDeleted = p.get("del") === "1";
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
      state.firstLineOnly = false; state.showDeleted = false;
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
    state.firstLine = buildFirstLineIndex(data.meta);
    renderMeta();
    renderFirstLinePanel();
    renderChips();
    el.sort.value = state.sort;
    bind();
    render();
  }).catch(function (err) {
    el.noticeStatus.textContent = "資料載入失敗";
    el.noticeText.textContent = err.message +
      "：若以 file:// 直接開啟，請確認 data/antimicrobials.js 存在，或改用本機伺服器（python3 -m http.server）。";
  });
})();
