#!/usr/bin/env python3
"""公版古籍批量下载：优先抓 guwendao.net（古诗文网镜像，结构稳定）。"""
import os, re, sys, time, urllib.request, urllib.parse, html
from html.parser import HTMLParser

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
OUT = os.path.dirname(os.path.abspath(__file__))

def get(url, encoding='utf-8', retry=2):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for i in range(retry+1):
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                data = r.read()
                # 尝试自动识别编码
                if hasattr(r.headers,'get_content_charset') and r.headers.get_content_charset():
                    enc = r.headers.get_content_charset()
                else:
                    enc = encoding
                return data.decode(enc, errors='ignore')
        except Exception as e:
            if i==retry:
                print(f'  !! fail {url}: {e}')
                return None
            time.sleep(1)

class LinksExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            d = dict(attrs)
            href = d.get('href','')
            title = d.get('title','')
            text=''
            self.in_a = True
            self.cur_text=[]
            self.cur = (href, title)
    def handle_data(self, data):
        if getattr(self,'in_a',False):
            self.cur_text.append(data)
    def handle_endtag(self, tag):
        if tag == 'a' and getattr(self,'in_a',False):
            href,title = self.cur
            t=''.join(self.cur_text).strip()
            if href:
                self.links.append((href, title or t))
            self.in_a=False

def extract_contained(html_text):
    """提取古诗文网页主正文区 <div class=...cont/sons/...> 内的段落文字。"""
    # 找 <div class="sons"> ... </div> 或 "cont"
    # 简化做法：抓所有 <p> 内文字、排除 script/style
    text = re.sub(r'<script[\s\S]*?</script>', '', html_text)
    text = re.sub(r'<style[\s\S]*?</style>', '', text)
    # 主内容区：尝试多个class
    blocks=[]
    for cls in ['cont','sons','shisoncont','contson','bookcont','main3','left','content']:
        m = re.findall(rf'<div[^>]*class="[^"]*{cls}[^"]*"[^>]*>([\s\S]*?)</div>', text)
        if m:
            blocks.extend(m)
    if not blocks:
        blocks=[text]
    out=[]
    for b in blocks:
        # 段落
        ps = re.findall(r'<p[^>]*>([\s\S]*?)</p>', b)
        for p in ps:
            p = re.sub(r'<[^>]+>', '', p)
            p = html.unescape(p).strip()
            if len(p)>1:
                out.append(p)
    return out

def fetch_book(url, fname, max_chapters=200):
    print(f'== fetch index {url} ==')
    idx = get(url)
    if not idx: return False
    le = LinksExtractor()
    le.feed(idx)
    # 找章节链接：href 包含 bookv_ 或 /bookv/ 或 /guwen/bookv_
    chap_links=[]
    seen=set()
    for href,txt in le.links:
        if 'bookv_' in href or '/bookv/' in href or 'book_' in href and 'bookv' in href:
            full = urllib.parse.urljoin(url, href)
            key = full.split('#')[0]
            if key not in seen:
                seen.add(key)
                chap_links.append((full, txt))
    print(f'  chapter links: {len(chap_links)}')
    if not chap_links:
        return False
    out=[]
    for i,(u,t) in enumerate(chap_links[:max_chapters]):
        time.sleep(0.4)
        page = get(u)
        if not page: continue
        ps = extract_contained(page)
        if ps:
            out.append(f'\n\n===== {t} =====\n')
            out.extend(ps)
            if i<3 or (i+1)%20==0:
                print(f'  [{i+1}/{len(chap_links)}] {t[:24]}  ({len(ps)}段)')
    content='\n'.join(out)
    path=os.path.join(OUT,fname)
    with open(path,'w',encoding='utf-8') as f:
        f.write(content)
    print(f'  -> saved {path}  ({len(content)} chars)')
    return True

if __name__=='__main__':
    # 从命令行接 url fname
    url = sys.argv[1]; fname=sys.argv[2]
    fetch_book(url, fname)
