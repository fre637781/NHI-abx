#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""匯入「附表一 全民健康保險醫療常用第一線抗微生物製劑品名表」。

結果寫入 data/antimicrobials.json 的 meta.firstLine，
頁面會據此在條文中標示哪些成分屬於第一線抗微生物製劑。

用法：
    python3 tools/import_firstline.py 附表一.pdf
    python3 tools/import_firstline.py 附表一.pdf --dry-run
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

sys.path.insert(0, os.path.join(ROOT, "tools"))
from import_nhi import extract_text, norm  # noqa: E402  共用文字擷取

HEADER_RE = re.compile(r"口\s*服.*注\s*射")
NOTE_RE = re.compile(r"[（(]([^）)]*)[）)]")
DELETED_RE = re.compile(r"刪除")


def parse_table(text):
    """雙欄表格：先掃出每一格的橫向位置，再由資料本身推算欄位分界。

    表頭「口　服／注　射」是置中排版，位置不等於欄位起點，
    因此改以第二欄各儲存格起點的最小值作為分界。
    """
    lines = [l.rstrip() for l in norm(text).splitlines()]
    start = None
    for i, line in enumerate(lines):
        if HEADER_RE.search(line):
            start = i + 1
            break
    if start is None:
        sys.exit("找不到「口服／注射」表頭，請確認檔案是附表一。")

    rows = []
    for line in lines[start:]:
        if not line.strip():
            continue
        cells = [(m.start(), m.group(0).strip())
                 for m in re.finditer(r"\S(?:.*?\S)?(?=\s{3,}|$)", line)]
        cells = [(pos, c) for pos, c in cells if c and not re.match(r"^\d+$", c)]
        if cells:
            rows.append(cells)

    seconds = [row[1][0] for row in rows if len(row) > 1]
    boundary = min(seconds) - 2 if seconds else 10 ** 6

    oral, inj = [], []
    for row in rows:
        for pos, cell in row:
            (inj if pos >= boundary else oral).append(cell)
    return oral, inj


def split_cell(cell):
    """把「Flucloxacillin（102/10/1）」拆成名稱與附註。"""
    notes = [m.group(1).strip() for m in NOTE_RE.finditer(cell)]
    name = NOTE_RE.sub("", cell).strip(" ,;、")
    name = re.sub(r"\s{2,}", " ", name)
    note = "；".join(n for n in notes if n)
    return {
        "name": name,
        "note": note,
        "deleted": bool(DELETED_RE.search(note)),
    }


def main():
    ap = argparse.ArgumentParser(description="匯入附表一 第一線抗微生物製劑品名表")
    ap.add_argument("path", help="附表一 PDF 或 TXT")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(args.path):
        sys.exit("找不到檔案：%s" % args.path)

    oral_raw, inj_raw = parse_table(extract_text(args.path, layout=True))
    oral = [split_cell(c) for c in oral_raw]
    inj = [split_cell(c) for c in inj_raw]
    oral = [d for d in oral if d["name"]]
    inj = [d for d in inj if d["name"]]

    print("口服 %d 項、注射 %d 項" % (len(oral), len(inj)))
    print("  口服：" + "、".join(d["name"] for d in oral[:8]) + " …")
    print("  注射：" + "、".join(d["name"] for d in inj[:8]) + " …")
    removed = [d["name"] for d in oral + inj if d["deleted"]]
    if removed:
        print("  已刪除品項：" + "、".join(removed))

    if args.dry_run:
        print("\n--dry-run：未寫入檔案。")
        return

    if not os.path.exists(OUT_JSON):
        sys.exit("找不到 %s，請先執行 tools/import_nhi.py。" % OUT_JSON)
    with io.open(OUT_JSON, encoding="utf-8") as fh:
        data = json.load(fh)
    data.setdefault("meta", {})["firstLine"] = {
        "title": "附表一 全民健康保險醫療常用第一線抗微生物製劑品名表",
        "importedAt": date.today().isoformat(),
        "oral": oral,
        "injection": inj,
    }
    with io.open(OUT_JSON, "w", encoding="utf-8") as fh:
        fh.write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print("\n已更新 %s 的 meta.firstLine" % OUT_JSON)
    subprocess.call([sys.executable, os.path.join(ROOT, "tools", "build.py")])


if __name__ == "__main__":
    main()
