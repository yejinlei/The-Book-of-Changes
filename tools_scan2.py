# -*- coding: utf-8 -*-
"""重建 data/texts-ontology.js：覆盖全部 6 个分类目录 + 实体别名（十翼/易图/注本）。"""
import gzip, re, json, os, time
from collections import Counter

ROOT = "/home/user/workspace/11610675399098713153/github-publish"
ents = json.load(open("/tmp/ents.json", encoding="utf-8"))

# 带分隔符 / 括号 / 异名的实体，补常见写法（避免「彖传·上」这类全称在正文中匹配不到）
ALIAS = {
    "彖传·上": ["彖传"], "彖传·下": ["彖传"],
    "象传·上": ["象传"], "象传·下": ["象传"],
    "系辞传·上": ["系辞传", "系辞"], "系辞传·下": ["系辞传", "系辞"],
    "文言传": ["文言"], "说卦传": ["说卦"], "序卦传": ["序卦"], "杂卦传": ["杂卦"],
    "先天八卦图（伏羲八卦）": ["先天图", "伏羲八卦", "先天八卦图"],
    "后天八卦图（文王八卦）": ["后天图", "文王八卦", "后天八卦图"],
    "六十四卦方圆图": ["方圆图"], "爻变图/十二消息卦": ["十二消息卦", "消息卦"],
    "八卦变六十四卦图": ["八卦变六十四卦"],
    "皇极经世书": ["皇极经世"], "周易集注（来氏易）": ["周易集注", "来氏易"],
    "周易外传/内传": ["周易外传", "周易内传"], "易汉学/周易述": ["易汉学", "周易述"],
    "周易古经今注/大传今注": ["周易古经今注", "周易大传今注"], "周易尚氏学": ["尚氏学"],
    "御纂周易折中": ["周易折中"], "周易郑注": ["郑氏易注"],
}

name2ent = {}
for e in ents:
    n = e["n"]
    if n and n not in name2ent:
        name2ent[n] = {"t": e["t"], "id": e["id"]}
for canon, als in ALIAS.items():
    base = name2ent.get(canon)
    if not base:
        print("!! alias base missing:", canon, flush=True); continue
    for a in als:
        if a in name2ent:
            if name2ent[a]["id"] != base["id"]:
                print("!! alias conflict:", a, "->", base["id"], "already", name2ent[a]["id"], flush=True)
            continue
        name2ent[a] = {"t": base["t"], "id": base["id"]}
print("实体键（含别名）:", len(name2ent), flush=True)

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

# 全部 6 个分类；易藏（yijing）允许单字卦名裸匹配，其余限「X卦」
CATS = sorted(d for d in os.listdir(os.path.join(ROOT, "data/texts"))
              if os.path.isdir(os.path.join(ROOT, "data/texts", d)))
print("分类:", CATS, flush=True)

files = []
for cat in CATS:
    d = os.path.join(ROOT, "data/texts", cat)
    for f in sorted(os.listdir(d)):
        if f.endswith(".gz"):
            files.append((cat, f))
print("待扫文件:", len(files), flush=True)

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
    if c:
        books[title] = c
    if i % 200 == 0:
        print(i, title, len(c), round(time.time() - t0, 1), flush=True)

eid_of, type_of, ent_names = {}, {}, {}
for n, meta in name2ent.items():
    eid_of[n] = meta["id"]
    type_of[meta["id"]] = meta["t"]
    # 规范名优先（别名不覆盖已登记名）
    if meta["id"] not in ent_names:
        ent_names[meta["id"]] = n

fwd = {}
for t, c in books.items():
    items = sorted(c.items(), key=lambda x: -x[1])[:24]
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
print("DONE 书", len(fwd), "实体", len(inv), "字节",
      os.path.getsize(os.path.join(ROOT, "data/texts-ontology.js")),
      round(time.time() - t0, 1), "s", flush=True)
