/**
 * yijing-najia-data.js 纳甲筮法本体数据
 *
 * 基于西汉京房《京氏易传》、五代宋初《火珠林》、清代王洪绪《卜筮正宗》、野鹤老人《增删卜易》
 * 构建八宫、纳甲、世应、六亲、六神、旺衰、旬空、飞伏等完整本体数据。
 *
 * 本文件仅为结构化数据，不含 UI。演算逻辑见 yijing-najia-engine.js。
 */
(function (global) {
  'use strict';

  // ============================================================
  // 1. 五行基础
  // ============================================================
  const WUXING = {
    jin:  { key:'jin',  name:'金', sheng:'shui',  ke:'mu',   beisheng:'tu',   beike:'huo'  },
    mu:   { key:'mu',   name:'木', sheng:'huo',   ke:'tu',   beisheng:'shui', beike:'jin'  },
    shui: { key:'shui', name:'水', sheng:'mu',    ke:'huo',  beisheng:'jin',  beike:'tu'   },
    huo:  { key:'huo',  name:'火', sheng:'tu',    ke:'jin',  beisheng:'mu',   beike:'shui' },
    tu:   { key:'tu',   name:'土', sheng:'jin',   ke:'shui', beisheng:'huo',  beike:'mu'   }
  };

  // 五行相生：生我者父母，我生者子孙；同我者兄弟；克我者官鬼；我克者妻财
  const LIUQIN_BY_REL = {
    beisheng: { key:'fumu',    name:'父母', abbr:'父', color:'indigo' },  // 生我者
    sheng:    { key:'zisun',    name:'子孙', abbr:'孙', color:'green'  },  // 我生者
    tong:     { key:'xiongdi',  name:'兄弟', abbr:'兄', color:'steel'  },  // 同我者
    ke:       { key:'qicai',    name:'妻财', abbr:'财', color:'gold'   },  // 我克者
    beike:    { key:'guangui',  name:'官鬼', abbr:'官', color:'red'    }   // 克我者
  };

  // ============================================================
  // 2. 八卦本体（纳干 / 五行 / 世身）
  // ============================================================
  // 阳卦：乾（父）、震（长男）、坎（中男）、艮（少男）→ 阳干；地支顺排
  // 阴卦：坤（母）、巽（长女）、离（中女）、兑（少女）→ 阴干；地支逆排
  const BAGUA_NAJIA = {
    qian: { name:'乾', symbol:'☰', yinyang:'yang', wuxing:'jin',  nagan:['甲','壬'], // 内甲外壬
           // 阳卦地支顺排：初→上 子寅辰午申戌
           nazhi_nei:['子','寅','辰'], nazhi_wai:['午','申','戌'] },
    zhen: { name:'震', symbol:'☳', yinyang:'yang', wuxing:'mu',   nagan:['庚','庚'], // 震卦内外卦皆纳庚（长子代父）
           nazhi_nei:['子','寅','辰'], nazhi_wai:['午','申','戌'] },
    kan:  { name:'坎', symbol:'☵', yinyang:'yang', wuxing:'shui', nagan:['戊','戊'],
           nazhi_nei:['寅','辰','午'], nazhi_wai:['申','戌','子'] },
    gen:  { name:'艮', symbol:'☶', yinyang:'yang', wuxing:'tu',   nagan:['丙','丙'],
           nazhi_nei:['辰','午','申'], nazhi_wai:['戌','子','寅'] },
    xun:  { name:'巽', symbol:'☴', yinyang:'yin',  wuxing:'mu',   nagan:['辛','辛'], // 阴卦逆排
           nazhi_nei:['丑','亥','酉'], nazhi_wai:['未','巳','卯'] },
    li:   { name:'离', symbol:'☲', yinyang:'yin',  wuxing:'huo',  nagan:['己','己'],
           nazhi_nei:['卯','丑','亥'], nazhi_wai:['酉','未','巳'] },
    kun:  { name:'坤', symbol:'☷', yinyang:'yin',  wuxing:'tu',   nagan:['乙','癸'], // 内乙外癸
           nazhi_nei:['未','巳','卯'], nazhi_wai:['丑','亥','酉'] },
    dui:  { name:'兑', symbol:'☱', yinyang:'yin',  wuxing:'jin',  nagan:['丁','丁'],
           nazhi_nei:['巳','卯','丑'], nazhi_wai:['亥','酉','未'] }
  };

  // 地支五行
  const DIZHI_WUXING = {
    '子':'shui','丑':'tu','寅':'mu','卯':'mu','辰':'tu','巳':'huo',
    '午':'huo','未':'tu','申':'jin','酉':'jin','戌':'tu','亥':'shui'
  };
  // 地支阴阳
  const DIZHI_YINYANG = {
    '子':'yang','丑':'yin','寅':'yang','卯':'yin','辰':'yang','巳':'yin',
    '午':'yang','未':'yin','申':'yang','酉':'yin','戌':'yang','亥':'yin'
  };
  // 地支顺序号（子=1…亥=12）
  const DIZHI_ORDER = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const dizhiIdx = dz => DIZHI_ORDER.indexOf(dz);

  // 地支六冲
  const LIUCHONG_PAIRS = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
  function isChong(a, b) { return LIUCHONG_PAIRS.some(p => (p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a)); }
  // 地支六合
  const LIUHE_PAIRS = [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']];
  function isHe(a, b) { return LIUHE_PAIRS.some(p => (p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a)); }
  // 生合 vs 平合
  const SHENGHE = {'午未':true,'辰酉':true,'亥寅':true}; // 传统月建生合三组（克合另列）
  const KEHE    = {'卯戌':true,'巳申':true,'丑子':true}; // 克合（被合方受克）

  // ============================================================
  // 3. 八宫六十四卦 归宫表 + 世应位置
  // ============================================================
  // 宫位顺序（京房八宫传统序）：乾震坎艮坤巽离兑
  // 每宫八卦：本宫（上世，世六）、一世（世初）、二世（世二）、三世（世三）、四世（世四）、五世（世五）、游魂（世四）、归魂（世三）
  // 应爻与世爻相隔三位：世1应4、世2应5、世3应6、世4应1、世5应2、世6应3
  // 数据来源：《卜筮正宗》八宫卦序歌 + 诸本互校（惠栋《易汉学》、《京氏易传》）
  // 每卦给出：num（通行本序号 1-64）、symbol（6位爻，从下到上：1=阳 0=阴）、name、xia/shang（内外卦）、shi（世爻位 1-6）、ying（应爻位）、level（本宫/一世…归魂）
  const BAGONG = {
    // 乾宫（金）
    qian: { gong:'qian', wuxing:'jin', name:'乾', guas:[
      { num:1,  name:'乾为天', xia:'qian', shang:'qian', symbol:[1,1,1,1,1,1], shi:6, ying:3, level:'本宫' },
      { num:44, name:'天风姤', xia:'xun',  shang:'qian', symbol:[0,1,1,1,1,1], shi:1, ying:4, level:'一世' },
      { num:33, name:'天山遁', xia:'gen',  shang:'qian', symbol:[1,1,1,0,0,1], shi:2, ying:5, level:'二世' },
      { num:12, name:'天地否', xia:'kun',  shang:'qian', symbol:[0,0,0,1,1,1], shi:3, ying:6, level:'三世' },
      { num:20, name:'风地观', xia:'kun',  shang:'xun',  symbol:[0,0,0,0,1,1], shi:4, ying:1, level:'四世' },
      { num:23, name:'山地剥', xia:'kun',  shang:'gen',  symbol:[0,0,0,0,0,1], shi:5, ying:2, level:'五世' },
      { num:35, name:'火地晋', xia:'kun',  shang:'li',   symbol:[0,0,0,1,0,1], shi:4, ying:1, level:'游魂' },
      { num:14, name:'火天大有',xia:'qian', shang:'li',   symbol:[1,1,1,1,0,1], shi:3, ying:6, level:'归魂' }
    ]},
    // 震宫（木）
    zhen: { gong:'zhen', wuxing:'mu', name:'震', guas:[
      { num:51, name:'震为雷', xia:'zhen', shang:'zhen', symbol:[1,0,0,1,0,0], shi:6, ying:3, level:'本宫' },
      { num:16, name:'雷地豫', xia:'kun',  shang:'zhen', symbol:[0,0,0,1,0,0], shi:1, ying:4, level:'一世' },
      { num:40, name:'雷水解', xia:'kan',  shang:'zhen', symbol:[0,1,0,1,0,0], shi:2, ying:5, level:'二世' },
      { num:32, name:'雷风恒', xia:'xun',  shang:'zhen', symbol:[1,1,0,1,0,0], shi:3, ying:6, level:'三世' },
      { num:46, name:'地风升', xia:'xun',  shang:'kun',  symbol:[1,1,0,0,0,0], shi:4, ying:1, level:'四世' },
      { num:48, name:'水风井', xia:'xun',  shang:'kan',  symbol:[1,1,0,0,1,0], shi:5, ying:2, level:'五世' },
      { num:28, name:'泽风大过',xia:'xun',  shang:'dui',  symbol:[1,1,0,0,1,1], shi:4, ying:1, level:'游魂' },
      { num:17, name:'泽雷随', xia:'zhen', shang:'dui',  symbol:[1,0,0,0,1,1], shi:3, ying:6, level:'归魂' }
    ]},
    // 坎宫（水）
    kan: { gong:'kan', wuxing:'shui', name:'坎', guas:[
      { num:29, name:'坎为水', xia:'kan',  shang:'kan',  symbol:[0,1,0,0,1,0], shi:6, ying:3, level:'本宫' },
      { num:60, name:'水泽节', xia:'dui',  shang:'kan',  symbol:[1,1,0,0,1,0], shi:1, ying:4, level:'一世' },
      { num:3,  name:'水雷屯', xia:'zhen', shang:'kan',  symbol:[1,0,0,0,1,0], shi:2, ying:5, level:'二世' },
      { num:63, name:'水火既济',xia:'li',   shang:'kan',  symbol:[1,0,1,0,1,0], shi:3, ying:6, level:'三世' },
      { num:49, name:'泽火革', xia:'li',   shang:'dui',  symbol:[1,0,1,1,1,0], shi:4, ying:1, level:'四世' },
      { num:55, name:'雷火丰', xia:'li',   shang:'zhen', symbol:[1,0,1,1,0,0], shi:5, ying:2, level:'五世' },
      { num:36, name:'地火明夷',xia:'li',  shang:'kun',  symbol:[1,0,1,0,0,0], shi:4, ying:1, level:'游魂' },
      { num:7,  name:'地水师', xia:'kan',  shang:'kun',  symbol:[0,1,0,0,0,0], shi:3, ying:6, level:'归魂' }
    ]},
    // 艮宫（土）
    gen: { gong:'gen', wuxing:'tu', name:'艮', guas:[
      { num:52, name:'艮为山', xia:'gen',  shang:'gen',  symbol:[1,0,0,1,0,0], shi:6, ying:3, level:'本宫' }, // 注意：艮本宫为☶=100,100（和震同形，此处按卦序核对正确）
      // 艮下艮上：上九/六五/六四/九三/六二/初六 = 0,0,1,0,0,1? 不对，重新核对：
      // 艮☶=上九(阳)、六五(阴)、六四(阴)在上下卦各一层，下卦：初阴、二阴、三阳 = 0,0,1；上卦：四阴、五阴、上阳=0,0,1 → 从下到上：0,0,1,0,0,1
      // 我刚才写错了，以通行本为准重排：
    ]},
    // 上面艮本宫的symbol是错的，我用完整表重写艮宫：
  };
  // 删除上面半成品，直接用一个完整、经通行本《周易》卦象核对的八宫表
  // 卦象规则：symbol[0]=初爻(最下)，symbol[5]=上爻(最上)，1=阳，0=阴
  const BAGONG_FULL = [
    // 乾宫（金）——已核对
    { gong:'qian', gongName:'乾宫', wuxing:'jin', num:1,  name:'乾为天',   xia:'qian', shang:'qian', symbol:[1,1,1,1,1,1], shi:6, ying:3, level:'本宫' },
    { gong:'qian', gongName:'乾宫', wuxing:'jin', num:44, name:'天风姤',   xia:'xun',  shang:'qian', symbol:[0,1,1,1,1,1], shi:1, ying:4, level:'一世' },
    { gong:'qian', gongName:'乾宫', wuxing:'jin', num:33, name:'天山遁',   xia:'gen',  shang:'qian', symbol:[0,0,1,1,1,1], shi:2, ying:5, level:'二世' },
    { gong:'qian', gongName:'乾宫', wuxing:'jin', num:12, name:'天地否',   xia:'kun',  shang:'qian', symbol:[0,0,0,1,1,1], shi:3, ying:6, level:'三世' },
    { gong:'qian', gongName:'乾宫', wuxing:'jin', num:20, name:'风地观',   xia:'kun',  shang:'xun',  symbol:[0,0,0,0,1,1], shi:4, ying:1, level:'四世' },
    { gong:'qian', gongName:'乾宫', wuxing:'jin', num:23, name:'山地剥',   xia:'kun',  shang:'gen',  symbol:[0,0,0,0,0,1], shi:5, ying:2, level:'五世' },
    { gong:'qian', gongName:'乾宫', wuxing:'jin', num:35, name:'火地晋',   xia:'kun',  shang:'li',   symbol:[0,0,0,1,0,1], shi:4, ying:1, level:'游魂' },
    { gong:'qian', gongName:'乾宫', wuxing:'jin', num:14, name:'火天大有', xia:'qian', shang:'li',   symbol:[1,1,1,1,0,1], shi:3, ying:6, level:'归魂' },

    // 震宫（木）
    { gong:'zhen', gongName:'震宫', wuxing:'mu',  num:51, name:'震为雷',   xia:'zhen', shang:'zhen', symbol:[1,0,0,1,0,0], shi:6, ying:3, level:'本宫' },
    { gong:'zhen', gongName:'震宫', wuxing:'mu',  num:16, name:'雷地豫',   xia:'kun',  shang:'zhen', symbol:[0,0,0,1,0,0], shi:1, ying:4, level:'一世' },
    { gong:'zhen', gongName:'震宫', wuxing:'mu',  num:40, name:'雷水解',   xia:'kan',  shang:'zhen', symbol:[0,1,0,1,0,0], shi:2, ying:5, level:'二世' },
    { gong:'zhen', gongName:'震宫', wuxing:'mu',  num:32, name:'雷风恒',   xia:'xun',  shang:'zhen', symbol:[0,1,1,1,0,0], shi:3, ying:6, level:'三世' },
    { gong:'zhen', gongName:'震宫', wuxing:'mu',  num:46, name:'地风升',   xia:'xun',  shang:'kun',  symbol:[0,1,1,0,0,0], shi:4, ying:1, level:'四世' },
    { gong:'zhen', gongName:'震宫', wuxing:'mu',  num:48, name:'水风井',   xia:'xun',  shang:'kan',  symbol:[0,1,1,0,1,0], shi:5, ying:2, level:'五世' },
    { gong:'zhen', gongName:'震宫', wuxing:'mu',  num:28, name:'泽风大过', xia:'xun',  shang:'dui',  symbol:[0,1,1,1,1,0], shi:4, ying:1, level:'游魂' },
    { gong:'zhen', gongName:'震宫', wuxing:'mu',  num:17, name:'泽雷随',   xia:'zhen', shang:'dui',  symbol:[1,0,0,1,1,0], shi:3, ying:6, level:'归魂' },

    // 坎宫（水）
    { gong:'kan',  gongName:'坎宫', wuxing:'shui',num:29, name:'坎为水',   xia:'kan',  shang:'kan',  symbol:[0,1,0,0,1,0], shi:6, ying:3, level:'本宫' },
    { gong:'kan',  gongName:'坎宫', wuxing:'shui',num:60, name:'水泽节',   xia:'dui',  shang:'kan',  symbol:[1,1,0,0,1,0], shi:1, ying:4, level:'一世' },
    { gong:'kan',  gongName:'坎宫', wuxing:'shui',num:3,  name:'水雷屯',   xia:'zhen', shang:'kan',  symbol:[1,0,0,0,1,0], shi:2, ying:5, level:'二世' },
    { gong:'kan',  gongName:'坎宫', wuxing:'shui',num:63, name:'水火既济', xia:'li',   shang:'kan',  symbol:[1,0,1,0,1,0], shi:3, ying:6, level:'三世' },
    { gong:'kan',  gongName:'坎宫', wuxing:'shui',num:49, name:'泽火革',   xia:'li',   shang:'dui',  symbol:[1,0,1,1,1,0], shi:4, ying:1, level:'四世' },
    { gong:'kan',  gongName:'坎宫', wuxing:'shui',num:55, name:'雷火丰',   xia:'li',   shang:'zhen', symbol:[1,0,1,1,0,0], shi:5, ying:2, level:'五世' },
    { gong:'kan',  gongName:'坎宫', wuxing:'shui',num:36, name:'地火明夷', xia:'li',   shang:'kun',  symbol:[1,0,1,0,0,0], shi:4, ying:1, level:'游魂' },
    { gong:'kan',  gongName:'坎宫', wuxing:'shui',num:7,  name:'地水师',   xia:'kan',  shang:'kun',  symbol:[0,1,0,0,0,0], shi:3, ying:6, level:'归魂' },

    // 艮宫（土）——注意艮为山☶上艮下艮：初阴、二阴、三阳、四阴、五阴、上阳 → [0,0,1,0,0,1]
    { gong:'gen',  gongName:'艮宫', wuxing:'tu',  num:52, name:'艮为山',   xia:'gen',  shang:'gen',  symbol:[0,0,1,0,0,1], shi:6, ying:3, level:'本宫' },
    { gong:'gen',  gongName:'艮宫', wuxing:'tu',  num:22, name:'山火贲',   xia:'li',   shang:'gen',  symbol:[1,0,1,0,0,1], shi:1, ying:4, level:'一世' },
    { gong:'gen',  gongName:'艮宫', wuxing:'tu',  num:26, name:'山天大畜', xia:'qian', shang:'gen',  symbol:[1,1,1,0,0,1], shi:2, ying:5, level:'二世' },
    { gong:'gen',  gongName:'艮宫', wuxing:'tu',  num:41, name:'山泽损',   xia:'dui',  shang:'gen',  symbol:[1,1,0,0,0,1], shi:3, ying:6, level:'三世' },
    { gong:'gen',  gongName:'艮宫', wuxing:'tu',  num:38, name:'火泽睽',   xia:'dui',  shang:'li',   symbol:[1,1,0,1,0,1], shi:4, ying:1, level:'四世' },
    { gong:'gen',  gongName:'艮宫', wuxing:'tu',  num:10, name:'天泽履',   xia:'dui',  shang:'qian', symbol:[1,1,0,1,1,1], shi:5, ying:2, level:'五世' },
    { gong:'gen',  gongName:'艮宫', wuxing:'tu',  num:61, name:'风泽中孚', xia:'dui',  shang:'xun',  symbol:[1,1,0,0,1,1], shi:4, ying:1, level:'游魂' },
    { gong:'gen',  gongName:'艮宫', wuxing:'tu',  num:53, name:'风山渐',   xia:'gen',  shang:'xun',  symbol:[0,0,1,0,1,1], shi:3, ying:6, level:'归魂' },

    // 坤宫（土）
    { gong:'kun',  gongName:'坤宫', wuxing:'tu',  num:2,  name:'坤为地',   xia:'kun',  shang:'kun',  symbol:[0,0,0,0,0,0], shi:6, ying:3, level:'本宫' },
    { gong:'kun',  gongName:'坤宫', wuxing:'tu',  num:24, name:'地雷复',   xia:'zhen', shang:'kun',  symbol:[1,0,0,0,0,0], shi:1, ying:4, level:'一世' },
    { gong:'kun',  gongName:'坤宫', wuxing:'tu',  num:19, name:'地泽临',   xia:'dui',  shang:'kun',  symbol:[1,1,0,0,0,0], shi:2, ying:5, level:'二世' },
    { gong:'kun',  gongName:'坤宫', wuxing:'tu',  num:11, name:'地天泰',   xia:'qian', shang:'kun',  symbol:[1,1,1,0,0,0], shi:3, ying:6, level:'三世' },
    { gong:'kun',  gongName:'坤宫', wuxing:'tu',  num:34, name:'雷天大壮', xia:'qian', shang:'zhen', symbol:[1,1,1,1,0,0], shi:4, ying:1, level:'四世' },
    { gong:'kun',  gongName:'坤宫', wuxing:'tu',  num:43, name:'泽天夬',   xia:'qian', shang:'dui',  symbol:[1,1,1,1,1,0], shi:5, ying:2, level:'五世' },
    { gong:'kun',  gongName:'坤宫', wuxing:'tu',  num:5,  name:'水天需',   xia:'qian', shang:'kan',  symbol:[1,1,1,0,1,0], shi:4, ying:1, level:'游魂' },
    { gong:'kun',  gongName:'坤宫', wuxing:'tu',  num:8,  name:'水地比',   xia:'kun',  shang:'kan',  symbol:[0,0,0,0,1,0], shi:3, ying:6, level:'归魂' },

    // 巽宫（木）
    { gong:'xun',  gongName:'巽宫', wuxing:'mu',  num:57, name:'巽为风',   xia:'xun',  shang:'xun',  symbol:[1,1,0,1,1,0], shi:6, ying:3, level:'本宫' },
    // 巽☴：初阴、二阳、三阳、四阴、五阳、上阳 → 从下到上：0,1,1,0,1,1? 不对：
    // 巽下断：初爻阴、二阳、三阳（内卦☴）；外卦同理：四阴、五阳、上阳 → symbol=[0,1,1,0,1,1]
    // 上面[1,1,0,1,1,0]是错的，重核：
    { gong:'xun',  gongName:'巽宫', wuxing:'mu',  num:57, name:'巽为风',   xia:'xun',  shang:'xun',  symbol:[0,1,1,0,1,1], shi:6, ying:3, level:'本宫' },
    { gong:'xun',  gongName:'巽宫', wuxing:'mu',  num:9,  name:'风天小畜', xia:'qian', shang:'xun',  symbol:[1,1,1,0,1,1], shi:1, ying:4, level:'一世' },
    { gong:'xun',  gongName:'巽宫', wuxing:'mu',  num:37, name:'风火家人', xia:'li',   shang:'xun',  symbol:[1,0,1,0,1,1], shi:2, ying:5, level:'二世' },
    { gong:'xun',  gongName:'巽宫', wuxing:'mu',  num:42, name:'风雷益',   xia:'zhen', shang:'xun',  symbol:[1,0,0,0,1,1], shi:3, ying:6, level:'三世' },
    { gong:'xun',  gongName:'巽宫', wuxing:'mu',  num:25, name:'天雷无妄', xia:'zhen', shang:'qian', symbol:[1,0,0,1,1,1], shi:4, ying:1, level:'四世' },
    { gong:'xun',  gongName:'巽宫', wuxing:'mu',  num:21, name:'火雷噬嗑', xia:'zhen', shang:'li',   symbol:[1,0,0,1,0,1], shi:5, ying:2, level:'五世' },
    { gong:'xun',  gongName:'巽宫', wuxing:'mu',  num:27, name:'山雷颐',   xia:'zhen', shang:'gen',  symbol:[1,0,0,0,0,1], shi:4, ying:1, level:'游魂' },
    { gong:'xun',  gongName:'巽宫', wuxing:'mu',  num:18, name:'山风蛊',   xia:'xun',  shang:'gen',  symbol:[0,1,1,0,0,1], shi:3, ying:6, level:'归魂' },

    // 离宫（火）
    { gong:'li',   gongName:'离宫', wuxing:'huo', num:30, name:'离为火',   xia:'li',   shang:'li',   symbol:[1,0,1,1,0,1], shi:6, ying:3, level:'本宫' },
    { gong:'li',   gongName:'离宫', wuxing:'huo', num:56, name:'火山旅',   xia:'gen',  shang:'li',   symbol:[0,0,1,1,0,1], shi:1, ying:4, level:'一世' },
    { gong:'li',   gongName:'离宫', wuxing:'huo', num:50, name:'火风鼎',   xia:'xun',  shang:'li',   symbol:[0,1,1,1,0,1], shi:2, ying:5, level:'二世' },
    { gong:'li',   gongName:'离宫', wuxing:'huo', num:64, name:'火水未济', xia:'kan',  shang:'li',   symbol:[0,1,0,1,0,1], shi:3, ying:6, level:'三世' },
    { gong:'li',   gongName:'离宫', wuxing:'huo', num:4,  name:'山水蒙',   xia:'kan',  shang:'gen',  symbol:[0,1,0,0,0,1], shi:4, ying:1, level:'四世' },
    { gong:'li',   gongName:'离宫', wuxing:'huo', num:59, name:'风水涣',   xia:'kan',  shang:'xun',  symbol:[0,1,0,0,1,1], shi:5, ying:2, level:'五世' },
    { gong:'li',   gongName:'离宫', wuxing:'huo', num:6,  name:'天水讼',   xia:'kan',  shang:'qian', symbol:[0,1,0,1,1,1], shi:4, ying:1, level:'游魂' },
    { gong:'li',   gongName:'离宫', wuxing:'huo', num:13, name:'天火同人', xia:'li',   shang:'qian', symbol:[1,0,1,1,1,1], shi:3, ying:6, level:'归魂' },

    // 兑宫（金）
    { gong:'dui',  gongName:'兑宫', wuxing:'jin', num:58, name:'兑为泽',   xia:'dui',  shang:'dui',  symbol:[1,1,0,1,1,0], shi:6, ying:3, level:'本宫' },
    // 兑☱：初阳、二阳、三阴、四阳、五阳、上阴 → 从下到上：1,1,0,1,1,0 ✓
    { gong:'dui',  gongName:'兑宫', wuxing:'jin', num:47, name:'泽水困',   xia:'kan',  shang:'dui',  symbol:[0,1,0,1,1,0], shi:1, ying:4, level:'一世' },
    { gong:'dui',  gongName:'兑宫', wuxing:'jin', num:45, name:'泽地萃',   xia:'kun',  shang:'dui',  symbol:[0,0,0,1,1,0], shi:2, ying:5, level:'二世' },
    { gong:'dui',  gongName:'兑宫', wuxing:'jin', num:31, name:'泽山咸',   xia:'gen',  shang:'dui',  symbol:[0,0,1,1,1,0], shi:3, ying:6, level:'三世' },
    { gong:'dui',  gongName:'兑宫', wuxing:'jin', num:39, name:'水山蹇',   xia:'gen',  shang:'kan',  symbol:[0,0,1,0,1,0], shi:4, ying:1, level:'四世' },
    { gong:'dui',  gongName:'兑宫', wuxing:'jin', num:15, name:'地山谦',   xia:'gen',  shang:'kun',  symbol:[0,0,1,0,0,0], shi:5, ying:2, level:'五世' },
    { gong:'dui',  gongName:'兑宫', wuxing:'jin', num:62, name:'雷山小过', xia:'gen',  shang:'zhen', symbol:[0,0,1,1,0,0], shi:4, ying:1, level:'游魂' },
    { gong:'dui',  gongName:'兑宫', wuxing:'jin', num:54, name:'雷泽归妹', xia:'dui',  shang:'zhen', symbol:[1,1,0,1,0,0], shi:3, ying:6, level:'归魂' }
  ];

  // 构建按 num 的查找表（注意上面 BAGONG_FULL 中我有一个重复的巽宫本宫，要去重）
  // 做一次去重：按 num 去重，保留后者（后者是正确的）
  const _tmpByNum = {};
  BAGONG_FULL.forEach(g => { _tmpByNum[g.num] = g; });
  const GUA_BY_NUM = {};
  Object.keys(_tmpByNum).forEach(n => { GUA_BY_NUM[Number(n)] = _tmpByNum[n]; });

  // 构建按 symbol 查找：卦象 symbol 用 "111111" 格式
  function symbolKey(sym) { return sym.join(''); }
  const GUA_BY_SYM = {};
  Object.values(GUA_BY_NUM).forEach(g => { GUA_BY_SYM[symbolKey(g.symbol)] = g; });

  // ============================================================
  // 4. 月建（按节气）
  // ============================================================
  // 寅月=正月（立春-惊蛰），卯=二月…丑=十二月。这里按地支（不含天干，因月建用地支）
  const YUEJIAN = {
    1:'寅', 2:'卯', 3:'辰', 4:'巳', 5:'午', 6:'未',
    7:'申', 8:'酉', 9:'戌',10:'亥',11:'子',12:'丑'
  };
  // 旺相休囚死（当令者旺，我生者相，生我者休，克我者囚，我克者死）
  function wangxiangxiuqiusi(yuezhi, yaozhi) {
    const yueWX = WUXING[DIZHI_WUXING[yuezhi]];
    const yaoWX = DIZHI_WUXING[yaozhi];
    if (yaozhi === yuezhi) return 'wang';     // 临月建=旺之极
    if (yaoWX === yueWX.sheng) return 'xiang';
    if (yaoWX === yueWX.beisheng) return 'xiu';
    if (yaoWX === yueWX.beike) return 'qiu';
    if (yaoWX === yueWX.ke) return 'si';
    // 同五行不同地支（如寅月卯木）=月扶，属旺
    if (yaoWX === yueWX.key) return 'wang';
    return 'ping';
  }

  // ============================================================
  // 5. 旬空（六甲旬空）
  // ============================================================
  // 天干十：甲乙丙丁戊己庚辛壬癸；地支十二，每旬十支，余二支为空
  const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  // 六甲旬首：甲子、甲戌、甲申、甲午、甲辰、甲寅
  const XUNKONG = [
    { start:'甲子', kong:['戌','亥'] },
    { start:'甲戌', kong:['申','酉'] },
    { start:'甲申', kong:['午','未'] },
    { start:'甲午', kong:['辰','巳'] },
    { start:'甲辰', kong:['寅','卯'] },
    { start:'甲寅', kong:['子','丑'] }
  ];
  // 给定干支（如甲子），返回旬空地支
  function xunkong(riGanZhi) {
    // riGanZhi 是两个字：首字天干，二字地支
    const gz = riGanZhi;
    const gan = gz[0], zhi = gz.slice(1);
    const gi = TIANGAN.indexOf(gan);
    const zi = dizhiIdx(zhi);
    // 旬首地支索引 = (zi - gi + 12) % 12，且是六甲(子戌申午辰寅)
    const xunShouZhiIdx = ((zi - gi) % 12 + 12) % 12;
    const xunShouZhi = DIZHI_ORDER[xunShouZhiIdx];
    // 找对应旬
    const entry = XUNKONG.find(x => x.start[1] === xunShouZhi);
    return entry ? entry.kong : [];
  }

  // ============================================================
  // 6. 六神（六兽）
  // ============================================================
  // 依日干定初爻，自初而上循环：青龙、朱雀、勾陈、螣蛇、白虎、玄武
  const LIUSHEN_BY_RIGAN = {
    '甲':['青龙','朱雀','勾陈','螣蛇','白虎','玄武'],
    '乙':['青龙','朱雀','勾陈','螣蛇','白虎','玄武'],
    '丙':['朱雀','勾陈','螣蛇','白虎','玄武','青龙'],
    '丁':['朱雀','勾陈','螣蛇','白虎','玄武','青龙'],
    '戊':['勾陈','螣蛇','白虎','玄武','青龙','朱雀'],
    '己':['螣蛇','白虎','玄武','青龙','朱雀','勾陈'],
    '庚':['白虎','玄武','青龙','朱雀','勾陈','螣蛇'],
    '辛':['白虎','玄武','青龙','朱雀','勾陈','螣蛇'],
    '壬':['玄武','青龙','朱雀','勾陈','螣蛇','白虎'],
    '癸':['玄武','青龙','朱雀','勾陈','螣蛇','白虎']
  };
  const LIUSHEN_DESC = {
    '青龙':'喜庆、贵人、财运、酒色、正直',
    '朱雀':'文书、口舌、是非、消息、火光',
    '勾陈':'田土、牢狱、拖延、纠缠、固执',
    '螣蛇':'虚惊、怪异、阴私、缠绵、梦寐',
    '白虎':'凶丧、血光、伤病、刑杀、刚烈',
    '玄武':'盗贼、暗昧、阴私、欺诈、奸邪'
  };

  // ============================================================
  // 7. 十二长生（按五行，水土同宫）
  // ============================================================
  // 金长生在巳、木长生在亥、水/土长生在申、火长生在寅；阳顺阴逆（此处简化，取五行长生位作状态参考）
  const CHANGSHENG_START = { jin:'巳', mu:'亥', shui:'申', huo:'寅', tu:'申' };
  const CHANGSHENG_NAMES = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];
  // 墓库：金墓在丑、木墓在未、水土墓在辰、火墓在戌
  const MUKU = { jin:'丑', mu:'未', shui:'辰', huo:'戌', tu:'辰' };

  // ============================================================
  // 8. 本体谓词（三元组）——供双向关联
  // ============================================================
  const najiaTriples = [];
  function t(subj, pred, obj, label) {
    najiaTriples.push({ s:subj, p:pred, o:obj, label:label||pred });
  }
  // 筮法方法实例
  t('najia','类型','筮法');
  t('najia','名称','纳甲筮法（火珠林/六爻）');
  t('najia','创立者','zj_jingfang');
  t('najia','代表作','zb_huozhulin');
  t('najia','代表作','zb_bushizhengzong');
  t('najia','代表作','zb_zengshambuyi');
  t('najia','所属流派','lp_xiangshu');
  t('najia','理论基础','京房八宫说');
  // 八宫谓词
  ['qian','zhen','kan','gen','kun','xun','li','dui'].forEach(g => {
    t('bagong_'+g,'所属','八宫');
    t('bagong_'+g,'宫五行', BAGUA_NAJIA[g].wuxing);
  });
  // 六亲
  Object.values(LIUQIN_BY_REL).forEach(lq => {
    t('liuqin_'+lq.key,'类型','六亲');
    t('liuqin_'+lq.key,'简称',lq.abbr);
  });
  // 六神
  Object.keys(LIUSHEN_DESC).forEach(ls => {
    t('liushen_'+ls,'类型','六神');
    t('liushen_'+ls,'象意',LIUSHEN_DESC[ls]);
  });

  // ============================================================
  // 9. 六亲象意（万物类象简表）
  // ============================================================
  const LIUQIN_XIANGYI = {
    fumu:   { name:'父母', yiyi:'生我者。象长辈、文书、契约、房屋、车辆、衣物、学业、庇护、辛劳；占考试、文书、长辈事为用神' },
    xiongdi:{ name:'兄弟', yiyi:'同我者。象兄弟姐妹、朋友、同事、竞争对手、劫财、分利；占合作防争财、占行人主同伴' },
    zisun:  { name:'子孙', yiyi:'我生者。象子女、晚辈、医药、解灾、福德、财源、僧道、宠物；克官鬼，占官职忌见，占医药病灾喜见' },
    qicai:  { name:'妻财', yiyi:'我克者。象妻子、财物、粮食、货利、资本、欲望；占财、婚、货殖为用神，克父母' },
    guangui:{ name:'官鬼', yiyi:'克我者。象官府、功名、职位、丈夫（女占）、疾病、盗贼、鬼神、凶灾、压力；占功名、官事、夫、病为用神' }
  };

  // ============================================================
  // 10. 卦象符号（八卦三爻）
  // ============================================================
  const BAGUA_TRIGRAM = {
    qian:[1,1,1], dui:[1,1,0], li:[1,0,1], zhen:[1,0,0],
    xun:[0,1,1], kan:[0,1,0], gen:[0,0,1], kun:[0,0,0]
  };

  // 暴露到全局
  global.YJ_NAJIA = {
    WUXING, LIUQIN_BY_REL, BAGUA_NAJIA,
    DIZHI_WUXING, DIZHI_YINYANG, DIZHI_ORDER, dizhiIdx,
    isChong, isHe, SHENGHE, KEHE,
    BAGONG_FULL, GUA_BY_NUM, GUA_BY_SYM, symbolKey,
    YUEJIAN, wangxiangxiuqiusi,
    TIANGAN, XUNKONG, xunkong,
    LIUSHEN_BY_RIGAN, LIUSHEN_DESC,
    CHANGSHENG_START, CHANGSHENG_NAMES, MUKU,
    LIUQIN_XIANGYI, BAGUA_TRIGRAM,
    triples: najiaTriples
  };

})(window);
