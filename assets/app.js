/* 感染科給付規定查詢 — app
   資料來源優先序：data/index.json + 各主題檔（可被匯入工具更新）
                 → window.NHI_BUNDLE（file:// 與單檔打包版的後援） */
(function () {
  "use strict";

  var FLAG_DEFS = [
    { id: "priorAuth",          label: "需事前審查" },
    { id: "cultureRequired",    label: "需檢驗／培養佐證" },
    { id: "specialist",         label: "需專科醫師" },
    { id: "inpatientOnly",      label: "以住院為主" },
    { id: "infectionScreening", label: "需感染症篩檢" }
  ];

  var ALL = "__all__";

  var state = {
    index: null, topics: [], datasets: {}, topicId: null,
    q: "", cats: [], funds: [], flags: [],
    firstLineOnly: false, showDeleted: false,
    sort: "section", expanded: false, firstLine: {}
  };

  var el = {};

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    ["q","clearBtn","catChips","fundChips","flagChips","extraChips","count","sort",
     "expandAll","printBtn","results","empty","dataNotice","noticeStatus","noticeText",
     "sourceLine","metaLine","sectionName","siteTitle","themeToggle","topicTabs",
     "firstLinePanel","firstLineTitle","flOral","flInj"].forEach(function (k) { el[k] = $(k); });
  }

  /* ---------- 載入 ---------- */
  function fetchJson(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(path + " HTTP " + r.status);
      return r.json();
    });
  }

  function bundled() { return window.NHI_BUNDLED && window.NHI_BUNDLE ? window.NHI_BUNDLE : null; }

  /* 只有在 fetch 失敗（例如以 file:// 開啟）時才載入整包後援資料，
     避免正常瀏覽時把所有主題的資料重複下載一次。 */
  var bundlePromise = null;
  function ensureBundle() {
    if (window.NHI_BUNDLE) return Promise.resolve(window.NHI_BUNDLE);
    if (bundlePromise) return bundlePromise;
    bundlePromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "data/bundle.js";
      s.onload = function () {
        if (window.NHI_BUNDLE) resolve(window.NHI_BUNDLE);
        else reject(new Error("data/bundle.js 未定義資料"));
      };
      s.onerror = function () { reject(new Error("無法載入 data/bundle.js")); };
      document.head.appendChild(s);
    });
    return bundlePromise;
  }

  function loadIndex() {
    var b = bundled();
    if (b) return Promise.resolve(b.index);
    return fetchJson("data/index.json")
      .catch(function () { return ensureBundle().then(function (bb) { return bb.index; }); });
  }

  function loadTopic(topic) {
    if (state.datasets[topic.id]) return Promise.resolve(state.datasets[topic.id]);
    var b = bundled();
    var p = b
      ? Promise.resolve(b.datasets[topic.id])
      : fetchJson(topic.file).catch(function () {
          return ensureBundle().then(function (bb) {
            var d = bb.datasets[topic.id];
            if (!d) throw new Error("後援資料缺少主題 " + topic.id);
            return d;
          });
        });
    return p.then(function (data) {
      (data.items || []).forEach(function (it) {
        it._topic = topic.id;
        it._topicLabel = topic.label;
      });
      state.datasets[topic.id] = data;
      mergeFirstLine(data);
      return data;
    });
  }

  function loadAll() {
    return Promise.all(state.topics.map(loadTopic));
  }

  /* 附表一：第一線抗微生物製劑索引（key 為小寫成分名） */
  function mergeFirstLine(data) {
    var fl = ((data.meta || {}).firstLine) || {};
    ["oral", "injection"].forEach(function (route) {
      (fl[route] || []).forEach(function (d) {
        if (d.deleted) return;
        var key = String(d.name || "").toLowerCase().trim();
        if (!key) return;
        if (!state.firstLine[key]) state.firstLine[key] = { name: d.name, routes: [] };
        state.firstLine[key].routes.push(route === "oral" ? "口服" : "注射");
      });
    });
  }

  function firstLineHit(item) {
    var hits = [];
    (item.drugs || []).forEach(function (d) {
      var name = String(d.generic || "").toLowerCase();
      var parts = name.split(" + ");
      Object.keys(state.firstLine).forEach(function (k) {
        if (name === k || parts.indexOf(k) >= 0 || name.split(" ")[0] === k) {
          if (hits.indexOf(state.firstLine[k].name) < 0) hits.push(state.firstLine[k].name);
        }
      });
    });
    return hits.length ? hits : null;
  }

  /* ---------- 目前檢視的資料 ---------- */
  function isAll() { return state.topicId === ALL; }

  function currentView() {
    if (isAll()) {
      var items = [], cats = [], funds = [], sc = {}, sf = {};
      state.topics.forEach(function (t) {
        var d = state.datasets[t.id];
        if (!d) return;
        (d.items || []).forEach(function (it) { items.push(it); });
        (d.categories || []).forEach(function (c) { if (!sc[c.id]) { sc[c.id] = 1; cats.push(c); } });
        (d.fundingTypes || []).forEach(function (f) { if (!sf[f.id]) { sf[f.id] = 1; funds.push(f); } });
      });
      return { items: items, categories: cats, fundingTypes: funds, meta: null };
    }
    var d = state.datasets[state.topicId] || {};
    return {
      items: d.items || [], categories: d.categories || [],
      fundingTypes: d.fundingTypes || [], meta: d.meta || {}
    };
  }

  function topicById(id) {
    for (var i = 0; i < state.topics.length; i++) {
      if (state.topics[i].id === id) return state.topics[i];
    }
    return null;
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function highlight(text, terms) {
    var out = esc(text);
    terms.forEach(function (t) {
      if (!t) return;
      var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function provisionText(item) {
    return (item.provisions || []).map(function (p) {
      return typeof p === "string" ? p : (p && p.text) || "";
    }).join(" ");
  }

  function haystack(item) {
    if (item._hay) return item._hay;
    var drugs = (item.drugs || []).map(function (d) {
      return [d.generic, d.zh].concat(d.brands || []).join(" ");
    }).join(" ");
    item._hay = [
      item.title, item.summary, item.section || "", drugs, provisionText(item),
      (item.tags || []).join(" "), item.note || "", (item.revisions || []).join(" "),
      item.groupTitle || "", item._topicLabel || ""
    ].join(" ").toLowerCase();
    return item._hay;
  }

  function labelOf(list, id, fallback) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].label;
    return fallback || id;
  }

  /* ---------- 篩選與排序 ---------- */
  function terms() {
    return state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  }

  function matches(item) {
    if (item.isHeader) return false;
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

  /* 條號依各層級數值比較；通則等非數字條號改用 order 欄位 */
  function sectionCompare(a, b) {
    if (a.order != null || b.order != null) {
      return (a.order || 0) - (b.order || 0);
    }
    var pa = String(a.section || "").split("."), pb = String(b.section || "").split(".");
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var na = parseInt(pa[i], 10), nb = parseInt(pb[i], 10);
      if (isNaN(na) && isNaN(nb)) return 0;
      if (isNaN(na)) return -1;
      if (isNaN(nb)) return 1;
      if (na !== nb) return na - nb;
    }
    return 0;
  }

  function topicOrder(item) {
    for (var i = 0; i < state.topics.length; i++) {
      if (state.topics[i].id === item._topic) return i;
    }
    return 99;
  }

  function filtered(view) {
    var list = view.items.filter(matches);
    if (state.sort === "title") {
      list.sort(function (a, b) { return a.title.localeCompare(b.title, "zh-Hant"); });
    } else if (state.sort === "category") {
      var order = view.categories.map(function (c) { return c.id; });
      list.sort(function (a, b) {
        var d = order.indexOf(a.category) - order.indexOf(b.category);
        return d !== 0 ? d : a.title.localeCompare(b.title, "zh-Hant");
      });
    } else {
      list.sort(function (a, b) {
        var d = topicOrder(a) - topicOrder(b);
        return d !== 0 ? d : sectionCompare(a, b);
      });
    }
    return list;
  }

  /* ---------- 主題分頁 ---------- */
  function renderTabs() {
    el.topicTabs.innerHTML = "";
    var defs = state.topics.concat([{ id: ALL, label: "全部主題", short: "跨主題搜尋" }]);
    defs.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "topic-tab";
      b.setAttribute("aria-pressed", state.topicId === t.id ? "true" : "false");
      b.innerHTML = '<span class="tt-label">' + esc(t.label) + "</span>" +
                    (t.short ? '<span class="tt-short">' + esc(t.short) + "</span>" : "");
      b.addEventListener("click", function () { switchTopic(t.id); });
      el.topicTabs.appendChild(b);
    });
  }

  function switchTopic(id) {
    if (state.topicId === id) return;
    state.topicId = id;
    state.cats = []; state.funds = []; state.flags = [];
    state.firstLineOnly = false; state.showDeleted = false;
    var ready = id === ALL ? loadAll() : loadTopic(topicById(id));
    ready.then(function () {
      syncUrl(); renderTabs(); renderMeta(); renderFirstLinePanel(); renderChips(); render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }).catch(showError);
  }

  /* ---------- 篩選 chips ---------- */
  function chip(label, active, count) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("aria-pressed", active ? "true" : "false");
    b.innerHTML = esc(label) + (count != null ? '<span class="n">' + count + "</span>" : "");
    return b;
  }

  function fillChips(node, defs, selected, countFn, onToggle) {
    node.innerHTML = "";
    var shown = 0;
    defs.forEach(function (d) {
      var n = countFn(d);
      if (!n) return;
      shown++;
      var b = chip(d.label, selected.indexOf(d.id) >= 0, n);
      b.addEventListener("click", function () {
        var i = selected.indexOf(d.id);
        if (i >= 0) selected.splice(i, 1); else selected.push(d.id);
        syncUrl(); renderChips(); render();
      });
      node.appendChild(b);
    });
    var group = node.parentNode;
    if (group && group.classList.contains("filter-group")) group.hidden = shown < 2;
    return shown;
  }

  function renderChips() {
    var view = currentView(), items = view.items;
    var visible = items.filter(function (i) { return !i.isHeader; });

    fillChips(el.catChips, view.categories, state.cats, function (c) {
      return visible.filter(function (i) { return i.category === c.id; }).length;
    });
    fillChips(el.fundChips, view.fundingTypes, state.funds, function (f) {
      return visible.filter(function (i) { return i.funding === f.id; }).length;
    });
    fillChips(el.flagChips, FLAG_DEFS, state.flags, function (f) {
      return visible.filter(function (i) { return i.flags && i.flags[f.id]; }).length;
    });

    el.extraChips.innerHTML = "";
    var nFirst = visible.filter(firstLineHit).length;
    if (nFirst) {
      var fb = chip("含第一線品項", state.firstLineOnly, nFirst);
      fb.addEventListener("click", function () {
        state.firstLineOnly = !state.firstLineOnly; syncUrl(); renderChips(); render();
      });
      el.extraChips.appendChild(fb);
    }
    var nDel = items.filter(function (i) { return i.deleted; }).length;
    if (nDel) {
      var db = chip("顯示已刪除條項", state.showDeleted, nDel);
      db.addEventListener("click", function () {
        state.showDeleted = !state.showDeleted; syncUrl(); renderChips(); render();
      });
      el.extraChips.appendChild(db);
    }
    el.extraChips.parentNode.hidden = el.extraChips.children.length === 0;
  }

  /* ---------- 卡片 ---------- */
  function cardHtml(item, t, view) {
    var fl = firstLineHit(item);
    var badges = "";
    if (isAll() && item._topicLabel) {
      badges += '<span class="badge topic">' + esc(item._topicLabel) + "</span>";
    }
    badges += '<span class="badge cat">' +
              esc(labelOf(view.categories, item.category, item.category)) + "</span>";
    if (item.section) badges += '<span class="badge sec">' + esc(item.section) + "</span>";
    if (item.deleted) badges += '<span class="badge todo">本項已刪除</span>';
    if (fl) badges += '<span class="badge first" title="列於附表一：' + esc(fl.join("、")) +
                      '">第一線</span>';
    if (item.funding && item.funding !== "nhi") {
      badges += '<span class="badge">' +
                esc(labelOf(view.fundingTypes, item.funding, item.funding)) + "</span>";
    }
    if (item.flags && item.flags.priorAuth) badges += '<span class="badge pa">事前審查</span>';
    if (item.flags && item.flags.infectionScreening) {
      badges += '<span class="badge screen">感染症篩檢</span>';
    }

    var brands = (item.drugs || []).map(function (d) { return (d.brands || []).join("／"); })
      .filter(Boolean).join("、");

    var html = "<summary>";
    html += '<div class="card-top">' + badges + "</div>";
    html += "<h2>" + highlight(item.title, t) + "</h2>";
    if (item.summary) html += '<p class="summary-text">' + highlight(item.summary, t) + "</p>";
    if (brands) html += '<p class="brands">品名：' + highlight(brands, t) + "</p>";
    html += "</summary>";

    html += '<div class="card-body">';
    if ((item.drugs || []).length) {
      html += '<h3>成分／品項</h3><ul class="drug-list">';
      item.drugs.forEach(function (d) {
        var line = d.generic + (d.zh ? "（" + d.zh + "）" : "");
        if ((d.brands || []).length) line += " — " + d.brands.join("、");
        html += "<li>" + highlight(line, t) + "</li>";
      });
      html += "</ul>";
    }
    var provs = item.provisions || [];
    if (provs.length) {
      html += "<h3>" + (item.limited ? "限用於下列情形" : "條文內容") + '</h3><ul class="prov-list">';
      provs.forEach(function (p) {
        var text = typeof p === "string" ? p : p.text;
        var lvl = typeof p === "string" ? 0 : (p.level || 0);
        html += '<li class="lv' + lvl + '">' + highlight(text, t) + "</li>";
      });
      html += "</ul>";
    }
    if (fl) {
      html += '<p class="firstline-note">附表一第一線抗微生物製劑：' + esc(fl.join("、")) + "</p>";
    }
    var active = FLAG_DEFS.filter(function (f) { return (item.flags || {})[f.id]; });
    if (active.length) {
      html += '<h3>條件標記</h3><ul class="tag-list">';
      active.forEach(function (f) { html += "<li>" + esc(f.label) + "</li>"; });
      html += "</ul>";
    }
    if ((item.tags || []).length) {
      html += '<h3 style="margin-top:12px">關鍵字</h3><ul class="tag-list">';
      item.tags.forEach(function (g) { html += "<li>" + highlight(g, t) + "</li>"; });
      html += "</ul>";
    }
    if ((item.revisions || []).length) {
      html += '<p class="revisions">修訂沿革：' + esc(item.revisions.join("、")) + "</p>";
    }
    if (item.note) html += '<p class="card-note">備註：' + highlight(item.note, t) + "</p>";
    if (item.sourceConfirmed === false) {
      html += '<p class="card-note">本項尚未與官方檔案逐字核對，請以公告原文為準。</p>';
    }
    html += "</div>";
    return html;
  }

  function groupHeading(item) {
    if (state.sort !== "section") return null;
    var parts = [];
    if (isAll()) parts.push(item._topicLabel || "");
    if (item.group && item.group !== item.groupTitle) parts.push(item.group);
    if (item.groupTitle) parts.push(item.groupTitle);
    return parts.filter(Boolean).join("　");
  }

  function render() {
    var view = currentView(), list = filtered(view), t = terms();
    el.results.innerHTML = "";

    var lastHead = null;
    list.forEach(function (item) {
      var head = groupHeading(item);
      if (head !== null && head !== lastHead) {
        lastHead = head;
        if (head) {
          var h = document.createElement("p");
          h.className = "group-head";
          h.textContent = head;
          el.results.appendChild(h);
        }
      }
      var d = document.createElement("details");
      d.className = "card" + (item.deleted ? " is-deleted" : "");
      d.id = "item-" + item.id;
      d.open = state.expanded;
      d.innerHTML = cardHtml(item, t, view);
      el.results.appendChild(d);
    });

    var total = view.items.filter(function (i) { return !i.isHeader && !i.deleted; }).length;
    el.count.textContent = list.length === total
      ? "共 " + total + " 項"
      : "符合 " + list.length + " 項（" + (isAll() ? "全部主題 " : "本主題 ") + total + " 項）";
    el.empty.hidden = list.length !== 0;
  }

  /* ---------- 標頭與附表 ---------- */
  function renderMeta() {
    var site = (state.index && state.index.site) || {};
    if (site.title) {
      el.siteTitle.innerHTML = esc(site.title.slice(0, 3)) +
                               "<span> " + esc(site.title.slice(3)) + "</span>";
    }
    var view = currentView(), m = view.meta;

    if (isAll()) {
      el.sectionName.textContent = "跨主題搜尋 · " +
        state.topics.map(function (t) { return t.label; }).join(" / ");
      el.noticeStatus.textContent = "全部主題";
      el.noticeText.textContent = site.notice || "";
      el.sourceLine.textContent = "";
      el.metaLine.textContent = state.topics.map(function (t) {
        var d = state.datasets[t.id];
        return d ? t.label + " " + (d.meta.version || "") : t.label;
      }).join("　·　");
      return;
    }

    var topic = topicById(state.topicId) || {};
    el.sectionName.textContent = (m.sectionName || topic.label || "") +
      (topic.blurb ? "　—　" + topic.blurb : "");
    el.noticeStatus.textContent = m.status === "imported"
      ? "資料版本：" + (m.version || "官方匯入")
      : (m.statusLabel || "資料狀態未標示");
    el.noticeText.textContent = m.notice || site.notice || "";
    if (m.source && m.source.url) {
      el.sourceLine.innerHTML = "官方來源：<a href=\"" + esc(m.source.url) +
        "\" target=\"_blank\" rel=\"noopener noreferrer\">" +
        esc(m.source.name || m.source.url) + "</a>";
    } else {
      el.sourceLine.textContent = "";
    }
    el.metaLine.textContent = [
      m.version ? "資料版本 " + m.version : null,
      m.effectiveDate ? "生效日 " + m.effectiveDate : null,
      m.generatedAt ? "匯入日期 " + m.generatedAt : null,
      topic.authority ? "主管機關 " + topic.authority : null
    ].filter(Boolean).join("　·　");
  }

  function renderFirstLinePanel() {
    var m = currentView().meta || {};
    var fl = m.firstLine;
    if (!fl || !(fl.oral || []).length) { el.firstLinePanel.hidden = true; return; }
    el.firstLinePanel.hidden = false;
    if (fl.title) el.firstLineTitle.textContent = fl.title;
    [["oral", el.flOral], ["injection", el.flInj]].forEach(function (pair) {
      pair[1].innerHTML = "";
      (fl[pair[0]] || []).forEach(function (d) {
        var li = document.createElement("li");
        li.textContent = d.name + (d.note ? "（" + d.note + "）" : "");
        if (d.deleted) li.style.textDecoration = "line-through";
        pair[1].appendChild(li);
      });
    });
  }

  /* ---------- 網址同步 ---------- */
  function syncUrl() {
    var p = new URLSearchParams();
    if (state.topicId && state.topicId !== state.topics[0].id) {
      p.set("topic", state.topicId === ALL ? "all" : state.topicId);
    }
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
    var t = p.get("topic");
    state.topicId = t === "all" ? ALL
      : (t && topicById(t) ? t : state.topics[0].id);
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
      el.q.value = ""; syncUrl(); renderChips(); render(); el.q.focus();
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
      if (e.key === "/" && document.activeElement !== el.q) {
        e.preventDefault(); el.q.focus(); el.q.select();
      }
      if (e.key === "Escape" && document.activeElement === el.q) el.q.blur();
    });
  }

  function initTheme() {
    try {
      var saved = localStorage.getItem("nhi-abx-theme");
      if (saved) document.documentElement.setAttribute("data-theme", saved);
    } catch (e) {}
  }

  function showError(err) {
    el.noticeStatus.textContent = "資料載入失敗";
    el.noticeText.textContent = (err && err.message ? err.message : String(err)) +
      "：若以 file:// 直接開啟，請確認 data/bundle.js 存在，或改用本機伺服器（python3 -m http.server）。";
  }

  /* ---------- 啟動 ---------- */
  cacheEls();
  initTheme();
  loadIndex().then(function (index) {
    state.index = index;
    state.topics = index.topics || [];
    if (!state.topics.length) throw new Error("index.json 沒有任何主題");
    readUrl();
    return (isAll() ? loadAll() : loadTopic(topicById(state.topicId))).then(function () {
      renderTabs();
      renderMeta();
      renderFirstLinePanel();
      renderChips();
      el.sort.value = state.sort;
      bind();
      render();
    });
  }).catch(showError);
})();
