import re
import json
from pathlib import Path

files = [
    "mazamitla.html",
    "mazamitla-en.html",
    "tequila.html",
    "tequila-en.html",
    "tequila-guachimontones.html",
    "tequila-guachimontones-en.html",
    "guachimontones.html",
    "guachimontones-en.html",
    "chapala-tonala.html",
    "chapala-tonala-en.html",
    "foodie-tour.html",
    "foodie-tour-en.html",
    "tlaquepaque.html",
    "tlaquepaque-en.html",
    "tonala-tlaquepaque.html",
    "tonala-tlaquepaque-en.html",
    "airport-transfer.html",
    "airport-transfer-en.html",
    "world-cup-2026-guadalajara-tours.html",
    "world-cup-2026-guadalajara-tours-es.html",
]

root = Path(__file__).resolve().parents[1]

script_re = re.compile(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.I | re.S)

def find_priceValidUntil(obj):
    # recursively search for priceValidUntil key anywhere
    if isinstance(obj, dict):
        if 'priceValidUntil' in obj:
            return True
        for v in obj.values():
            if find_priceValidUntil(v):
                return True
    elif isinstance(obj, list):
        for item in obj:
            if find_priceValidUntil(item):
                return True
    return False

for fname in files:
    path = root / fname
    if not path.exists():
        print(f"{fname}: ERROR - file not found")
        continue
    text = path.read_text(encoding='utf-8')
    blocks = script_re.findall(text)
    print(f"{fname}: {len(blocks)} <script type=application/ld+json> block(s)")
    for i, block in enumerate(blocks, start=1):
        snippet = block.strip()[:120].replace('\n',' ')
        try:
            parsed = json.loads(block)
            # If parsed is a list of objects, iterate
            objs = parsed if isinstance(parsed, list) else [parsed]
            # Determine @type if available
            types = []
            for o in objs:
                t = o.get('@type') if isinstance(o, dict) else None
                types.append(str(t))
            type_desc = ','.join(types)
            pv_present = find_priceValidUntil(parsed)
            print(f"  block {i}: valid JSON, @type: {type_desc}, priceValidUntil present: {pv_present}")
        except Exception as e:
            # print the json parse error
            print(f"  block {i}: INVALID JSON — {e}")
    print("")

# Additionally, for world-cup files give detail which blocks have priceValidUntil
for fname in ["world-cup-2026-guadalajara-tours.html", "world-cup-2026-guadalajara-tours-es.html"]:
    path = root / fname
    text = path.read_text(encoding='utf-8')
    blocks = script_re.findall(text)
    print(f"DETAIL {fname}: {len(blocks)} blocks")
    for i, block in enumerate(blocks, start=1):
        try:
            parsed = json.loads(block)
            objs = parsed if isinstance(parsed, list) else [parsed]
            for j, o in enumerate(objs, start=1):
                t = o.get('@type') if isinstance(o, dict) else None
                pv = find_priceValidUntil(o)
                print(f"  block {i}.{j}: @type={t}, priceValidUntil in block: {pv}")
        except Exception as e:
            print(f"  block {i}: INVALID JSON — {e}")
    print("")
