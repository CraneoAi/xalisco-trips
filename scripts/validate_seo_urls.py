import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


ROOT = Path(__file__).resolve().parents[1]
BASE = "https://xaliscotrips.lat"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
XHTML_NS = "http://www.w3.org/1999/xhtml"
SKIP_DIRS = {".git", "node_modules", "Claude outputs", "reports"}
REDIRECT_TARGETS = {
    "/cumbre-seguros": "/eventos-corporativos",
    "/world-cup-2026-guadalajara-tours": "/chapala-tonala-en",
    "/world-cup-2026-guadalajara-tours-es": "/chapala-tonala",
}


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.attrs = []
        self.meta = []
        self.links = []
        self.ids = set()
        self.jsonld = []
        self._jsonld = None
        self._title = False
        self.title = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            self.meta.append(attrs)
        elif tag == "link":
            self.links.append(attrs)
        if tag == "title":
            self._title = True
        if tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self._jsonld = []
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        for attr in ("href", "src", "action"):
            if attrs.get(attr):
                self.attrs.append((attr, attrs[attr]))

    def handle_endtag(self, tag):
        if tag == "title":
            self._title = False
        elif tag == "script" and self._jsonld is not None:
            self.jsonld.append("".join(self._jsonld))
            self._jsonld = None

    def handle_data(self, data):
        if self._title:
            self.title.append(data)
        if self._jsonld is not None:
            self._jsonld.append(data)


def source_pages():
    for path in ROOT.rglob("*"):
        if not path.is_file() or any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        if path.suffix.lower() != ".html" and (path.parent != ROOT or path.suffix):
            continue
        text = path.read_text(encoding="utf-8-sig", errors="replace")
        if "<html" in text[:1000].lower():
            parser = PageParser()
            parser.feed(text)
            yield path, text, parser


def canonical(parser):
    return next(
        (
            link.get("href", "")
            for link in parser.links
            if "canonical" in link.get("rel", "").lower().split()
        ),
        "",
    )


def robots(parser):
    return next(
        (
            meta.get("content", "").lower()
            for meta in parser.meta
            if meta.get("name", "").lower() == "robots"
        ),
        "",
    )


def local_file_for(path):
    path = unquote(path)
    if path == "/":
        candidates = [ROOT / "index.html"]
    else:
        relative = path.lstrip("/")
        candidates = [ROOT / relative]
        if path.endswith("/"):
            candidates.insert(0, ROOT / relative / "index.html")
        elif not Path(relative).suffix:
            candidates.extend((ROOT / f"{relative}.html", ROOT / relative / "index.html"))
    return next((candidate for candidate in candidates if candidate.is_file()), None)


def find_site_link(target, source_url):
    if target.startswith("#"):
        return None, target[1:]
    resolved = urljoin(source_url, target)
    parsed = urlsplit(resolved)
    if parsed.scheme not in ("http", "https") or parsed.netloc.lower() != "xaliscotrips.lat":
        return None, ""
    resolved_path = REDIRECT_TARGETS.get(parsed.path, parsed.path)
    return local_file_for(resolved_path), parsed.fragment


def validate():
    failures = []
    pages = list(source_pages())
    canonical_pages = {}
    for path, text, parser in pages:
        url = canonical(parser)
        is_noindex = "noindex" in robots(parser)
        if not is_noindex:
            if not url.startswith(BASE + "/") and url != BASE:
                failures.append(f"{path.relative_to(ROOT)}: missing absolute canonical")
            elif ".html" in url.lower():
                failures.append(f"{path.relative_to(ROOT)}: .html in canonical {url}")
            elif url in {BASE + path for path in REDIRECT_TARGETS}:
                pass
            else:
                canonical_pages[url] = parser
        for language_link in parser.links:
            if language_link.get("hreflang") and ".html" in language_link.get("href", "").lower():
                failures.append(f"{path.relative_to(ROOT)}: .html in hreflang")
        for match in re.finditer(r"https://xaliscotrips\.lat/[^\s\"'<>),]+", text, re.I):
            if ".html" in match.group(0).lower():
                failures.append(f"{path.relative_to(ROOT)}: internal absolute URL contains .html")
                break
        for block in parser.jsonld:
            try:
                json.loads(block)
            except json.JSONDecodeError as error:
                failures.append(f"{path.relative_to(ROOT)}: invalid JSON-LD: {error}")
        source_url = url or BASE + "/"
        for attr, target in parser.attrs:
            if target.startswith("#"):
                if target[1:] not in parser.ids:
                    failures.append(f"{path.relative_to(ROOT)}: missing fragment {target}")
                continue
            target_file, fragment = find_site_link(target, source_url)
            resolved = urlsplit(urljoin(source_url, target))
            if (
                resolved.netloc.lower() == "xaliscotrips.lat"
                and ".html" in resolved.path.lower()
            ):
                failures.append(f"{path.relative_to(ROOT)}: {attr} points to .html: {target}")
            if target_file is None:
                parsed = resolved
                if parsed.netloc.lower() == "xaliscotrips.lat" and parsed.path in REDIRECT_TARGETS:
                    continue
                if parsed.netloc.lower() == "xaliscotrips.lat" and parsed.path.startswith(("/api/", "/r/")):
                    continue
                if parsed.netloc.lower() == "xaliscotrips.lat" and parsed.path in ("", "/"):
                    continue
                if parsed.netloc.lower() == "xaliscotrips.lat" and attr == "action":
                    continue
                if parsed.netloc.lower() == "xaliscotrips.lat":
                    failures.append(f"{path.relative_to(ROOT)}: broken local {attr}: {target}")
            elif fragment and target_file.suffix.lower() == ".html":
                target_parser = next((p for file, _, p in pages if file == target_file), None)
                if target_parser and fragment not in target_parser.ids:
                    failures.append(f"{path.relative_to(ROOT)}: missing fragment #{fragment} in {target_file.relative_to(ROOT)}")

    for url, parser in canonical_pages.items():
        alternates = {
            link.get("hreflang"): link.get("href")
            for link in parser.links
            if link.get("hreflang")
        }
        spanish = alternates.get("es")
        if alternates.get("x-default") != spanish:
            failures.append(f"{url}: x-default should match Spanish alternate")
        for language in ("es", "en"):
            alternate = alternates.get(language)
            if not alternate:
                continue
            other = canonical_pages.get(alternate)
            if not other:
                failures.append(f"{url}: missing canonical page for hreflang {language}: {alternate}")
                continue
            reciprocal = {
                link.get("hreflang"): link.get("href")
                for link in other.links
                if link.get("hreflang")
            }
            if reciprocal.get("es") != spanish or reciprocal.get("en") != alternates.get("en"):
                failures.append(f"{url}: hreflang {language} pair is not reciprocal")

    sitemap_path = ROOT / "sitemap.xml"
    sitemap = ET.parse(sitemap_path).getroot()
    sitemap_urls = []
    for entry in sitemap.findall(f"{{{SITEMAP_NS}}}url"):
        loc = entry.findtext(f"{{{SITEMAP_NS}}}loc", "")
        sitemap_urls.append(loc)
        if ".html" in loc.lower():
            failures.append(f"sitemap.xml: .html URL {loc}")
        if loc not in canonical_pages:
            failures.append(f"sitemap.xml: URL is not an indexable canonical page: {loc}")
        for alternate in entry.findall(f"{{{XHTML_NS}}}link"):
            if ".html" in alternate.get("href", "").lower():
                failures.append(f"sitemap.xml: .html hreflang URL {alternate.get('href')}")
    if len(sitemap_urls) != len(set(sitemap_urls)):
        failures.append("sitemap.xml: duplicate <loc> entries")
    robots_text = (ROOT / "robots.txt").read_text(encoding="utf-8")
    if f"Sitemap: {BASE}/sitemap.xml" not in robots_text:
        failures.append("robots.txt: sitemap.xml is not declared")

    redirects = {}
    for line in (ROOT / "_redirects").read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) == 3 and parts[2] in {"301", "302", "303", "307", "308"}:
            redirects[parts[0]] = (parts[1], parts[2])
    for html_path, _, _ in pages:
        if html_path.suffix.lower() != ".html":
            continue
        route = "/" + html_path.relative_to(ROOT).as_posix()
        target = route[:-5]
        if html_path.name == "index.html":
            parent = html_path.parent.relative_to(ROOT).as_posix().strip("/")
            target = "/" if parent == "." else f"/{parent}/"
        elif html_path.name == "index-en.html":
            target = "/index-en"
        if route == "/cumbre-seguros.html":
            target = "/eventos-corporativos"
        rule = redirects.get(route)
        if not rule or rule != (target, "301"):
            failures.append(f"_redirects: expected direct 301 {route} -> {target}")
        elif rule[0] in redirects:
            failures.append(f"_redirects: redirect chain from {route} via {rule[0]}")

    for alias, target in (
        ("/world-cup-2026-guadalajara-tours.html", "/chapala-tonala-en"),
        ("/world-cup-2026-guadalajara-tours-es.html", "/chapala-tonala"),
    ):
        if redirects.get(alias) != (target, "301"):
            failures.append(f"_redirects: missing direct 301 {alias} -> {target}")

    if failures:
        print("\n".join(f"FAIL: {failure}" for failure in failures))
        print(f"\n{len(failures)} validation error(s) across {len(pages)} HTML pages.")
        return 1
    print(
        f"PASS: {len(pages)} HTML pages, {len(sitemap_urls)} unique sitemap URLs, "
        "canonical/hreflang, redirects, local links, and JSON-LD."
    )
    return 0


if __name__ == "__main__":
    sys.exit(validate())
