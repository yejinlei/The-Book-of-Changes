#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
公版古籍原文批量下载器
使用：python3 download_all_classics.py
运行环境：Python 3.7+，无需额外依赖
保存路径：同目录下的 txt 文件，文件名见 FILES 列表
版权说明：仅下载先秦至清代公版古籍（作者去世超过50年）；近现代版权期内作品只摘短段合理引用
"""
import os, re, sys, time, json, urllib.request, html as htmlmod
from urllib.parse import quote

OUT = os.path.dirname(os.path.abspath(__file__))
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

# ========== 抓取工具 ==========
def fetch(url, encoding='utf-8', retry=3, sleep=1.0):
    """抓取URL并返回解码后的HTML。"""
    if '://' in url:
        proto, rest = url.split('://', 1)
        if '/' in rest:
            host, path = rest.split('/', 1)
            path = quote(path, safe='/:?=&%,;#')
            url = proto + '://' + host + '/' + path
    req = urllib.request.Request(url, headers={
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.google.com/',
    })
    for i in range(retry+1):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
                enc = r.headers.get_content_charset() or encoding
                if enc and enc.lower() == 'gb2312':
                    enc = 'gbk'
                return data.decode(enc, errors='ignore')
        except Exception as e:
            if i == retry:
                print(f'  !! fail {url}: {e}')
                return None
            time.sleep(sleep * (i+1))
    return None

def strip_tags(s):
    s = re.sub(r'<script[\s\S]*?</script>', '', s, flags=re.I)
    s = re.sub(r'<style[\s\S]*?</style>', '', s, flags=re.I)
    s = re.sub(r'<!--[\s\S]*?-->', '', s)
    s = re.sub(r'<br\s*/?>', '\n', s, flags=re.I)
    s = re.sub(r'</p>', '\n', s, flags=re.I)
    s = re.sub(r'</div>', '\n', s, flags=re.I)
    s = re.sub(r'<[^>]+>', '', s)
    s = htmlmod.unescape(s)
    s = s.replace('\r', '')
    s = re.sub(r'[ \t\u00a0\u3000]+', ' ', s)
    s = re.sub(r'\n{2,}', '\n', s)
    return s.strip()

def extract_paragraphs(h, containers=None):
    """从HTML中提取正文段落。依次尝试多个正文容器，最后 fallback 到全站<p>。"""
    if containers is None:
        containers = [
            'rich_media_content', 'article-content', 'main-text', 'content', 'article',
            'lemma-summary', 'lemmaWgt-lemmaContent', 'text', 'contson', 'bookcont',
            'main3', 'left', 'post_content', 'post_text', 'post_content_main',
            'news_content', 'post_body', 'art_main', 'contentbox', 'read-content',
            'reader-content', 'content_area', 'chapter_content', 'article-body',
            'article_content', 'art_content', 'art_con', 'bookcontent',
        ]
    out = []
    # 先按容器抓
    for cls in containers:
        blocks = re.findall(rf'<(?:div|section|article)[^>]*class="[^"]*{cls}[^"]*"[^>]*>([\s\S]*?)</\1>', h)
        # 简单回退：不依赖闭合标签匹配，找一段区域内所有<p>
        m_iter = list(re.finditer(rf'<(?:div|section|article)[^>]*class="[^"]*{cls}[^"]*"[^>]*>', h))
        for m in m_iter:
            start = m.end()
            # 找匹配的闭合
            depth = 1; i = start
            while i < len(h) and depth > 0:
                no = re.search(r'<(?:div|section|article)[^>]*>', h[i:])
                nc = re.search(r'</(?:div|section|article)>', h[i:])
                if not nc: break
                if no and no.start() < nc.start():
                    depth += 1; i += no.end()
                else:
                    depth -= 1; i += nc.end()
            block = h[start:i]
            ps = re.findall(r'<p[^>]*>([\s\S]*?)</p>', block, flags=re.I)
            if not ps:
                t = strip_tags(block)
                ps = [l for l in t.split('\n') if len(l.strip())>6]
            for p in ps:
                t = strip_tags(p)
                if len(t) > 5: out.append(t)
        if out: break
    # fallback：所有<p>
    if not out:
        ps = re.findall(r'<p[^>]*>([\s\S]*?)</p>', h, flags=re.I)
        for p in ps:
            t = strip_tags(p)
            if len(t) > 5: out.append(t)
    return out

BAD_PAT = re.compile(
    r'(登录|注册|收藏|下载APP|扫码|关注我们|免责声明|版权所有|侵权|举报|点击查看|'
    r'分享到|点赞|留言|下一篇|上一篇|回到顶部|相关阅读|责任编辑|https?://|www\.|'
    r'微信公众号|未经授权|展开全文|返回搜狐|本文来自|转载请|百家号\b|浏览器|客户端|'
    r'原标题|查看更多|阅读全文|广告\b|免责|本文地址|原文地址|推荐阅读|'
    r'责任编辑|编辑\s*[:：]|展开全文|收起全文|手机阅读|返回网易首页|'
    r'参考资料|继续阅读|责任编辑|原标题|图片来源|网络综合|本文链接|'
    r'扫描二维码|下载地址|电子书下载|pdf下载|txt下载|epub|mobi)'
)

def clean_paragraphs(ps, min_len=8):
    res=[]
    seen=set()
    for p in ps:
        p = p.strip()
        if BAD_PAT.search(p): continue
        if len(p) < min_len: continue
        if p in seen: continue
        # 过滤纯英文、纯数字行
        cn = len(re.findall(r'[\u4e00-\u9fff]', p))
        if cn < 3: continue
        seen.add(p)
        res.append(p)
    return res

def save(fname, title, source, paragraphs):
    path = os.path.join(OUT, fname)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f'# {title}\n')
        f.write(f'# 来源：{source}\n')
        f.write(f'# 下载时间：{time.strftime("%Y-%m-%d %H:%M")}\n\n')
        for p in paragraphs:
            f.write(p + '\n\n')
    print(f'  ✓ {fname}  {os.path.getsize(path)}B / {len(paragraphs)}段')
    return path

# ========== 典籍清单（多源回退，第一个成功的即保存）==========
# 格式：(文件名, 中文书名, [(url, 关键词过滤可为None)])
FILES = [
    # ---- 十翼 ----
    ('xici-shang.txt', '周易·系辞传·上', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F42E1F7D7FBD83.aspx', ['天尊地卑','一阴一阳']),
        ('https://www.guwendao.net/guwen/bookv_46653FD803893E4F42E1F7D7FBD83.aspx', ['天尊地卑']),
    ]),
    # ---- 道家/丹道 ----
    ('daodejing.txt', '道德经（老子）全81章', [
        ('https://www.gushiwen.cn/guwen/book_46653FD803893E4F1564F0C048E05AAB.aspx', ['道可道','上善若水','道生一']),
        ('https://www.guwendao.net/guwen/book_46653FD803893E4F1564F0C048E05AAB.aspx', ['道可道']),
    ]),
    ('cantongqi.txt', '周易参同契（东汉·魏伯阳）', [
        ('https://m.dashengshan.cn/nd.jsp?id=292', ['乾坤者','坎离匡廓']),
        ('https://www.gushiwen.cn/guwen/bookv_b10aa50e82c4.aspx', ['乾坤']),
    ]),
    ('wuzhenpian.txt', '悟真篇（北宋·张伯端）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F92D98E00C.aspx', ['不求大道']),
    ]),
    ('ruyaojing.txt', '入药镜（唐·崔希范）', [
        ('https://www.shidianguji.com/zh/book/CADAL06030957/chapter/1l3ci2ngznlkw', ['先天炁']),
    ]),
    ('taijitu-shuo.txt', '太极图说（北宋·周敦颐）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FD22DB1A2F.aspx', ['无极而太极']),
        ('https://baike.so.com/doc/30513804-32313579.html', ['无极而太极']),
    ]),
    ('huangji-jingshi.txt', '皇极经世书·观物篇（北宋·邵雍）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F7EFB50D1F.aspx', ['观物']),
    ]),
    ('zhonglü-chuandao.txt', '钟吕传道集（唐·施肩吾编）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F07CE0190.aspx', ['真仙']),
    ]),
    ('dadan-zhizhi.txt', '大丹直指（金·丘处机）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FE6BDB59AF.aspx', ['金丹']),
    ]),
    ('xingming-guizhi.txt', '性命圭旨（明·尹真人高弟）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F970F5B5F3.aspx', ['性命']),
    ]),
    ('xuanji-zhijiang.txt', '玄机直讲（元末明初·张三丰）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FBD5D7ED4.aspx', ['道者']),
    ]),
    ('ruyaojing.txt', '入药镜（唐·崔希范）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F6F75CEB3.aspx', ['先天炁']),
    ]),

    # ---- 医易 ----
    ('huangdi-neijing.txt', '黄帝内经·素问（节选上古天真论、四气调神大论、生气通天论、阴阳应象大论、天元纪大论）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F5FA2528AF.aspx', ['昔在黄帝']),  # 上古天真论
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F0C0D7C20C.aspx', ['春三月']),   # 四气调神论
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F26F565029.aspx', ['阳气者']),   # 生气通天论
    ]),
    ('shanghan-lun.txt', '伤寒论（东汉·张仲景，含原序、太阳上篇前30条）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F2C68D1B06.aspx', ['论曰：余每览']),
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F54551C63C.aspx', ['太阳之为病']),
    ]),
    ('qianjin-dayixiye.txt', '备急千金要方·大医习业（唐·孙思邈）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F6ED5911FA.aspx', ['凡欲为大医']),
    ]),
    ('leijing-fuyi.txt', '类经附翼·医易义（明·张景岳）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FCEC00A84B.aspx', ['不知易']),
    ]),

    # ---- 卦气/天文 ----
    ('huainanzi-tianwen.txt', '淮南子·天文训（西汉·刘安）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F92F88C8E4.aspx', ['天地未形']),
    ]),
    ('yiwei-qianzaodu.txt', '易纬·乾凿度', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F5DB87810E.aspx', ['易者']),
    ]),
    ('yiwei-jilantu.txt', '易纬·稽览图', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F8A267476E.aspx', ['甲子卦气']),
    ]),

    # ---- 术数/纳甲/筮法 ----
    ('jingshi-yizhuan.txt', '京氏易传（西汉·京房）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F64E529212.aspx', ['夫易者']),
    ]),
    ('huozhulin.txt', '火珠林', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F666C95E37.aspx', ['易书']),
    ]),
    ('huangjince.txt', '黄金策（明·刘基）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FBEF7703BD.aspx', ['动静阴阳']),
    ]),
    ('bushi-zhengzong.txt', '卜筮正宗（清·王洪绪）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F09C8FCA30.aspx', ['爻象']),
    ]),
    ('yixue-qimeng.txt', '易学启蒙（南宋·朱熹）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FC023DCECA.aspx', ['河图']),
    ]),

    # ---- 注疏核心 ----
    ('wangbi-yi-zhu.txt', '周易注+周易略例（魏·王弼）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F24F714D7A.aspx', ['乾：元亨利贞']),
    ]),
    ('zhouyi-zhengyi.txt', '周易正义（唐·孔颖达）乾卦疏', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F43B69705.aspx', ['乾下乾上']),
    ]),
    ('yichuan-yizhuan.txt', '伊川易传（北宋·程颐）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F90CC0B36.aspx', ['乾']),
    ]),
    ('zhouyi-benyi.txt', '周易本义（南宋·朱熹）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FA1627E8E.aspx', ['周易']),
    ]),
    ('zhouyi-shangshi.txt', '周易尚氏学（近代·尚秉和，自序+总论）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F77F55FCDF.aspx', ['易辞']),
    ]),
    ('zhouyi-jijie.txt', '周易集解（唐·李鼎祚）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F3F22C4E6.aspx', ['乾']),
    ]),
    ('dongpo-yizhuan.txt', '东坡易传（北宋·苏轼）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F904AE76.aspx', ['乾']),
    ]),
    ('hengqu-yishuo.txt', '横渠易说（北宋·张载）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F05E16C82.aspx', ['乾']),
    ]),
    ('zhouyi-jizhu.txt', '周易集注（明·来知德）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FBD377D5A.aspx', ['易']),
    ]),
    ('zhouyi-waizhuan.txt', '周易外传（明末·王夫之）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4F7DA8EAB3.aspx', ['系辞']),
    ]),
    ('yitu-mingbian.txt', '易图明辨（清·胡渭）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FBF9310E.aspx', ['河图']),
    ]),
    ('yihanxue.txt', '易汉学（清·惠栋）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FE93B7CD0.aspx', ['孟喜']),
    ]),

    # ---- 帛书/出土文献（节选）----
    ('boshu-zhouyi.txt', '马王堆帛书周易（二三子问、易之义、要、缪和、昭力）', [
        ('https://www.gushiwen.cn/guwen/bookv_46653FD803893E4FA41E631D.aspx', ['孔子']),
    ]),
]

def main():
    print(f'=== 公版古籍批量下载（共 {len(FILES)} 部）===\n')
    ok=0; fail=[]
    for fname, title, sources in FILES:
        # 如果文件已存在且>2KB，跳过
        path = os.path.join(OUT, fname)
        if os.path.exists(path) and os.path.getsize(path) > 2000:
            print(f'  = 已存在，跳过 {fname}')
            ok += 1
            continue
        downloaded = False
        for url, kw in sources:
            h = fetch(url)
            if not h: continue
            ps = extract_paragraphs(h)
            ps = clean_paragraphs(ps)
            if kw:
                ps2 = [p for p in ps if any(k in p for k in kw)]
                # 如果关键词过滤后内容太少，不过滤
                if sum(len(p) for p in ps2) > 200:
                    ps = ps2
            if len(ps) >= 3 and sum(len(p) for p in ps) > 500:
                save(fname, title, url, ps)
                ok += 1
                downloaded = True
                break
            time.sleep(0.5)
        if not downloaded:
            print(f'  ✗ 全部源失败：{title}（{fname}）')
            fail.append(fname)
        time.sleep(1.0)
    print(f'\n=== 完成：成功 {ok}/{len(FILES)}，失败 {len(fail)} ===')
    if fail:
        print('失败清单（可手动补充或访问 shidianguji.com/ctext.org 手动复制）：')
        for f in fail: print(' -', f)
    # 写 manifest
    manifest = {}
    for fname, title, _ in FILES:
        p = os.path.join(OUT, fname)
        manifest[fname] = {
            'title': title,
            'downloaded': os.path.exists(p) and os.path.getsize(p)>200,
            'size': os.path.getsize(p) if os.path.exists(p) else 0,
        }
    with open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print('\nmanifest.json 已生成')

if __name__ == '__main__':
    main()
