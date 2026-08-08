#!/usr/bin/env python3
"""Create myrm-website/locales/ko.json from en.json via Google Translate."""

from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path
from typing import Any

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1]
EN = ROOT / "locales" / "en.json"
KO = ROOT / "locales" / "ko.json"
CACHE = ROOT / "locales" / ".ko-translate-cache.json"

PLACEHOLDER_RE = re.compile(r"\{[^{}]+\}")
BRANDS = ["Myrm", "MyrmAgent", "MCP", "OpenAI", "GitHub", "Webhook", "BYOK", "Cloud"]


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


def translate_string(en_val: str, translator: GoogleTranslator, cache: dict[str, str]) -> str:
    if not en_val.strip():
        return en_val
    if en_val in cache:
        return cache[en_val]
    protected, tokens = protect(en_val)
    for brand in BRANDS:
        protected = protected.replace(brand, f"__BR_{brand}__")
    try:
        translated = translator.translate(protected)
    except Exception as exc:  # noqa: BLE001
        print(f"SKIP {en_val[:60]!r}: {exc}", file=sys.stderr)
        cache[en_val] = en_val
        return en_val
    for brand in BRANDS:
        translated = translated.replace(f"__BR_{brand}__", brand)
    translated = restore(translated, tokens)
    cache[en_val] = translated
    return translated


def translate_tree(obj: Any, translator: GoogleTranslator, cache: dict[str, str], counter: list[int]) -> Any:
    if isinstance(obj, dict):
        return {k: translate_tree(v, translator, cache, counter) for k, v in obj.items()}
    if isinstance(obj, list):
        return [translate_tree(v, translator, cache, counter) for v in obj]
    if isinstance(obj, str):
        counter[0] += 1
        if counter[0] % 40 == 0:
            print(f"ko strings {counter[0]}", flush=True)
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            time.sleep(0.12)
        return translate_string(obj, translator, cache)
    return obj


def main() -> None:
    en = json.loads(EN.read_text(encoding="utf-8"))
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    translator = GoogleTranslator(source="en", target="ko")
    counter = [0]
    ko = translate_tree(en, translator, cache, counter)
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    KO.write_text(json.dumps(ko, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {KO} strings={counter[0]} cache={len(cache)}")


if __name__ == "__main__":
    main()
