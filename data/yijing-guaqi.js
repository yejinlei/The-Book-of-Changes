/**
 * 卦气爻辰月体纳甲本体数据
 * 涵盖汉易象数宇宙论六大体系：
 *   1. 四正卦 - 二十四节气（孟喜卦气说）
 *   2. 十二消息卦（辟卦） - 十二辰月 + 十二律吕
 *   3. 六十卦六日七分值日 - 公侯卿大夫
 *   4. 七十二候配卦
 *   5. 郑玄爻辰说 - 十二辰配二十八宿
 *   6. 《周易参同契》月体纳甲 - 朔望月相八卦配
 * 文献来源：《易纬·乾凿度》、孟喜卦气说、郑玄爻辰、
 *           京房纳甲、魏伯阳《周易参同契》、惠栋《易汉学》
 */
(function(global){
  var Q = window.YJ_ONTOLOGY_ENHANCE || {};

  /* ============ 1. 四正卦与二十四节气 ============
   * 坎（冬）、离（夏）、震（春）、兑（秋）为方伯，各主一季；
   * 四卦共二十四爻，爻主一气，每卦从下爻起：
   *   坎初六=冬至、九二=小寒、六三=大寒、六四=立春、九五=雨水、上六=惊蛰
   *   震初九=春分、六二=清明、六三=谷雨、九四=立夏、六五=小满、上六=芒种
   *   离初九=夏至、六二=小暑、九三=大暑、九四=立秋、六五=处暑、上九=白露
   *   兑初九=秋分、九二=寒露、六三=霜降、九四=立冬、九五=小雪、上六=大雪
   */
  var SIZHENG_GUA = ['kan','li','zhen','dui'];

  var JIEQI_24 = [
    // 坎卦（冬·正北）六节
    {name:'冬至', yue:'十一月中', gua:'kan', yao:1, chen:'子', season:'冬', yangqi:'一阳生'},
    {name:'小寒', yue:'十二月节', gua:'kan', yao:2, chen:'丑', season:'冬'},
    {name:'大寒', yue:'十二月中', gua:'kan', yao:3, chen:'丑', season:'冬'},
    {name:'立春', yue:'正月节',   gua:'kan', yao:4, chen:'寅', season:'春'},
    {name:'雨水', yue:'正月中',   gua:'kan', yao:5, chen:'寅', season:'春'},
    {name:'惊蛰', yue:'二月节',   gua:'kan', yao:6, chen:'卯', season:'春'},
    // 震卦（春·正东）六节
    {name:'春分', yue:'二月中',   gua:'zhen', yao:1, chen:'卯', season:'春', yangqi:'昼夜平'},
    {name:'清明', yue:'三月节',   gua:'zhen', yao:2, chen:'辰', season:'春'},
    {name:'谷雨', yue:'三月中',   gua:'zhen', yao:3, chen:'辰', season:'春'},
    {name:'立夏', yue:'四月节',   gua:'zhen', yao:4, chen:'巳', season:'夏'},
    {name:'小满', yue:'四月中',   gua:'zhen', yao:5, chen:'巳', season:'夏'},
    {name:'芒种', yue:'五月节',   gua:'zhen', yao:6, chen:'午', season:'夏'},
    // 离卦（夏·正南）六节
    {name:'夏至', yue:'五月中',   gua:'li',  yao:1, chen:'午', season:'夏', yangqi:'一阴生'},
    {name:'小暑', yue:'六月节',   gua:'li',  yao:2, chen:'未', season:'夏'},
    {name:'大暑', yue:'六月中',   gua:'li',  yao:3, chen:'未', season:'夏'},
    {name:'立秋', yue:'七月节',   gua:'li',  yao:4, chen:'申', season:'秋'},
    {name:'处暑', yue:'七月中',   gua:'li',  yao:5, chen:'申', season:'秋'},
    {name:'白露', yue:'八月节',   gua:'li',  yao:6, chen:'酉', season:'秋'},
    // 兑卦（秋·正西）六节
    {name:'秋分', yue:'八月中',   gua:'dui', yao:1, chen:'酉', season:'秋', yangqi:'昼夜平'},
    {name:'寒露', yue:'九月节',   gua:'dui', yao:2, chen:'戌', season:'秋'},
    {name:'霜降', yue:'九月中',   gua:'dui', yao:3, chen:'戌', season:'秋'},
    {name:'立冬', yue:'十月节',   gua:'dui', yao:4, chen:'亥', season:'冬'},
    {name:'小雪', yue:'十月中',   gua:'dui', yao:5, chen:'亥', season:'冬'},
    {name:'大雪', yue:'十一月节', gua:'dui', yao:6, chen:'子', season:'冬'}
  ];

  /* ============ 2. 十二消息卦（十二辟卦） ============
   * 自复至坤，阳爻递生递消，对应十二月、十二辰、十二律吕。
   */
  var XIAOXI_12 = [
    {gua:'fu',    yue:11, chen:'子', lv:'黄钟', yangYao:1, yinyang:'一阳息阴', desc:'冬至一阳生'},
    {gua:'lin',   yue:12, chen:'丑', lv:'大吕', yangYao:2, yinyang:'二阳息阴', desc:'十二月临'},
    {gua:'tai',   yue:1,  chen:'寅', lv:'太簇', yangYao:3, yinyang:'三阳息阴', desc:'正月泰·三阳开泰'},
    {gua:'dazhuang', yue:2, chen:'卯', lv:'夹钟', yangYao:4, yinyang:'四阳息阴', desc:'二月大壮'},
    {gua:'guai',  yue:3,  chen:'辰', lv:'姑洗', yangYao:5, yinyang:'五阳息阴', desc:'三月夬'},
    {gua:'qian',  yue:4,  chen:'巳', lv:'仲吕', yangYao:6, yinyang:'六阳纯阳', desc:'四月乾·纯阳'},
    {gua:'gou',   yue:5,  chen:'午', lv:'蕤宾', yangYao:5, yinyang:'一阴消阳', desc:'五月姤·一阴生'},
    {gua:'dun',   yue:6,  chen:'未', lv:'林钟', yangYao:4, yinyang:'二阴消阳', desc:'六月遁'},
    {gua:'pi',    yue:7,  chen:'申', lv:'夷则', yangYao:3, yinyang:'三阴消阳', desc:'七月否'},
    {gua:'guan',  yue:8,  chen:'酉', lv:'南吕', yangYao:2, yinyang:'四阴消阳', desc:'八月观'},
    {gua:'bo',    yue:9,  chen:'戌', lv:'无射', yangYao:1, yinyang:'五阴消阳', desc:'九月剥'},
    {gua:'kun',   yue:10, chen:'亥', lv:'应钟', yangYao:0, yinyang:'六阴纯阴', desc:'十月坤·纯阴'}
  ];

  // 十二律吕对应
  var LVLV_12 = [
    {lv:'黄钟', yin:'阳律', chen:'子', yue:11, desc:'黄者中之色，钟者种也，阳气种于黄泉'},
    {lv:'大吕', yin:'阴吕', chen:'丑', yue:12, desc:'吕，助也，言阴大助黄钟宣气'},
    {lv:'太簇', yin:'阳律', chen:'寅', yue:1,  desc:'簇，凑也，言万物凑地而出'},
    {lv:'夹钟', yin:'阴吕', chen:'卯', yue:2,  desc:'夹，辅也，阴夹助太簇宣四方之气'},
    {lv:'姑洗', yin:'阳律', chen:'辰', yue:3,  desc:'洗，洁也，言阳气洗物生洁'},
    {lv:'仲吕', yin:'阴吕', chen:'巳', yue:4,  desc:'中，微也，言微阴始起未成'},
    {lv:'蕤宾', yin:'阳律', chen:'午', yue:5,  desc:'蕤，继也；宾，导也，言阳导阴气使继养物'},
    {lv:'林钟', yin:'阴吕', chen:'未', yue:6,  desc:'林，君也，言阴气受任助蕤宾君主种物'},
    {lv:'夷则', yin:'阳律', chen:'申', yue:7,  desc:'夷，伤也；则，法也，言阳气正法使阴气夷当伤之物'},
    {lv:'南吕', yin:'阴吕', chen:'酉', yue:8,  desc:'南，任也，言阴气助夷则任成万物'},
    {lv:'无射', yin:'阳律', chen:'戌', yue:9,  desc:'射，厌也，言阳气究物使阴气毕剥落'},
    {lv:'应钟', yin:'阴吕', chen:'亥', yue:10, desc:'应，应也，言阴气应无射该藏万物'}
  ];

  /* ============ 3. 六十卦六日七分值日（公侯辟大夫卿，每月五卦） ============
   * 始于中孚（冬至），终于颐，合一年365.25日。
   * 侯卦分内外卦：外卦在前月末终候，内卦在本月初初候。
   * 每月五卦：侯(外)→大夫→卿→公→辟→侯(内)（每卦六爻当六日七分），侯卦拆两卦，故有5卦6候。
   */
  // 十二月每卦排列，依《新唐书·历志》及《易纬·稽览图》标准卦序。
  // 每卦标注身份 gong/qing/dafu/hou/pi（公/卿/大夫/侯/辟）
  var LIUSHI_GUA_BY_MONTH = [
    // 子月十一月（冬至-大雪）
    {hou:'zhongfu',  role:'gong',  yue:11},
    {hou:'fu',       role:'pi',    yue:11},
    {hou:'tun_nei',  role:'hou',   yue:11},  // 屯内
    {hou:'tun_wai',  role:'hou_wai', yue:12},  // 屯外（为小寒前候）
    {hou:'qianwenyan', role:'dafu', yue:12, note:'谦'},  // 大夫谦
    {hou:'kui',      role:'qing',  yue:12},  // 卿睽
    // 丑月十二月
    {hou:'sheng',    role:'gong',  yue:12},
    {hou:'lin',      role:'pi',    yue:12},
    {hou:'xiaoguo_nei', role:'hou', yue:12},
    {hou:'xiaoguo_wai', role:'hou_wai', yue:1},
    {hou:'meng',     role:'dafu',  yue:1},
    {hou:'yi',       role:'qing',  yue:1},  // 卿益
    // 寅月正月
    {hou:'jian',     role:'gong',  yue:1, note:'渐'},
    {hou:'tai',      role:'pi',    yue:1},
    {hou:'xu_nei',   role:'hou',   yue:1, note:'需内'},
    {hou:'xu_wai',   role:'hou_wai', yue:2, note:'需外'},
    {hou:'sui',      role:'dafu',  yue:2},
    {hou:'jin',      role:'qing',  yue:2},  // 卿晋
    // 卯月二月
    {hou:'jie',      role:'gong',  yue:2, note:'解'},
    {hou:'dazhuang', role:'pi',    yue:2},
    {hou:'yu_nei',   role:'hou',   yue:2},
    {hou:'yu_wai',   role:'hou_wai', yue:3},
    {hou:'song',     role:'dafu',  yue:3},
    {hou:'gu',       role:'qing',  yue:3},
    // 辰月三月
    {hou:'ge',       role:'gong',  yue:3},  // 革
    {hou:'guai',     role:'pi',    yue:3},
    {hou:'lv_nei',   role:'hou',   yue:3, note:'旅内'},
    {hou:'lv_wai',   role:'hou_wai', yue:4, note:'旅外'},
    {hou:'shi',      role:'dafu',  yue:4},  // 大夫师
    {hou:'bi',       role:'qing',  yue:4},
    // 巳月四月
    {hou:'xiaoxu',   role:'gong',  yue:4},  // 小畜
    {hou:'qian',     role:'pi',    yue:4},
    {hou:'dayou_nei', role:'hou',  yue:4},
    {hou:'dayou_wai', role:'hou_wai', yue:5},
    {hou:'jiaren',   role:'dafu',  yue:5},
    {hou:'jing',     role:'qing',  yue:5},  // 卿井
    // 午月五月
    {hou:'xian',     role:'gong',  yue:5},  // 咸
    {hou:'gou',      role:'pi',    yue:5},
    {hou:'ding_nei', role:'hou',   yue:5},
    {hou:'ding_wai', role:'hou_wai', yue:6},
    {hou:'feng',     role:'dafu',  yue:6},  // 大夫丰
    {hou:'huan',     role:'qing',  yue:6},
    // 未月六月
    {hou:'lv',       role:'gong',  yue:6},  // 履
    {hou:'dun',      role:'pi',    yue:6},
    {hou:'heng_nei', role:'hou',   yue:6},
    {hou:'heng_wai', role:'hou_wai', yue:7},
    {hou:'jie2',     role:'dafu',  yue:7, note:'节'},
    {hou:'tongren',  role:'qing',  yue:7},
    // 申月七月
    {hou:'sun',      role:'gong',  yue:7},  // 损
    {hou:'pi',       role:'pi',    yue:7},
    {hou:'xun_nei',  role:'hou',   yue:7},
    {hou:'xun_wai',  role:'hou_wai', yue:8},
    {hou:'cui',      role:'dafu',  yue:8},  // 大夫萃
    {hou:'daxu',     role:'qing',  yue:8},
    // 酉月八月
    {hou:'ben',      role:'gong',  yue:8, note:'贲'},
    {hou:'guan',     role:'pi',    yue:8},
    {hou:'guimei_nei', role:'hou', yue:8},
    {hou:'guimei_wai', role:'hou_wai', yue:9},
    {hou:'wuwang',   role:'dafu',  yue:9},
    {hou:'mingyi',   role:'qing',  yue:9},
    // 戌月九月
    {hou:'kun4',     role:'gong',  yue:9, note:'困'},
    {hou:'bo',       role:'pi',    yue:9},
    {hou:'gen_nei',  role:'hou',   yue:9},
    {hou:'gen_wai',  role:'hou_wai', yue:10},
    {hou:'jiji',     role:'dafu',  yue:10},
    {hou:'shihe',    role:'qing',  yue:10},  // 卿噬嗑
    // 亥月十月
    {hou:'daguo',    role:'gong',  yue:10},
    {hou:'kun',      role:'pi',    yue:10},
    {hou:'weiji_nei', role:'hou',  yue:10},
    {hou:'weiji_wai', role:'hou_wai', yue:11},
    {hou:'jian2',    role:'dafu',  yue:11, note:'蹇'},
    {hou:'yi2',      role:'qing',  yue:11, note:'颐'}
  ];

  /* ============ 4. 七十二候（五日一候，每月六候，共72候）配辟卦之爻 ============
   * 按《卦气七十二候图》，十二辟卦每卦六爻值一月六候，
   * 另四正卦爻主24节气中的"节"，辟卦爻主"候"。
   * 以下列表按冬至起，依惠栋《易汉学》、李鼎祚《周易集解》引。
   */
  var QIHOU_72 = [
    // 冬至起（子月·坎初）
    {jieqi:'冬至', hou:'蚯蚓结',  pi:'fu',   yao:4},
    {jieqi:'冬至', hou:'麋角解',  pi:'fu',   yao:5},
    {jieqi:'冬至', hou:'水泉动',  pi:'fu',   yao:6, next:'gong zhongfu'},
    // 小寒（丑月·坎九二）
    {jieqi:'小寒', hou:'雁北乡',  pi:'lin',  yao:1, note:'屯外'},
    {jieqi:'小寒', hou:'鹊始巢',  pi:'lin',  yao:2, note:'大夫谦'},
    {jieqi:'小寒', hou:'雉始雊',  pi:'lin',  yao:3, note:'卿睽'},
    // 大寒
    {jieqi:'大寒', hou:'鸡始乳',  pi:'lin',  yao:4, note:'公升'},
    {jieqi:'大寒', hou:'鸷鸟厉疾',pi:'lin',  yao:5, note:'辟临'},
    {jieqi:'大寒', hou:'水泽腹坚',pi:'lin',  yao:6, note:'侯小过内'},
    // 立春（寅月·坎六四）
    {jieqi:'立春', hou:'东风解冻',pi:'tai',  yao:1, note:'侯小过外'},
    {jieqi:'立春', hou:'蛰虫始振',pi:'tai',  yao:2, note:'大夫蒙'},
    {jieqi:'立春', hou:'鱼上冰',  pi:'tai',  yao:3, note:'卿益'},
    // 雨水
    {jieqi:'雨水', hou:'獭祭鱼',  pi:'tai',  yao:4, note:'公渐'},
    {jieqi:'雨水', hou:'鸿雁来',  pi:'tai',  yao:5, note:'辟泰'},
    {jieqi:'雨水', hou:'草木萌动',pi:'tai',  yao:6, note:'侯需内'},
    // 惊蛰（卯月·坎上六）
    {jieqi:'惊蛰', hou:'桃始华',  pi:'dazhuang',yao:1, note:'侯需外'},
    {jieqi:'惊蛰', hou:'仓庚鸣',  pi:'dazhuang',yao:2, note:'大夫随'},
    {jieqi:'惊蛰', hou:'鹰化为鸠',pi:'dazhuang',yao:3, note:'卿晋'},
    // 春分（震初九）
    {jieqi:'春分', hou:'玄鸟至',  pi:'dazhuang',yao:4, note:'公解'},
    {jieqi:'春分', hou:'雷乃发声',pi:'dazhuang',yao:5, note:'辟大壮'},
    {jieqi:'春分', hou:'始电',    pi:'dazhuang',yao:6, note:'侯豫内'},
    // 清明（震六二）
    {jieqi:'清明', hou:'桐始华',  pi:'guai', yao:1, note:'侯豫外'},
    {jieqi:'清明', hou:'田鼠化为鴽',pi:'guai',yao:2, note:'大夫讼'},
    {jieqi:'清明', hou:'虹始见',  pi:'guai', yao:3, note:'卿蛊'},
    // 谷雨
    {jieqi:'谷雨', hou:'萍始生',  pi:'guai', yao:4, note:'公革'},
    {jieqi:'谷雨', hou:'鸣鸠拂羽',pi:'guai',yao:5, note:'辟夬'},
    {jieqi:'谷雨', hou:'戴胜降桑',pi:'guai', yao:6, note:'侯旅内'},
    // 立夏（震九四）
    {jieqi:'立夏', hou:'蝼蝈鸣',  pi:'qian', yao:1, note:'侯旅外'},
    {jieqi:'立夏', hou:'蚯蚓出',  pi:'qian', yao:2, note:'大夫师'},
    {jieqi:'立夏', hou:'王瓜生',  pi:'qian', yao:3, note:'卿比'},
    // 小满
    {jieqi:'小满', hou:'苦菜秀',  pi:'qian', yao:4, note:'公小畜'},
    {jieqi:'小满', hou:'靡草死',  pi:'qian', yao:5, note:'辟乾'},
    {jieqi:'小满', hou:'麦秋至',  pi:'qian', yao:6, note:'侯大有内'},
    // 芒种（震上六）
    {jieqi:'芒种', hou:'螳螂生',  pi:'gou',  yao:1, note:'侯大有外'},
    {jieqi:'芒种', hou:'鵙始鸣',  pi:'gou',  yao:2, note:'大夫家人'},
    {jieqi:'芒种', hou:'反舌无声',pi:'gou',  yao:3, note:'卿井'},
    // 夏至（离初九）
    {jieqi:'夏至', hou:'鹿角解',  pi:'gou',  yao:4, note:'公咸'},
    {jieqi:'夏至', hou:'蜩始鸣',  pi:'gou',  yao:5, note:'辟姤'},
    {jieqi:'夏至', hou:'半夏生',  pi:'gou',  yao:6, note:'侯鼎内'},
    // 小暑（离六二）
    {jieqi:'小暑', hou:'温风至',  pi:'dun',  yao:1, note:'侯鼎外'},
    {jieqi:'小暑', hou:'蟋蟀居壁',pi:'dun',  yao:2, note:'大夫丰'},
    {jieqi:'小暑', hou:'鹰始挚',  pi:'dun',  yao:3, note:'卿涣'},
    // 大暑
    {jieqi:'大暑', hou:'腐草为萤',pi:'dun',  yao:4, note:'公履'},
    {jieqi:'大暑', hou:'土润溽暑',pi:'dun',  yao:5, note:'辟遁'},
    {jieqi:'大暑', hou:'大雨时行',pi:'dun',  yao:6, note:'侯恒内'},
    // 立秋（离九四）
    {jieqi:'立秋', hou:'凉风至',  pi:'pi',   yao:1, note:'侯恒外'},
    {jieqi:'立秋', hou:'白露降',  pi:'pi',   yao:2, note:'大夫节'},
    {jieqi:'立秋', hou:'寒蝉鸣',  pi:'pi',   yao:3, note:'卿同人'},
    // 处暑
    {jieqi:'处暑', hou:'鹰乃祭鸟',pi:'pi',   yao:4, note:'公损'},
    {jieqi:'处暑', hou:'天地始肃',pi:'pi',   yao:5, note:'辟否'},
    {jieqi:'处暑', hou:'禾乃登',  pi:'pi',   yao:6, note:'侯巽内'},
    // 白露（离上九）
    {jieqi:'白露', hou:'鸿雁来',  pi:'guan', yao:1, note:'侯巽外'},
    {jieqi:'白露', hou:'玄鸟归',  pi:'guan', yao:2, note:'大夫萃'},
    {jieqi:'白露', hou:'群鸟养羞',pi:'guan', yao:3, note:'卿大畜'},
    // 秋分（兑初九）
    {jieqi:'秋分', hou:'雷始收声',pi:'guan', yao:4, note:'公贲'},
    {jieqi:'秋分', hou:'蛰虫坯户',pi:'guan', yao:5, note:'辟观'},
    {jieqi:'秋分', hou:'水始涸',  pi:'guan', yao:6, note:'侯归妹内'},
    // 寒露（兑九二）
    {jieqi:'寒露', hou:'鸿雁来宾',pi:'bo',  yao:1, note:'侯归妹外'},
    {jieqi:'寒露', hou:'雀入大水为蛤',pi:'bo',yao:2, note:'大夫无妄'},
    {jieqi:'寒露', hou:'菊有黄华',pi:'bo',   yao:3, note:'卿明夷'},
    // 霜降
    {jieqi:'霜降', hou:'豺乃祭兽',pi:'bo',   yao:4, note:'公困'},
    {jieqi:'霜降', hou:'草木黄落',pi:'bo',   yao:5, note:'辟剥'},
    {jieqi:'霜降', hou:'蛰虫咸俯',pi:'bo',   yao:6, note:'侯艮内'},
    // 立冬（兑九四）
    {jieqi:'立冬', hou:'水始冰',  pi:'kun',  yao:1, note:'侯艮外'},
    {jieqi:'立冬', hou:'地始冻',  pi:'kun',  yao:2, note:'大夫既济'},
    {jieqi:'立冬', hou:'雉入大水为蜃',pi:'kun',yao:3,note:'卿噬嗑'},
    // 小雪
    {jieqi:'小雪', hou:'虹藏不见',pi:'kun',  yao:4, note:'公大过'},
    {jieqi:'小雪', hou:'天气上升地气下降',pi:'kun',yao:5,note:'辟坤'},
    {jieqi:'小雪', hou:'闭塞而成冬',pi:'kun',yao:6, note:'侯未济内'},
    // 大雪（兑上六）
    {jieqi:'大雪', hou:'鹖鴠不鸣',pi:'fu',   yao:1, note:'侯未济外'},
    {jieqi:'大雪', hou:'虎始交',  pi:'fu',   yao:2, note:'大夫蹇'},
    {jieqi:'大雪', hou:'荔挺出',  pi:'fu',   yao:3, note:'卿颐'}
  ];

  /* ============ 5. 郑玄爻辰说 - 十二爻辰配二十八宿 ============
   * 乾贞于子，左行；坤贞于未，右行。
   * 乾初九子、九二寅、九三辰、九四午、九五申、上九戌；
   * 坤初六未、六二酉、六三亥、六四丑、六五卯、上六巳。
   * 阳爻值乾辰、阴爻值坤辰；爻辰上值二十八宿。
   */
  var QIAN_YAO_CHEN = ['zi','yin','chen','wu','shen','xu']; // 初→上
  var KUN_YAO_CHEN  = ['wei','you','hai','chou','mao','si'];

  // 十二辰→二十八宿（《礼记·月令》郑氏注，参考惠栋《易汉学》）
  var CHEN_ERSHIBAXIU = {
    zi: {xiu:'虚、危、女', xingci:'玄枵', animal:'玄武', fangwei:'北', desc:'初爻子上值虚危女，北方玄武'},
    chou:{xiu:'斗、牛',     xingci:'星纪', animal:'玄武', fangwei:'北', desc:'丑上斗牛'},
    yin: {xiu:'尾、箕',     xingci:'析木', animal:'青龙', fangwei:'东', desc:'寅上尾箕'},
    mao: {xiu:'氐、房、心', xingci:'大火', animal:'青龙', fangwei:'东', desc:'卯上氐房心（大火）'},
    chen:{xiu:'角、亢',     xingci:'寿星', animal:'青龙', fangwei:'东', desc:'辰上角亢'},
    si:  {xiu:'翼、轸',     xingci:'鹑尾', animal:'朱雀', fangwei:'南', desc:'巳上翼轸'},
    wu:  {xiu:'柳、星、张', xingci:'鹑火', animal:'朱雀', fangwei:'南', desc:'午上柳星张（鹑火）'},
    wei: {xiu:'井、鬼',     xingci:'鹑首', animal:'朱雀', fangwei:'南', desc:'未上井鬼（东井）'},
    shen:{xiu:'觜、参',     xingci:'实沈', animal:'白虎', fangwei:'西', desc:'申上觜参'},
    you: {xiu:'胃、昴、毕', xingci:'大梁', animal:'白虎', fangwei:'西', desc:'酉上胃昴毕'},
    xu:  {xiu:'奎、娄',     xingci:'降娄', animal:'白虎', fangwei:'西', desc:'戌上奎娄'},
    hai: {xiu:'室、壁',     xingci:'娵訾', animal:'玄武', fangwei:'北', desc:'亥上室壁'}
  };

  // 十二辰→十二律吕
  var CHEN_LVLV = {
    zi:'黄钟',chou:'大吕',yin:'太簇',mao:'夹钟',chen:'姑洗',si:'仲吕',
    wu:'蕤宾',wei:'林钟',shen:'夷则',you:'南吕',xu:'无射',hai:'应钟'
  };

  /* ============ 6. 《周易参同契》月体纳甲 ============
   * 魏伯阳以月相盈亏明八卦纳甲：
   *   初三黄昏，新月见于西方庚位（震☳一阳生）→ 震纳庚
   *   初八上弦，月见于南方丁位（兑☱二阳）   → 兑纳丁
   *   十五满月，月出于东方甲位（乾☰三阳）   → 乾纳甲
   *   十六平明，月亏于西方辛位（巽☴一阴生） → 巽纳辛
   *   二十三下弦，月见于南方丙位（艮☶二阴） → 艮纳丙
   *   三十月晦，月灭于东方乙位（坤☷三阴）   → 坤纳乙
   *   坎戊离己为日月之体，居中宫。
   * 乾又纳壬（十六以后阳复生之义）、坤又纳癸（月终阴尽之义）。
   */
  var YUEXIANG_NAJIA = [
    {day:3,  gua:'zhen', gan:'geng', yuexiang:'新月（娥眉月）', fangwei:'西方庚位', time:'黄昏',  yangxian:1, desc:'三日出为爽，震受庚西方'},
    {day:8,  gua:'dui',  gan:'ding', yuexiang:'上弦月',       fangwei:'南方丁位', time:'黄昏',  yangxian:2, desc:'八日兑受丁，上弦平如绳'},
    {day:15, gua:'qian', gan:'jia',  yuexiang:'望月（满月）', fangwei:'东方甲位', time:'黄昏',  yangxian:3, desc:'十五乾体就，盛满甲东方'},
    {day:16, gua:'xun',  gan:'xin',  yuexiang:'既望月（始亏）',fangwei:'西方辛位', time:'平明',  yangxian:2, desc:'十六转受统，巽辛见平明'},
    {day:23, gua:'gen',  gan:'bing', yuexiang:'下弦月',       fangwei:'南方丙位', time:'平明',  yangxian:1, desc:'艮直于丙南，下弦二十三'},
    {day:30, gua:'kun',  gan:'yi',   yuexiang:'晦月（朔前）', fangwei:'东北乙位', time:'平明',  yangxian:0, desc:'坤乙三十日，东北丧其明'},
    {day:0,  gua:'kun',  gan:'yi',   yuexiang:'朔月（新月前）',fangwei:'东北',   time:'',       yangxian:0, desc:'三十日晨月丧于乙，晦朔合符'},
    // 乾坤包壬癸（乾阳终壬、坤阴尽癸）
    {day:'壬',  gua:'qian', gan:'ren', yuexiang:'阳终复生', fangwei:'北方壬位',  time:'', yangxian:3, desc:'乾纳甲壬：甲望而壬晦，阳之始终'},
    {day:'癸',  gua:'kun',  gan:'gui', yuexiang:'阴尽复阳', fangwei:'北方癸位',  time:'', yangxian:0, desc:'坤纳乙癸：乙晦而癸尽，阴之始终'}
  ];

  // 坎离为日月之体，居戊己中宫
  var KANLI_WUJI = {
    kan:{gan:'wu',  desc:'坎为月，月是水精，纳戊居中央'},
    li: {gan:'ji',  desc:'离为日，日是火精，纳己居中央'}
  };

  // 纳甲完整表（京房系统天干配八卦）
  var NAJIA_BAGUA = [
    {gua:'qian', gan:'甲、壬', yinyang:'阳', fangwei:'东/北', desc:'纯阳，纳首尾阳干'},
    {gua:'kun',  gan:'乙、癸', yinyang:'阴', fangwei:'东/北', desc:'纯阴，纳首尾阴干'},
    {gua:'zhen', gan:'庚',     yinyang:'阳（长男）', fangwei:'西', desc:'长男一阳初生，纳庚'},
    {gua:'xun',  gan:'辛',     yinyang:'阴（长女）', fangwei:'西', desc:'长女一阴初生，纳辛'},
    {gua:'kan',  gan:'戊',     yinyang:'阳（中男）', fangwei:'中宫', desc:'中男为月，纳戊'},
    {gua:'li',   gan:'己',     yinyang:'阴（中女）', fangwei:'中宫', desc:'中女为日，纳己'},
    {gua:'gen',  gan:'丙',     yinyang:'阳（少男）', fangwei:'南', desc:'少男二阴一阳，纳丙'},
    {gua:'dui',  gan:'丁',     yinyang:'阴（少女）', fangwei:'南', desc:'少女二阳一阴，纳丁'}
  ];

  /* ============ 导出 ============ */
  Q.GUAQI = {
    meta: {
      version:'1.0',
      builtOn:'2026-11-09',
      title:'汉易卦气·爻辰·月体纳甲本体',
      author:'YJ Ontology',
      sources:[
        '孟喜《卦气图》（载《新唐书·历志》、《易纬·稽览图》）',
        '京房《易传》纳甲',
        '《易纬·乾凿度》爻辰说',
        '郑玄《易注》爻辰值宿',
        '魏伯阳《周易参同契》月体纳甲',
        '惠栋《易汉学》卦气、爻辰、纳甲考',
        '张惠言《周易虞氏义》',
        '《礼记·月令》郑氏注'
      ]
    },
    sizheng: SIZHENG_GUA,
    jieqi24: JIEQI_24,
    xiaoxi: XIAOXI_12,
    lvlv: LVLV_12,
    liushigualist: LIUSHI_GUA_BY_MONTH,
    qihou72: QIHOU_72,
    qianYaoChen: QIAN_YAO_CHEN,
    kunYaoChen:  KUN_YAO_CHEN,
    chenXiu:     CHEN_ERSHIBAXIU,
    chenLv:      CHEN_LVLV,
    yuexiangNajia: YUEXIANG_NAJIA,
    kanliWuJi:   KANLI_WUJI,
    najiaBagua:  NAJIA_BAGUA,
    constants: {
      riPerGua: 6 + 7/80,      // 六日七分（6又7/80日）
      daysPerYear: 365.25,     // 四分历周天
      liushiGua: 60,           // 卦气用卦60（去四正卦）
      yaoPerGua: 6,
      totalYao: 360,           // 当期之日
      sizhengYaoJieqi: 24,     // 四正卦24爻主24节气
      piGuaYaoHou: 72          // 十二辟卦72爻主72候
    }
  };

  // 挂到全局
  window.YJ_ONTOLOGY_ENHANCE = Q;
  window.YJ_GUAQI = Q.GUAQI;
})(window);
