#!/usr/bin/env python3
"""把 data/index.json 與各主題資料檔打包成 data/bundle.js（file:// 開啟時的後援）。

用法：python3 tools/build.py
"""
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "data", "index.json")
DST = os.path.join(ROOT, "data", "bundle.js")

HEADER = (
    "/* 自動產生，請勿手動編輯。\n"
    "   來源：data/index.json 及其所列各主題資料檔；重新產生：python3 tools/build.py */\n"
    "window.NHI_BUNDLE = "
)


def main():
    if not os.path.exists(INDEX):
        sys.exit("找不到 %s" % INDEX)
    with io.open(INDEX, encoding="utf-8") as fh:
        index = json.load(fh)

    datasets = {}
    for topic in index.get("topics", []):
        path = os.path.join(ROOT, topic["file"])
        if not os.path.exists(path):
            sys.exit("找不到主題資料檔：%s" % path)
        with io.open(path, encoding="utf-8") as fh:
            datasets[topic["id"]] = json.load(fh)

    payload = {"index": index, "datasets": datasets}
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    with io.open(DST, "w", encoding="utf-8") as fh:
        fh.write(HEADER + body + ";\n")

    total = sum(len(d.get("items", [])) for d in datasets.values())
    print("已寫入 %s（%d 個主題，共 %d 項）" % (DST, len(datasets), total))


if __name__ == "__main__":
    main()
