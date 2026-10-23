#!/usr/bin/env python3
"""Sincroniza TODOS los precios del sitio desde precios.json.

Uso:
  python scripts/precios.py           -> aplica cambios
  python scripts/precios.py --check   -> solo valida (lo usa el pre-push); falla si algo esta desincronizado

Regla: MXN es el precio oficial (ES y EN). USD = MXN / tasa_proteccion, redondeado hacia arriba.
"""
import json, math, os, re, sys, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
CFG = json.load(open("precios.json", encoding="utf-8"))
TASA = float(CFG["tasa_proteccion_usd_mxn"])
T = CFG["tours"]

def usd(mxn): return math.ceil(mxn / TASA - 1e-9)
def m(n): return f"{n:,}"
def P(k): return T[k]["mxn"]
def U(k): return usd(P(k))

PAGES = {
    "airport-transfer": "aeropuerto", "chapala-tonala": "chapala", "foodie-tour": "foodie",
    "guachimontones": "guachimontones", "mazamitla": "mazamitla", "tequila": "tequila",
    "tequila-guachimontones": "tequila_guachi", "tlaquepaque": "tlaquepaque",
    "tonala-tlaquepaque": "tonala_tlaquepaque",
}

def key_from_name(name):
    n = name.lower()
    if "aeropuerto" in n or "airport" in n: return "aeropuerto"
    if "foodie" in n: return "foodie"
    if "tequila" in n and "guachimontones" in n: return "tequila_guachi"
    if "tonal" in n and "tlaquepaque" in n: return "tonala_tlaquepaque"
    if "chapala" in n: return "chapala"
    if "mazamitla" in n: return "mazamitla"
    if "tlaquepaque" in n: return "tlaquepaque"
    if "guachimontones" in n: return "guachimontones"
    if "tequila" in n: return "tequila"
    raise KeyError(name)

def deposit(total_usd):
    d = math.ceil(total_usd * 0.30); return d, total_usd - d

def common(s):
    # shippingRate en la misma moneda que la oferta
    return re.sub(r'("value":\s*"0",\s*"currency":\s*)"USD"', r'\1"MXN"', s)

def tour_page(s, k, en):
    mx, us = P(k), U(k)
    s, n = re.subn(r'"priceCurrency":\s*"(?:USD|MXN)",(\s*)"price":\s*"\d+"', rf'"priceCurrency": "MXN",\1"price": "{mx}"', s)
    assert n == 1, ("offer", k, en, n)
    if T[k]["unidad"] == "vehiculo":
        d, b = deposit(us)
        if en:
            s = re.sub(r"Fixed \$\d+ USD", f"Fixed ${us} USD", s)
            s = re.sub(r"fixed \$\d+ USD per vehicle", f"fixed ${us} USD per vehicle", s)
            s = re.sub(r"From \$[\d,]+ (?:MXN \(≈ \$\d+ USD\)|USD) per vehicle", f"From ${m(mx)} MXN (≈ ${us} USD) per vehicle", s)
            s = re.sub(r"Example \(1 vehicle \$\d+\s+USD\):\s*\$\d+ USD deposit via Higlobe \+ \$\d+ USD cash",
                       f"Example (1 vehicle ${us} USD): ${d} USD deposit via Higlobe + ${b} USD cash", s)
        else:
            s = re.sub(r"Precio Fijo \$[\d,]+ MXN", f"Precio Fijo ${m(mx)} MXN", s)
            s = re.sub(r"\$[\d,]+ MXN por vehículo", f"${m(mx)} MXN por vehículo", s)
            s = re.sub(r"Ejemplo \(1 vehículo\):\s*\$[\d,]+ MXN total", f"Ejemplo (1 vehículo): ${m(mx)} MXN total", s)
            s = re.sub(r"vehículo\):\s*\$[\d,.]+\s+(?:MXN|USD) depósito Higlobe \+ \$[\d,.]+\s+(?:MXN|USD)",
                       f"vehículo): ${d} USD depósito Higlobe + ${b} USD", s)
        return s
    # precios dentro de <meta ... content="..."> (description / og / twitter)
    def meta_fix(mt):
        tag = mt.group(0)
        if en:
            return re.sub(r"\b([Ff])rom \$[\d,]+ (?:USD|MXN)", lambda x: f"{x.group(1)}rom ${us} USD", tag)
        return re.sub(r"\b([Dd])esde \$[\d,]+ (?:USD|MXN)", lambda x: f"{x.group(1)}esde ${m(mx)} MXN", tag)
    s = re.sub(r"<meta[^>]+content=\"[^\"]*\"[^>]*>", meta_fix, s)
    tm, tu = 4 * mx, 4 * us
    d, b = deposit(tu)
    if en:
        s = re.sub(r"example \(4 people at \$[\d,.]+ (?:USD|MXN)/person\):\s*\$[\d,.]+ MXN total",
                   f"example (4 people at ${m(mx)} MXN/person): ${m(tm)} MXN total", s)
        s = re.sub(r"Example \(4 people\):\s*\$[\d,.]+ USD deposit via\s+Higlobe \+ \$[\d,.]+ USD cash",
                   f"Example (4 people): ${d} USD deposit via Higlobe + ${b} USD cash", s)
    else:
        s = re.sub(r"Ejemplo \(4\s+personas a \$[\d,.]+ MXN/persona\):\s*\$[\d,.]+ MXN total vía Clip\.",
                   f"Ejemplo (4 personas a ${m(mx)} MXN/persona): ${m(tm)} MXN total vía Clip.", s)
        s = re.sub(r"Ejemplo \(4\s+personas\):\s*\$[\d,.]+\s+(?:MXN|USD) depósito Higlobe \+ \$[\d,.]+\s+(?:MXN|USD)",
                   f"Ejemplo (4 personas): ${d} USD depósito Higlobe + ${b} USD", s)
    if k == "tequila":
        md = T["tequila"]["mxn_destileria"]
        if en:
            s = re.sub(r"(Tequila Jalisco Tour from Guadalajara — From )\$\d+ USD", rf"\g<1>${us} USD", s)
            note = (f'<p class="small text-muted" data-precio="tequila">From ${m(mx)} MXN (≈ ${us} USD) per person: private transport + '
                    f'certified bilingual guide, admissions not included. With basic Destilería Tres Mujeres entry + tasting: '
                    f'${m(md)} MXN (≈ ${usd(md)} USD) per person.</p>')
            head = r"<h2 class=\"mb-4\">What's Included in the Tequila Tour</h2>"
        else:
            s = re.sub(r"(Tour Tequila Jalisco desde Guadalajara — Desde )\$[\d,]+ (?:USD|MXN)", rf"\g<1>${m(mx)} MXN", s)
            note = (f'<p class="small text-muted" data-precio="tequila">Desde ${m(mx)} MXN por persona: transporte privado + '
                    f'guía bilingüe certificado, sin entradas. Con entrada básica a Destilería Tres Mujeres + degustación: '
                    f'${m(md)} MXN por persona.</p>')
            head = r"<h2 class=\"mb-\d\">(?:Qu[ée] [Ii]ncluye[^<]*|M[ée]todos de Pago)</h2>"
        if 'data-precio="tequila"' in s:
            s = re.sub(r'<p class="small text-muted" data-precio="tequila">.*?</p>', note, s, flags=re.S)
        else:
            mm = re.search(head, s)
            if mm: s = s[:mm.end()] + "\n            " + note + s[mm.end():]
            else: WARN.append(f"tequila {'EN' if en else 'ES'}: no encontre el encabezado de 'incluye' para la nota de precio")
    return s

def home(s, en):
    def offer(mo):
        seg = s[s.rfind('"@type": "Product"', 0, mo.start()):mo.start()]
        k = key_from_name(re.search(r'"name":\s*"([^"]+)"', seg).group(1))
        return f'"price": "{P(k)}",{mo.group(1)}"priceCurrency": "MXN"'
    s2, n = re.subn(r'"price":\s*"\d+",(\s*)"priceCurrency":\s*"(?:USD|MXN)"', offer, s); assert n == 8, ("home offers", n); s = s2
    out, last, n = [], 0, 0
    for mo in re.finditer(r'(<div class="price-badge mb-2">)(.*?)(</div>)', s):
        if "$" not in mo.group(2): continue  # p.ej. "Tour a tu Medida" (cotizacion)
        hs = re.findall(r"<h[2-5][^>]*>(.*?)</h[2-5]>", s[max(0, mo.start()-1500):mo.start()], re.S)
        k = key_from_name(re.sub(r"<[^>]+>", " ", hs[-1]))
        mx, us = P(k), U(k); veh = T[k]["unidad"] == "vehiculo"
        txt = (f"From ${m(mx)} MXN (≈ ${us} USD) per {'vehicle' if veh else 'Person'}" if en
               else f"Desde ${m(mx)} MXN {'por vehículo' if veh else 'x Persona'}")
        out += [s[last:mo.start()], mo.group(1), txt, mo.group(3)]; last = mo.end(); n += 1
    out.append(s[last:]); s = "".join(out); assert n == 9, ("cards", n)
    if not en:
        s = re.sub(r"Transporte desde \$[\d,]+ (?:USD|MXN)", f"Transporte desde ${m(P('aeropuerto'))} MXN", s)
    return s

WARN = []
def main(check):
    changed = []
    jobs = [("index.html", lambda s: home(s, False)), ("index-en.html", lambda s: home(s, True))]
    for slug, k in PAGES.items():
        jobs.append((slug + ".html", lambda s, k=k: tour_page(s, k, False)))
        jobs.append((slug + "-en.html", lambda s, k=k: tour_page(s, k, True)))
    for f, fn in jobs:
        raw = open(f, "rb").read(); s = raw.decode("utf-8")
        new = common(fn(s))
        for blk in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', new, re.S):
            json.loads(blk)
        if new != s:
            changed.append(f)
            if not check: open(f, "wb").write(new.encode("utf-8"))
    # copias sin extension: siempre identicas a su .html
    for f in sorted(os.listdir(".")):
        if os.path.isfile(f) and "." not in f and not f.startswith("_") and os.path.exists(f + ".html") and f != "index-en":
            if open(f, "rb").read() != open(f + ".html", "rb").read():
                changed.append(f + " (copia)")
                if not check: shutil.copyfile(f + ".html", f)
    print(f"Tasa de proteccion: {TASA:.2f} MXN/USD")
    for k, v in T.items():
        print(f"  {k:<20} ${m(v['mxn']):>6} MXN  ->  ${usd(v['mxn'])} USD ({usd(v['mxn'])*TASA:,.0f} MXN a {TASA:.2f})")
    for w in WARN: print("AVISO:", w)
    if check:
        if changed:
            print("\nPRECIOS DESINCRONIZADOS en:", ", ".join(changed)); print("Corre: python scripts/precios.py"); sys.exit(1)
        print("\nOK: precios sincronizados con precios.json")
    else:
        print("\nActualizados:", ", ".join(changed) if changed else "nada (ya estaba sincronizado)")

if __name__ == "__main__":
    main("--check" in sys.argv)
