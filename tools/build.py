#!/usr/bin/env python3
"""從 data/antimicrobials.json 產生 data/antimicrobials.js（file:// 開啟時的後援）。

用法：python3 tools/build.py
"""
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "antimicrobials.json")
DST = os.path.join(ROOT, "data", "antimicrobials.js")

HEADER = (
    "/* 自動產生，請勿手動編輯。\n"
    "   來源：data/antimicrobials.json；重新產生：python3 tools/build.py */\n"
    "window.NHI_DATA = "
)


def main():
    if not os.path.exists(SRC):
        sys.exit("找不到 %s" % SRC)
    with io.open(SRC, encoding="utf-8") as fh:
        data = json.load(fh)
    body = json.dumps(data, ensure_ascii=False, indent=2)
    with io.open(DST, "w", encoding="utf-8") as fh:
        fh.write(HEADER + body + ";\n")
    print("已寫入 %s（%d 項）" % (DST, len(data.get("items", []))))


if __name__ == "__main__":
    main()
