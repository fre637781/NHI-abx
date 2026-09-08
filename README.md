# 抗微生物劑健保給付規定查詢

針對**健保藥品給付規定第 10 節「抗微生物劑 Antimicrobial agents」**的單頁查詢工具。
純靜態網頁（HTML / CSS / 原生 JS），無需建置流程，可直接以 GitHub Pages 發佈。

> ⚠️ **免責聲明**
> 本專案為臨床查詢輔助工具，內容為整理摘要，**非官方文件**。
> 給付條件、條號與生效日期一律以[中央健康保險署](https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html)最新公告為準。

## 功能

- 關鍵字搜尋：學名、中文名、商品名、適應症、條文內容、條號，支援多關鍵字（空白分隔）與結果高亮
- 分類篩選：通則／抗細菌／抗黴菌／抗病毒／肝炎抗病毒／抗結核·NTM／抗 HIV／抗寄生蟲·瘧疾
- 給付方式篩選：健保給付／公費（疾管署等）／健保·公費併行
- 條件標記篩選：需事前審查、需檢驗培養佐證、需專科醫師、以住院為主
- 排序（分類／藥名／條號）、全部展開、列印友善版面
- 網址同步查詢條件，可直接把搜尋結果連結分享給同事
- 深色模式（跟隨系統，可手動切換）、鍵盤 `/` 快速聚焦搜尋框
- 未經核對的項目會標示「條號待核對」與提醒，不會偽裝成官方原文

## 使用

```bash
# 本機預覽（建議）
python3 -m http.server 8000
# 開啟 http://localhost:8000
```

直接用瀏覽器開啟 `index.html`（`file://`）也可以，此時資料改由 `data/antimicrobials.js` 載入。

### 發佈到 GitHub Pages

Repository → Settings → Pages → Source 選 **Deploy from a branch**，
分支選本分支、資料夾選 `/ (root)` 即可。專案已含 `.nojekyll`。

## 資料

| 檔案 | 說明 |
| --- | --- |
| `data/antimicrobials.json` | 資料主檔（唯一真實來源） |
| `data/antimicrobials.js` | 由主檔自動產生，供 `file://` 開啟時使用 |

目前隨附的是**種子資料**（`meta.status = "seed"`），涵蓋 40 個項目。
其中通則（10.1）各款、Ceftaroline fosamil、Imipenem/cilastatin/relebactam 與
抗微生物製劑管理計畫等項目已對照公開資料確認（`sourceConfirmed: true`）；
其餘項目為臨床常見給付條件之整理摘要，**條號尚未逐字核對**，頁面上會明確標示。

### 用官方檔案取代種子資料

1. 到[健保署「最新版藥品給付規定內容（分章節）」](https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html)下載「第 10 節 抗微生物劑」PDF。
2. 執行匯入：

```bash
python3 tools/import_nhi.py 第10節.pdf --dry-run      # 先看解析結果
python3 tools/import_nhi.py 第10節.pdf --effective 115-01-01
```

匯入後 `meta.status` 會變成 `imported`，頁面頂端的黃色警示會轉為綠色版本標示，
每筆項目也會帶有官方條號。**請務必人工抽查解析結果**——PDF 排版變動時，
可調整 `tools/import_nhi.py` 中的 `SECTION_RE`。

PDF 文字擷取依序嘗試 `pdftotext`（poppler-utils，建議）→ `pypdf` → `pdfminer.six`；
若都沒有，可先自行把 PDF 另存為 `.txt` 再匯入。

### 手動編修

直接編輯 `data/antimicrobials.json`，然後重新產生 JS 後援檔：

```bash
python3 tools/build.py
```

### 資料格式

```jsonc
{
  "id": "af-voriconazole",
  "section": "10.2.1",              // 條號；不確定時為 null
  "sectionConfidence": "high",      // high | unknown | na
  "category": "antifungal",         // 對應 categories
  "title": "Voriconazole",
  "drugs": [{ "generic": "Voriconazole", "zh": "", "brands": ["Vfend"] }],
  "funding": "nhi",                 // nhi | public | mixed
  "summary": "一句話摘要",
  "provisions": ["給付要點 1", "給付要點 2"],
  "flags": {
    "priorAuth": true,              // 需事前審查
    "cultureRequired": true,        // 需檢驗／培養佐證
    "specialist": true,             // 需專科醫師
    "inpatientOnly": false          // 以住院為主
  },
  "tags": ["侵襲性麴菌症", "azole"],
  "sourceConfirmed": false,         // 是否已與官方原文核對
  "note": "選填備註"
}
```

## 專案結構

```
index.html                 頁面
assets/style.css           樣式（含深色模式與列印樣式）
assets/app.js              查詢邏輯（原生 JS，無相依套件）
data/antimicrobials.json   資料主檔
data/antimicrobials.js     自動產生的後援
tools/import_nhi.py        官方 PDF／TXT 匯入工具
tools/build.py             由 JSON 產生 JS 後援
```

## 授權

程式碼採 MIT 授權。法規條文著作權屬中央健康保險署，引用請註明出處。
