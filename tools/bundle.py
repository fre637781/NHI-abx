#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把整個網站打包成單一 HTML 檔（dist/artifact.html）。

樣式、程式與資料全部內嵌，不依賴任何外部檔案，方便直接分享或發佈為 Artifact。

用法：
    python3 tools/bundle.py
"""
from __future__ import print_function

import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
OUT = os.path.join(DIST, "artifact.html")

FONT_LINK = ('<link rel="stylesheet" '
             'href="https://fonts.googleapis.com/css2?'
             'family=Noto+Sans+TC:wght@400;500;600;700&display=swap">')


def read(*parts):
    with io.open(os.path.join(ROOT, *parts), encoding="utf-8") as fh:
        return fh.read()


def main():
    html = read("index.html")
    css = read("assets", "style.css")
    js = read("assets", "app.js")
    data = json.loads(read("data", "antimicrobials.json"))

    # 取出 <body> 內容；外層 doctype/head/body 由 Artifact 容器提供
    m = re.search(r"<body[^>]*>(.*)</body>", html, re.S)
    if not m:
        sys.exit("index.html 找不到 <body>")
    body = m.group(1)

    title_m = re.search(r"<title>(.*?)</title>", html, re.S)
    title = title_m.group(1).strip() if title_m else "抗微生物劑健保條文查詢"

    # 移除外部資源引用，改為內嵌
    body = re.sub(r'\s*<script src="[^"]*"></script>', "", body)
    body = body.strip()

    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))

    parts = [
        "<title>%s</title>" % title,
        FONT_LINK,
        "<style>\n%s\n</style>" % css,
        body,
        "<script>window.NHI_BUNDLED=true;window.NHI_DATA=%s;</script>" % payload,
        "<script>\n%s\n</script>" % js,
    ]
    out = "\n".join(parts) + "\n"

    if not os.path.isdir(DIST):
        os.makedirs(DIST)
    with io.open(OUT, "w", encoding="utf-8") as fh:
        fh.write(out)
    print("已寫入 %s（%.0f KB，%d 個條號）" %
          (OUT, len(out.encode("utf-8")) / 1024.0, len(data.get("items", []))))


if __name__ == "__main__":
    main()
