#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""匯入「藥品給付規定通則」。

通則採中文編號（一、二、…十二、），與各節的 10.1 / 8.2.3 格式不同，
因此獨立一支解析器。第10節多處引用通則（例如「不受通則八之限制」），
收錄後交叉引用才讀得完整。

用法：
    python3 tools/import_general_rules.py 通則.pdf --dry-run
    python3 tools/import_general_rules.py 通則.pdf --version 113.05.20
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
sys.path.insert(0, os.path.join(ROOT, "tools"))
from import_nhi import extract_text, norm, DATE_ONLY_RE  # noqa: E402

OUT_JSON = os.path.join(ROOT, "data", "general-rules.json")

CN_DIGITS = {"一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6,
             "七": 7, "八": 8, "九": 9, "十": 10}

# 頂層條目：「一、」～「二十、」
TOP_RE = re.compile(r"^([一二三四五六七八九十]{1,3})、\s*(.*)$")
PAGE_NOISE_RE = re.compile(r"^\s*通則\s*[-–—]\s*\d+\s*$|^\s*\d{1,3}\s*$")

# 通則內的條列層級
BULLET_LEVELS = [
    (re.compile(r"^[（(]\s*[一二三四五六七八九十]+\s*[）)]"), 0),   # （一）
    (re.compile(r"^\d{1,2}\s*[.、]"), 1),                            # 1.
    (re.compile(r"^[（(]\s*\d{1,2}\s*[）)]"), 2),                    # (1)
    (re.compile(r"^[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]+[.、]"), 3),                  # Ⅰ.
]

REVISION_RE = re.compile(r"[（(]\s*(\d{2,3}/\d{1,2}\s*/\s*\d{1,2}[^（()）]*)[）)]")

FLAG_RULES = {
    "priorAuth": ("事前審查", "事前申請", "報准", "專案審查"),
    "cultureRequired": ("檢驗報告", "檢查報告", "生物標記", "檢測結果"),
    "specialist": ("專科醫師", "會診"),
    "inpatientOnly": ("住院",),
}


def cn_to_int(s):
    """把「一」「十」「十二」「二十」轉成整數。"""
    if s == "十":
        return 10
    if s.startswith("十"):
        return 10 + CN_DIGITS.get(s[1:], 0)
    if "十" in s:
        head, tail = s.split("十", 1)
        return CN_DIGITS.get(head, 0) * 10 + (CN_DIGITS.get(tail, 0) if tail else 0)
    return CN_DIGITS.get(s, 0)


def clean_lines(text):
    out = []
    for raw in norm(text).splitlines():
        line = raw.strip()
        if not line or PAGE_NOISE_RE.match(line):
            continue
        out.append(line)
    return out


def bullet_level(line):
    for pat, lvl in BULLET_LEVELS:
        if pat.match(line):
            return lvl
    return None


def parse(lines):
    """切出頂層條目。

    只接受「恰為前一條加一」的編號，否則內文換行後的
    「八、第九凝血因子…」（原文是「第八、第九凝血因子」被斷行）會被誤判成新條目。
    """
    blocks, cur, expected = [], None, 1
    for line in lines:
        m = TOP_RE.match(line)
        num = cn_to_int(m.group(1)) if m else None
        if m and num == expected:
            if cur:
                blocks.append(cur)
            cur = {"num": num, "cn": m.group(1), "body": [m.group(2).strip()]}
            expected += 1
        elif cur is not None:
            cur["body"].append(line)
    if cur:
        blocks.append(cur)

    items = []
    for b in blocks:
        provisions, revisions, buf, buf_lvl = [], [], "", 0
        for line in b["body"]:
            if DATE_ONLY_RE.match(line):
                revisions += [x.strip() for x in re.split(r"[、,]", line.strip("（()）")) if x.strip()]
                continue
            lvl = bullet_level(line)
            if lvl is not None:
                if buf:
                    provisions.append({"text": buf.strip(), "level": buf_lvl})
                buf, buf_lvl = line, lvl
            else:
                buf = (buf + line) if buf else line
        if buf.strip():
            provisions.append({"text": buf.strip(), "level": buf_lvl})

        for p in provisions:
            p["text"] = re.sub(r"\s{2,}", " ", p["text"]).strip()
            for m in REVISION_RE.finditer(p["text"]):
                for x in re.split(r"[、,]", m.group(1)):
                    x = x.strip()
                    if x and x not in revisions:
                        revisions.append(x)

        head = provisions[0]["text"] if provisions else ""
        title = re.split(r"[。：:]", head)[0].strip()
        title = re.sub(r"[（(][^）)]*[）)]\s*$", "", title).strip()
        if len(title) > 42:
            title = title[:40] + "…"

        blob = " ".join(p["text"] for p in provisions)
        summary = head if len(head) <= 150 else head[:148] + "…"
        items.append({
            "id": "tz-%02d" % b["num"],
            "section": "通則" + b["cn"],
            "order": b["num"],
            "sectionConfidence": "high",
            "group": "通則",
            "groupTitle": "藥品給付規定通則",
            "category": "general",
            "title": title or ("通則" + b["cn"]),
            "drugs": [],
            "funding": "nhi",
            "summary": summary,
            "provisions": provisions,
            "limited": False,
            "revisions": revisions,
            "deleted": False,
            "isHeader": False,
            "flags": {f: any(k in blob for k in keys) for f, keys in FLAG_RULES.items()},
            "tags": [],
            "sourceConfirmed": True,
        })
    return items


def main():
    ap = argparse.ArgumentParser(description="匯入藥品給付規定通則")
    ap.add_argument("path", help="官方 PDF 或 TXT")
    ap.add_argument("--version")
    ap.add_argument("--effective")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(args.path):
        sys.exit("找不到檔案：%s" % args.path)

    items = parse(clean_lines(extract_text(args.path)))
    if not items:
        sys.exit("沒有解析到任何條目，請確認檔案是「藥品給付規定通則」。")

    print("解析到 %d 條通則" % len(items))
    for it in items:
        print("  %-6s %-44s 條文 %d" % (it["section"], it["title"], len(it["provisions"])))
    if args.dry_run:
        print("\n--dry-run：未寫入檔案。")
        return

    data = {
        "meta": {
            "topicId": "general-rules",
            "sectionName": "藥品給付規定通則",
            "status": "imported",
            "statusLabel": "已由健保署官方檔案匯入",
            "version": args.version or ("import-" + date.today().isoformat()),
            "generatedAt": date.today().isoformat(),
            "effectiveDate": args.effective,
            "source": {
                "name": "衛生福利部中央健康保險署／藥品給付規定通則",
                "url": "https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html",
            },
            "notice": "本頁條文由健保署官方檔案匯入。各節條文常引用本通則"
                      "（例如「不受通則八之限制」），實際規定以健保署最新公告為準。",
        },
        "categories": [{"id": "general", "label": "通則"}],
        "fundingTypes": [{"id": "nhi", "label": "健保給付"}],
        "items": items,
    }
    with io.open(OUT_JSON, "w", encoding="utf-8") as fh:
        fh.write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print("\n已寫入 %s" % OUT_JSON)
    subprocess.call([sys.executable, os.path.join(ROOT, "tools", "build.py")])


if __name__ == "__main__":
    main()
