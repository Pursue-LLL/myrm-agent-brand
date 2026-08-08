#!/usr/bin/env python3
"""Create myrm-website/locales/ko.json from en.json via Google Translate."""

from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1]
EN = ROOT / "locales" / "en.json"
KO = ROOT / "locales" / "ko.json"
CACHE = ROOT / "locales" / ".ko-translate-cache.json"

PLACEHOLDER_RE = re.compile(r"\{[^{}]+\}")
BRANDS = ["Myrm", "MyrmAgent", "MCP", "OpenAI", "GitHub", "Webhook"]


def protect(text: str) -> tuple[str, list[str]]:
    tokens: list[str] = []

    def repl(m: re.Match[str]) -> str:
        tokens.append(m.group(0))
        return f"__PH{len(tokens) - 1}__"

    return PLACEHOLDER_RE.sub(repl, text), tokens


def restore(text: str, tokens: list[str]) -> str:
    out = text
    for i, tok in enumerate(tokens):
        out = out.replace(f"__PH{i}__", tok)
    return out


def walk_strings(obj, prefix="", out=None):
    out = out or []
    if isinstance(obj, dict):
        for k, v in obj.items():
            walk_strings(v, f"{prefix}.{k}" if prefix else k, out)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            if isinstance(v, str):
                out.append((f"{prefix}[{i}]", v))
            else:
                walk_strings(v, f"{prefix}[{i}]", out)
    elif isinstance(obj, str):
        out.append((prefix, obj))
    return out


def set_leaf(obj: dict, dotted: str, value: str) -> None:
    if "[" in dotted:
        return
    parts = dotted.split(".")
    node = obj
    for part in parts[:-1]:
        node = node.setdefault(part, {})
    node[parts[-1]] = value


def main() -> None:
    en = json.loads(EN.read_text(encoding="utf-8"))
    ko = json.loads(json.dumps(en))
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    translator = GoogleTranslator(source="en", target="ko")
    pairs = walk_strings(en)
    unique = {}
    for _k, v in pairs:
        unique.setdefault(v, None)

    total = len(unique)
    done = 0
    for en_val in unique:
        if en_val in cache:
            unique[en_val] = cache[en_val]
            done += 1
            continue
        protected, tokens = protect(en_val)
        for brand in BRANDS:
            protected = protected.replace(brand, f"__BR_{brand}__")
        try:
            translated = translator.translate(protected)
        except Exception as exc:  # noqa: BLE001
            print(f"SKIP {en_val!r}: {exc}", file=sys.stderr)
            cache[en_val] = en_val
            unique[en_val] = en_val
            done += 1
            continue
        for brand in BRANDS:
            translated = translated.replace(f"__BR_{brand}__", brand)
        translated = restore(translated, tokens)
        cache[en_val] = translated
        unique[en_val] = translated
        done += 1
        if done % 40 == 0:
            print(f"ko translated {done}/{total}", flush=True)
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            time.sleep(0.15)

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for key, en_val in pairs:
        if "[" in key:
            continue
        ko_val = unique.get(en_val) or cache.get(en_val) or en_val
        set_leaf(ko, key, ko_val)

    KO.write_text(json.dumps(ko, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {KO}")


if __name__ == "__main__":
    main()
