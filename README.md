# 感染科給付規定查詢

**健保藥品給付規定**中感染科常用章節的單頁查詢工具，目前收錄三個主題：

| 主題 | 內容 | 版本 | 條文數 |
| --- | --- | --- | --- |
| 第 10 節 抗微生物劑 | 抗生素、抗黴菌、抗病毒、肝炎與 HIV 用藥；含附表一第一線品名表 | 115.07.23 | 72 |
| 第 8 節 免疫製劑 | 疫苗與免疫球蛋白、免疫調節劑；含生物製劑用藥前之感染症篩檢要求 | 115.08.21 | 58 |
| 藥品給付規定通則 | 各節共同適用的通則（例如「不受通則八之限制」所指的內服液劑規定） | 113.05.20 | 12 |

純靜態網頁（HTML / CSS / 原生 JS），無需建置流程，可直接以 GitHub Pages 發佈。

> ⚠️ **免責聲明**
> 條文擷取自健保署官方 PDF，但本站**非官方文件**，且 PDF 轉文字可能有排版誤差。
> 給付條件、條號與生效日期一律以[中央健康保險署](https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html)最新公告為準，
> 用藥決策請對照官方原文與專業判斷。

## 功能

- 關鍵字搜尋：學名、中文名、商品名、適應症、條文內容、條號，支援多關鍵字（空白分隔）與結果高亮
- 主題分頁切換，另有「全部主題」可跨章節搜尋（例如搜「通則八」會同時找到引用它的巨環類條文與通則本文）
- 分類篩選：各主題自帶分類（抗細菌／抗黴菌／抗病毒／肝炎／抗 HIV／疫苗與免疫球蛋白／免疫調節劑…）
- 條件標記篩選：需事前審查、需檢驗培養佐證、需專科醫師、以住院為主、需感染症篩檢
- 其他篩選：只看含第一線品項的條文、顯示已刪除條項
- 排序（條號／分類／藥名）、依節分組、全部展開、列印友善版面
- 網址同步查詢條件，可直接把搜尋結果連結分享給同事
- 深色模式（跟隨系統，可手動切換）、鍵盤 `/` 快速聚焦搜尋框
- 標示「第一線」（附表一品項）、「本項已刪除」、事前審查等徽章，並顯示各條修訂沿革

## 使用

```bash
# 本機預覽（建議）
python3 -m http.server 8000
# 開啟 http://localhost:8000
```

### 打包成單一檔案

```bash
python3 tools/bundle.py     # 產生 dist/artifact.html
```

`dist/artifact.html` 把樣式、程式與全部條文內嵌在同一個檔案，
不依賴任何外部資源，可直接寄送、放上任何靜態空間，或發佈為 Artifact。

直接用瀏覽器開啟 `index.html`（`file://`）也可以，此時資料改由 `data/antimicrobials.js` 載入。

### 發佈到 GitHub Pages

已內建 `.github/workflows/pages.yml`，每次 push 到本分支就會自動部署。
**首次需要手動啟用一次**（GitHub 不允許 workflow 的 `GITHUB_TOKEN` 自行建立 Pages 站台）：

1. Repository → **Settings** → **Pages**
2. **Source** 選 **GitHub Actions**
3. 回到 **Actions** 分頁，重跑 `Deploy GitHub Pages`（或直接再 push 一次）

完成後網址為 `https://<帳號>.github.io/NHI-abx/`。專案已含 `.nojekyll`，
不會被 Jekyll 處理。

部署前 workflow 會先驗證 `data/antimicrobials.json` 可解析且為官方匯入版本。

## 資料

| 檔案 | 說明 |
| --- | --- |
| `data/index.json` | 主題索引（站名、各主題檔案位置與說明） |
| `data/antimicrobials.json` | 第 10 節 抗微生物劑（含 `meta.firstLine` 附表一） |
| `data/immunologics.json` | 第 8 節 免疫製劑 |
| `data/general-rules.json` | 藥品給付規定通則 |
| `data/bundle.js` | 由上列檔案自動產生，僅在 `fetch` 失敗（如 `file://`）時才載入 |

目前收錄的是**健保署官方原文**（`meta.status = "imported"`）：

- 來源：藥品給付規定 **第10節 抗微生物劑**，版本 **115.07.23**
- 共 **72 個條號**（10.1 通則、10.2 盤尼西林類、10.3 頭孢子菌素、10.4 巨環類、
  10.5 Carbapenem 類、10.6 抗黴菌劑、10.7 抗病毒劑、10.8 其他、10.9 抗 HIV），
  其中 58 項為實質條文、10 項為節標題、4 項為已刪除條項
- 另收錄**附表一 第一線抗微生物製劑品名表**（口服 32 項、注射 24 項），
  頁面會在條文上標示「第一線」徽章，並可只篩選含第一線品項的條文

### 更新到新版條文

健保署改版後，到[「最新版藥品給付規定內容（分章節）」](https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html)
下載新的章節 PDF，然後：

```bash
# 各節（第8節、第10節…）：依檔案內容自動判斷章節與輸出檔名
python3 tools/import_nhi.py chap10.pdf --dry-run                    # 先看解析出的條號
python3 tools/import_nhi.py chap10.pdf --version 115.07.23 --effective 115-07-23
python3 tools/import_nhi.py chap8.pdf  --version 115.08.21 --effective 115-08-21

# 通則（中文編號，另一支解析器）
python3 tools/import_general_rules.py 通則.pdf --version 113.05.20

# 附表一（可省略，更新章節時不會被覆蓋）
python3 tools/import_firstline.py 附表一.pdf
```

要新增其他章節，在 `tools/import_nhi.py` 的 `CHAPTER_PROFILES` 加一組設定
（分類、頂層節次對應、額外旗標），再把主題加進 `data/index.json` 即可。

匯入會覆蓋該主題的 `items` 並重新產生 `data/bundle.js`；`meta.firstLine` 會被保留，
因此更新條文時不必重跑附表一。**請人工抽查解析結果**——官方 PDF 排版變動時，
可調整 `tools/import_nhi.py` 中的 `SECTION_RE`、`BULLET_LEVELS` 與 `title_incomplete()`。

PDF 文字擷取依序嘗試 `pdftotext -layout`（poppler-utils，建議）→ `pypdf` → `pdfminer.six`；
都沒有時可先把 PDF 另存為 `.txt` 再匯入。附表一是雙欄表格，需要保留版面的擷取器
（`pdftotext -layout` 或 pypdf 的 layout 模式）才能正確分出口服／注射欄。

### 解析器處理的實際排版狀況

官方 PDF 直接轉文字後有不少陷阱，匯入器已針對這些情況處理：

- 標題跨行（如 10.4 巨環類的品名與修訂日期橫跨三行）
- 全半形括號混用（`：(108/2/1、110/11/1）`），單純計數會讓標題吞掉整段內文
- 內文中的交叉引用（`10.7.4.之 1至4項`）不可誤判為新條號
- 通則的中文編號需「恰為前一條加一」才算新條目，否則內文「第八、第九凝血因子」
  斷行後的 `八、` 會被誤判成通則八
- 內文中的小數（`1.0 mg`、`0.5 mg`）不可誤判為條號 → 以節次前綴過濾
- 巢狀條列 `1.` /`(1)` /`a.` /`Ⅰ.` → 轉為 `level` 0–3 供頁面縮排
- 單獨一行的 `限` → 轉為 `limited` 旗標，條文標題顯示「限用於下列情形」
- 單獨一行的修訂日期 → 併入 `revisions`，不當作條文內容
- `刪除`、`（刪除）`、`(本項刪除)` → 標記 `deleted`，預設隱藏

### 手動編修

直接編輯 `data/antimicrobials.json`，然後重新產生 JS 後援檔：

```bash
python3 tools/build.py
```

### 資料格式

```jsonc
{
  "id": "sec-10-3-5",
  "section": "10.3.5",
  "group": "10.3",                  // 所屬節
  "groupTitle": "頭孢子菌素 Cephalosporins",
  "category": "antibiotic",         // general|antibiotic|antifungal|antiviral|hepatitis|hiv
  "title": "Ceftaroline fosamil（如 Zinforo）",
  "drugs": [{ "generic": "Ceftaroline fosamil", "zh": "", "brands": ["Zinforo"] }],
  "funding": "nhi",
  "summary": "一句話摘要（取自第一項條文）",
  "provisions": [                   // level 0–3 對應官方巢狀編號
    { "text": "1.限下列條件之一且經感染症專科醫師會診確認需使用者:", "level": 0 },
    { "text": "(1)社區性肺炎，經使用第一線…", "level": 1 }
  ],
  "limited": false,                 // 條文以「限」起首
  "revisions": ["108/2/1", "110/11/1"],
  "deleted": false,
  "isHeader": false,                // 純節標題（無條文、有子項）
  "flags": {
    "priorAuth": false,             // 需事前審查
    "cultureRequired": true,        // 需檢驗／培養佐證
    "specialist": true,             // 需專科醫師
    "inpatientOnly": false          // 以住院為主
  },
  "sourceConfirmed": true
}
```

`flags` 是由條文關鍵字自動推導的輔助標記，方便篩選，**不是官方分類**；
實際要件請看條文內容。

## 專案結構

```
index.html                 頁面
assets/style.css           樣式（含深色模式與列印樣式）
assets/app.js              查詢邏輯（原生 JS，無相依套件）
data/index.json            主題索引
data/*.json                各主題資料主檔
data/bundle.js             自動產生的後援（fetch 失敗時才載入）
tools/import_nhi.py        各節條文匯入工具（第8節、第10節…，官方 PDF／TXT）
tools/import_general_rules.py  藥品給付規定通則匯入工具（中文編號格式）
tools/import_firstline.py  附表一 第一線抗微生物製劑品名表匯入工具
tools/build.py             由 JSON 產生 JS 後援
tools/bundle.py            打包成單一檔案 dist/artifact.html
```

## 授權

程式碼採 MIT 授權。法規條文著作權屬中央健康保險署，引用請註明出處。
