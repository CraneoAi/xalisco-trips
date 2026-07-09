import re
import json

files = [
    'world-cup-2026-guadalajara-tours.html',
    'world-cup-2026-guadalajara-tours-es.html'
]

pattern = re.compile(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.S|re.I)

results = {}
for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        src = fh.read()
    blocks = pattern.findall(src)
    results[f] = []
    for i, b in enumerate(blocks, 1):
        txt = b.strip()
        try:
            parsed = json.loads(txt)
            results[f].append((i, 'valid'))
        except Exception as e:
            results[f].append((i, 'error', str(e)))

if __name__ == '__main__':
    for f, arr in results.items():
        print(f"File: {f} — {len(arr)} blocks")
        for item in arr:
            if item[1] == 'valid':
                print(f"  Block {item[0]}: válido")
            else:
                print(f"  Block {item[0]}: ERROR -> {item[2]}")
    
    # exit code 0 if all valid, 1 otherwise
    all_valid = all(len([x for x in arr if x[1]=='valid'])==len(arr) for arr in results.values())
    raise SystemExit(0 if all_valid else 1
)
