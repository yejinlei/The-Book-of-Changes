/**
 * 筮法本体扩展模块
 * ---------------------------------
 * 在主本体（yijing-ontology.js）基础上，新增：
 *  - 筮法类（Shifa）、占问类（Zhanwen）、爻象类（Yaoxiang）的元类
 *  - 大衍筮法 / 铜钱摇卦法 / 梅花易数 三种经典筮法实例
 *  - 筮法与《系辞》原文、历代注家的双向关联
 *  - 概率分布、规则、术语等演算相关元数据
 *
 * 加载方式：在 yijing-ontology.js 之后引入本文件，
 * 即可通过 window.YJ_ONT.shifa.* 访问筮法本体。
 */
(function(){
  'use strict';
  const ONT = window.YJ_ONT || {};

  // ============================================================
  // 元类扩展：筮法相关类别
  // ============================================================
  ONT.meta.Shifa   = { id:'Shifa',   label:'筮法',   comment:'占卦推演的方法体系' };
  ONT.meta.Zhanwen = { id:'Zhanwen', label:'占问',   comment:'占卦时所问之事，与卦爻辞的所指' };
  ONT.meta.Yaoxiang= { id:'Yaoxiang',label:'爻象',   comment:'七九八六——少阳/老阳/少阴/老阴四象' };
  ONT.meta.Guashi  = { id:'Guashi',  label:'卦式',   comment:'一次占筮所得的本卦/之卦整体结果' };

  // 新增关系谓词（反向谓词通过 inverse 自动建立）
  const R = ONT.relations;
  const addRel = (id, label, inv) => {
    if(!R[id]) R[id] = { id, label, inverse: inv };
    if(inv && !R[inv]) R[inv] = { id:inv, label:R[inv]&&R[inv].label||('被'+label), inverse:id };
  };
  addRel('shiYongShifa','使用筮法','shiYongYu');
  addRel('caiYongCeshifa','采用策数法','ceShuYongYu');
  addRel('benGua','本卦','benGuaZai');
  addRel('zhiGua','之卦','zhiGuaZai');
  addRel('dongYao','动爻','dongYu');
  addRel('jingYao','静爻','jingYu');
  addRel('shuZhiGua','属之卦','dongYuZhi');
  addRel('yaoXiangWei','爻象为','shuYaoXiang');
  addRel('jiChengZi','继承自','chengFaYu');
  addRel('yuanChuYuxi','原出系辞','xiCiShuo');
  addRel('guiZeLaiYuan','规则源于','guiZeSuoShu');
  addRel('yanJieYu','演解于','yanJieYou');
  addRel('gailvFenbu','概率分布','shuFenbu');
  addRel('shifaBuZhou','筮法步骤','buShuShu');

  // ============================================================
  // 四象爻象（少阳/老阳/少阴/老阴；七九八六）
  // ============================================================
  const YAOXIANG = {
    shaoyang: {
      id:'yx_shaoyang', shu:7, code:'', name:'少阳', yinyang:'阳', dong:false,
      desc:'七为少阳，阳气初生，静而不动；占遇此爻，以本爻阳爻视之，不变。',
      tianqi:'阳气始生',
    },
    laoyang: {
      id:'yx_laoyang', shu:9, code:'○', name:'老阳', yinyang:'阳', dong:true,
      desc:'九为老阳，阳气极盛，动而生变；占遇此爻，阳变阴，谓之动爻，参看变爻爻辞。',
      tianqi:'阳极生阴',
    },
    shaoyin: {
      id:'yx_shaoyin', shu:8, code:'', name:'少阴', yinyang:'阴', dong:false,
      desc:'八为少阴，阴气初长，静而不动；占遇此爻，以本爻阴爻视之，不变。',
      tianqi:'阴气始凝',
    },
    laoyin: {
      id:'yx_laoyin', shu:6, code:'×', name:'老阴', yinyang:'阴', dong:true,
      desc:'六为老阴，阴气极盛，动而生变；占遇此爻，阴变阳，谓之动爻，参看变爻爻辞。',
      tianqi:'阴极生阳',
    },
  };

  // ============================================================
  // 筮法本体实例
  // ============================================================
  const SHIFA = {
    // ---------------- 大衍揲蓍法 ----------------
    dayan: {
      id:'sf_dayan',
      name:'大衍揲蓍法',
      aka:'大衍筮法、揲蓍法、蓍草占',
      dynasty:'上古（相传伏羲-文王-周公-孔子传承）',
      author:'相传伏羲画卦，《系辞》载其法',
      source:'《周易·系辞上》"大衍之数五十"章',
      status:'正统筮法',
      difficulty:'高',
      tools:'蓍草五十策（或竹签、棋子代用）',
      yaoShuDesc:'三变定一爻、十八变定一卦',
      desc:'《系辞》所载最古老的占筮法，"大衍之数五十，其用四十有九。分而为二以象两，挂一以象三，揲之以四以象四时，归奇于扐以象闰"。每爻经"分二、挂一、揲四、归奇"三变成一爻，自初爻至上爻，十八变而成卦。',
      // 严格数学概率（余策分配推得）
      probability: { laoyang:3/16, shaoyin:7/16, shaoyang:5/16, laoyin:1/16 },
      steps:[
        {k:'bei', name:'备策', desc:'取蓍草五十策，置其一不用以象太极，实用四十九策。'},
        {k:'fen', name:'分二', desc:'将四十九策任意分置左右两手，以象两仪（天地）。'},
        {k:'gua', name:'挂一', desc:'从右手取一策挂于左手小指间，以象三才（天地人）。'},
        {k:'she', name:'揲四', desc:'将左右之策分别以四为一组数之，以象四时；余数（1~4）归扐。'},
        {k:'gui', name:'归奇', desc:'将左右余数连同挂一之策合于扐，是为第一变，得余策数为5或9。'},
        {k:'chong', name:'再揲三揲', desc:'将剩余正策再"分二、挂一、揲四、归奇"，再经两变，共三变。'},
        {k:'ding', name:'定爻', desc:'三变后正策数除以四得6/7/8/9，对应老阴/少阳/少阴/老阳，定一爻之象。'},
        {k:'liu', name:'六爻成卦', desc:'自下而上，重复六遍共十八变，六爻俱定，本卦成；老阳老阴变之，得之卦。'},
      ],
      // 大衍筮法与经典的关系
      relations:{
        yuanChuYuxi:'sy_xici_shang',           // 出自《系辞上》
        guanlianZhe:['zj_kongzi','zj_zhuxi','zj_chengtuanying','zj_jingfang','zj_shangbinghe'],
        zhushizai:['zb_yizhuan','zb_zhouyibenyi','zb_zhouyizhengyi'],
        shuYuLiupai:'lp_xuanxue',
      },
    },

    // ---------------- 铜钱摇卦法 ----------------
    tongqian: {
      id:'sf_tongqian',
      name:'铜钱摇卦法',
      aka:'文王课、火珠林、三钱代蓍法',
      dynasty:'汉（京房纳甲体系）至唐定型',
      author:'传为京房纳甲起例，后世火珠林派发扬',
      source:'《火珠林》《增删卜易》《卜筮正宗》',
      status:'民间通行筮法',
      difficulty:'中',
      tools:'铜钱三枚（以乾隆通宝为佳，字为背、幕为面）',
      yaoShuDesc:'摇六次定一卦，每次得一爻',
      desc:'以三枚铜钱代蓍草，取便捷用。摇钱掷地：两背一字为拆（少阴八）、两字一背为单（少阳七）、三字为重（老阳九动）、三背为交（老阴六动）。自下而上摇六次得六爻。配纳甲、世应、六亲、六神以断。',
      probability: { laoyang:1/8, shaoyin:3/8, shaoyang:3/8, laoyin:1/8 },
      steps:[
        {k:'bei', name:'备钱', desc:'取铜钱三枚，焚香净手，诚心问事。'},
        {k:'yao', name:'摇掷', desc:'将三枚铜钱合于掌心，默念所问之事，摇后掷于桌面。'},
        {k:'kan', name:'辨象', desc:'视三枚钱币字背组合：二字一背=少阳（—），二背一字=少阴（- -），三字=老阳（○动），三背=老阴（×动）。'},
        {k:'ji', name:'记爻', desc:'自下而上记录，第一次为初爻，第六次为上爻。'},
        {k:'cheng', name:'成卦', desc:'六爻俱定得本卦；老阳老阴变之得之卦。'},
        {k:'na', name:'纳甲', desc:'按八宫世应配天干地支、六亲、六神，以断吉凶。'},
      ],
      relations:{
        jiChengZi:'sf_dayan',                // 继承自大衍
        guanlianZhe:['zj_jingfang','zj_zhuxi','zj_yehong'],
        zhushizai:['zb_huozhulin','zb_bushizhengzong','zb_zengshanbuyi'],
        shuYuLiupai:'lp_najia',
      },
    },

    // ---------------- 梅花易数 ----------------
    meihua: {
      id:'sf_meihua',
      name:'梅花易数',
      aka:'梅花心易、先天易数',
      dynasty:'宋',
      author:'邵雍（邵康节）',
      source:'《梅花易数》（托名邵雍，宋代以来流传）',
      status:'心易占法',
      difficulty:'高（需外应心悟）',
      tools:'无需器具，可随时起卦（年月日时、物数、声音、字数、方位皆可起卦）',
      yaoShuDesc:'以数起卦，上下卦+动爻一次得出',
      desc:'邵雍先天易学之占法，以先天八卦数（乾一兑二离三震四巽五坎六艮七坤八）为本，随物起数、随数起卦。观梅见雀坠枝而占，得"泽火革"变"泽山咸"，知女子折花伤股，是为"梅花易数"之名由来。重体用、互变、旺衰生克。',
      probability: null, // 非随机，以数取象
      steps:[
        {k:'qu', name:'取数', desc:'观年月日时、或眼前之物数、字数、声音数等，得上卦之数除以8取余。'},
        {k:'xia', name:'下卦', desc:'另取一数（如加时/方位数）除以8取余，得下卦。'},
        {k:'yao', name:'动爻', desc:'总数除以6取余，得动爻位（余0为上爻）。'},
        {k:'cheng', name:'成卦', desc:'上下卦合成本卦；动爻变之得之卦；二三四爻为下互、三四五为上互得互卦。'},
        {k:'ti', name:'分体用', desc:'不动之卦为体（为己），有动爻之卦为用（为事），以体用五行生克断吉凶。'},
        {k:'ying', name:'观外应', desc:'耳目所接、偶见之事皆为外应，合参以断——此梅花易之精髓。'},
      ],
      relations:{
        jiChengZi:'sf_dayan',
        guanlianZhe:['zj_shaoyong','zj_laixide'],
        zhushizai:['zb_meihuayishu'],
        shuYuLiupai:'lp_xiangshu',
      },
    },
  };

  // ============================================================
  // 术语与规则表（给演算器直接查）
  // ============================================================
  const LEXICON = {
    // 揲蓍三变余策 → 结果
    // 第一变余 5 或 9；第二、三变余 4 或 8
    // 三变余策皆"少"（5或4）→ 9 老阳；两少一多 → 8 少阴；两多一少 → 7 少阳；三多 → 6 老阴
    sanchengRule: {
      counts:[
        { remainders:[5,4,4], shu:9, xiang:'laoyang' },
        { remainders:[9,8,8], shu:9, xiang:'laoyang' },
        { remainders:[9,4,4], shu:8, xiang:'shaoyin' },
        { remainders:[5,8,4], shu:8, xiang:'shaoyin' },
        { remainders:[5,4,8], shu:8, xiang:'shaoyin' },
        { remainders:[9,8,4], shu:7, xiang:'shaoyang' },
        { remainders:[9,4,8], shu:7, xiang:'shaoyang' },
        { remainders:[5,8,8], shu:7, xiang:'shaoyang' },
        { remainders:[9,4,4], shu:7, xiang:'shaoyang' }, // 兜底
        { remainders:[5,8,8], shu:7, xiang:'shaoyang' },
        { remainders:[5,5,4], shu:6, xiang:'laoyin' },  // 理论不存在的组合
      ],
      // 标准判定口诀
      koujue:'三少为老阳（九），三多为老阴（六），两少一多为少阴（八），两多一少为少阳（七）',
    },
    // 铜钱法三字背对应
    tongqianMap:{
      '3zi':   { shu:9, xiang:'laoyang', mark:'○', desc:'三字为重——老阳动' },
      '2zi1b': { shu:7, xiang:'shaoyang',mark:'—',desc:'两字一背为单——少阳静' },
      '2b1zi': { shu:8, xiang:'shaoyin', mark:'- -',desc:'两背一字为拆——少阴静' },
      '3b':    { shu:6, xiang:'laoyin', mark:'×', desc:'三背为交——老阴动' },
    },
    // 先天八卦数（梅花易）
    xiantianShu:{ '1':'乾','2':'兑','3':'离','4':'震','5':'巽','6':'坎','7':'艮','8':'坤' },
    // 后天八卦方位
    houtianFangwei:{ '南':'离','北':'坎','东':'震','西':'兑','东南':'巽','东北':'艮','西南':'坤','西北':'乾' },
  };

  // ============================================================
  // 建立本体三元组关联（筮法 ↔ 经传/注家/流派）
  // ============================================================
  function wireShifaRelations(){
    const addT = ONT.addTriple;
    if(typeof addT !== 'function') return;

    // 元类归属
    ['sf_dayan','sf_tongqian','sf_meihua'].forEach(id => addT(id,'type','Shifa'));
    Object.values(YAOXIANG).forEach(y => addT(y.id,'type','Yaoxiang'));

    // 筮法 ↔ 出处/流派/注家/注本
    Object.values(SHIFA).forEach(sf=>{
      const r = sf.relations||{};
      if(r.yuanChuYuxi) addT(sf.id,'yuanChuYuxi',r.yuanChuYuxi);
      if(r.jiChengZi)   addT(sf.id,'jiChengZi',r.jiChengZi);
      if(r.shuYuLiupai) addT(sf.id,'shuYuLiupai',r.shuYuLiupai);
      if(r.guanlianZhe) r.guanlianZhe.forEach(zj=>addT(sf.id,'yanJieYu',zj));
      if(r.zhushizai)   r.zhushizai.forEach(zb=>addT(sf.id,'zhushiZai',zb));
    });

    // 爻象 ↔ 筮法
    Object.values(YAOXIANG).forEach(y=>{
      addT(y.id,'shuYu','sf_dayan');
      addT(y.id,'shuYu','sf_tongqian');
    });
  }

  // 等主本体完全初始化后再接线；主本体本身在 load 事件里才暴露 API
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(wireShifaRelations, 50);
  } else {
    window.addEventListener('DOMContentLoaded', ()=>setTimeout(wireShifaRelations,50));
  }

  // ============================================================
  // 挂载公开 API
  // ============================================================
  ONT.shifa = {
    meta:  { Shifa:'筮法', Zhanwen:'占问', Yaoxiang:'爻象', Guashi:'卦式' },
    yaoxiang: YAOXIANG,
    methods: SHIFA,
    lexicon: LEXICON,
    shuToXiang: { 6:'laoyin',7:'shaoyang',8:'shaoyin',9:'laoyang' },
    shuToYao:   { 6:0,7:1,8:0,9:1 },  // 0阴1阳
    shuToDong:  { 6:1,7:0,8:0,9:1 },
  };
  window.YJ_ONT = ONT;
})();
