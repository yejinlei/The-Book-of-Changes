# -*- coding: utf-8 -*-
import gzip, re, json, os, time
from collections import Counter

ROOT = "/home/user/workspace/11610675399098713153/github-publish"
ents = json.load(open("/tmp/ents.json", encoding="utf-8"))
name2ent = {}
for e in ents:
    n = e["n"]
    if n and n not in name2ent:
        name2ent[n] = {"t": e["t"], "id": e["id"]}

# 两套模式：
#  A) 易学类(yijing)：单字卦名裸匹配（易注中多字卦名/单字卦名均是卦名）
#  B) 其他类：单字卦名限「X卦」
def build(bare_single):
    p = {}
    for n, meta in name2ent.items():
        if meta["t"] == "gua" and len(n) == 1 and not bare_single:
            p[n + "卦"] = (n, meta)
        else:
            p[n] = (n, meta)
    keys = sorted(p.keys(), key=len, reverse=True)
    return re.compile("|".join(map(re.escape, keys))), p

patY, mapY = build(True)
patO, mapO = build(False)

CATS = ["yijing", "shushu", "daozang", "yizang"]
files = []
for cat in CATS:
    d = os.path.join(ROOT, "data/texts", cat)
    for f in (sorted(os.listdir(d)) if os.path.isdir(d) else []):
        if f.endswith(".gz"):
            files.append((cat, f))

books = {}
t0 = time.time()
for i, (cat, f) in enumerate(files):
    title = f[:-7]
    txt = gzip.open(os.path.join(ROOT, "data/texts", cat, f), "rt",
                    encoding="utf-8", errors="ignore").read()
    pat, mp = (patY, mapY) if cat == "yijing" else (patO, mapO)
    c = Counter()
    for m in pat.finditer(txt):
        c[mp[m.group(0)][0]] += 1
    books[title] = {"cat": cat, "c": dict(c)}
    if i % 120 == 0:
        print(i, title, len(c), round(time.time()-t0,1), flush=True)

df = Counter()
for t, v in books.items():
    for k in v["c"]:
        df[k] += 1

eid_of = {n: meta["id"] for n, meta in name2ent.items()}
type_of = {}
ent_names = {}
for n, meta in name2ent.items():
    type_of[meta["id"]] = meta["t"]
    ent_names.setdefault(meta["id"], n)

fwd = {}
for t, v in books.items():
    items = sorted(v["c"].items(), key=lambda x: -x[1])[:18]
    arr = [[eid_of[nm], cnt] for nm, cnt in items if cnt >= 3]
    if arr:
        fwd[t] = arr
inv = {}
for t, arr in fwd.items():
    for eid, cnt in arr:
        inv.setdefault(eid, []).append([t, cnt])

payload = {"types": type_of, "names": ent_names, "books": fwd, "inv": inv,
           "stats": {"books": len(fwd), "ents": len(inv)}}
js = "window.YJ_TEXTO = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n"
open(os.path.join(ROOT, "data/texts-ontology.js"), "w", encoding="utf-8").write(js)
print("DONE 书", len(fwd), "实体", len(inv), "字节", os.path.getsize(os.path.join(ROOT,"data/texts-ontology.js")), round(time.time()-t0,1),"s", flush=True)
