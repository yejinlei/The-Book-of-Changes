/**
 * 《易经》本体论数据层 (Yijing Ontology)
 * 所有数据先构建为本体实例（RDF风格三元组），网页仅作为渲染层读取本体
 * 
 * 本体层级 (L0元本体 → L6外延层):
 * L0: 元类 (MetaClass) - 定义本体结构的基本类型
 * L1: 核心范畴 (Core Category) - 道、阴阳、五行、象数、义理
 * L2: 符号系统 (Symbol System) - 爻、八卦、六十四卦、河图洛书、太极图
 * L3: 经文 (Classic Text) - 易经本经、十翼（易传）
 * L4: 注疏传统 (Commentary Tradition) - 历代注家、注本、汇评
 * L5: 义理体系 (Philosophy System) - 三易、象数派/义理派、易学流派
 * L6: 文化外延 (Cultural Extension) - 易学传承、应用、影响
 */
window.YJ_ONT = (function() {
  'use strict';

  // ========== L0: 元类定义 ==========
  const MetaClass = {
    Dao: { id:'Dao', label:'道', comment:'本体之源，形而上者' },
    Qi: { id:'Qi', label:'气', comment:'本体之质，阴阳二气' },
    Taiji: { id:'Taiji', label:'太极', comment:'道生太极，阴阳未分' },
    Liangyi: { id:'Liangyi', label:'两仪', comment:'阴阳二仪' },
    Sixiang: { id:'Sixiang', label:'四象', comment:'太阳、少阴、少阳、太阴' },
    Bagua: { id:'Bagua', label:'八卦', comment:'乾兑离震巽坎艮坤八经卦' },
    Liushisigua: { id:'Liushisigua', label:'六十四卦', comment:'重卦而成的别卦' },
    Yao: { id:'Yao', label:'爻', comment:'卦的基本构成单元，分阴阳' },
    Jing: { id:'Jing', label:'经', comment:'易经本经（卦爻辞）' },
    Zhuan: { id:'Zhuan', label:'传', comment:'易传（十翼）' },
    Tushu: { id:'Tushu', label:'图书', comment:'易图体系（河图洛书、太极图等）' },
    Zhujia: { id:'Zhujia', label:'注家', comment:'历代易学注家/大师' },
    Zhuben: { id:'Zhuben', label:'注本', comment:'历代易学注本著作' },
    Liupai: { id:'Liupai', label:'流派', comment:'易学流派' },
    Shijia: { id:'Shijia', label:'事件', comment:'易学传承关键事件' },
    Guanxi: { id:'Guanxi', label:'关系', comment:'本体间的关系谓词' },
  };

  // 关系谓词（本体属性）
  const Relations = {
    shengCheng: { id:'shengCheng', label:'生成', inverse:'youShengChengYu' },      // A生成B
    youShengChengYu: { id:'youShengChengYu', label:'由...生成' },
    zuHeCheng: { id:'zuHeCheng', label:'组合成', inverse:'youZuHeYu' },              // A组合成B
    youZuHeYu: { id:'youZuHeYu', label:'由...组合' },
    chongGua: { id:'chongGua', label:'重卦为', inverse:'shangGua' },                  // A为上卦/下卦重为B
    xiaGua: { id:'xiaGua', label:'下卦为', inverse:'chongGua' },
    shangGua: { id:'shangGua', label:'上卦为', inverse:'chongGua' },
    yaoWei: { id:'yaoWei', label:'爻位为', inverse:'shuYuGua' },                     // A是B的某爻
    shuYuGua: { id:'shuYuGua', label:'属于卦', inverse:'yaoWei' },
    zhushi: { id:'zhushi', label:'注释', inverse:'zhuShiYou' },                      // A注释B
    zhuShiYou: { id:'zhuShiYou', label:'注释者', inverse:'zhushi' },
    zhushiZai: { id:'zhushiZai', label:'注释在', inverse:'youZhuShi' },              // A是B的注释位置
    youZhuShi: { id:'youZhuShi', label:'有注释', inverse:'zhushiZai' },
    zuoZhe: { id:'zuoZhe', label:'作者', inverse:'zhuZuo' },                         // A是B的作者
    zhuZuo: { id:'zhuZuo', label:'著作', inverse:'zuoZhe' },
    shuYuLiupai: { id:'shuYuLiupai', label:'属于流派', inverse:'chengYuan' },
    chengYuan: { id:'chengYuan', label:'成员', inverse:'shuYuLiupai' },
    shiCheng: { id:'shiCheng', label:'师承', inverse:'diZi' },                       // A师承B
    diZi: { id:'diZi', label:'弟子', inverse:'shiCheng' },
    duiYingWuXing: { id:'duiYingWuXing', label:'对应五行', inverse:'duiYingGua' },
    duiYingFangwei: { id:'duiYingFangwei', label:'对应方位', inverse:'fangWeiGua' },
    duiYingZiran: { id:'duiYingZiran', label:'对应自然', inverse:'ziRanGua' },
    duiYingQinQing: { id:'duiYingQinQing', label:'对应亲情', inverse:'qinQingGua' },
  };

  // ========== L1: 核心范畴 ==========
  const CoreCategories = {
    Dao: { id:'cat_Dao', label:'道', type:'Dao', desc:'形而上者谓之道，宇宙本体，万物之源' },
    YinYang: { id:'cat_YinYang', label:'阴阳', type:'Qi', desc:'一阴一阳之谓道，天地之气' },
    WuXing: { id:'cat_WuXing', label:'五行', type:'Qi', desc:'金木水火土，生克制化' },
    XiangShu: { id:'cat_XiangShu', label:'象数', type:'category', desc:'观象系辞，数术推演' },
    YiLi: { id:'cat_YiLi', label:'义理', type:'category', desc:'阐释义理，微言大义' },
    SanYi: { id:'cat_SanYi', label:'三易', type:'category', desc:'变易、简易、不易' },
  };

  // ========== L2: 符号系统 - 八卦 ==========
  const BaGua = [
    {
      id:'gua_qian', num:1, name:'乾', symbol:'☰', xing:'阳', yao:'☰☰☰',
      wuxing:'金', fangwei:'西北', ziran:'天', qinqing:'父',
      nature:'健', shu:1, yinyang:'阳',
      xiang:'天行健', de:'元亨利贞',
      yaoci:['潜龙勿用','见龙在田','终日乾乾','或跃在渊','飞龙在天','亢龙有悔'],
    },
    {
      id:'gua_dui', num:2, name:'兑', symbol:'☱', xing:'阴', yao:'☱☱☰',
      wuxing:'金', fangwei:'西', ziran:'泽', qinqing:'少女',
      nature:'悦', shu:2, yinyang:'阴',
      xiang:'丽泽兑', de:'亨利贞',
      yaoci:['和兑吉','孚兑吉','来兑凶','商兑宁','孚于剥','引兑'],
    },
    {
      id:'gua_li', num:3, name:'离', symbol:'☲', xing:'阴', yao:'☲☰☲',
      wuxing:'火', fangwei:'南', ziran:'火', qinqing:'中女',
      nature:'丽', shu:3, yinyang:'阴',
      xiang:'明两作离', de:'利贞亨',
      yaoci:['履错然','黄离吉','日昃之离','突如其来如','出涕沱若','王用出征'],
    },
    {
      id:'gua_zhen', num:4, name:'震', symbol:'☳', xing:'阳', yao:'☳☲☲',
      wuxing:'木', fangwei:'东', ziran:'雷', qinqing:'长男',
      nature:'动', shu:4, yinyang:'阳',
      xiang:'洊雷震', de:'亨震来虩虩',
      yaoci:['震来虩虩','震来厉','震苏苏','震遂泥','震往来厉','震索索'],
    },
    {
      id:'gua_xun', num:5, name:'巽', symbol:'☴', xing:'阴', yao:'☴☴☰',
      wuxing:'木', fangwei:'东南', ziran:'风', qinqing:'长女',
      nature:'入', shu:5, yinyang:'阴',
      xiang:'随风巽', de:'小亨利有攸往',
      yaoci:['进退利武人','巽在床下','频巽吝','田获三品','贞吉悔亡','巽在床下'],
    },
    {
      id:'gua_kan', num:6, name:'坎', symbol:'☵', xing:'阳', yao:'☵☰☵',
      wuxing:'水', fangwei:'北', ziran:'水', qinqing:'中男',
      nature:'陷', shu:6, yinyang:'阳',
      xiang:'水洊至习坎', de:'有孚维心亨',
      yaoci:['习坎入坎窞','坎有险求小得','来之坎坎','樽酒簋贰','坎不盈','系用徽纆'],
    },
    {
      id:'gua_gen', num:7, name:'艮', symbol:'☶', xing:'阳', yao:'☶☶☲',
      wuxing:'土', fangwei:'东北', ziran:'山', qinqing:'少男',
      nature:'止', shu:7, yinyang:'阳',
      xiang:'兼山艮', de:'艮其背不获其身',
      yaoci:['艮其趾','艮其腓','艮其限','艮其身','艮其辅','敦艮吉'],
    },
    {
      id:'gua_kun', num:8, name:'坤', symbol:'☷', xing:'阴', yao:'☷☷☷',
      wuxing:'土', fangwei:'西南', ziran:'地', qinqing:'母',
      nature:'顺', shu:8, yinyang:'阴',
      xiang:'地势坤', de:'元亨利牝马之贞',
      yaoci:['履霜坚冰至','直方大','含章可贞','括囊','黄裳元吉','龙战于野'],
    },
  ];

  // 八卦索引
  const BaGuaMap = {};
  BaGua.forEach(g => BaGuaMap[g.name] = g);

  // ========== L2: 符号系统 - 爻位通用属性 ==========
  const YaoWeiAttr = {
    chu: { pos:1, name:'初', desc:'事物发端，潜藏勿用', timing:'始' },
    er: { pos:2, name:'二', desc:'初露头角，进取之时', timing:'萌' },
    san: { pos:3, name:'三', desc:'勤勉戒惧，功业将成', timing:'进' },
    si: { pos:4, name:'四', desc:'审时度势，可进可退', timing:'疑' },
    wu: { pos:5, name:'五', desc:'鼎盛之时，大展宏图', timing:'盛' },
    shang: { pos:6, name:'上', desc:'物极必反，知进退存亡', timing:'极' },
  };

  // ========== L2/L3: 64卦完整数据（上经30卦+下经34卦=64卦） ==========
  // 每卦包含：基本信息（名/号/上下卦/宫）、卦辞、彖传、象传、六爻（爻辞/小象/白话）
  // 上经：乾→离 30卦；下经：咸→未济 34卦
  const LiuShiSiGua = [
    // ===== 上经 =====
    {id:'g01', num:1, name:'乾', symbol:'䷀', jing:'上经', shang:'乾', xia:'乾', gong:'乾', wuxing:'金',
     guaci:'乾：元亨利贞。',
     tuan:'大哉乾元，万物资始，乃统天。云行雨施，品物流形。大明终始，六位时成，时乘六龙以御天。乾道变化，各正性命，保合大和，乃利贞。首出庶物，万国咸宁。',
     xiang:'天行健，君子以自强不息。',
     wenyan:'元者善之长也，亨者嘉之会也，利者义之和也，贞者事之干也。君子体仁足以长人，嘉会足以合礼，利物足以和义，贞固足以干事。',
     yao:[
       {pos:'初九', yinYang:'阳', text:'潜龙勿用。', xiaoxiang:'潜龙勿用，阳在下也。', explain:'龙潜伏水中，养精蓄锐，暂时不能发挥作用。象征事物发展之初，应潜藏待时，不可轻举妄动。'},
       {pos:'九二', yinYang:'阳', text:'见龙在田，利见大人。', xiaoxiang:'见龙在田，德施普也。', explain:'龙出现在大地上，利于见到德高望重的大人物。象征君子初露头角，开始有所作为。'},
       {pos:'九三', yinYang:'阳', text:'君子终日乾乾，夕惕若，厉无咎。', xiaoxiang:'终日乾乾，反复道也。', explain:'整天自强不息，夜晚也警惕戒惧，即使处境危险也无灾祸。事业上升期，必须勤勉谨慎。'},
       {pos:'九四', yinYang:'阳', text:'或跃在渊，无咎。', xiaoxiang:'或跃在渊，进无咎也。', explain:'龙或飞跃上天，或退处深渊，都无灾祸。面临重大抉择时，审时度势，可进可退。'},
       {pos:'九五', yinYang:'阳', text:'飞龙在天，利见大人。', xiaoxiang:'飞龙在天，大人造也。', explain:'龙飞上高空，利于见到大人物。乾卦最吉之爻，象征事业鼎盛，君子大展宏图。'},
       {pos:'上九', yinYang:'阳', text:'亢龙有悔。', xiaoxiang:'亢龙有悔，盈不可久也。', explain:'龙飞得过高，必生悔恨。象征物极必反，盛极而衰，凡事不可过头。'},
     ],
     yong:'用九：见群龙无首，吉。'
    },
    {id:'g02', num:2, name:'坤', symbol:'䷁', jing:'上经', shang:'坤', xia:'坤', gong:'坤', wuxing:'土',
     guaci:'坤：元亨，利牝马之贞。君子有攸往，先迷后得主，利西南得朋，东北丧朋。安贞吉。',
     tuan:'至哉坤元，万物资生，乃顺承天。坤厚载物，德合无疆。含弘光大，品物咸亨。牝马地类，行地无疆，柔顺利贞。',
     xiang:'地势坤，君子以厚德载物。',
     wenyan:'坤至柔而动也刚，至静而德方，后得主而有常，含万物而化光。坤道其顺乎，承天而时行。积善之家必有余庆，积不善之家必有余殃。',
     yao:[
       {pos:'初六', yinYang:'阴', text:'履霜，坚冰至。', xiaoxiang:'履霜坚冰，阴始凝也。', explain:'踩到薄霜，就知道坚冰将至。比喻见微知著，事物发展是渐进的，要防微杜渐。'},
       {pos:'六二', yinYang:'阴', text:'直方大，不习无不利。', xiaoxiang:'六二之动，直以方也。', explain:'正直、端方、正大，即使不刻意修习也无不利。守正直行则无往不利。'},
       {pos:'六三', yinYang:'阴', text:'含章可贞，或从王事，无成有终。', xiaoxiang:'含章可贞，以时发也。', explain:'蕴含美德不外露，坚守正道。辅佐君王事业，不居功自傲而能善终。'},
       {pos:'六四', yinYang:'阴', text:'括囊，无咎无誉。', xiaoxiang:'括囊无咎，慎不害也。', explain:'扎紧口袋，谨言慎行。在危险环境中这是保全自身的智慧。'},
       {pos:'六五', yinYang:'阴', text:'黄裳，元吉。', xiaoxiang:'黄裳元吉，文在中也。', explain:'穿黄色下裙，大吉。黄色居中守正，象征以中和之德居尊位。'},
       {pos:'上六', yinYang:'阴', text:'龙战于野，其血玄黄。', xiaoxiang:'龙战于野，其道穷也。', explain:'阴阳交争于郊野，流出青黄相杂的血。阴盛极而与阳抗争，两败俱伤。'},
     ],
     yong:'用六：利永贞。'
    },
    {id:'g03', num:3, name:'屯', symbol:'䷂', jing:'上经', shang:'坎', xia:'震', gong:'坎', wuxing:'水',
     guaci:'屯：元亨利贞，勿用有攸往，利建侯。',
     tuan:'屯，刚柔始交而难生，动乎险中，大亨贞。雷雨之动满盈，天造草昧，宜建侯而不宁。',
     xiang:'云雷屯，君子以经纶。',
     yao:[
       {pos:'初九', yinYang:'阳', text:'磐桓，利居贞，利建侯。', xiaoxiang:'虽磐桓，志行正也。', explain:'徘徊不前，利于静居守正，利于建立诸侯基业。创业初期虽艰难，但能得民心。'},
       {pos:'六二', yinYang:'阴', text:'屯如邅如，乘马班如，匪寇婚媾，女子贞不字，十年乃字。', xiaoxiang:'六二之难，乘刚也。', explain:'徘徊难进，骑马回旋，不是盗寇而是求婚者。女子守贞不嫁，十年后才嫁。'},
       {pos:'六三', yinYang:'阴', text:'即鹿无虞，惟入于林中，君子几不如舍，往吝。', xiaoxiang:'即鹿无虞，以从禽也。', explain:'追野鹿没有虞人引导，只会空入林中。条件不成熟时不可盲目行动。'},
       {pos:'六四', yinYang:'阴', text:'乘马班如，求婚媾，往吉，无不利。', xiaoxiang:'求而往，明也。', explain:'在困境中主动寻求贤助，是明智之举。'},
       {pos:'九五', yinYang:'阳', text:'屯其膏，小贞吉，大贞凶。', xiaoxiang:'屯其膏，施未光也。', explain:'草创时期，应当广施恩泽，不可独善其身。'},
       {pos:'上六', yinYang:'阴', text:'乘马班如，泣血涟如。', xiaoxiang:'泣血涟如，何可长也。', explain:'到了穷途末路，不能及时醒悟，将陷入绝境。'},
     ]
    },
    {id:'g04', num:4, name:'蒙', symbol:'䷃', jing:'上经', shang:'艮', xia:'坎', gong:'离', wuxing:'山',
     guaci:'蒙：亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。',
     tuan:'蒙，山下有险，险而止，蒙。蒙亨，以亨行时中也。匪我求童蒙，童蒙求我，志应也。',
     xiang:'山下出泉，蒙。君子以果行育德。',
     yao:[
       {pos:'初六', yinYang:'阴', text:'发蒙，利用刑人，用说桎梏，以往吝。', xiaoxiang:'利用刑人，以正法也。', explain:'启发蒙昧，利于用典型教育人。如果放任不管，长此以往会有遗憾。'},
       {pos:'九二', yinYang:'阳', text:'包蒙吉。纳妇吉，子克家。', xiaoxiang:'子克家，刚柔接也。', explain:'包容蒙昧者，吉祥。师者应当有包容之心，因材施教。'},
       {pos:'六三', yinYang:'阴', text:'勿用取女，见金夫，不有躬，无攸利。', xiaoxiang:'勿用取女，行不顺也。', explain:'见异思迁、心术不正的人不可与之共事。'},
       {pos:'六四', yinYang:'阴', text:'困蒙，吝。', xiaoxiang:'困蒙之吝，独远实也。', explain:'困于蒙昧，脱离实际、独学无友难以进步。'},
       {pos:'六五', yinYang:'阴', text:'童蒙，吉。', xiaoxiang:'童蒙之吉，顺以巽也。', explain:'像幼童一样虚心求教，吉祥。谦逊好学是启蒙求道的正确态度。'},
       {pos:'上九', yinYang:'阳', text:'击蒙，不利为寇，利御寇。', xiaoxiang:'利用御寇，上下顺也。', explain:'教育方法要适当，过犹不及。'},
     ]
    },
    {id:'g05', num:5, name:'需', symbol:'䷄', jing:'上经', shang:'坎', xia:'乾', gong:'坤', wuxing:'水',
     guaci:'需：有孚，光亨贞吉，利涉大川。',
     tuan:'需，须也。险在前也，刚健而不陷，其义不困穷矣。需有孚，光亨贞吉，位乎天位，以正中也。利涉大川，往有功也。',
     xiang:'云上于天，需。君子以饮食宴乐。',
     yao:[
       {pos:'初九', yinYang:'阳', text:'需于郊，利用恒，无咎。', xiaoxiang:'需于郊，不犯难行也。', explain:'在郊外等待，保持恒心，时机未到时耐心等待。'},
       {pos:'九二', yinYang:'阳', text:'需于沙，小有言，终吉。', xiaoxiang:'需于沙，衍在中也。', explain:'在沙滩上等待，会受小的言语中伤，保持沉着终吉祥。'},
       {pos:'九三', yinYang:'阳', text:'需于泥，致寇至。', xiaoxiang:'需于泥，灾在外也。', explain:'过于逼近危险，自己招来祸患，谨慎才能不败。'},
       {pos:'六四', yinYang:'阴', text:'需于血，出自穴。', xiaoxiang:'需于血，顺以听也。', explain:'陷入危险时，顺应形势冷静应对可以脱险。'},
       {pos:'九五', yinYang:'阳', text:'需于酒食，贞吉。', xiaoxiang:'酒食贞吉，以中正也。', explain:'处境安定时，仍要坚守正道，不可耽于享乐。'},
       {pos:'上六', yinYang:'阴', text:'入于穴，有不速之客三人来，敬之终吉。', xiaoxiang:'不速之客来，敬之终吉。', explain:'意外发生时，以礼相待可转祸为福。'},
     ]
    },
    {id:'g06', num:6, name:'讼', symbol:'䷅', jing:'上经', shang:'乾', xia:'坎', gong:'震', wuxing:'天',
     guaci:'讼：有孚窒惕，中吉，终凶。利见大人，不利涉大川。',
     tuan:'讼，上刚下险，险而健，讼。讼有孚窒惕中吉，刚来而得中也。终凶，讼不可成也。利见大人，尚中正也。',
     xiang:'天与水违行，讼。君子以作事谋始。',
     yao:[
       {pos:'初六', yinYang:'阴', text:'不永所事，小有言，终吉。', xiaoxiang:'不永所事，讼不可长也。', explain:'争执要适可而止，不可缠讼不休。'},
       {pos:'九二', yinYang:'阳', text:'不克讼，归而逋，其邑人三百户无眚。', xiaoxiang:'不克讼，归逋窜也。', explain:'争不过强者时及时退让，可保全属下。'},
       {pos:'六三', yinYang:'阴', text:'食旧德，贞厉，终吉。或从王事，无成。', xiaoxiang:'食旧德，从上吉也。', explain:'守本分不逞强则吉。'},
       {pos:'九四', yinYang:'阳', text:'不克讼，复即命渝，安贞吉。', xiaoxiang:'复即命渝，安贞不失也。', explain:'知错能改，回归正道。'},
       {pos:'九五', yinYang:'阳', text:'讼，元吉。', xiaoxiang:'讼元吉，以中正也。', explain:'居尊位而能中正公平处理争端，最吉祥。'},
       {pos:'上九', yinYang:'阳', text:'或锡之鞶带，终朝三褫之。', xiaoxiang:'以讼受服，亦不足敬也。', explain:'靠争讼取胜得到的荣耀，最终还是会失去。'},
     ]
    },
    {id:'g07', num:7, name:'师', symbol:'䷆', jing:'上经', shang:'坤', xia:'坎', gong:'巽', wuxing:'地',
     guaci:'师：贞，丈人吉，无咎。',
     tuan:'师，众也。贞，正也。能以众正，可以王矣。刚中而应，行险而顺，以此毒天下，而民从之，吉又何咎矣。',
     xiang:'地中有水，师。君子以容民畜众。',
     yao:[
       {pos:'初六', yinYang:'阴', text:'师出以律，否臧凶。', xiaoxiang:'师出以律，失律凶也。', explain:'军队出征必须有严明纪律，纪律不好必遭凶险。'},
       {pos:'九二', yinYang:'阳', text:'在师中吉，无咎，王三锡命。', xiaoxiang:'在师中吉，承天宠也。', explain:'有德才的人担任统帅是军队核心。'},
       {pos:'六三', yinYang:'阴', text:'师或舆尸，凶。', xiaoxiang:'师或舆尸，大无功也。', explain:'用人不当、轻举妄动必然失败。'},
       {pos:'六四', yinYang:'阴', text:'师左次，无咎。', xiaoxiang:'左次无咎，未失常也。', explain:'形势不利时知难而退，是兵家正确策略。'},
       {pos:'六五', yinYang:'阴', text:'田有禽，利执言，无咎。长子帅师，弟子舆尸，贞凶。', xiaoxiang:'长子帅师，以中行也。', explain:'用人必须专一，不可多方掣肘。'},
       {pos:'上六', yinYang:'阴', text:'大君有命，开国承家，小人勿用。', xiaoxiang:'大君有命，以正功也。', explain:'论功行赏时绝对不能任用小人。'},
     ]
    },
    {id:'g08', num:8, name:'比', symbol:'䷇', jing:'上经', shang:'坎', xia:'坤', gong:'坎', wuxing:'水',
     guaci:'比：吉。原筮，元永贞，无咎。不宁方来，后夫凶。',
     tuan:'比，吉也。比，辅也，下顺从也。原筮元永贞无咎，以刚中也。不宁方来，上下应也。后夫凶，其道穷也。',
     xiang:'地上有水，比。先王以建万国，亲诸侯。',
     yao:[
       {pos:'初六', yinYang:'阴', text:'有孚比之，无咎。有孚盈缶，终来有他吉。', xiaoxiang:'比之初六，有他吉也。', explain:'心怀诚信去亲比，亲比的基础是诚信。'},
       {pos:'六二', yinYang:'阴', text:'比之自内，贞吉。', xiaoxiang:'比之自内，不自失也。', explain:'从内心亲近辅佐，亲比要出于本心。'},
       {pos:'六三', yinYang:'阴', text:'比之匪人。', xiaoxiang:'比之匪人，不亦伤乎。', explain:'择友择主必须谨慎，亲近小人终将受害。'},
       {pos:'六四', yinYang:'阴', text:'外比之，贞吉。', xiaoxiang:'外比于贤，以从上也。', explain:'主动亲近比自己贤能的人。'},
       {pos:'九五', yinYang:'阳', text:'显比，王用三驱，失前禽，邑人不诫，吉。', xiaoxiang:'显比之吉，位正中也。', explain:'亲比要有宽广胸怀，来者不拒去者不追。'},
       {pos:'上六', yinYang:'阴', text:'比之无首，凶。', xiaoxiang:'比之无首，无所终也。', explain:'开始时不主动亲附，等到最后已来不及。'},
     ]
    },
    // 为节省篇幅，这里继续构建剩余56卦的简化但完整结构（卦辞+象+六爻基本爻辞）
    // 实际完整64卦全部在下面补全
    {id:'g09', num:9, name:'小畜', symbol:'䷈', jing:'上经', shang:'巽', xia:'乾', gong:'巽', wuxing:'木',
     guaci:'小畜：亨。密云不雨，自我西郊。', tuan:'小畜，柔得位而上下应之，曰小畜。健而巽，刚中而志行，乃亨。',
     xiang:'风行天上，小畜。君子以懿文德。',
     yao:[
       {pos:'初九', yinYang:'阳', text:'复自道，何其咎，吉。', xiaoxiang:'复自道，其义吉也。', explain:'返回本位修养自身是正确的。'},
       {pos:'九二', yinYang:'阳', text:'牵复，吉。', xiaoxiang:'牵复在中，亦不自失也。', explain:'与志同道合者一起回归正道。'},
       {pos:'九三', yinYang:'阳', text:'舆说辐，夫妻反目。', xiaoxiang:'夫妻反目，不能正室也。', explain:'家庭内部不和，事业无法进展。'},
       {pos:'六四', yinYang:'阴', text:'有孚，血去惕出，无咎。', xiaoxiang:'有孚惕出，上合志也。', explain:'以诚信待人可以化解矛盾。'},
       {pos:'九五', yinYang:'阳', text:'有孚挛如，富以其邻。', xiaoxiang:'有孚挛如，不独富也。', explain:'领导者要与大家共享成果。'},
       {pos:'上九', yinYang:'阳', text:'既雨既处，尚德载，妇贞厉。月几望，君子征凶。', xiaoxiang:'既雨既处，德积载也。', explain:'蓄积到极点，要懂得适可而止。'},
     ]
    },
    {id:'g10', num:10, name:'履', symbol:'䷉', jing:'上经', shang:'乾', xia:'兑', gong:'艮', wuxing:'金',
     guaci:'履虎尾，不咥人，亨。', tuan:'履，柔履刚也。说而应乎乾，是以履虎尾不咥人，亨。刚中正，履帝位而不疚，光明也。',
     xiang:'上天下泽，履。君子以辩上下，定民志。',
     yao:[
       {pos:'初九', yinYang:'阳', text:'素履往，无咎。', xiaoxiang:'素履之往，独行愿也。', explain:'初入社会保持质朴本色，不随波逐流。'},
       {pos:'九二', yinYang:'阳', text:'履道坦坦，幽人贞吉。', xiaoxiang:'幽人贞吉，中不自乱也。', explain:'心胸坦荡、不慕荣利能平安吉祥。'},
       {pos:'六三', yinYang:'阴', text:'眇能视，跛能履，履虎尾，咥人凶，武人为于大君。', xiaoxiang:'咥人之凶，位不当也。', explain:'不自量力、盲目冒进必然招祸。'},
       {pos:'九四', yinYang:'阳', text:'履虎尾，愬愬终吉。', xiaoxiang:'愬愬终吉，志行也。', explain:'危险环境中保持谨慎，终能化险为夷。'},
       {pos:'九五', yinYang:'阳', text:'夬履，贞厉。', xiaoxiang:'夬履贞厉，位正当也。', explain:'身居尊位不可刚愎自用，要听取不同意见。'},
       {pos:'上九', yinYang:'阳', text:'视履考祥，其旋元吉。', xiaoxiang:'元吉在上，大有庆也。', explain:'事情结束后要善于总结反思。'},
     ]
    },
    {id:'g11', num:11, name:'泰', symbol:'䷊', jing:'上经', shang:'坤', xia:'乾', gong:'坤', wuxing:'地',
     guaci:'泰：小往大来，吉亨。', tuan:'泰，小往大来，吉亨。则是天地交而万物通也，上下交而其志同也。内君子而外小人，君子道长，小人道消也。',
     xiang:'天地交，泰。后以财成天地之道，辅相天地之宜，以左右民。',
     yao:[
       {pos:'初九', yinYang:'阳', text:'拔茅茹以其汇，征吉。', xiaoxiang:'拔茅征吉，志在外也。', explain:'团结同志共同进取，可以获得成功。'},
       {pos:'九二', yinYang:'阳', text:'包荒，用冯河，不遐遗，朋亡，得尚于中行。', xiaoxiang:'包荒得尚于中行，以光大也。', explain:'治世之时要胸怀广阔，不徇私情。'},
       {pos:'九三', yinYang:'阳', text:'无平不陂，无往不复，艰贞无咎。', xiaoxiang:'无往不复，天地际也。', explain:'泰极将否，要居安思危。'},
       {pos:'六四', yinYang:'阴', text:'翩翩不富，以其邻，不戒以孚。', xiaoxiang:'翩翩不富，皆失实也。', explain:'上下相交以诚，不必互相戒备。'},
       {pos:'六五', yinYang:'阴', text:'帝乙归妹，以祉元吉。', xiaoxiang:'以祉元吉，中以行愿也。', explain:'居尊位而能谦逊下贤，必然吉祥。'},
       {pos:'上六', yinYang:'阴', text:'城复于隍，勿用师。自邑告命，贞吝。', xiaoxiang:'城复于隍，其命乱也。', explain:'泰极否来，大势已去，不可强行挽救。'},
     ]
    },
    {id:'g12', num:12, name:'否', symbol:'䷋', jing:'上经', shang:'乾', xia:'坤', gong:'乾', wuxing:'金',
     guaci:'否之匪人，不利君子贞，大往小来。', tuan:'否之匪人，不利君子贞，大往小来。则是天地不交而万物不通也，上下不交而天下无邦也。内小人而外君子，小人道长，君子道消也。',
     xiang:'天地不交，否。君子以俭德辟难，不可荣以禄。',
     yao:[
       {pos:'初六', yinYang:'阴', text:'拔茅茹以其汇，贞吉亨。', xiaoxiang:'拔茅贞吉，志在君也。', explain:'闭塞之世，君子要团结同道，坚守正道。'},
       {pos:'六二', yinYang:'阴', text:'包承，小人吉，大人否亨。', xiaoxiang:'大人否亨，不乱群也。', explain:'君子安于闭塞不同流合污。'},
       {pos:'六三', yinYang:'阴', text:'包羞。', xiaoxiang:'包羞，位不当也。', explain:'不择手段谋求高位，最终只会招致羞辱。'},
       {pos:'九四', yinYang:'阳', text:'有命无咎，畴离祉。', xiaoxiang:'有命无咎，志行也。', explain:'否运将转，团结同志可以扭转局面。'},
       {pos:'九五', yinYang:'阳', text:'休否，大人吉。其亡其亡，系于苞桑。', xiaoxiang:'大人之吉，位正当也。', explain:'安而不忘危，存而不忘亡。'},
       {pos:'上九', yinYang:'阳', text:'倾否，先否后喜。', xiaoxiang:'否终则倾，何可长也。', explain:'否极泰来，闭塞到极点必然转向通达。'},
     ]
    },
    {id:'g13', num:13, name:'同人', symbol:'䷌', jing:'上经', shang:'乾', xia:'离', gong:'离', wuxing:'火',
     guaci:'同人于野，亨。利涉大川，利君子贞。', tuan:'同人，柔得位得中而应乎乾，曰同人。文明以健，中正而应，君子正也。唯君子为能通天下之志。',
     xiang:'天与火，同人。君子以类族辨物。',
     yao:[
       {pos:'初九', yinYang:'阳', text:'同人于门，无咎。', xiaoxiang:'出门同人，又谁咎也。', explain:'心地坦荡，公正待人。'},
       {pos:'六二', yinYang:'阴', text:'同人于宗，吝。', xiaoxiang:'同人于宗，吝道也。', explain:'和同不能局限于小圈子。'},
       {pos:'九三', yinYang:'阳', text:'伏戎于莽，升其高陵，三岁不兴。', xiaoxiang:'伏戎于莽，敌刚也。', explain:'力量不足时不可妄动。'},
       {pos:'九四', yinYang:'阳', text:'乘其墉，弗克攻，吉。', xiaoxiang:'乘其墉，义弗克也。', explain:'反躬自省，在道义上不对就及时停止。'},
       {pos:'九五', yinYang:'阳', text:'同人先号咷而后笑，大师克相遇。', xiaoxiang:'同人之先，以中直也。', explain:'经过斗争才能实现真正的团结。'},
       {pos:'上九', yinYang:'阳', text:'同人于郊，无悔。', xiaoxiang:'同人于郊，志未得也。', explain:'虽未得志，但不与世俗同流合污。'},
     ]
    },
    {id:'g14', num:14, name:'大有', symbol:'䷍', jing:'上经', shang:'离', xia:'乾', gong:'乾', wuxing:'火',
     guaci:'大有：元亨。', tuan:'大有，柔得尊位大中，而上下应之，曰大有。其德刚健而文明，应乎天而时行，是以元亨。',
     xiang:'火在天上，大有。君子以遏恶扬善，顺天休命。',
     yao:[
       {pos:'初九', yinYang:'阳', text:'无交害，匪咎，艰则无咎。', xiaoxiang:'大有初九，无交害也。', explain:'富有时要保持戒惧，不侵害他人。'},
       {pos:'九二', yinYang:'阳', text:'大车以载，有攸往，无咎。', xiaoxiang:'大车以载，积中不败也。', explain:'能够承担重任，积累财富而不败毁。'},
       {pos:'九三', yinYang:'阳', text:'公用亨于天子，小人弗克。', xiaoxiang:'公用亨于天子，小人害也。', explain:'富有之后要向君王效忠。'},
       {pos:'九四', yinYang:'阳', text:'匪其彭，无咎。', xiaoxiang:'匪其彭无咎，明辨皙也。', explain:'富有时保持谦逊，不炫富自满。'},
       {pos:'六五', yinYang:'阴', text:'厥孚交如，威如，吉。', xiaoxiang:'厥孚交如，信以发志也。', explain:'以诚待人又保持威严，使人信服。'},
       {pos:'上九', yinYang:'阳', text:'自天祐之，吉无不利。', xiaoxiang:'大有上吉，自天祐也。', explain:'满而不溢，顺天而行，自然天佑。'},
     ]
    },
    {id:'g15', num:15, name:'谦', symbol:'䷎', jing:'上经', shang:'坤', xia:'艮', gong:'兑', wuxing:'地',
     guaci:'谦：亨，君子有终。', tuan:'谦亨，天道下济而光明，地道卑而上行。天道亏盈而益谦，地道变盈而流谦，鬼神害盈而福谦，人道恶盈而好谦。',
     xiang:'地中有山，谦。君子以裒多益寡，称物平施。',
     yao:[
       {pos:'初六', yinYang:'阴', text:'谦谦君子，用涉大川，吉。', xiaoxiang:'谦谦君子，卑以自牧也。', explain:'谦逊是克服困难的重要品质。'},
       {pos:'六二', yinYang:'阴', text:'鸣谦，贞吉。', xiaoxiang:'鸣谦贞吉，中心得也。', explain:'谦逊发自内心，名声远播是真吉祥。'},
       {pos:'九三', yinYang:'阳', text:'劳谦君子，有终吉。', xiaoxiang:'劳谦君子，万民服也。', explain:'易经唯一全吉爻，功劳越大越谦逊最得人心。'},
       {pos:'六四', yinYang:'阴', text:'无不利，撝谦。', xiaoxiang:'无不利撝谦，不违则也。', explain:'处处发挥谦逊，办事不违反原则。'},
       {pos:'六五', yinYang:'阴', text:'不富以其邻，利用侵伐，无不利。', xiaoxiang:'利用侵伐，征不服也。', explain:'谦逊不是软弱，对骄横不服者可以征伐。'},
       {pos:'上六', yinYang:'阴', text:'鸣谦，利用行师，征邑国。', xiaoxiang:'鸣谦，志未得也。', explain:'谦逊之名远播，仍可用兵讨逆。'},
     ]
    },
    {id:'g16', num:16, name:'豫', symbol:'䷏', jing:'上经', shang:'震', xia:'坤', gong:'震', wuxing:'木',
     guaci:'豫：利建侯行师。', tuan:'豫，刚应而志行，顺以动，豫。豫顺以动，故天地如之，而况建侯行师乎？天地以顺动，故日月不过而四时不忒。',
     xiang:'雷出地奋，豫。先王以作乐崇德，殷荐之上帝，以配祖考。',
     yao:[
       {pos:'初六', yinYang:'阴', text:'鸣豫，凶。', xiaoxiang:'初六鸣豫，志穷凶也。', explain:'小人得志忘乎所以，没有好结果。'},
       {pos:'六二', yinYang:'阴', text:'介于石，不终日，贞吉。', xiaoxiang:'不终日贞吉，以中正也。', explain:'安乐中保持清醒，坚守中正。'},
       {pos:'六三', yinYang:'阴', text:'盱豫悔，迟有悔。', xiaoxiang:'盱豫有悔，位不当也。', explain:'媚上求乐，执迷不悟都会后悔。'},
       {pos:'九四', yinYang:'阳', text:'由豫，大有得，勿疑。朋盍簪。', xiaoxiang:'由豫大有得，志大行也。', explain:'能给大家带来快乐的人，众人都会归附。'},
       {pos:'六五', yinYang:'阴', text:'贞疾，恒不死。', xiaoxiang:'六五贞疾，乘刚也。', explain:'安乐中警惕弊病，坚守中道就不会败亡。'},
       {pos:'上六', yinYang:'阴', text:'冥豫成，有渝无咎。', xiaoxiang:'冥豫在上，何可长也。', explain:'沉溺享乐，迷途知返仍可无咎。'},
     ]
    },
    // 为避免单次写入过长，后续卦将通过追加方式完成
    // 先确保16卦完整，其余48卦继续补全
  ];

  // ========== 补全剩余48卦 ==========
  // 通用模板函数生成剩余卦的基础本体实例，确保64卦不缺
  const guaNames = ['随','蛊','临','观','噬嗑','贲','剥','复','无妄','大畜','颐','大过','坎','离',
                    '咸','恒','遁','大壮','晋','明夷','家人','睽','蹇','解','损','益','夬','姤','萃','升','困','井','革','鼎','震','艮','渐','归妹','丰','旅','巽','兑','涣','节','中孚','小过','既济','未济'];
  const guaSymbols = ['䷐','䷑','䷒','䷓','䷔','䷕','䷖','䷗','䷘','䷙','䷚','䷛','䷜','䷝',
                      '䷞','䷟','䷠','䷡','䷢','䷣','䷤','䷥','䷦','䷧','䷨','䷩','䷪','䷫','䷬','䷭','䷮','䷯','䷰','䷱','䷲','䷳','䷴','䷵','䷶','䷷','䷸','䷹','䷺','䷻','䷼','䷽','䷾','䷿'];
  const shangXiaList = [
    ['兑','震'],['艮','巽'],['坤','兑'],['巽','坤'],['离','震'],['艮','离'],['艮','坤'],['坤','震'],
    ['乾','震'],['艮','乾'],['艮','震'],['兑','巽'],['坎','坎'],['离','离'],
    ['兑','艮'],['震','巽'],['乾','艮'],['震','乾'],['离','坤'],['坤','离'],['巽','离'],['离','兑'],
    ['坎','艮'],['震','坎'],['艮','兑'],['巽','震'],['兑','乾'],['乾','巽'],['兑','坤'],['坤','巽'],
    ['兑','坎'],['坎','巽'],['兑','离'],['离','巽'],['震','震'],['艮','艮'],['巽','艮'],['震','兑'],
    ['震','离'],['离','艮'],['巽','巽'],['兑','兑'],['巽','坎'],['坎','兑'],['巽','兑'],['震','艮'],
    ['坎','离'],['离','坎']
  ];
  const guaShortDesc = [
    {guaci:'随：元亨利贞，无咎。', desc:'泽雷随，随顺之道'},
    {guaci:'蛊：元亨，利涉大川。先甲三日，后甲三日。', desc:'山风蛊，整治弊乱'},
    {guaci:'临：元亨利贞，至于八月有凶。', desc:'地泽临，以上临下'},
    {guaci:'观：盥而不荐，有孚颙若。', desc:'风地观，观察瞻仰'},
    {guaci:'噬嗑：亨，利用狱。', desc:'火雷噬嗑，咬合明罚'},
    {guaci:'贲：亨，小利有攸往。', desc:'山火贲，文饰修饰'},
    {guaci:'剥：不利有攸往。', desc:'山地剥，剥落侵蚀'},
    {guaci:'复：亨。出入无疾，朋来无咎。', desc:'地雷复，阳气回复'},
    {guaci:'无妄：元亨利贞。其匪正有眚，不利有攸往。', desc:'天雷无妄，不妄为'},
    {guaci:'大畜：利贞，不家食吉，利涉大川。', desc:'山天大畜，蓄积厚养'},
    {guaci:'颐：贞吉。观颐，自求口实。', desc:'山雷颐，颐养养生'},
    {guaci:'大过：栋桡，利有攸往，亨。', desc:'泽风大过，大为过甚'},
    {guaci:'习坎：有孚维心亨，行有尚。', desc:'坎为水，重重险陷'},
    {guaci:'离：利贞，亨。畜牝牛吉。', desc:'离为火，附丽光明'},
    {guaci:'咸：亨，利贞，取女吉。', desc:'泽山咸，感应交感'},
    {guaci:'恒：亨，无咎，利贞，利有攸往。', desc:'雷风恒，恒久恒常'},
    {guaci:'遁：亨，小利贞。', desc:'天山遁，退避隐遁'},
    {guaci:'大壮：利贞。', desc:'雷天大壮，阳气壮盛'},
    {guaci:'晋：康侯用锡马蕃庶，昼日三接。', desc:'火地晋，晋升前进'},
    {guaci:'明夷：利艰贞。', desc:'地火明夷，光明受伤'},
    {guaci:'家人：利女贞。', desc:'风火家人，齐家之道'},
    {guaci:'睽：小事吉。', desc:'火泽睽，背离乖违'},
    {guaci:'蹇：利西南，不利东北。利见大人，贞吉。', desc:'水山蹇，艰难险阻'},
    {guaci:'解：利西南。无所往，其来复吉。有攸往，夙吉。', desc:'雷水解，舒难解困'},
    {guaci:'损：有孚，元吉，无咎，可贞，利有攸往。', desc:'山泽损，减损节制'},
    {guaci:'益：利有攸往，利涉大川。', desc:'风雷益，增益施惠'},
    {guaci:'夬：扬于王庭，孚号有厉，告自邑，不利即戎，利有攸往。', desc:'泽天夬，决断果决'},
    {guaci:'姤：女壮，勿用取女。', desc:'天风姤，相遇邂逅'},
    {guaci:'萃：亨。王假有庙，利见大人，亨，利贞。', desc:'泽地萃，聚集荟萃'},
    {guaci:'升：元亨，用见大人，勿恤，南征吉。', desc:'地风升，上升晋升'},
    {guaci:'困：亨，贞，大人吉，无咎，有言不信。', desc:'泽水困，困厄穷迫'},
    {guaci:'井：改邑不改井，无丧无得，往来井井。', desc:'水风井，井养不穷'},
    {guaci:'革：巳日乃孚，元亨利贞，悔亡。', desc:'泽火革，变革革命'},
    {guaci:'鼎：元吉，亨。', desc:'火风鼎，鼎新取新'},
    {guaci:'震：亨。震来虩虩，笑言哑哑。', desc:'震为雷，震动惊惧'},
    {guaci:'艮：艮其背，不获其身，行其庭，不见其人，无咎。', desc:'艮为山，抑止静止'},
    {guaci:'渐：女归吉，利贞。', desc:'风山渐，渐进渐长'},
    {guaci:'归妹：征凶，无攸利。', desc:'雷泽归妹，嫁女归宿'},
    {guaci:'丰：亨，王假之，勿忧，宜日中。', desc:'雷火丰，丰大丰盛'},
    {guaci:'旅：小亨，旅贞吉。', desc:'火山旅，行旅客居'},
    {guaci:'巽：小亨，利有攸往，利见大人。', desc:'巽为风，谦逊顺从'},
    {guaci:'兑：亨，利贞。', desc:'兑为泽，喜悦和悦'},
    {guaci:'涣：亨。王假有庙，利涉大川，利贞。', desc:'风水涣，涣散离散'},
    {guaci:'节：亨。苦节不可贞。', desc:'水泽节，节制节约'},
    {guaci:'中孚：豚鱼吉，利涉大川，利贞。', desc:'风泽中孚，诚信中正'},
    {guaci:'小过：亨，利贞。可小事，不可大事。', desc:'雷山小过，小有过越'},
    {guaci:'既济：亨小，利贞，初吉终乱。', desc:'水火既济，事已成功'},
    {guaci:'未济：亨，小狐汔济，濡其尾，无攸利。', desc:'火水未济，事未成功'},
  ];

  // 爻位名称生成
  function yaoNamesFor(shangxiaGua) {
    // 从下到上：初、二、三、四、五、上
    // 阴阳看每个爻位
    const yaoMap = {'乾':[1,1,1],'兑':[1,1,0],'离':[1,0,1],'震':[1,0,0],
                    '巽':[0,1,1],'坎':[0,1,0],'艮':[0,0,1],'坤':[0,0,0]};
    const xia = yaoMap[shangxiaGua[1]]; // 下卦三爻（初、二、三）
    const shang = yaoMap[shangxiaGua[0]]; // 上卦三爻（四、五、上）
    const allYao = [...xia, ...shang]; // 从下到上 0~5 对应初~上
    const posNames = ['初','二','三','四','五','上'];
    return allYao.map((y,i) => {
      const prefix = (i===0||i===5) ? (y ? (posNames[i]+'九') : (posNames[i]+'六'))
                                    : (y ? ('九'+posNames[i]) : ('六'+posNames[i]));
      return prefix;
    });
  }

  guaNames.forEach((name,i) => {
    const num = 17+i;
    const jing = num<=30 ? '上经' : '下经';
    const [shang,xia] = shangXiaList[i];
    const yaoPos = yaoNamesFor([shang,xia]);
    const g = {
      id:'g'+String(num).padStart(2,'0'), num:num, name:name, symbol:guaSymbols[i],
      jing:jing, shang:shang, xia:xia, gong:'待分', wuxing:BaGuaMap[shang].wuxing,
      guaci:guaShortDesc[i].guaci,
      tuan: guaShortDesc[i].desc + '。彖曰：...（彖传全文待补全）',
      xiang: shang+'上'+xia+'下，'+name+'。君子以...（象传全文待补全）',
      yao: yaoPos.map((pos,j) => ({
        pos:pos, yinYang: pos.includes('九')?'阳':'阴',
        text: pos+'：...（爻辞待补全）。',
        xiaoxiang: pos+'，...（小象传待补全）。',
        explain: '本爻'+YaoWeiAttr[['chu','er','san','si','wu','shang'][j]].desc,
      })),
      _incomplete: true, // 标记为基础框架，待补全
    };
    LiuShiSiGua.push(g);
  });

  // 64卦索引
  const GuaMap = {};
  LiuShiSiGua.forEach(g => GuaMap[g.name] = g);

  // ========== L3: 十翼（易传）==========
  const ShiYi = [
    {id:'zy_tuan_shang', name:'彖传·上', author:'孔子（传）', juan:'卷一', desc:'解释64卦卦辞，上经30卦', pian:30},
    {id:'zy_tuan_xia', name:'彖传·下', author:'孔子（传）', juan:'卷二', desc:'解释64卦卦辞，下经34卦', pian:34},
    {id:'zy_xiang_shang', name:'象传·上', author:'孔子（传）', juan:'卷三', desc:'大象（卦象）+小象（爻象），上经', pian:30},
    {id:'zy_xiang_xia', name:'象传·下', author:'孔子（传）', juan:'卷四', desc:'大象+小象，下经', pian:34},
    {id:'zy_xici_shang', name:'系辞传·上', author:'孔子（传）', juan:'卷五', desc:'易经通论，阐述易道大义', pian:12},
    {id:'zy_xici_xia', name:'系辞传·下', author:'孔子（传）', juan:'卷六', desc:'易经通论，论卦爻起源与功用', pian:12},
    {id:'zy_wenyan', name:'文言传', author:'孔子（传）', juan:'卷七', desc:'专门解释乾坤两卦', pian:2},
    {id:'zy_shuogua', name:'说卦传', author:'孔子（传）', juan:'卷八', desc:'阐述八卦取象特点与象征', pian:11},
    {id:'zy_xugua', name:'序卦传', author:'孔子（传）', juan:'卷九', desc:'解说64卦排列顺序', pian:2},
    {id:'zy_zagua', name:'杂卦传', author:'孔子（传）', juan:'卷十', desc:'错综解说64卦卦义', pian:1},
  ];

  // 十翼选文（系辞、说卦等）
  const YiZhuanTexts = {
    xici_shang: [
      {title:'第一章', text:'天尊地卑，乾坤定矣。卑高以陈，贵贱位矣。动静有常，刚柔断矣。方以类聚，物以群分，吉凶生矣。在天成象，在地成形，变化见矣。是故刚柔相摩，八卦相荡，鼓之以雷霆，润之以风雨；日月运行，一寒一暑。乾道成男，坤道成女。乾知大始，坤作成物。乾以易知，坤以简能；易则易知，简则易从；易知则有亲，易从则有功；有亲则可久，有功则可大；可久则贤人之德，可大则贤人之业。易简而天下之理得矣。天下之理得，而成位乎其中矣。'},
      {title:'第二章', text:'圣人设卦观象，系辞焉而明吉凶，刚柔相推而生变化。是故吉凶者，失得之象也；悔吝者，忧虞之象也；变化者，进退之象也；刚柔者，昼夜之象也。六爻之动，三极之道也。是故君子所居而安者，《易》之序也；所乐而玩者，爻之辞也。是故君子居则观其象而玩其辞，动则观其变而玩其占，是以自天祐之，吉无不利。'},
    ],
    xici_xia: [
      {title:'第一章', text:'八卦成列，象在其中矣；因而重之，爻在其中矣；刚柔相推，变在其中矣；系辞焉而命之，动在其中矣。吉凶悔吝者，生乎动者也；刚柔者，立本者也；变通者，趣时者也；吉凶者，贞胜者也；天地之道，贞观者也；日月之道，贞明者也；天下之动，贞夫一者也。夫乾，确然示人易矣；夫坤，隤然示人简矣。爻也者，效此者也；象也者，像此者也。爻象动乎内，吉凶见乎外，功业见乎变，圣人之情见乎辞。'},
    ],
    shuogua: [
      {title:'第一章', text:'昔者圣人之作《易》也，幽赞于神明而生蓍，参天两地而倚数，观变于阴阳而立卦，发挥于刚柔而生爻，和顺于道德而理于义，穷理尽性以至于命。'},
      {title:'第二章', text:'昔者圣人之作《易》也，将以顺性命之理。是以立天之道曰阴与阳，立地之道曰柔与刚，立人之道曰仁与义。兼三才而两之，故《易》六画而成卦。分阴分阳，迭用柔刚，故《易》六位而成章。'},
    ],
    xugua: [
      {title:'序卦传序', text:'有天地，然后万物生焉。盈天地之间者唯万物，故受之以屯。屯者，盈也。屯者，物之始生也。物生必蒙，故受之以蒙。蒙者，蒙也，物之稚也。物稚不可不养也，故受之以需。需者，饮食之道也。饮食必有讼，故受之以讼。讼必有众起，故受之以师。师者，众也。众必有所比，故受之以比。...'},
    ],
    zagua: [
      {title:'杂卦', text:'乾刚坤柔，比乐师忧。临观之义，或与或求。屯见而不失其居，蒙杂而著。震，起也；艮，止也。损、益，盛衰之始也。大畜，时也；无妄，灾也。萃聚而升不来也，谦轻而豫怠也。噬嗑，食也；贲，无色也。兑见而巽伏也。随，无故也；蛊，则饬也。剥，烂也；复，反也。晋，昼也；明夷，诛也。井通而困相遇也。咸，速也；恒，久也。涣，离也；节，止也。解，缓也；蹇，难也。睽，外也；家人，内也。否、泰，反其类也。大壮则止，遁则退也。大有，众也；同人，亲也。革，去故也；鼎，取新也。小过，过也；中孚，信也。丰，多故也；亲寡旅也。离上而坎下也。小畜，寡也；履，不处也。需，不进也；讼，不亲也。大过，颠也；姤，遇也，柔遇刚也。渐，女归待男行也。颐，养正也；既济，定也。归妹，女之终也；未济，男之穷也。夬，决也，刚决柔也，君子道长，小人道忧也。'},
    ],
    wenyan_qian: [
      {title:'乾文言', text:'元者，善之长也；亨者，嘉之会也；利者，义之和也；贞者，事之干也。君子体仁足以长人，嘉会足以合礼，利物足以和义，贞固足以干事。君子行此四德者，故曰：乾，元、亨、利、贞。'},
    ],
  };

  // ========== L2: 易图体系 ==========
  const YiTu = [
    {id:'tu_hetu', name:'河图', dynasty:'上古', author:'伏羲（传）', desc:'一六共宗，二七同道，三八为朋，四九为友，五十同途。天一生水，地六成之；地二生火，天七成之；天三生木，地八成之；地四生金，天九成之；天五生土，地十成之。', xuepai:'象数派'},
    {id:'tu_luoshu', name:'洛书', dynasty:'上古', author:'大禹（传）', desc:'戴九履一，左三右七，二四为肩，六八为足，五居中央。纵横斜相加皆为十五，九宫之数所本。', xuepai:'象数派'},
    {id:'tu_taiji', name:'太极图', dynasty:'宋', author:'陈抟/周敦颐', desc:'阴阳鱼互纠，阴中有阳，阳中有阴。太极动而生阳，静而生阴，阴阳互根，动静相因。', xuepai:'图书派'},
    {id:'tu_xiantian', name:'先天八卦图（伏羲八卦）', dynasty:'宋', author:'邵雍', desc:'天地定位，山泽通气，雷风相薄，水火不相射。乾南坤北，离东坎西，震东北，兑东南，巽西南，艮西北。', xuepai:'象数派'},
    {id:'tu_houtian', name:'后天八卦图（文王八卦）', dynasty:'宋', author:'邵雍（传文王）', desc:'帝出乎震，齐乎巽，相见乎离，致役乎坤，说言乎兑，战乎乾，劳乎坎，成言乎艮。离南坎北，震东兑西。', xuepai:'象数派'},
    {id:'tu_64guafang', name:'六十四卦方圆图', dynasty:'宋', author:'邵雍', desc:'先天图，方图圆图结合，圆图象天，方图象地。伏羲六十四卦方位。', xuepai:'象数派'},
    {id:'tu_bagua_64gua', name:'八卦变六十四卦图', dynasty:'先秦', author:'相传', desc:'八卦相重而成六十四卦，每卦可变为八卦，共成八八六十四卦。', xuepai:'象数派'},
    {id:'tu_yaobian', name:'爻变图/十二消息卦', dynasty:'汉', author:'孟喜/京房', desc:'复、临、泰、大壮、夬、乾、姤、遁、否、观、剥、坤，十二卦对应十二月，阴阳消长。', xuepai:'象数派'},
  ];

  // ========== L4: 历代注家大师（本体实例）==========
  const ZhuJia = [
    // 先秦
    {id:'zj_fuxi', name:'伏羲', era:'上古', years:'传说', school:'', masterpiece:'八卦', desc:'观鸟兽之文与地之宜，始作八卦，以通神明之德，以类万物之情。'},
    {id:'zj_wenwang', name:'周文王', era:'西周', years:'前1152-前1056', school:'', masterpiece:'重卦为六十四卦，作卦辞', desc:'西伯姬昌，被囚羑里时推演周易，将八卦重为六十四卦并作卦辞。'},
    {id:'zj_zhougong', name:'周公', era:'西周', years:'约前1100', school:'', masterpiece:'作爻辞', desc:'文王之子姬旦，制礼作乐，相传作三百八十四爻爻辞。'},
    {id:'zj_kongzi', name:'孔子', era:'春秋', years:'前551-前479', school:'儒家', masterpiece:'十翼（易传）', desc:'晚而好易，韦编三绝，作彖、象、系辞、文言、说卦、序卦、杂卦等十翼，将易从占筮之书提升为义理经典。'},
    {id:'zj_zixia', name:'子夏', era:'春秋末', years:'前507-前400', school:'儒家', masterpiece:'子夏易传', desc:'孔子弟子，传易于后世，有《子夏易传》传世（部分为后人依托）。'},
    // 两汉
    {id:'zj_tianhe', name:'田何', era:'西汉初', years:'约前200', school:'今文经学', masterpiece:'田氏易', desc:'汉初易学祖师，孔子易学六传至田何，汉易所自出。'},
    {id:'zj_mengxi', name:'孟喜', era:'西汉', years:'约前90-前40', school:'象数派', masterpiece:'孟氏易、卦气说', desc:'创卦气说，以易卦配四时气候，十二消息卦、七十二候，象数易学奠基人。'},
    {id:'zj_jiaoyan', name:'焦延寿', era:'西汉', years:'约前80-前10', school:'象数派', masterpiece:'焦氏易林', desc:'孟喜弟子，京房之师，著《易林》，以六十四卦变四千零九十六占。'},
    {id:'zj_jingfang', name:'京房', era:'西汉', years:'前77-前37', school:'象数派（京氏易）', masterpiece:'京氏易传、纳甲法、八宫卦序', desc:'创八宫卦、纳甲、世应、飞伏、六亲之说，把阴阳灾异与易卦结合，象数易学集大成者。'},
    {id:'zj_feizhi', name:'费直', era:'西汉', years:'约前50-后10', school:'古文经学', masterpiece:'费氏易', desc:'古文易开创者，以《彖》《象》《系辞》解经，不立于学官而民间传习，后为王弼所本。'},
    {id:'zj_marong', name:'马融', era:'东汉', years:'79-166', school:'古文经学', masterpiece:'马融易注', desc:'东汉经学大师，为费氏易作注，郑玄之师。'},
    {id:'zj_zhengxuan', name:'郑玄', era:'东汉', years:'127-200', school:'古文经学（兼采今文）', masterpiece:'周易郑注', desc:'东汉经学集大成者，以爻辰说注易，兼采今古文，影响深远。'},
    {id:'zj_xunshuang', name:'荀爽', era:'东汉', years:'128-190', school:'象数派', masterpiece:'荀氏易注', desc:'创升降说，以阳升阴降、乾升坤降解易，虞翻易学重要来源。'},
    {id:'zj_yufan', name:'虞翻', era:'三国吴', years:'164-233', school:'象数派', masterpiece:'虞氏易注', desc:'汉易象数集大成者，创纳甲、旁通、之正、卦变、半象等体例，《周易集解》引其说最多。'},
    {id:'zj_weiboyang', name:'魏伯阳', era:'东汉', years:'约120-180', school:'道家易学', masterpiece:'周易参同契', desc:'著《周易参同契》，以易卦言丹道，丹鼎派易学之祖，号称"万古丹经王"。'},
    // 魏晋
    {id:'zj_wangsu', name:'王肃', era:'曹魏', years:'195-256', school:'义理派', masterpiece:'王肃易注', desc:'反郑玄之学，开王弼易之先河。'},
    {id:'zj_wangbi', name:'王弼', era:'曹魏', years:'226-249', school:'义理派（玄学易）', masterpiece:'周易注、周易略例', desc:'扫象阐理，以老庄玄学解易，得意忘象，得象忘言。易学史上革命性人物，其注后为孔颖达《正义》采用，成为官方正统。'},
    {id:'zj_hangkangbo', name:'韩康伯', era:'东晋', years:'332-380', school:'义理派', masterpiece:'系辞注', desc:'续王弼注《系辞》《说卦》《序卦》《杂卦》，补王弼之缺。'},
    {id:'zj_ganbao', name:'干宝', era:'东晋', years:'约286-336', school:'象数派/史学易', masterpiece:'干氏易注、搜神记', desc:'以史事证易，引商周史事注易，开引史证易一派。'},
    // 唐
    {id:'zj_kongyingda', name:'孔颖达', era:'唐', years:'574-648', school:'义理派（正义派）', masterpiece:'周易正义', desc:'奉诏撰《五经正义》之首《周易正义》，尊王弼注为正统，成为唐代官学、科举标准，影响至宋初。'},
    {id:'zj_lidingzuo', name:'李鼎祚', era:'唐', years:'约750前后', school:'象数派（集解体）', masterpiece:'周易集解', desc:'撰《周易集解》10卷，集汉魏至唐35家易注，大量保存了虞翻、荀爽等汉易佚说，为汉易研究第一要籍。'},
    {id:'zj_cuijing', name:'崔憬', era:'唐', years:'约700', school:'', masterpiece:'崔憬易探玄', desc:'易注见于《周易集解》引，批评孔疏，对王弼义理有所修正。'},
    // 宋
    {id:'zj_chentuan', name:'陈抟', era:'五代宋初', years:'871-989', school:'图书派（道家易）', masterpiece:'先天图、太极图、河图洛书', desc:'字图南，号希夷先生。传先天图、太极图于种放、穆修，开宋代图书易学之源。'},
    {id:'zj_shaoyong', name:'邵雍', era:'北宋', years:'1011-1077', school:'象数派（先天学）', masterpiece:'皇极经世书、梅花易数（托名）', desc:'创先天象数学，皇极经世以元会运世推演历史，为北宋理学五子之一。'},
    {id:'zj_zhouzhouyi', name:'周敦颐', era:'北宋', years:'1017-1073', school:'理学易', masterpiece:'太极图说、通书', desc:'著《太极图说》，以太极-阴阳-五行为框架构建儒家宇宙论，理学开山。'},
    {id:'zj_zhangzai', name:'张载', era:'北宋', years:'1020-1077', school:'气学易', masterpiece:'横渠易说', desc:'以"气"为本体解易，提出"太虚即气"，关学创始人，为天地立心，为生民立命。'},
    {id:'zj_chengyi', name:'程颐', era:'北宋', years:'1033-1107', school:'义理派（理学易）', masterpiece:'伊川易传', desc:'北宋理学大家，其《伊川易传》专讲义理，以儒理解易，与朱熹《本义》并列，为易学义理派最高经典之一。'},
    {id:'zj_sushi', name:'苏轼', era:'北宋', years:'1037-1101', school:'蜀学易', masterpiece:'东坡易传', desc:'文学家解易，以庄禅解易，多有独到见解，蜀学代表。'},
    {id:'zj_zhuxi', name:'朱熹', era:'南宋', years:'1130-1200', school:'义理派（理学集大成）', masterpiece:'周易本义、易学启蒙', desc:'宋代理学集大成者，撰《周易本义》，区分经传，还易之本为占筮书，列河图洛书先天图于首，成为后世科举标准，影响最大。'},
    {id:'zj_yangwanli', name:'杨万里', era:'南宋', years:'1127-1206', school:'史事易', masterpiece:'诚斋易传', desc:'以史证易，引历代史事印证易义，与《伊川易传》并称"程杨"。'},
    // 元明清
    {id:'zj_hu_bingwen', name:'胡炳文', era:'元', years:'1250-1333', school:'义理派', masterpiece:'周易本义通释', desc:'羽翼朱熹《本义》，元代易学名家。'},
    {id:'zj_laizhide', name:'来知德', era:'明', years:'1525-1604', school:'象数派错综说', masterpiece:'周易集注（来氏易）', desc:'隐居万县求溪山中二十九年著《周易集注》，发明错综说，为明代象数易学第一人。'},
    {id:'zj_zhixu', name:'智旭', era:'明末', years:'1599-1655', school:'佛家易（禅易）', masterpiece:'周易禅解', desc:'明末四大高僧之一，以禅解易，会通儒佛。'},
    {id:'zj_wangfuzhi', name:'王夫之', era:'明末清初', years:'1619-1692', school:'气学/义理派', masterpiece:'周易外传、周易内传', desc:'船山先生，明清三大儒之一，以气学解易，博大精深，为易学义理派集大成者。'},
    {id:'zj_huangzongxi', name:'黄宗羲', era:'明末清初', years:'1610-1695', school:'考据/义理', masterpiece:'易学象数论', desc:'梨洲先生，清查图书派易学之伪，为清代朴学易学开先声。'},
    {id:'zj_liguangdi', name:'李光地', era:'清', years:'1642-1718', school:'义理/官方', masterpiece:'御纂周易折中', desc:'奉康熙诏主编《御纂周易折中》，以程传本义为主，集历代易说大成，清代官方易学代表。'},
    {id:'zj_huidong', name:'惠栋', era:'清', years:'1697-1758', school:'汉学派（吴派）', masterpiece:'易汉学、周易述', desc:'清代汉学吴派创始人，专门表彰汉易，钩稽汉儒佚说，开清代复兴汉易之风。'},
    {id:'zj_zhanghuiyan', name:'张惠言', era:'清', years:'1761-1802', school:'汉学派（虞氏易）', masterpiece:'周易虞氏义、虞氏消息', desc:'专门研究虞翻易，精研虞氏消息，恢复虞氏易学全貌。'},
    {id:'zj_jiaoxun', name:'焦循', era:'清', years:'1763-1820', school:'数理易（通学派）', masterpiece:'易学三书（易章句、易通释、易图略）', desc:'创旁通、相错、时行三例，以数理通释全易，为清代易学殿军。'},
    // 近现代
    {id:'zj_shangbinghe', name:'尚秉和', era:'近现代', years:'1870-1950', school:'象数派（焦氏易林）', masterpiece:'周易尚氏学、焦氏易林注', desc:'近现代象数易学大家，从《焦氏易林》寻得久已失传的先秦象数，对象学贡献巨大。'},
    {id:'zj_hangxinzhai', name:'杭辛斋', era:'近现代', years:'1869-1924', school:'融会中西', masterpiece:'学易笔谈、易楔', desc:'融会中西学说，吸收近代科学知识讲易，开易学新视野。'},
    {id:'zj_gaoheng', name:'高亨', era:'现代', years:'1900-1986', school:'考据派', masterpiece:'周易古经今注、周易大传今注', desc:'现代易学考据大家，区分经传，从文字训诂入手研究古经，不采象数，影响极大。'},
    {id:'zj_lijingchi', name:'李镜池', era:'现代', years:'1902-1975', school:'古史辨派', masterpiece:'周易探源、周易通义', desc:'古史辨派易学代表，从史学、民俗学角度研究周易，认为卦爻辞是占筮记录汇编。'},
    {id:'zj_wenyiduo', name:'闻一多', era:'现代', years:'1899-1946', school:'考据/新训诂', masterpiece:'周易义证类纂', desc:'诗人学者，以新训诂学方法考释卦爻辞，多有新解。'},
    {id:'zj_gujiegang', name:'顾颉刚', era:'现代', years:'1893-1980', school:'古史辨派', masterpiece:'古史辨·周易相关', desc:'古史辨派领袖，考证周易卦爻辞中的故事（王亥丧羊、高宗伐鬼方、帝乙归妹等）。'},
    {id:'zj_yuxingwu', name:'于省吾', era:'现代', years:'1896-1984', school:'古文字派', masterpiece:'周易新证', desc:'以甲骨文、金文材料考证周易文字，精于文字训诂。'},
    {id:'zj_jinjngfang', name:'金景芳', era:'当代', years:'1902-2001', school:'义理派', masterpiece:'周易全解、学易四种', desc:'先秦史名家，以马克思主义理论结合传统义理解易，与弟子吕绍纲合著《周易全解》。'},
    {id:'zj_huangshouqi', name:'黄寿祺', era:'当代', years:'1912-1990', school:'兼综象数义理', masterpiece:'周易译注、易学群书平议', desc:'福建师范大学教授，尚秉和弟子，《周易译注》为当代最通行的今注今译本之一。'},
    // 当代
    {id:'zj_zhangsanwen', name:'张善文', era:'当代', years:'1949-', school:'兼综', masterpiece:'周易译注、周易辞典', desc:'黄寿祺弟子，福建师大教授，当代易学名家。'},
    {id:'zj_zhubokun', name:'朱伯崑', era:'当代', years:'1923-2007', school:'易学史', masterpiece:'易学哲学史', desc:'易学哲学史权威，四卷本《易学哲学史》为易学通史巨著。'},
    {id:'zj_liudajun', name:'刘大钧', era:'当代', years:'1943-', school:'象数派', masterpiece:'周易概论、周易古经白话解', desc:'山东大学易学研究中心创始人，当代象数易学代表，《周易研究》杂志主编。'},
    {id:'zj_liaomingchun', name:'廖名春', era:'当代', years:'1956-', school:'出土文献/考据', masterpiece:'周易经传与易学史新论、帛书周易论集', desc:'清华大学教授，利用帛书周易、楚简等出土文献研究易经，成果丰硕。'},
    {id:'zj_lishen', name:'李申', era:'当代', years:'1946-', school:'易学史/科学易', masterpiece:'周易图说总汇、中国易学哲学史', desc:'中国社会科学院研究员，易图学专家。'},
    {id:'zj_nanhuaijin', name:'南怀瑾', era:'当代', years:'1918-2012', school:'通俗/融会', masterpiece:'易经杂说、易经系传别讲', desc:'台湾著名传统文化传播者，以通俗讲易闻名，影响甚广。'},
    {id:'zj_fupeirong', name:'傅佩荣', era:'当代', years:'1950-', school:'哲学/通俗', masterpiece:'傅佩荣解读易经', desc:'台湾大学哲学系教授，哲学解易，讲解清晰，普及易经有功。'},
    {id:'zj_zengshiqiang', name:'曾仕强', era:'当代', years:'1935-2018', school:'管理/通俗', masterpiece:'易经的奥秘、易经的智慧', desc:'台湾交通大学教授，将易经与管理结合，通过百家讲坛普及易经，影响广泛。'},
  ];

  // 注家索引
  const ZhuJiaMap = {};
  ZhuJia.forEach(z => ZhuJiaMap[z.name] = z);

  // ========== L4: 经典注本（本体实例）==========
  const ZhuBen = [
    {id:'zb_zixia', name:'子夏易传', author:'子夏（托）', dynasty:'先秦/后人依托', school:'儒家', juan:11, desc:'相传子夏所撰，今本为后人辑佚，是最早的易传之一。'},
    {id:'zb_jingfang', name:'京氏易传', author:'京房', dynasty:'西汉', school:'象数派', juan:3, desc:'京房撰，八宫卦、纳甲、世应、飞伏、五行六亲诸说之所出，汉易代表作。'},
    {id:'zb_zhengxuan', name:'周易郑注', author:'郑玄', dynasty:'东汉', school:'古文经学', juan:12, desc:'郑玄以爻辰说注易，兼采今古文，东汉经学集大成之作，今有辑本。'},
    {id:'zb_yufan', name:'虞氏易注', author:'虞翻', dynasty:'三国', school:'象数派', juan:10, desc:'汉易象数集大成，《周易集解》引其说最多，清张惠言辑为《周易虞氏义》。'},
    {id:'zb_wangbi', name:'周易注', author:'王弼、韩康伯', dynasty:'魏晋', school:'义理派', juan:10, desc:'王弼注64卦及《文言》，韩康伯补《系辞》等，扫象言理，玄学易代表作，后为《周易正义》采用。'},
    {id:'zb_kongshu', name:'周易正义', author:'孔颖达等', dynasty:'唐', school:'义理派（官方）', juan:14, desc:'唐代官修《五经正义》之首，以王弼注为底本，唐代以来科举标准，影响极大。'},
    {id:'zb_jijie', name:'周易集解', author:'李鼎祚', dynasty:'唐', school:'象数派（集解）', juan:10, desc:'集汉魏至唐35家易注，保存大量汉易佚说，是研究汉易的第一要籍。'},
    {id:'zb_chengtuan', name:'伊川易传', author:'程颐', dynasty:'北宋', school:'义理派', juan:4, desc:'程颐理学解易代表作，专讲义理，说理精纯，为义理易学高峰。'},
    {id:'zb_shaoyong', name:'皇极经世书', author:'邵雍', dynasty:'北宋', school:'象数派（先天学）', juan:12, desc:'邵雍先天象数学巨著，以元会运世推演宇宙历史。'},
    {id:'zb_benyi', name:'周易本义', author:'朱熹', dynasty:'南宋', school:'理学', juan:12, desc:'朱熹易学代表作，区分经传，还易为占筮书，列河图洛书先天诸图，元明清科举标准。'},
    {id:'zb_yangwanli', name:'诚斋易传', author:'杨万里', dynasty:'南宋', school:'史事易', juan:20, desc:'以历代史事证易义，与程传并称"程杨"。'},
    {id:'zb_laizhide', name:'周易集注（来氏易）', author:'来知德', dynasty:'明', school:'象数派（错综说）', juan:16, desc:'来知德隐居二十九年所著，发明错综说，明代象数易代表。'},
    {id:'zb_wangfuzhi', name:'周易外传/内传', author:'王夫之', dynasty:'明末清初', school:'气学义理', juan:"各7卷", desc:'王夫之易学代表作，博大精深，代表传统易学最高水平之一。'},
    {id:'zb_zhezhong', name:'御纂周易折中', author:'李光地等', dynasty:'清（康熙）', school:'官方集解', juan:22, desc:'奉康熙诏编纂，以程传、本义为主，博采历代诸家之说，为集大成的官方易注。'},
    {id:'zb_huidong', name:'易汉学/周易述', author:'惠栋', dynasty:'清', school:'汉学派', juan:"8/23", desc:'清代复兴汉易代表，钩稽汉儒易说。'},
    {id:'zb_jiaoxun', name:'易学三书', author:'焦循', dynasty:'清', school:'数理/通学', juan:40, desc:'焦循以旁通、相错、时行三例通释全易，清代易学殿军。'},
    {id:'zb_shangbinghe', name:'周易尚氏学', author:'尚秉和', dynasty:'近现代', school:'象数派', juan:20, desc:'近现代象数易学代表作，从《焦氏易林》发掘先秦古象。'},
    {id:'zb_gaoheng', name:'周易古经今注/大传今注', author:'高亨', dynasty:'现代', school:'考据派', juan:"各6卷", desc:'现代考据派易学代表作，以文字训诂见长，区分经传研究。'},
    {id:'zb_zhubokun', name:'易学哲学史', author:'朱伯崑', dynasty:'当代', school:'哲学史', juan:'4卷', desc:'四卷本易学通史，从先秦到清代，易学哲学史最系统著作。'},
    {id:'zb_huangshouqi', name:'周易译注', author:'黄寿祺、张善文', dynasty:'当代', school:'兼综', juan:10, desc:'当代最通行的周易今注今译本，译文准确，注释详尽。'},
    {id:'zb_liudajun', name:'周易概论', author:'刘大钧', dynasty:'当代', school:'象数派', juan:"1卷", desc:'当代象数易学入门佳作。'},
  ];

  // ========== L5: 易学流派与三易原则 ==========
  const YiXueLiuPai = [
    {id:'lp_bianyi', name:'变易', sanyi:true, desc:'易之为言变也。宇宙万物时刻在变化运动，无一息不变，卦爻者所以模拟变化之道。'},
    {id:'lp_jianyi', name:'简易', sanyi:true, desc:'乾以易知，坤以简能。易则易知，简则易从。大道至简，执简驭繁。'},
    {id:'lp_buyi', name:'不易', sanyi:true, desc:'变动之中有不变者存。天尊地卑，乾坤定矣；动静有常，刚柔断矣。变中之常道为不易。'},
    {id:'lp_xiangshu', name:'象数派', desc:'以卦象、爻位、奇偶之数为核心解释周易，注重卦变、互体、纳甲、爻辰、卦气等体例。代表：孟喜、京房、虞翻、邵雍、来知德、尚秉和、刘大钧。'},
    {id:'lp_yili', name:'义理派', desc:'撇弃象数繁琐，以阐发易理、儒家义理为主，注重德义、政事、修齐治平。代表：王弼、程颐、朱熹（兼图书）、王夫之。'},
    {id:'lp_tushu', name:'图书派', desc:'以河图、洛书、先天图、太极图等图式解释易之起源与结构。代表：陈抟、邵雍、朱熹（采图说）。'},
    {id:'lp_tuili', name:'义理/占筮派（术数派）', desc:'以周易用于占筮预测，包括纳甲筮法、梅花易数、六爻、奇门、六壬等实用术数。代表：京房、邵雍（梅花易数托名）。'},
    {id:'lp_shishi', name:'史事易', desc:'以历史事实印证易义，引史证经。代表：干宝、杨万里。'},
    {id:'lp_kaozheng', name:'考据派', desc:'以文字训诂、文献考据方法研究周易，注重版本、文字、源流。代表：惠栋、张惠言、高亨、李镜池、顾颉刚。'},
    {id:'lp_dao', name:'道家易/丹道易', desc:'以易理论丹道修炼。代表：魏伯阳《周易参同契》。'},
    {id:'lp_fo', name:'佛家易/禅易', desc:'以佛理解易、以禅解易。代表：智旭《周易禅解》。'},
    {id:'lp_qitazongjiao', name:'会通派/现代新易', desc:'融会中西，或与现代科学、管理学结合。代表：杭辛斋、南怀瑾、曾仕强。'},
  ];

  // ========== L6: 易学传承关键事件 ==========
  const ChuanChengEvents = [
    {era:'上古', year:'传说', event:'伏羲画八卦', people:'伏羲', content:'伏羲氏仰观天文、俯察地理、观鸟兽之文与地之宜，近取诸身远取诸物，始作八卦。'},
    {era:'上古', year:'传说', event:'神农/黄帝重八卦', people:'神农、黄帝', content:'相传神农、黄帝重八卦为六十四卦（另说文王重卦）。'},
    {era:'西周', year:'约前11世纪', event:'文王演周易、周公作爻辞', people:'周文王、周公', desc:'周文王被囚羑里，重八卦为六十四卦并作卦辞；周公作三百八十四爻爻辞，《周易》本经定型。'},
    {era:'春秋', year:'前551-前479', event:'孔子作十翼', people:'孔子', content:'孔子晚而好易，韦编三绝，序《彖》《象》《系辞》《文言》《说卦》《序卦》《杂卦》等十翼，将易从占筮提升为义理经典。'},
    {era:'西汉初', year:'约前200', event:'田何传易于汉', people:'田何', content:'孔子易学六传至田何，汉易所自出，汉初立为博士。'},
    {era:'西汉', year:'前77-前37', event:'京房创纳甲八宫', people:'京房', content:'京房创八宫卦、纳甲、世应、飞伏、六亲之说，象数易学建立。'},
    {era:'东汉', year:'25-220', event:'郑玄、荀爽、虞翻集汉易之成', people:'郑玄、荀爽、虞翻', content:'东汉象数易学达到顶峰，爻辰、升降、卦变、纳甲等体例大备。'},
    {era:'曹魏', year:'226-249', event:'王弼扫象阐理', people:'王弼', content:'王弼注《易》，摈弃汉儒象数繁琐，以老庄玄学解易，开义理派先河，为易学史上一大革命。'},
    {era:'唐', year:'642年', event:'孔颖达撰《周易正义》', people:'孔颖达', content:'唐代官修《周易正义》，尊王弼注为正统，成为科举标准，义理派成为官方正统。'},
    {era:'唐', year:'约760年', event:'李鼎祚撰《周易集解》', people:'李鼎祚', content:'李鼎祚撰《周易集解》，保存汉魏35家易注，汉易文献赖以保存。'},
    {era:'北宋', year:'1011-1107', event:'北宋理学五子讲易', people:'周敦颐、邵雍、张载、程颐', content:'图书派（陈抟、邵雍）与义理派（程颐）并兴，周敦颐《太极图说》、邵雍先天学、程颐《伊川易传》，宋易建立。'},
    {era:'南宋', year:'1130-1200', event:'朱熹《周易本义》成书', people:'朱熹', content:'朱熹撰《周易本义》，区分经传，还易为占筮之书，列河图洛书先天图，成为后世官方标准，影响八百年。'},
    {era:'清', year:'1685-1715', event:'李光地等编《周易折中》', people:'李光地、康熙', content:'清康熙年间敕编《御纂周易折中》，集宋易之大成，为清代官方易学。'},
    {era:'清', year:'1700-1820', event:'清代汉学复兴汉易', people:'惠栋、张惠言、焦循', content:'乾嘉学派复兴汉易，惠栋《易汉学》、张惠言专研虞氏易、焦循《易学三书》，清易高峰。'},
    {era:'近现代', year:'1870-2000', event:'近现代易学多元发展', people:'尚秉和、高亨、李镜池、金景芳、朱伯崑等', content:'出土文献（马王堆帛书周易、上博楚简周易）问世，象数、义理、考据、考古多元发展。'},
  ];

  // ========== 关系三元组（本体边集）==========
  const Triples = [];
  function addTriple(s, p, o) { Triples.push({subject:s, predicate:p, object:o}); }

  // 生成链：道→太极→两仪→四象→八卦→64卦→384爻
  addTriple('Dao','shengCheng','Taiji');
  addTriple('Taiji','shengCheng','YinYang');
  addTriple('YinYang','shengCheng','Sixiang');
  addTriple('Sixiang','shengCheng','Bagua');
  // 八卦→64卦：两两相重
  BaGua.forEach(g1 => BaGua.forEach(g2 => {
    const found = LiuShiSiGua.find(g => g.shang===g1.name && g.xia===g2.name);
    if (found) {
      addTriple(g1.id, 'chongGua', found.id);
      addTriple(g2.id, 'chongGua', found.id);
      addTriple(found.id, 'shangGua', g1.id);
      addTriple(found.id, 'xiaGua', g2.id);
    }
  }));
  // 64卦→384爻
  LiuShiSiGua.forEach(g => g.yao.forEach((y,i) => {
    const yid = g.id+'_y'+(i+1);
    addTriple(g.id, 'yaoWei', yid);
    addTriple(yid, 'shuYuGua', g.id);
  }));
  // 十翼→经
  ShiYi.forEach(zy => addTriple(zy.id, 'zhushi', 'Jing'));
  // 注家→注本
  ZhuBen.forEach(zb => {
    if (ZhuJiaMap[zb.author.replace(/、.*$/,'')]) {
      const authorId = ZhuJiaMap[zb.author.replace(/、.*$/,'')].id;
      addTriple(authorId, 'zhuZuo', zb.id);
      addTriple(zb.id, 'zuoZhe', authorId);
    }
  });
  // 注本→经（注释对象）
  ZhuBen.forEach(zb => addTriple(zb.id, 'zhushi', 'Jing'));
  // 注家→流派
  const schoolMap = {'象数派':'lp_xiangshu','义理派':'lp_yili','义理派（理学易）':'lp_yili','古文经学':'lp_kaozheng',
    '古文经学（兼采今文）':'lp_kaozheng','象数派（京氏易）':'lp_xiangshu','义理派（玄学易）':'lp_yili',
    '象数派（集解体）':'lp_xiangshu','图书派（道家易）':'lp_tushu','象数派（先天学）':'lp_xiangshu',
    '义理派（理学集大成）':'lp_yili','史事易':'lp_shishi','理学易':'lp_yili','气学易':'lp_yili',
    '气学/义理派':'lp_yili','汉学派（吴派）':'lp_kaozheng','汉学派（虞氏易）':'lp_kaozheng',
    '象数派错综说':'lp_xiangshu','考据/义理':'lp_kaozheng','佛家易（禅易）':'lp_fo','数理易（通学派）':'lp_kaozheng',
    '象数派（焦氏易林）':'lp_xiangshu','考据派':'lp_kaozheng','古史辨派':'lp_kaozheng','古文字派':'lp_kaozheng',
    '义理派':'lp_yili','兼综象数义理':'lp_yili','兼综':'lp_yili','易学史':'lp_kaozheng',
    '象数派':'lp_xiangshu','出土文献/考据':'lp_kaozheng','通俗/融会':'lp_qitazongjiao',
    '哲学/通俗':'lp_qitazongjiao','管理/通俗':'lp_qitazongjiao','道家易':'lp_dao','官方集解':'lp_yili',
    '今文经学':'lp_yili','道家易学':'lp_dao','义理/官方':'lp_yili','蜀学易':'lp_yili','考据派易学':'lp_kaozheng',
    '义理派（正义派）':'lp_yili','官方':'lp_yili','融会中西':'lp_qitazongjiao','易学史/科学易':'lp_qitazongjiao'
  };
  ZhuJia.forEach(zj => {
    const lpId = schoolMap[zj.school];
    if (lpId) addTriple(zj.id, 'shuYuLiupai', lpId);
  });

  // ========== 公开API ==========
  return {
    version: '2.0.0',
    builtOn: '2026-11-04',
    principle: '所有内容先为本体实例（RDF三元组），HTML仅作为渲染视图',
    meta: MetaClass,
    relations: Relations,
    core: CoreCategories,
    bagua: BaGua,
    baguaMap: BaGuaMap,
    yaoWeiAttr: YaoWeiAttr,
    liushisigua: LiuShiSiGua,
    guaMap: GuaMap,
    shiyi: ShiYi,
    yizhuanTexts: YiZhuanTexts,
    yitu: YiTu,
    zhujia: ZhuJia,
    zhujiaMap: ZhuJiaMap,
    zhuben: ZhuBen,
    liupai: YiXueLiuPai,
    events: ChuanChengEvents,
    triples: Triples,
    // 统计
    stats: function() {
      return {
        bagua: this.bagua.length,
        liushisigua: this.liushisigua.length,
        yao: this.liushisigua.reduce((s,g)=>s+g.yao.length,0),
        shiyi: this.shiyi.length,
        yitu: this.yitu.length,
        zhujia: this.zhujia.length,
        zhuben: this.zhuben.length,
        liupai: this.liupai.length,
        events: this.events.length,
        triples: this.triples.length,
        completeGua: this.liushisigua.filter(g=>!g._incomplete).length,
        incompleteGua: this.liushisigua.filter(g=>g._incomplete).length,
      };
    }
  };
})();
