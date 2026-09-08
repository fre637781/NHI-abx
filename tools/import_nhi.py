#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把健保署官方「藥品給付規定 第10節 抗微生物劑」檔案匯入為本站資料。

官方檔案：健保署 →「最新版藥品給付規定內容（分章節）」→ 第10節 抗微生物劑
    https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html

用法：
    python3 tools/import_nhi.py chap10.pdf --dry-run          # 只看解析結果
    python3 tools/import_nhi.py chap10.pdf --effective 115-07-23
    python3 tools/import_nhi.py chap10.txt --version 115.07.23

PDF 文字擷取依序嘗試：pdftotext -layout（poppler-utils）→ pypdf → pdfminer.six。
解析結果請人工抽查；官方排版變動時可調整 SECTION_RE 與 BULLET_LEVELS。
"""
from __future__ import print_function

import argparse
import io
import json
import os
import re
import subprocess
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JSON = os.path.join(ROOT, "data", "antimicrobials.json")

SOURCE = {
    "name": "衛生福利部中央健康保險署／藥品給付規定 第10節 抗微生物劑",
    "url": "https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html",
    "fullUrl": "https://www.nhi.gov.tw/ch/np-2508-1.html",
}

NOTICE = ("本頁條文由健保署官方檔案匯入。給付條件仍以健保署最新公告為準；"
          "文字擷取自 PDF，若與官方原文有出入請以原文為準。")

CATEGORIES = [
    {"id": "general",    "label": "通則"},
    {"id": "antibiotic", "label": "抗細菌劑"},
    {"id": "antifungal", "label": "抗黴菌劑"},
    {"id": "antiviral",  "label": "抗病毒劑"},
    {"id": "hepatitis",  "label": "肝炎抗病毒"},
    {"id": "hiv",        "label": "抗 HIV"},
]
FUNDING_TYPES = [
    {"id": "nhi",    "label": "健保給付"},
    {"id": "public", "label": "公費（疾管署等）"},
    {"id": "mixed",  "label": "健保／公費併行"},
]

# 條號行，例如「10.1.抗微生物劑用藥給付規定通則：」
SECTION_RE = re.compile(r"^(\d{1,2}(?:\.\d{1,3})+)\.?\s*(.*)$")
# 條號後若接這些字，代表是內文的交叉引用（如「10.7.4.之 1至4項」）而非新條號
CROSSREF_PREFIX = ("之", "至", "項", "款", "及", "或", "、", "，", "。", "第")
# 頁首頁尾，如「第10節-5」
PAGE_NOISE_RE = re.compile(r"^\s*第\s*\d+\s*節\s*[-–—]\s*\d+\s*$|^\s*[-–—]?\s*\d{1,3}\s*[-–—]?\s*$")

# 條列符號 →（正規表示式, 縮排層級）
BULLET_LEVELS = [
    (re.compile(r"^[（(]\s*\d{1,2}\s*[）)]"), 1),           # (1)
    (re.compile(r"^[a-z][.)]\s"), 2),                        # a.
    (re.compile(r"^[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]+[.、]"), 3),           # Ⅰ.
    (re.compile(r"^[一二三四五六七八九十]+[、.]"), 0),        # 一、
    (re.compile(r"^\d{1,2}\s*[.、]"), 0),                    # 1.
]

# 標題中的修訂日期括號，如「：(85/1/1、109/10/1)」
REVISION_RE = re.compile(r"[（(]\s*(\d{2,3}/\d{1,2}/\d{1,2}[^（()）]*)[）)]")
# 只由日期與分隔符組成的殘留行
DATE_ONLY_RE = re.compile(r"^[\s、,;；()（）]*\d{2,3}/\d{1,2}/\d{1,2}[\s、,;；()（）\d/]*$")
# 品名，如「（如 Augmentin tab）」
BRAND_RE = re.compile(r"[（(]\s*如\s*([^）)]+)[）)]")
# 英文成分名
GENERIC_RE = re.compile(
    r"[A-Za-z][A-Za-z\-]{3,}"
    r"(?:\s*[+＋/]\s*[A-Za-z][A-Za-z\-]{3,}"
    r"|\s+[a-z][A-Za-z\-]{3,}"
    r"|\s+[A-Z](?![A-Za-z]))*"
)
GENERIC_STOP = {
    "Antimicrobial", "Antifungal", "Antiviral", "drugs", "agents", "Miscellaneous",
    "Penicillins", "Cephalosporins", "Macrolides", "Carbapenem", "Injection",
    "inj", "tab", "cap", "oral", "solution", "suspension", "powder", "Tablets",
    "capsules", "extended", "release", "complex", "dispersion", "colloidal",
}

# 10.7 之下依成分名判定為肝炎用藥（避免用內文關鍵字誤判）
HBV_DRUGS = ("lamivudine", "entecavir", "telbivudine", "adefovir", "tenofovir")
HCV_DRUGS = ("ribavirin", "daclatasvir", "asunaprevir", "ombitasvir", "paritaprevir",
             "dasabuvir", "elbasvir", "grazoprevir", "ledipasvir", "sofosbuvir",
             "glecaprevir", "pibrentasvir", "velpatasvir", "voxilaprevir")

# 依頂層節標題判定分類
PARENT_CATEGORY_RULES = [
    ("general",    ("通則",)),
    ("hiv",        ("人類免疫缺乏", "愛滋")),
    ("antifungal", ("抗黴菌", "Antifungal")),
    ("antiviral",  ("抗病毒", "Antiviral")),
]

FLAG_RULES = {
    "priorAuth": ("事前審查", "事前申請", "專案審查", "報經同意", "申請核准", "預先審查"),
    "cultureRequired": ("藥物敏感", "藥敏", "細菌培養", "微生物培養", "培養證實",
                        "檢驗報告", "病毒量", "檢查報告", "檢附", "病理報告", "基因型"),
    "specialist": ("專科醫師", "感染症專科", "感染科", "會診", "專責醫師"),
    "inpatientOnly": ("限住院", "住院病患", "加護病房"),
}
# 僅在明確寫出公費／公務預算時才判為非健保給付；
# 條文中提到「依疾病管制署指引辦理」並不代表該藥品由公費支應。
PUBLIC_KEYWORDS = ("公費", "公務預算")

DELETED_RE = re.compile(r"^[（(]?\s*(本項)?刪除\s*[）)]?$")
# 標題結尾標示為刪除，如「…：（刪除）」
DELETED_SUFFIX_RE = re.compile(r"[（(]\s*(本項)?刪除\s*[）)]\s*$")


# --------------------------------------------------------------------------- #
# 文字擷取
# --------------------------------------------------------------------------- #
_FULLWIDTH = {}
for _lo, _hi in ((0xFF10, 0xFF19), (0xFF21, 0xFF3A), (0xFF41, 0xFF5A)):
    for _cp in range(_lo, _hi + 1):
        _FULLWIDTH[_cp] = _cp - 0xFEE0


def norm(text):
    """只把全形英數轉半形，保留中文標點以維持條文原貌。"""
    text = text.replace("　", " ").replace("\xa0", " ").replace("‐", "-")
    return text.translate(_FULLWIDTH)


def extract_text(path, layout=False):
    if path.lower().endswith(".txt"):
        with io.open(path, encoding="utf-8", errors="replace") as fh:
            return fh.read()

    try:
        cmd = ["pdftotext"] + (["-layout"] if layout else []) + ["-enc", "UTF-8", path, "-"]
        return subprocess.check_output(cmd, stderr=subprocess.STDOUT).decode("utf-8", "replace")
    except (OSError, subprocess.CalledProcessError):
        pass

    for mod in ("pypdf", "PyPDF2"):
        try:
            m = __import__(mod)
            reader = m.PdfReader(path)
            pages = []
            for p in reader.pages:
                try:
                    pages.append(p.extract_text(extraction_mode="layout") if layout
                                 else p.extract_text())
                except TypeError:          # 舊版沒有 extraction_mode
                    pages.append(p.extract_text())
            return "\n".join(t or "" for t in pages)
        except Exception:
            continue

    try:
        from pdfminer.high_level import extract_text as pm_extract
        return pm_extract(path)
    except Exception:
        pass

    sys.exit("無法擷取 PDF 文字。請安裝下列其中一項後重試：\n"
             "  sudo apt install poppler-utils   # pdftotext（建議）\n"
             "  pip install pypdf\n"
             "  pip install pdfminer.six\n"
             "或先把 PDF 另存為 .txt 再匯入。")


def clean_lines(text):
    out = []
    for raw in norm(text).splitlines():
        line = raw.strip()
        if not line or PAGE_NOISE_RE.match(line):
            continue
        out.append(line)
    return out


# --------------------------------------------------------------------------- #
# 解析
# --------------------------------------------------------------------------- #
def is_section_start(line, seen, chapter=None):
    m = SECTION_RE.match(line)
    if not m:
        return None
    num, rest = m.group(1), m.group(2)
    if num.count(".") < 1:
        return None
    # 條號必須屬於本節，否則像內文的「1.0 mg」「0.5 mg」會被誤判為條號
    if chapter and num.split(".")[0] != chapter:
        return None
    if num in seen:                                   # 內文重複引用同一條號
        return None
    if rest[:1] in CROSSREF_PREFIX:                   # 「10.7.4.之 1至4項」
        return None
    return num, rest


def detect_chapter(lines):
    """由第一個看起來像條號的行推出本節編號（例如「10.1.…」→「10」）。"""
    for line in lines:
        m = SECTION_RE.match(line)
        if m and m.group(1).count(".") >= 1 and m.group(2).strip():
            return m.group(1).split(".")[0]
    return None


def title_incomplete(title):
    """標題是否還沒結束（括號未閉合或以頓號結尾）。

    官方檔案常見全半形括號混用（如「：(108/2/1、110/11/1）」），
    因此括號計數不分全半形，否則標題會永遠判定為未結束而吞掉內文。
    """
    if title.endswith(("、", "，", "；")):
        return True
    opens = title.count("(") + title.count("（")
    closes = title.count(")") + title.count("）")
    return opens > closes


def bullet_level(line):
    for pat, lvl in BULLET_LEVELS:
        if pat.match(line):
            return lvl
    return None


def split_title(raw_title):
    """把標題中的修訂日期切出來，回傳（乾淨標題, 修訂日期清單）。"""
    title = raw_title.strip()
    revisions = []
    for m in list(REVISION_RE.finditer(title)):
        revisions += [x.strip() for x in re.split(r"[、,]", m.group(1)) if x.strip()]
    title = REVISION_RE.sub(" ", title)
    # 跨行而未閉合的日期串（如「(107/8/1、108/1/1、」）也一併移除
    title = re.sub(r"[（(]\s*\d{2,3}/\d{1,2}/\d{1,2}[\s、,\d/]*$", " ", title)
    title = re.sub(r"[\s、,]*\d{2,3}/\d{1,2}/\d{1,2}[\s、,\d/]*[）)]?\s*$", " ", title)
    title = title.strip().rstrip("：:；;、,").strip()
    # PDF 擷取常在括號內外留下多餘空白，統一成全形括號以利閱讀
    title = re.sub(r"\s*[（(]\s*如\s*", "（如 ", title)
    title = re.sub(r"\s*[）)]", "）", title) if "（如 " in title else title
    title = re.sub(r"\s{2,}", " ", title)
    seen, uniq = set(), []
    for r in revisions:
        if re.match(r"^\d{2,3}/\d{1,2}/\d{1,2}", r) and r not in seen:
            seen.add(r); uniq.append(r)
    return title, uniq


def parse_drugs(title):
    brands_by_pos, drugs = [], []
    for m in BRAND_RE.finditer(title):
        brands_by_pos.append((m.start(), [b.strip() for b in re.split(r"[、,；;/／]", m.group(1)) if b.strip()]))
    stripped = BRAND_RE.sub(" ", title)
    stop_low = set(w.lower() for w in GENERIC_STOP)
    seen = set()
    for m in GENERIC_RE.finditer(stripped):
        name = re.sub(r"\s*([+＋/])\s*", r" + ", m.group(0).strip())
        parts = name.split()
        while len(parts) > 1 and parts[-1].lower() in stop_low:   # 去掉尾端劑型字
            parts.pop()
        name = " ".join(parts)
        if not name or parts[0] in GENERIC_STOP or name.lower() in seen:
            continue
        seen.add(name.lower())
        drugs.append({"generic": name, "zh": "", "brands": []})
    for i, (_, brands) in enumerate(brands_by_pos):
        if i < len(drugs):
            drugs[i]["brands"] = brands
        elif drugs:
            drugs[-1]["brands"] = drugs[-1]["brands"] + brands
    known = set(b.lower() for d in drugs for b in d["brands"])
    return [d for i, d in enumerate(drugs) if i == 0 or d["generic"].lower() not in known]


def build_provisions(body):
    """把內文切成帶縮排層級的條列，並回傳散落在內文的修訂日期。"""
    items, cur, limited, revisions = [], None, False, []
    for line in body:
        if line == "限":
            limited = True
            continue
        if DATE_ONLY_RE.match(line):          # 標題換行後單獨一行的修訂日期
            revisions += [x.strip() for x in re.split(r"[、,]", line.strip("（()）")) if x.strip()]
            continue
        lvl = bullet_level(line)
        if lvl is not None:
            if cur:
                items.append(cur)
            cur = {"text": line, "level": lvl}
        elif cur:
            joiner = "" if cur["text"].endswith(("、", "，", "(", "（", "-")) else ""
            cur["text"] = cur["text"] + joiner + line
        else:
            cur = {"text": line, "level": 0}
    if cur:
        items.append(cur)
    for it in items:
        it["text"] = re.sub(r"\s{2,}", " ", it["text"]).strip()
    return ([it for it in items if it["text"] and not DATE_ONLY_RE.match(it["text"])],
            limited, revisions)


def guess_category(num, title, parents):
    top = num.split(".")[0] + "." + num.split(".")[1]
    parent_title = parents.get(top, "")
    for cat, keys in PARENT_CATEGORY_RULES:
        if any(k in parent_title for k in keys):
            base = cat
            break
    else:
        base = "antibiotic"
    if base == "antiviral":
        low = title.lower()
        if any(d in low for d in HBV_DRUGS) or any(d in low for d in HCV_DRUGS):
            return "hepatitis"
        if "肝炎" in title:
            return "hepatitis"
    return base


def parse(lines):
    chapter = detect_chapter(lines)
    blocks, seen, cur = [], set(), None
    for line in lines:
        hit = is_section_start(line, seen, chapter)
        if hit:
            num, rest = hit
            seen.add(num)
            if cur:
                blocks.append(cur)
            cur = {"num": num, "title_lines": [rest], "body": [], "title_open": True}
        elif cur is not None:
            title = " ".join(cur["title_lines"]).strip()
            brand_continuation = line.startswith(("（如", "(如", "（ 如", "( 如"))
            if (cur["title_open"] and title and not cur["body"]
                    and len(cur["title_lines"]) < 6
                    and bullet_level(line) is None
                    and (title_incomplete(title) or brand_continuation)):
                cur["title_lines"].append(line)
            else:
                cur["title_open"] = False
                cur["body"].append(line)
    if cur:
        blocks.append(cur)

    parents = {}
    for b in blocks:
        if b["num"].count(".") == 1:
            parents[b["num"]] = " ".join(b["title_lines"])

    items = []
    for b in blocks:
        raw_title = " ".join(b["title_lines"]).strip()
        title, revisions = split_title(raw_title)
        provisions, limited, body_revisions = build_provisions(b["body"])
        for r in body_revisions:
            if r not in revisions:
                revisions.append(r)

        deleted = bool(DELETED_RE.match(title)) or bool(DELETED_SUFFIX_RE.search(title)) or (
            not title and provisions and DELETED_RE.match(provisions[0]["text"]))
        if deleted and not title:
            title = "（本項刪除）"

        blob = title + " " + " ".join(p["text"] for p in provisions)
        summary = provisions[0]["text"] if provisions else title
        summary = re.sub(r"^(?:[（(]?\d{1,2}[）).、]|[一二三四五六七八九十]+[、.])\s*", "", summary)
        if len(summary) > 150:
            summary = summary[:148] + "…"

        top = ".".join(b["num"].split(".")[:2])
        items.append({
            "id": "sec-" + b["num"].replace(".", "-"),
            "section": b["num"],
            "sectionConfidence": "high",
            "group": top,
            "groupTitle": split_title(parents.get(top, ""))[0] if top in parents else "",
            "category": guess_category(b["num"], title, parents),
            "title": title or b["num"],
            "drugs": parse_drugs(raw_title),
            "funding": "public" if any(k in blob for k in PUBLIC_KEYWORDS) else "nhi",
            "summary": summary if not deleted else "本項已刪除。",
            "provisions": provisions,
            "limited": limited,
            "revisions": revisions,
            "deleted": deleted,
            "flags": {f: any(k in blob for k in keys) for f, keys in FLAG_RULES.items()},
            "tags": [],
            "sourceConfirmed": True,
        })

    # 無條文但底下有子項者，標記為節標題，UI 以群組標頭呈現
    for it in items:
        prefix = it["section"] + "."
        has_children = any(o["section"].startswith(prefix) for o in items)
        it["isHeader"] = bool(has_children and not it["provisions"] and not it["deleted"])
    return items


# --------------------------------------------------------------------------- #
def main():
    ap = argparse.ArgumentParser(description="匯入健保署第10節抗微生物劑給付規定")
    ap.add_argument("path", help="官方 PDF 或 TXT 檔路徑")
    ap.add_argument("--effective", help="生效日期，例如 115-07-23")
    ap.add_argument("--version", help="資料版本標示，預設用今天日期")
    ap.add_argument("--dry-run", action="store_true", help="只印出解析結果，不寫檔")
    args = ap.parse_args()

    if not os.path.exists(args.path):
        sys.exit("找不到檔案：%s" % args.path)

    items = parse(clean_lines(extract_text(args.path)))
    if not items:
        sys.exit("沒有解析到任何條號，請確認檔案是「第10節 抗微生物劑」。")

    print("解析到 %d 個條號" % len(items))
    for it in items:
        if it["section"].count(".") == 1:
            kids = len([x for x in items if x["group"] == it["section"] and x["section"] != it["section"]])
            print("  %-8s %-34s %-12s 子項 %d" %
                  (it["section"], it["title"][:34], it["category"], kids))
    if args.dry_run:
        print("\n--dry-run：未寫入檔案。")
        return

    first_line = {}
    if os.path.exists(OUT_JSON):
        with io.open(OUT_JSON, encoding="utf-8") as fh:
            first_line = (json.load(fh).get("meta", {}) or {}).get("firstLine", {}) or {}

    data = {
        "meta": {
            "title": "健保藥品給付規定 — 抗微生物劑查詢",
            "sectionName": "第10節 抗微生物劑 Antimicrobial agents",
            "status": "imported",
            "statusLabel": "已由健保署官方檔案匯入",
            "version": args.version or ("import-" + date.today().isoformat()),
            "generatedAt": date.today().isoformat(),
            "effectiveDate": args.effective,
            "source": SOURCE,
            "notice": NOTICE,
            "firstLine": first_line,
        },
        "categories": CATEGORIES,
        "fundingTypes": FUNDING_TYPES,
        "items": items,
    }
    with io.open(OUT_JSON, "w", encoding="utf-8") as fh:
        fh.write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print("\n已寫入 %s" % OUT_JSON)
    subprocess.call([sys.executable, os.path.join(ROOT, "tools", "build.py")])


if __name__ == "__main__":
    main()
