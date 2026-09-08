#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把健保署官方「藥品給付規定 第10節 抗微生物劑」檔案匯入為本站資料。

本工具在有網路的環境（例如你自己的電腦）執行，用官方原文取代種子資料。

取得官方檔案：
    https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html  （分章節，下載「第10節 抗微生物劑」）

用法：
    python3 tools/import_nhi.py 第10節.pdf
    python3 tools/import_nhi.py 第10節.txt --effective 115-01-01
    python3 tools/import_nhi.py 第10節.pdf --dry-run          # 只看解析結果不寫檔
    python3 tools/import_nhi.py --url <官方PDF網址>            # 需可連線

PDF 文字擷取依序嘗試：pdftotext（poppler-utils）→ pypdf → pdfminer.six。
解析結果請務必人工抽查，法規排版變動時可調整 SECTION_RE。
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
    "name": "衛生福利部中央健康保險署／藥品給付規定（分章節）",
    "url": "https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html",
    "fullUrl": "https://www.nhi.gov.tw/ch/np-2508-1.html",
}

NOTICE = (
    "本頁內容由健保署官方檔案匯入。實際給付條件仍以健保署最新公告為準；"
    "解析過程可能有排版誤差，重要決策請對照官方原文。"
)

# 條號行，例如「10.1.抗微生物劑用藥給付規定通則：」「10.2.3.Voriconazole（如 Vfend）：」
SECTION_RE = re.compile(r"^\s*(\d{1,2}(?:\.\d{1,3})+)\.?\s*(.*)$")
# 條文內的子項編號：一、（一）1.(1)
BULLET_RE = re.compile(r"^\s*(?:[（(]?[一二三四五六七八九十]+[）)、.]|[（(]?\d{1,2}[）).、]|[IVXivx]+\.)\s*")
PAGE_NOISE_RE = re.compile(r"^\s*(第\s*\d+\s*[節章頁]?\s*[-–]\s*\d+|[-–]?\s*\d+\s*[-–]?)\s*$")

# 英文藥名候選：至少 4 個字母、常見藥名字尾，或含「+」的複方
DRUG_TOKEN_RE = re.compile(r"[A-Z][A-Za-z][A-Za-z\-]{2,}(?:\s*[+/]\s*[A-Za-z][A-Za-z\-]{2,})*")
DRUG_SUFFIXES = (
    "cillin", "mycin", "micin", "cycline", "cef", "ceph", "penem", "floxacin",
    "conazole", "fungin", "vir", "avir", "ovir", "azid", "ampin", "butol",
    "amide", "actam", "bactam", "oxacin", "sporin", "azole", "cidin", "mulin",
    "prim", "dazole", "quine", "arin", "polin", "tidine",
)
DRUG_STOPWORDS = {
    "Antimicrobial", "Agents", "Note", "Table", "The", "For", "And", "With",
    "Section", "Drugs", "Drug", "Use", "Used", "Patients", "Patient", "Treatment",
}

CATEGORY_RULES = [
    ("general",    ("通則", "使用原則", "管理計畫", "第一線抗微生物")),
    ("hiv",        ("愛滋", "人類免疫缺乏", "HIV")),
    ("hepatitis",  ("B型肝炎", "C型肝炎", "肝炎", "HBV", "HCV")),
    ("tb",         ("結核", "分枝桿菌", "NTM", "TB")),
    ("parasite",   ("瘧", "寄生蟲", "阿米巴", "疥瘡", "線蟲")),
    ("antifungal", ("黴菌", "念珠菌", "麴菌", "隱球菌", "抗黴")),
    ("antiviral",  ("病毒", "流感", "疱疹", "CMV", "COVID")),
    ("antibiotic", ("抗生素", "抗細菌", "細菌", "球菌", "桿菌")),
]

FLAG_RULES = {
    "priorAuth": ("事前審查", "事前申請", "專案審查", "須報准", "申請核准"),
    "cultureRequired": ("藥物敏感", "藥敏", "細菌培養", "微生物培養", "檢驗報告",
                        "培養", "病毒量", "檢查報告"),
    "specialist": ("專科醫師", "感染科", "專科醫師照會", "會診", "專任醫師"),
    "inpatientOnly": ("住院", "加護病房", "限住院"),
}

FUNDING_RULES = [
    ("public", ("公費", "疾病管制署", "疾管署", "公務預算")),
]


# 只把全形英數字轉半形，保留「，（）：」等中文標點，避免破壞條文原貌。
_FULLWIDTH = {}
for _lo, _hi in ((0xFF10, 0xFF19), (0xFF21, 0xFF3A), (0xFF41, 0xFF5A)):
    for _cp in range(_lo, _hi + 1):
        _FULLWIDTH[_cp] = _cp - 0xFEE0


def norm(text):
    text = text.replace("\u3000", " ").replace("\xa0", " ")
    return text.translate(_FULLWIDTH)


def extract_text(path):
    """從 PDF 或純文字檔取出文字。"""
    if path.lower().endswith(".txt"):
        with io.open(path, encoding="utf-8", errors="replace") as fh:
            return fh.read()

    # 1) pdftotext
    try:
        out = subprocess.check_output(
            ["pdftotext", "-layout", "-enc", "UTF-8", path, "-"],
            stderr=subprocess.STDOUT,
        )
        return out.decode("utf-8", "replace")
    except (OSError, subprocess.CalledProcessError):
        pass

    # 2) pypdf / PyPDF2
    for mod, cls in (("pypdf", "PdfReader"), ("PyPDF2", "PdfReader")):
        try:
            m = __import__(mod)
            reader = getattr(m, cls)(path)
            return "\n".join((p.extract_text() or "") for p in reader.pages)
        except Exception:
            continue

    # 3) pdfminer.six
    try:
        from pdfminer.high_level import extract_text as pm_extract
        return pm_extract(path)
    except Exception:
        pass

    sys.exit(
        "無法擷取 PDF 文字。請安裝其中一項後重試：\n"
        "  sudo apt install poppler-utils      # 提供 pdftotext（建議）\n"
        "  pip install pypdf\n"
        "  pip install pdfminer.six\n"
        "或先自行把 PDF 另存為 .txt 再匯入。"
    )


def clean_lines(text):
    lines = []
    for raw in norm(text).splitlines():
        line = raw.rstrip()
        if not line.strip():
            continue
        if PAGE_NOISE_RE.match(line):
            continue
        lines.append(line.strip())
    return lines


def guess_category(blob):
    for cat, keys in CATEGORY_RULES:
        for k in keys:
            if k in blob:
                return cat
    return "antibiotic"


def guess_funding(blob):
    for fund, keys in FUNDING_RULES:
        for k in keys:
            if k in blob:
                return fund
    return "nhi"


def guess_flags(blob):
    return {flag: any(k in blob for k in keys) for flag, keys in FLAG_RULES.items()}


def guess_drugs(title, body):
    seen, drugs = set(), []
    for chunk in [title] + body[:4]:
        for m in DRUG_TOKEN_RE.finditer(chunk):
            name = re.sub(r"\s*([+/])\s*", r" \1 ", m.group(0).strip(" -"))
            head = name.split()[0]
            if head in DRUG_STOPWORDS or len(head) < 4:
                continue
            low = name.lower()
            if not any(low.find(s) >= 0 for s in DRUG_SUFFIXES) and " " not in name:
                # 沒有藥名字尾又是單字，僅在標題出現時才採用
                if chunk is not title:
                    continue
            if low in seen:
                continue
            seen.add(low)
            drugs.append({"generic": name, "zh": "", "brands": []})
    # 中文商品名／括號內品名
    for m in re.finditer(r"[（(]\s*如\s*([^）)]+)[）)]", title):
        brands = [b.strip() for b in re.split(r"[、,／/]", m.group(1)) if b.strip()]
        if drugs:
            drugs[0]["brands"] = brands
        elif brands:
            drugs.append({"generic": brands[0], "zh": "", "brands": brands})
    # 移除與商品名重複的條目（如標題「Voriconazole（如 Vfend）」不應產生 Vfend 一筆）
    known_brands = set()
    for d in drugs:
        known_brands.update(b.lower() for b in d.get("brands", []))
    drugs = [d for i, d in enumerate(drugs)
             if i == 0 or d["generic"].lower() not in known_brands]
    return drugs


def split_provisions(body):
    """把條文內容切成條列。以子項編號為切點，其餘依句號合併。"""
    provisions, buf = [], ""
    for line in body:
        if BULLET_RE.match(line) and buf:
            provisions.append(buf.strip())
            buf = line
        else:
            buf = (buf + line) if buf.endswith(("、", "，", "(", "（")) else (buf + " " + line if buf else line)
    if buf.strip():
        provisions.append(buf.strip())
    out = []
    for p in provisions:
        p = re.sub(r"\s+", " ", p).strip()
        if p:
            out.append(p)
    return out


def parse(lines):
    blocks, cur = [], None
    for line in lines:
        m = SECTION_RE.match(line)
        if m and m.group(1).count(".") >= 1:
            if cur:
                blocks.append(cur)
            cur = {"section": m.group(1), "title": m.group(2).strip(" ：:"), "body": []}
        elif cur is not None:
            cur["body"].append(line)
    if cur:
        blocks.append(cur)

    items = []
    for b in blocks:
        title = b["title"] or b["section"]
        provisions = split_provisions(b["body"])
        blob = title + " " + " ".join(provisions)
        summary = provisions[0] if provisions else title
        if len(summary) > 160:
            summary = summary[:157] + "…"
        items.append({
            "id": "sec-" + b["section"].replace(".", "-"),
            "section": b["section"],
            "sectionConfidence": "high",
            "category": guess_category(blob),
            "title": title,
            "drugs": guess_drugs(title, provisions),
            "funding": guess_funding(blob),
            "summary": summary,
            "provisions": provisions,
            "flags": guess_flags(blob),
            "tags": [],
            "sourceConfirmed": True,
        })
    return items


def load_template():
    """沿用現有檔案的分類／給付方式定義。"""
    if os.path.exists(OUT_JSON):
        with io.open(OUT_JSON, encoding="utf-8") as fh:
            old = json.load(fh)
        return old.get("categories", []), old.get("fundingTypes", [])
    return [], []


def download(url, dest):
    try:
        from urllib.request import urlopen
    except ImportError:  # py2
        from urllib2 import urlopen  # type: ignore
    print("下載中：%s" % url)
    with urlopen(url, timeout=60) as resp, open(dest, "wb") as fh:
        fh.write(resp.read())
    return dest


def main():
    ap = argparse.ArgumentParser(description="匯入健保署第10節抗微生物劑給付規定")
    ap.add_argument("path", nargs="?", help="官方 PDF 或 TXT 檔路徑")
    ap.add_argument("--url", help="改為從網址下載官方檔案")
    ap.add_argument("--effective", help="生效日期，例如 115-01-01")
    ap.add_argument("--version", help="資料版本標示，預設用今天日期")
    ap.add_argument("--dry-run", action="store_true", help="只印出解析結果，不寫檔")
    args = ap.parse_args()

    path = args.path
    if args.url:
        path = os.path.join(ROOT, "data", "_downloaded.pdf")
        download(args.url, path)
    if not path:
        ap.error("請提供檔案路徑或 --url")
    if not os.path.exists(path):
        sys.exit("找不到檔案：%s" % path)

    items = parse(clean_lines(extract_text(path)))
    if not items:
        sys.exit("沒有解析到任何條號。請確認檔案是「第10節 抗微生物劑」，"
                 "或依實際排版調整 SECTION_RE。")

    print("解析到 %d 個條號：" % len(items))
    for it in items[:15]:
        print("  %-10s %s" % (it["section"], it["title"][:52]))
    if len(items) > 15:
        print("  … 其餘 %d 項" % (len(items) - 15))

    if args.dry_run:
        print("\n--dry-run：未寫入檔案。")
        return

    categories, funding_types = load_template()
    data = {
        "meta": {
            "title": "健保藥品給付規定 — 抗微生物劑查詢",
            "sectionName": "第10節 抗微生物劑 Antimicrobial agents",
            "status": "imported",
            "statusLabel": "已由官方檔案匯入",
            "version": args.version or ("import-" + date.today().isoformat()),
            "generatedAt": date.today().isoformat(),
            "effectiveDate": args.effective,
            "source": SOURCE,
            "notice": NOTICE,
        },
        "categories": categories,
        "fundingTypes": funding_types,
        "items": items,
    }
    with io.open(OUT_JSON, "w", encoding="utf-8") as fh:
        fh.write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print("\n已寫入 %s" % OUT_JSON)

    build = os.path.join(ROOT, "tools", "build.py")
    subprocess.call([sys.executable, build])
    print("完成。請以瀏覽器開啟 index.html 檢視，並人工抽查解析結果。")


if __name__ == "__main__":
    main()
