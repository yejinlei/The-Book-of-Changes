/**
 * yijing-najia-duangua.js
 * 纳甲筮法·断卦推理层
 * 功能：用神/原神/忌神/仇神自动判定 + 旺衰分析 + 动变生克 + 吉凶推理
 * 配套 yijing-najia-data.js / yijing-najia-engine.js 使用
 */
(function(global){
  'use strict';

  const WX = '金木水火土';
  // 五行生克
  const SHENG = { 金: '水', 木: '火', 水: '木', 火: '土', 土: '金' }; // X生Y
  const KE   = { 金: '木', 木: '土', 水: '火', 火: '金', 土: '水' }; // X克Y
  function sheng(a,b){ return SHENG[a]===b; }
  function ke(a,b){ return KE[a]===b; }

  /**
   * 六亲名称（给定"我"的五行与对方五行）
   */
  function liuqin(wx_wo, wx_other){
    if(wx_wo===wx_other) return '兄弟';
    if(sheng(wx_wo, wx_other)) return '子孙';     // 我生
    if(ke(wx_wo, wx_other)) return '妻财';        // 我克
    if(sheng(wx_other, wx_wo)) return '父母';     // 生我
    if(ke(wx_other, wx_wo)) return '官鬼';        // 克我
    return '';
  }

  /**
   * 占事分类 → 用神规则
   * 参考《卜筮正宗》《增删卜易》《黄金策》
   */
  const YONGSHEN_RULES = [
    { id:'zizhan',   name:'自占（问自身命运/近期整体运势）',   main:'世爻',         desc:'以世爻为用神，占己身之休咎' },
    { id:'qiancai',  name:'求财/问买卖/问生意',              main:'妻财',         desc:'妻财为用；子孙为原神（财源），兄弟为忌神（劫财），官鬼为仇神（泄财、招非）' },
    { id:'guanming', name:'问官运/功名/事业/升迁',           main:'官鬼',         desc:'官鬼为用；妻财为原神（财可生官），子孙为忌神（剥官之煞），兄弟为仇神（克财破官之源）' },
    { id:'hunyin',   name:'问婚姻/感情',                     main:{nan:'妻财', nv:'官鬼'}, desc:'男占婚以妻财为用，女占婚以官鬼为用；父母为忌神（文书、阻隔）' },
    { id:'fumu',     name:'问父母/长辈/师长/文书/家宅',     main:'父母',         desc:'父母为用；官鬼为原神（生父母），妻财为忌神（克父母），子孙为仇神（生财克父）' },
    { id:'zinü',     name:'问子女/晚辈/医药/僧道/六畜',     main:'子孙',         desc:'子孙为用；兄弟为原神，父母为忌神，官鬼为仇神' },
    { id:'xiongdi',  name:'问兄弟/朋友/同行/伙伴/竞争',     main:'兄弟',         desc:'兄弟为用；父母为原神，官鬼为忌神，妻财为仇神' },
    { id:'jibing',   name:'问疾病/健康',                     main:{zizhan:'世爻', wenren:'应爻'}, special:'官鬼为病症', desc:'自占以世爻为身、官鬼为病、子孙为药；代人占以应爻为病人' },
    { id:'songshi',  name:'问官讼/是非',                     main:{zizhan:'世爻', duifang:'应爻'}, special:'官鬼为讼事', desc:'世为我，应为对方，官鬼为官府讼事；父母为文书证据' },
    { id:'chuxing', name:'问出行/行人/失物',               main:{zizhan:'世爻', xingren:'应爻', shiwu:'妻财'}, desc:'出行看世爻旺衰；行人看应爻；失物贵重看妻财' },
    { id:'kaoshi',   name:'问考试/学业/文书',               main:{chengji:'父母', luqu:'官鬼'}, desc:'父母为试卷/文书，官鬼为功名/录取；财动克父母则文章不利' },
    { id:'jiazhai',  name:'问家宅/建房/搬迁',               main:{zhai:'父母', ren:'世爻'}, desc:'父母为房屋，世为居者；财为宅中之财，官为宅中之祟' },
    { id:'siyu',     name:'问生育/怀孕/胎产',               main:'子孙',         desc:'子孙为胎；胎爻（根据日干支推算）为胎' },
    { id:'fangshi',  name:'问遗失/寻物',                    main:'妻财',         desc:'财物看妻财，文书看父母；空亡不见，冲合可期' },
  ];

  /**
   * 六亲万物类象（《卜筮正宗》卷二要略）
   */
  const LIUQIN_WANWU = {
    '父母': {
      yixiang:'庇护我身者',
      wulei:['父母、长辈、师长、家宅、房屋、城池、舟车、衣服、雨具、文书、契约、合同、文章、考卷、学业、学问、执照、批文、公文、通讯、消息、书信'],
      renlun:'父母、祖父母、伯叔、师父、长辈亲属、保护我的人',
      woshi:'父母爻持世：主辛劳、操心、为长辈事、文书事；旺相学业成、文书就，休囚文书不利',
    },
    '官鬼': {
      yixiang:'拘我身者',
      wulei:['官贵、官府、衙门、功名、官职、事业、职位、升迁、丈夫（女占）、男情人、病症、盗贼、祸殃、邪祟、雷电、官司、诉讼、牢狱、夫星'],
      renlun:'丈夫、官员、官府中人、拘管我之人',
      woshi:'官鬼持世：忧疑、疾病、官非；若占功名官贵反为吉；女占婚喜官鬼持世',
    },
    '妻财': {
      yixiang:'我所驱使',
      wulei:['钱财、粮食、货物、金银、珠宝、财务、利润、薪水、报酬、妻子（男占）、女情人、妻妾、仆人、日用品、嫁妆'],
      renlun:'妻子、情人、财利',
      woshi:'妻财持世：财利之事、利求财；但克父母文书、利财不利学不利名',
    },
    '子孙': {
      yixiang:'我之所生者',
      wulei:['子女、晚辈、徒弟、下属、医药、医生、僧道、六畜、宠物、福神、解忧、喜庆、解灾之神、学生、儿孙、保健品'],
      renlun:'子女、孙辈、徒弟、下属、医生、僧道',
      woshi:'子孙持世：无忧无患、诸事吉庆、福神持世解百祸；唯不利官名、不利女占夫（克官鬼）',
    },
    '兄弟': {
      yixiang:'同类相比者',
      wulei:['兄弟、姊妹、朋友、伙伴、同行、竞争者、阻力、阻隔、破财、劫财、分家、分财、花费、口舌'],
      renlun:'兄弟姐妹、朋友、同学、同行、合伙人',
      woshi:'兄弟持世：克妻财、主破财、花费、竞争、口舌；唯利兄弟朋友之事',
    },
  };

  /**
   * 六神类象（《卜筮正宗》）
   */
  const LIUSHEN_WANWU = {
    '青龙': { wuxing:'木', fangwei:'东方', haohuai:'吉庆喜庆',
      lei:['喜庆、婚姻、财喜、酒色、正直、美貌、青龙持世：近贵、有喜庆'] },
    '朱雀': { wuxing:'火', fangwei:'南方', haohuai:'口舌文书',
      lei:['文书、书信、消息、口舌、是非、官司、争吵、火灾、声音、飞鸟'] },
    '勾陈': { wuxing:'土', fangwei:'中央', haohuai:'田土牵连',
      lei:['田土、房屋、牢狱、迟滞、牵连、旧事、稳重、田产、农事'] },
    '螣蛇': { wuxing:'火', fangwei:'中央', haohuai:'虚惊怪异',
      lei:['虚惊、怪梦、缠绕、多疑、惊恐、阴邪、怪事、小人为害、绳索'] },
    '白虎': { wuxing:'金', fangwei:'西方', haohuai:'凶丧血光',
      lei:['凶丧、孝服、疾病、死伤、刀兵、血光、车祸、威严、猛将、暴躁'] },
    '玄武': { wuxing:'水', fangwei:'北方', haohuai:'盗贼阴私',
      lei:['盗贼、阴私、暧昧、奸邪、色情、隐私、小人、盗贼、失物、水患、阴谋'] },
  };

  /**
   * 判断爻的旺衰（结合月建、日辰、动爻）
   * @param {Object} yao { wx, liuqin, liuShen, isDong, isShi, isYing, kong, ... }
   * @param {string} yueJian 月建地支 如'子'
   * @param {string} riChen 日辰地支 如'寅'
   * @param {Array} dongYaos 所有动爻
   * @returns {Object} 评级
   */
  function yaowangshuai(yao, yueJian, riChen, dongYaos){
    const wx = yao.wx;
    const scores = [];
    let level = '平';
    let reason = [];

    // 月建旺相休囚死
    const yueWx = DZ_WX[yueJian];
    if(yueWx === wx){ scores.push(3); reason.push('临月建'); }          // 临月建
    else if(sheng(yueWx, wx)){ scores.push(2); reason.push('月建生扶（相）'); }
    else if(wx === SHENG[yueWx]){ scores.push(-1); reason.push('生月泄气（休）'); }
    else if(ke(yueWx, wx)){ scores.push(-2); reason.push('月建克（囚）'); }
    else if(KE[wx] === yueWx){ scores.push(-3); reason.push('月破（死）'); }

    // 月破：日冲不叫月破，爻支被月建冲叫月破
    if(CHONG[yueJian] === yao.dz){
      scores.push(-3);
      if(!reason.some(r=>r.includes('月破'))) reason.push('月破');
    }
    // 月合
    if(LIUHE[yueJian] === yao.dz){
      scores.push(1);
      reason.push('月合');
    }

    // 日辰
    if(riChen === yao.dz){ scores.push(2); reason.push('日临'); }
    else if(sheng(DZ_WX[riChen], wx)){ scores.push(1); reason.push('日辰生扶'); }
    else if(ke(DZ_WX[riChen], wx)){ scores.push(-1); reason.push('日辰克'); }
    if(CHONG[riChen] === yao.dz){
      if(scores[0] <= -2 || yao.isDong){
        // 月破/休囚逢日冲为"日破"，动爻逢冲为"暗动"
        if(yao.isDong){ scores.push(1); reason.push('动逢日冲为暗动/冲起'); }
        else { scores.push(-2); reason.push('休囚日破'); }
      } else {
        scores.push(0);
        reason.push('日冲（暗动或冲散，需观旺衰）');
      }
    }
    if(LIUHE[riChen] === yao.dz){ scores.push(1); reason.push('日合'); }
    if(yao.kong){ scores.push(-2); reason.push('旬空'); }

    // 动爻生克
    for(const d of dongYaos){
      if(d.idx === yao.idx) continue;
      if(sheng(d.wx, wx)){ scores.push(1); reason.push(`${d.label}动来生`); }
      if(ke(d.wx, wx)){ scores.push(-1); reason.push(`${d.label}动来克`); }
    }

    const total = scores.reduce((a,b)=>a+b,0);
    if(total >= 5) level='极旺';
    else if(total >= 3) level='旺';
    else if(total >= 1) level='偏旺';
    else if(total === 0) level='平';
    else if(total >= -2) level='偏弱';
    else if(total >= -4) level='衰';
    else level='极衰';

    return { level, score: total, reason, wx };
  }

  // ======== 辅助：地支→五行、冲合 ========
  const DZ_WX = { 子:'水', 丑:'土', 寅:'木', 卯:'木', 辰:'土', 巳:'火', 午:'火', 未:'土', 申:'金', 酉:'金', 戌:'土', 亥:'水' };
  const CHONG = { 子:'午', 午:'子', 丑:'未', 未:'丑', 寅:'申', 申:'寅', 卯:'酉', 酉:'卯', 辰:'戌', 戌:'辰', 巳:'亥', 亥:'巳' };
  const LIUHE= { 子:'丑', 丑:'子', 寅:'亥', 亥:'寅', 卯:'戌', 戌:'卯', 辰:'酉', 酉:'辰', 巳:'申', 申:'巳', 午:'未', 未:'午' };

  /**
   * 主断卦函数
   * @param {Object} pan 排盘结果（najia-engine返回值）
   * @param {string} wenshi 占问类型 id（YONGSHEN_RULES中id）
   * @param {string} [gender] 'nan'/'nv'，婚姻/身命用
   * @returns {Object} 断卦结果
   */
  function duangua(pan, wenshi, gender){
    const rules = YONGSHEN_RULES.find(r=>r.id===wenshi) || YONGSHEN_RULES[0];
    const yongWanted = typeof rules.main==='string' ? rules.main : (rules.main[gender]||rules.main.zizhan||'世爻');

    const yue = pan.yueJian;
    const ri = pan.riChen;
    const yaoList = pan.liuyao.map((y,i)=>({...y, idx:i, label:`${i===0?'初':(i===5?'上':(i+1))}${y.isYang?'阳':'阴'}${['爻','爻','二','三','四','五'][i]}`.replace('阳爻','阳').replace('阴爻','阴')}));
    const dongYaos = yaoList.filter(y=>y.isDong);
    const shi = yaoList.find(y=>y.isShi);
    const ying = yaoList.find(y=>y.isYing);

    // ---- 1. 找用神 ----
    let yong = null, yongType = '';
    if(yongWanted === '世爻'){
      yong = shi; yongType = '世爻（用神）';
    } else if(yongWanted === '应爻'){
      yong = ying; yongType = '应爻（用神）';
    } else {
      // 按六亲找
      const candidates = yaoList.filter(y=>y.liuqin===yongWanted && !y.isInBian);
      // 优先世应上的，再择其旺相者
      if(candidates.length === 0){
        // 用神不现 → 取伏神
        const fushen = pan.fushen.find(f=>f.liuqin===yongWanted);
        if(fushen){
          yong = { ...fushen, isFu:true, dz:fushen.dz, wx:fushen.wx, liuqin:fushen.liuqin, label:`伏${fushen.label}` };
          yongType = `${yongWanted}（伏神）`;
        }
      } else {
        // 两个同六亲时：临世应者优先；旺相者优先
        yong = candidates.sort((a,b)=>{
          const as = (a.isShi?2:0)+(a.isYing?1:0);
          const bs = (b.isShi?2:0)+(b.isYing?1:0);
          return bs-as;
        })[0];
        yongType = `${yongWanted}${yong.isShi?'（临世）':(yong.isYing?'（临应）':'')}（用神）`;
      }
    }

    if(!yong){
      return { error:`用神不现，${yongWanted}爻不上卦且伏神无着，请换占法或重起卦`, rules };
    }

    // ---- 2. 原神、忌神、仇神 ----
    // 原神：生用神者；忌神：克用神者；仇神：生忌神、克原神者
    const yongWx = yong.wx;
    const yuanShenWx = Object.keys(SHENG).find(w=>SHENG[w]===yongWx); // 生用神
    const jiShenWx   = Object.keys(KE).find(w=>KE[w]===yongWx);      // 克用神
    const chouShenWx = Object.keys(SHENG).find(w=>SHENG[w]===jiShenWx); // 生忌神
    const xianShenWx = SHENG[yongWx]; // 用神生的 → 泄气/闲神

    const yuanShen = yaoList.filter(y=>y.wx===yuanShenWx && !y.isFu);
    const jiShen   = yaoList.filter(y=>y.wx===jiShenWx   && !y.isFu);
    const chouShen = yaoList.filter(y=>y.wx===chouShenWx && !y.isFu);

    // ---- 3. 旺衰分析 ----
    const yongWS = yaowangshuai(yong, yue, ri, dongYaos);
    const yuanWS = yuanShen.map(y=>({...yaowangshuai(y,yue,ri,dongYaos), yao:y}));
    const jiWS   = jiShen.map(y=>({...yaowangshuai(y,yue,ri,dongYaos), yao:y}));
    const chouWS = chouShen.map(y=>({...yaowangshuai(y,yue,ri,dongYaos), yao:y}));

    // ---- 4. 动变关系（回头生克、化进化退） ----
    const dongbian = [];
    for(const d of dongYaos){
      const bianYao = pan.bian.liuyao[d.idx]; // 变卦对应位
      if(!bianYao) continue;
      const dWx = d.wx;
      const bWx = bianYao.wx;
      if(sheng(bWx, dWx)) dongbian.push({yao:d, type:'化回头生', desc:`${d.label}动化${bianYao.label}，回头生扶，动爻益旺`});
      else if(ke(bWx, dWx)) dongbian.push({yao:d, type:'化回头克', desc:`${d.label}动化${bianYao.label}，回头克伤，动爻受伤无力`});
      else if(sheng(dWx, bWx)) dongbian.push({yao:d, type:'化泄', desc:`${d.label}动化${bianYao.label}，动生变，泄气`});
      else if(ke(dWx, bWx)) dongbian.push({yao:d, type:'化克', desc:`${d.label}动化${bianYao.label}，动克变，事有阻隔`});
      else if(bWx===dWx){
        // 同五行，查进退神（寅→卯/申→酉/丑→辰/未→戌 为进； 卯→寅/酉→申/辰→丑/戌→未 为退）
        const JIN_MAP = {寅:'卯', 申:'酉', 丑:'辰', 未:'戌', 巳:'午'}; // 简化：只列常见
        const TUI_MAP = {卯:'寅', 酉:'申', 辰:'丑', 戌:'未', 午:'巳'};
        if(JIN_MAP[d.dz]===bianYao.dz) dongbian.push({yao:d, type:'化进神', desc:`${d.label}动化进神，力量增强、事态发展`});
        else if(TUI_MAP[d.dz]===bianYao.dz) dongbian.push({yao:d, type:'化退神', desc:`${d.label}动化退神，力量消退、事情缓散`});
        else dongbian.push({yao:d, type:'伏吟', desc:`${d.label}动化${bianYao.label}，伏吟呻吟、事多忧疑不决`});
      }
    }

    // 动爻对用神的生克
    const duiYong = [];
    for(const d of dongYaos){
      if(d.idx === yong.idx) continue;
      if(sheng(d.wx, yongWx)) duiYong.push({yao:d, type:'动来生用', good:true});
      if(ke(d.wx, yongWx)) duiYong.push({yao:d, type:'动来克用', good:false});
      if(yongWx===d.wx) duiYong.push({yao:d, type:'动来比扶', good:true});
    }

    // ---- 5. 空亡/月破等针对用神 ----
    const yongSpecial = [];
    if(yong.kong) yongSpecial.push('用神旬空：所问之事目前虚无缥缈、时机未到、或人未露面；旺相待出空则成，休囚终空');
    if(yongWS.reason.some(r=>r.includes('月破'))) yongSpecial.push('用神月破：用神逢月破，事多破散难成，纵有成亦不久');
    if(yongWS.reason.some(r=>r.includes('日破'))) yongSpecial.push('用神日破：休囚逢冲，事被冲散');
    if(!yong.kong && !yongWS.reason.some(r=>r.includes('月破')) && yongWS.score>=1){
      // 用神得地
    }
    if(yong.isFu){
      // 伏神：飞生伏/伏克飞为出，飞克伏为压
      const fei = yaoList[yong.feiIdx];
      if(fei){
        if(sheng(fei.wx, yongWx)) yongSpecial.push(`用神伏藏于${fei.label}下，飞生伏，易得，待引拔之期（冲飞、露伏之日月）`);
        else if(ke(fei.wx, yongWx)) yongSpecial.push(`用神伏于${fei.label}下，飞来克伏（飞来压伏），事被压不得出，甚凶`);
        else if(ke(yongWx, fei.wx)) yongSpecial.push(`伏克飞，"伏去克飞为出暴"，事可出但急中有悔`);
        else if(yongWx===fei.wx) yongSpecial.push(`伏与飞比和，事可自然露出`);
        else yongSpecial.push(`伏生飞，泄气，事难成`);
      }
    }

    // ---- 6. 吉凶判定（简化版，综合规则）----
    // 核心：用神旺相+原神动来生用=吉；用神休囚+忌神动克+仇神生忌=凶
    const yuanActive = yuanWS.filter(w=>w.yao.isDong && w.score>=0).length;
    const jiActive   = jiWS.filter(w=>w.yao.isDong && w.score>=0).length;
    const chouActive = chouWS.filter(w=>w.yao.isDong && w.score>=0).length;

    let jiXiong = '平';
    let jiXiongReason = [];

    if(yongWS.score >= 3 && jiActive===0){ jiXiong='大吉'; jiXiongReason.push('用神旺相，无动克，诸事顺遂'); }
    else if(yongWS.score >= 1 && yuanActive>0 && jiActive===0){ jiXiong='吉'; jiXiongReason.push('用神旺相，原神发动来生，事可成'); }
    else if(yongWS.score >= 0 && jiActive===0){ jiXiong='小吉'; jiXiongReason.push('用神尚有力，无动克，事可缓慢成就'); }
    else if(yongWS.score <= -3 && yuanActive===0){ jiXiong='大凶'; jiXiongReason.push('用神休囚破散，无原神救助，事不可为'); }
    else if(jiActive>0 && yuanActive===0){ jiXiong='凶'; jiXiongReason.push('忌神发动克用，又无原神救助，事有阻难'); }
    else if(yongWS.score <= -1 && jiActive>0){ jiXiong='凶'; jiXiongReason.push('用神衰弱又见忌神动克，凶'); }
    else if(yongWS.score >= 0 && jiActive>0 && yuanActive>0){ jiXiong='先难后易'; jiXiongReason.push('忌神虽动，但原神亦动通关，凶中有救，先阻后成'); }
    else if(chouActive>0){ jiXiong='凶中加重'; jiXiongReason.push('仇神发动生忌克原，凶势加重'); }
    else { jiXiong='平'; jiXiongReason.push('用神旺衰与动克平衡，事在两可之间，需观时日'); }

    // 空亡/月破额外降级
    if(yong.kong && yongWS.score<2) { jiXiong = '空待'; jiXiongReason.push('用神空亡，事未到时候，待出空、冲空之日方可论吉凶'); }
    if(yongWS.reason.some(r=>r.includes('月破')) && yongWS.score<3) {
      if(jiXiong==='平'||jiXiong==='小吉') jiXiong='破';
      jiXiongReason.push('用神月破，事成亦破');
    }

    // 特殊占问加成
    if(wenshi==='jibing' && yong){
      // 疾病：看官鬼（病症）、子孙（药）
      const guanghost = yaoList.find(y=>y.liuqin==='官鬼' && !y.isFu);
      const medicine = yaoList.find(y=>y.liuqin==='子孙' && !y.isFu);
      if(guanghost){
        const ghWS = yaowangshuai(guanghost, yue, ri, dongYaos);
        const medWS = medicine ? yaowangshuai(medicine, yue, ri, dongYaos) : null;
        if(ghWS.score>=2 && (!medWS || medWS.score<=0)){ jiXiong='病重'; jiXiongReason.push('官鬼（病）旺而无制，子孙（药）无力，病重难愈'); }
        else if(medWS && medWS.score>=1 && ke(medicine.wx, guanghost.wx)){ jiXiongReason.push('子孙旺相克官鬼，医药有效，病可愈'); }
      }
    }

    return {
      rules,
      yongWanted,
      yong, yongType, yongWS,
      yuanShenWx, jiShenWx, chouShenWx, xianShenWx,
      yuanShen, yuanWS,
      jiShen, jiWS,
      chouShen, chouWS,
      dongbian, duiYong, yongSpecial,
      jiXiong, jiXiongReason,
      shi, ying, shiWS: yaowangshuai(shi,yue,ri,dongYaos), yingWS: yaowangshuai(ying,yue,ri,dongYaos),
    };
  }

  global.YJ_NAJIA_DUANGUA = {
    LIUQIN_WANWU,
    LIUSHEN_WANWU,
    YONGSHEN_RULES,
    duangua,
    yaowangshuai,
    liuqin,
  };
})(window);
