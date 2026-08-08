#!/usr/bin/env python3
"""Translate myrm-docs/docs/<section>/**/*.mdx (EN) → docs/ko/<section>/**/*.mdx."""

from __future__ import annotations

import json
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
KO_DIR = DOCS_DIR / "ko"
CACHE_PATH = Path(__file__).resolve().parent / ".ko-mdx-translate-cache.json"

LOCALE_SKIP_DIRS = {"zh", "ko"}
FENCE_RE = re.compile(r"(```[\s\S]*?```)")
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")
URL_RE = re.compile(r"https?://[^\s)>\]]+")
LINK_PATH_RE = re.compile(
    r"(?<=[(\[])(/(?:getting-started|core-concepts|guides|tutorials|api-reference|contributing|self-hosting)[^\s)\]]*)"
)
TITLE_ATTR_RE = re.compile(r'(title=")([^"]+)(")')
MAX_BATCH_CHARS = 2800
MAX_TRANSLATE_CHARS = 4500
LARGE_FILE_LINE_THRESHOLD = 500
CACHE_LOCK = threading.Lock()

BRANDS = [
    "Myrm",
    "MyrmAgent",
    "MCP",
    "OpenAI",
    "GitHub",
    "Webhook",
    "BYOK",
    "Hermes",
    "OpenClaw",
    "Tauri",
    "Mintlify",
    "Docker",
    "SaaS",
    "GUI",
    "LLM",
    "API",
    "ZIP",
    "OAuth",
    "SSE",
    "HITL",
    "pytest",
    "vitest",
]

SKIP_LINE_PREFIXES = ("|", "---", ":::", "<", "```")


def load_cache() -> dict[str, str]:
    if not CACHE_PATH.exists():
        return {}
    with CACHE_LOCK:
        try:
            return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            backup = CACHE_PATH.with_suffix(".json.bak")
            CACHE_PATH.replace(backup)
            return {}


def save_cache(cache: dict[str, str]) -> None:
    with CACHE_LOCK:
        CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def protect_brands(text: str) -> tuple[str, list[tuple[str, str]]]:
    replacements: list[tuple[str, str]] = []
    out = text
    for brand in BRANDS:
        token = f"__BR_{len(replacements)}__"
        if brand in out:
            out = out.replace(brand, token)
            replacements.append((token, brand))
    return out, replacements


def restore_brands(text: str, replacements: list[tuple[str, str]]) -> str:
    out = text
    for token, brand in replacements:
        out = out.replace(token, brand)
    return out


def localize_doc_links(text: str) -> str:
    text = text.replace("](/zh/", "](/ko/")
    text = text.replace('href="/zh/', 'href="/ko/')

    def repl(match: re.Match[str]) -> str:
        path = match.group(1)
        if path.startswith("/ko/") or path.startswith("/zh/"):
            return path
        return f"/ko{path}"

    return LINK_PATH_RE.sub(repl, text)


def is_translatable_line(line: str) -> bool:
    trimmed = line.strip()
    if not trimmed:
        return False
    if trimmed.startswith("#"):
        return sum(1 for c in trimmed if c.isalpha()) >= 4
    if trimmed.startswith(SKIP_LINE_PREFIXES):
        return False
    return sum(1 for c in line if c.isalpha()) >= 4


def translate_text(text: str, translator: GoogleTranslator, cache: dict[str, str]) -> str:
    stripped = text.strip()
    if not stripped:
        return text
    if len(stripped) > MAX_TRANSLATE_CHARS:
        parts: list[str] = []
        remaining = stripped
        while remaining:
            chunk = remaining[:MAX_TRANSLATE_CHARS]
            if len(remaining) > MAX_TRANSLATE_CHARS:
                split_at = chunk.rfind("\n")
                if split_at < MAX_TRANSLATE_CHARS // 3:
                    split_at = MAX_TRANSLATE_CHARS
                chunk = remaining[:split_at]
                remaining = remaining[split_at:].lstrip("\n")
            else:
                chunk = remaining
                remaining = ""
            parts.append(translate_text(chunk, translator, cache))
        merged = "\n".join(parts)
        return merged if stripped == text.strip() else text.replace(stripped, merged)

    if stripped in cache:
        translated = cache[stripped]
        return translated if stripped == text.strip() else text.replace(stripped, translated)

    protected_urls: list[str] = []

    def url_repl(match: re.Match[str]) -> str:
        protected_urls.append(match.group(0))
        return f"__URL{len(protected_urls) - 1}__"

    work = URL_RE.sub(url_repl, text)
    work, brand_tokens = protect_brands(work)

    inline_codes: list[str] = []

    def code_repl(match: re.Match[str]) -> str:
        inline_codes.append(match.group(0))
        return f"__IC{len(inline_codes) - 1}__"

    work = INLINE_CODE_RE.sub(code_repl, work)

    translated = stripped
    for attempt in range(4):
        try:
            translated = translator.translate(work)
            break
        except Exception as exc:  # noqa: BLE001
            if attempt == 3:
                print(f"SKIP chunk ({stripped[:48]!r}): {exc}", file=sys.stderr)
                cache[stripped] = stripped
                return text
            time.sleep(0.4 * (attempt + 1))

    for i, code in enumerate(inline_codes):
        translated = translated.replace(f"__IC{i}__", code)
    for i, url in enumerate(protected_urls):
        translated = translated.replace(f"__URL{i}__", url)
    translated = restore_brands(translated, brand_tokens)
    translated = localize_doc_links(translated)

    cache[stripped] = translated.strip()
    save_cache(cache)
    if stripped == text.strip():
        return translated.strip()
    return text.replace(stripped, translated.strip())


def translate_title_attrs(text: str, translator: GoogleTranslator, cache: dict[str, str]) -> str:
    def repl(match: re.Match[str]) -> str:
        prefix, value, suffix = match.group(1), match.group(2), match.group(3)
        return prefix + translate_text(value, translator, cache) + suffix

    return TITLE_ATTR_RE.sub(repl, text)


def translate_frontmatter(fm: str, translator: GoogleTranslator, cache: dict[str, str]) -> str:
    lines: list[str] = []
    for line in fm.splitlines():
        if line.startswith("title:"):
            _, _, value = line.partition("title:")
            raw = value.strip()
            lines.append(f"title: {translate_text(raw, translator, cache) if raw else raw}")
            continue
        if line.startswith("description:"):
            _, _, value = line.partition("description:")
            raw = value.strip()
            lines.append(
                f"description: {translate_text(raw, translator, cache) if raw else raw}"
            )
            continue
        lines.append(line)
    return "\n".join(lines)


def flush_batch(
    batch: list[str],
    translator: GoogleTranslator,
    cache: dict[str, str],
) -> list[str]:
    if not batch:
        return []
    if len(batch) == 1:
        return [translate_text(batch[0], translator, cache)]

    joined = "\n".join(line.rstrip("\n") for line in batch)
    if len(joined) <= MAX_BATCH_CHARS:
        translated = translate_text(joined, translator, cache)
        return translated.split("\n")

    mid = len(batch) // 2
    return flush_batch(batch[:mid], translator, cache) + flush_batch(batch[mid:], translator, cache)


def translate_body(body: str, translator: GoogleTranslator, cache: dict[str, str]) -> str:
    parts = FENCE_RE.split(body)
    out: list[str] = []
    for idx, part in enumerate(parts):
        if idx % 2 == 1:
            out.append(part)
            continue
        chunk = translate_title_attrs(part, translator, cache)
        lines = chunk.splitlines(keepends=True)
        batch: list[str] = []
        translated_lines: list[str] = []

        def flush() -> None:
            nonlocal batch
            if not batch:
                return
            results = flush_batch(batch, translator, cache)
            for i, original in enumerate(batch):
                suffix = "\n" if original.endswith("\n") else ""
                translated_lines.append((results[i] if i < len(results) else original.rstrip("\n")) + suffix)
            batch = []

        for line in lines:
            if is_translatable_line(line):
                batch.append(line)
                joined_len = sum(len(item) for item in batch)
                if joined_len >= MAX_BATCH_CHARS:
                    flush()
                continue
            flush()
            translated_lines.append(line)
        flush()
        out.append("".join(translated_lines))
    return "".join(out)


def translate_paragraph_batches(
    text: str,
    translator: GoogleTranslator,
    cache: dict[str, str],
) -> str:
    paragraphs = re.split(r"\n\n+", text)
    out: list[str] = []
    batch: list[str] = []

    def flush() -> None:
        nonlocal batch
        if not batch:
            return
        joined = "\n\n".join(batch)
        translated = translate_text(joined, translator, cache)
        parts = translated.split("\n\n")
        if len(parts) == len(batch):
            out.extend(parts)
        else:
            out.extend(flush_batch(batch, translator, cache))
        batch = []

    for paragraph in paragraphs:
        if not paragraph.strip():
            out.append(paragraph)
            continue
        if not is_translatable_line(paragraph):
            flush()
            out.append(paragraph)
            continue
        batch.append(paragraph)
        if sum(len(item) for item in batch) >= MAX_BATCH_CHARS:
            flush()
    flush()
    return "\n\n".join(out)


def translate_large_body(body: str, translator: GoogleTranslator, cache: dict[str, str]) -> str:
    parts = FENCE_RE.split(body)
    out: list[str] = []
    for idx, part in enumerate(parts):
        if idx % 2 == 1:
            out.append(part)
            continue
        out.append(translate_paragraph_batches(translate_title_attrs(part, translator, cache), translator, cache))
    return "".join(out)


def translate_mdx(content: str, translator: GoogleTranslator, cache: dict[str, str]) -> str:
    line_count = content.count("\n") + 1
    if not content.startswith("---"):
        if line_count >= LARGE_FILE_LINE_THRESHOLD:
            return translate_large_body(content, translator, cache)
        return translate_body(content, translator, cache)
    end = content.find("\n---\n", 3)
    if end == -1:
        if line_count >= LARGE_FILE_LINE_THRESHOLD:
            return translate_large_body(content, translator, cache)
        return translate_body(content, translator, cache)
    fm = content[3:end]
    body = content[end + 5 :]
    body_fn = translate_large_body if line_count >= LARGE_FILE_LINE_THRESHOLD else translate_body
    return f"---\n{translate_frontmatter(fm, translator, cache)}\n---\n{body_fn(body, translator, cache)}"


def iter_en_mdx_files() -> list[Path]:
    files: list[Path] = []
    for path in sorted(DOCS_DIR.rglob("*.mdx")):
        rel_parts = path.relative_to(DOCS_DIR).parts
        if rel_parts and rel_parts[0] in LOCALE_SKIP_DIRS:
            continue
        files.append(path)
    return files


def needs_translation(dest: Path) -> bool:
    if not dest.exists():
        return True
    head = dest.read_text(encoding="utf-8")[:1200]
    title_match = re.search(r"^title:\s*(.+)$", head, re.MULTILINE)
    if title_match:
        return not re.search(r"[가-힣]", title_match.group(1))
    return not re.search(r"[가-힣]", head)


def translate_one(
    src: Path,
    index: int,
    total: int,
    force: bool,
    cache: dict[str, str],
) -> str:
    rel = src.relative_to(DOCS_DIR)
    dest = KO_DIR / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not force and not needs_translation(dest):
        return f"[{index}/{total}] skip translated {rel}"

    raw = src.read_text(encoding="utf-8")
    if rel.as_posix() == "getting-started/competitor-comparison.mdx":
        zh_src = DOCS_DIR / "zh" / rel
        if zh_src.exists():
            raw = localize_doc_links(zh_src.read_text(encoding="utf-8"))
            translator = GoogleTranslator(source="zh-CN", target="ko")
        else:
            translator = GoogleTranslator(source="en", target="ko")
    else:
        translator = GoogleTranslator(source="en", target="ko")

    translated = translate_mdx(raw, translator, cache)
    dest.write_text(translated, encoding="utf-8")
    return f"[{index}/{total}] wrote {rel}"


def main() -> None:
    force = "--force" in sys.argv
    workers = 2
    cache = load_cache()
    files = iter_en_mdx_files()
    print(f"Translating {len(files)} EN MDX files → docs/ko/ ({workers} workers)", flush=True)

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {
            pool.submit(translate_one, src, index, len(files), force, cache): src
            for index, src in enumerate(files, start=1)
        }
        for future in as_completed(futures):
            print(future.result(), flush=True)

    save_cache(cache)
    print("ko MDX bulk translate done", flush=True)


if __name__ == "__main__":
    main()
