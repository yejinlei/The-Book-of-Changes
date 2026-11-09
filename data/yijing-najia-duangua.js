/**
 * yijing-najia-duangua.js
 * 纳甲筮法·断卦推理层
 * 功能：用神/原神/忌神/仇神自动判定 + 旺衰分析 + 动变生克 + 吉凶推理
 * 配套 yijing-najia-data.js / yijing-najia-engine.js 使用
 * 
 * 字段约定（对应 engine 返回的 pan）：
 *  pan.yaos[i] = {pos, yinyang, gan, zhi, wuxing(jin/mu/shui/huo/tu), liuqin:{key,name,...}, shi, ying, value, dong, liushen, kong, yueEffect, riEffect, wangshuai, changsheng}
 *  pan.bian 无yaos（变卦需从 dongList 取对应爻变化；这里简化：变爻按变值6↔9重算）
 */
(function(global){
  'use strict';

  // 内部使用中文五行名（与duangua逻辑一致），做一个 wuxing 缩写→中文映射
  const WX_MAP = { jin:'金', mu:'木', shui:'水', huo:'火', tu:'土' };
  const WX = '金木水火土';
  const SHENG = { '金':'水', '木':'火', '水':'木', '火':'土', '土':'金' }; // X生Y
  const KE   = { '金':'木', '木':'土', '水':'火', '火':'金', '土':'水' }; // X克Y
  const sheng = (a,b)=>SHENG[a]===b;
  const ke    = (a,b)=>KE[a]===b;

  const DZ_WX = { 子:'水', 丑:'土', 寅:'木', 卯:'木', 辰:'土', 巳:'火', 午:'火', 未:'土', 申:'金', 酉:'金', 戌:'土', 亥:'水' };
  const CHONG = { 子:'午', 午:'子', 丑:'未', 未:'丑', 寅:'申', 申:'寅', 卯:'酉', 酉:'卯', 辰:'戌', 戌:'辰', 巳:'亥', 亥:'巳' };
  const LIUHE= { 子:'丑', 丑:'子', 寅:'亥', 亥:'寅', 卯:'戌', 戌:'卯', 辰:'酉', 酉:'辰', 巳:'申', 申:'巳', 午:'未', 未:'午' };

  const POS_NAME = {1:'初',2:'二',3:'三',4:'四',5:'五',6:'上'};

  /**
   * 占事分类 → 用神规则（参考《卜筮正宗》《增删卜易》《黄金策》）
   */
  const YONGSHEN_RULES = [
    { id:'zizhan',   name:'自占（问自身命运/近期整体运势）',   main:'世爻',         desc:'以世爻为用神，占己身之休咎' },
    { id:'qiancai',  name:'求财/问买卖/生意/财运',            main:'妻财',         desc:'妻财为用；子孙为原神（财源），兄弟为忌神（劫财），官鬼为仇神' },
    { id:'guanming', name:'问官运/功名/事业/升迁/求职',       main:'官鬼',         desc:'官鬼为用；妻财为原神（财可生官），子孙为忌神（剥官之煞）' },
    { id:'hunyin',   name:'问婚姻/感情',                     main:{nan:'妻财', nv:'官鬼'}, desc:'男占婚以妻财为用，女占婚以官鬼为用' },
    { id:'fumu',     name:'问父母/长辈/师长/家宅/文书',       main:'父母',         desc:'父母为用；官鬼为原神，妻财为忌神' },
    { id:'zinü',     name:'问子女/晚辈/医药/僧道/六畜',       main:'子孙',         desc:'子孙为用；兄弟为原神，父母为忌神' },
    { id:'xiongdi',  name:'问兄弟/朋友/同行/伙伴/竞争',       main:'兄弟',         desc:'兄弟为用；父母为原神，官鬼为忌神' },
    { id:'jibing',   name:'问疾病/健康',                     main:{zizhan:'世爻'}, special:'官鬼为病、子孙为药', desc:'自占以世爻为身，官鬼为病症，子孙为医药；世爻旺而有制则愈' },
    { id:'songshi',  name:'问官讼/是非/纠纷',                main:{zizhan:'世爻', duifang:'应爻'}, special:'官鬼为官府', desc:'世为我，应为对方，官鬼为讼事；父母为文书证据' },
    { id:'chuxing',  name:'问出行/行人',                     main:'应爻',         desc:'应爻为行人/目的地；世为行者' },
    { id:'kaoshi',   name:'问考试/学业/文书',                main:'父母', special:'官鬼为功名录取', desc:'父母为试卷/文书，官鬼为录取；财动克父母不利文章' },
    { id:'jiazhai',  name:'问家宅/建房/搬迁',                main:{zhai:'父母', ren:'世爻'}, desc:'父母为房屋，世为居者' },
    { id:'siyu',     name:'问生育/怀孕/胎产',                main:'子孙',         desc:'子孙为胎爻' },
    { id:'fangshi',  name:'问遗失/寻物',                     main:'妻财',         desc:'财物看妻财，文书看父母' },
  ];

  const LIUQIN_WANWU = {
    '父母': { yixiang:'庇护我身者', wulei:'父母、长辈、师长、家宅、房屋、舟车、衣服、雨具、文书、契约、文章、考卷、学业、执照、批文、公文、书信' },
    '官鬼': { yixiang:'拘我身者',   wulei:'官贵、官府、功名、职位、升迁、丈夫（女占）、病症、盗贼、祸殃、邪祟、官司、牢狱' },
    '妻财': { yixiang:'我所驱使',   wulei:'钱财、粮食、货物、金银、薪水、妻子（男占）、情人、仆人、日用品' },
    '子孙': { yixiang:'我之所生',   wulei:'子女、晚辈、徒弟、下属、医药、医生、僧道、六畜、福神、解忧喜庆、保健品' },
    '兄弟': { yixiang:'同类相比者', wulei:'兄弟姊妹、朋友伙伴、同行竞争、劫财破耗、口舌分利' },
  };

  const LIUSHEN_WANWU = {
    '青龙':{ haohuai:'吉庆喜庆',   lei:'喜庆、婚姻、财喜、酒色、美貌；青龙持世近贵有喜' },
    '朱雀':{ haohuai:'口舌文书',   lei:'文书书信、消息口舌、是非官司、争吵、火灾、声音' },
    '勾陈':{ haohuai:'田土牵连',   lei:'田土房屋、牢狱迟滞、牵连旧事、稳重田产' },
    '螣蛇':{ haohuai:'虚惊怪异',   lei:'虚惊怪梦、缠绕多疑、惊恐阴邪、怪事小人、绳索' },
    '白虎':{ haohuai:'凶丧血光',   lei:'凶丧孝服、疾病死伤、刀兵血光、车祸、威严暴躁' },
    '玄武':{ haohuai:'盗贼阴私',   lei:'盗贼阴私、暧昧奸邪、隐私小人、失物水患、阴谋' },
  };

  /**
   * 旺衰评分（基于 engine 已经给出的 yueEffect/riEffect/kong，这里细化为综合分）
   */
  function yaowangshuai(yao, yueDz, riDz, allYaos){
    const wx = WX_MAP[yao.wuxing];
    const dz = yao.zhi;
    const yueWx = DZ_WX[yueDz];
    const riWx = DZ_WX[riDz];
    const scores = [];
    const reason = [];

    // 月建
    if(dz === yueDz){ scores.push(3); reason.push('临月建'); }
    else if(yueWx === wx){ scores.push(2); reason.push('月建同气（旺）'); }
    else if(sheng(yueWx, wx)){ scores.push(2); reason.push('月建生扶（相）'); }
    else if(wx === SHENG[yueWx]){ scores.push(-1); reason.push('生月泄气（休）'); }
    else if(ke(wx, yueWx)){ scores.push(-2); reason.push('我克月（囚/死）'); }
    else if(ke(yueWx, wx)){ scores.push(-2); reason.push('月建克（囚）'); }

    if(CHONG[yueDz] === dz){ scores.push(-3); if(!reason.some(r=>r.includes('月破'))) reason.push('月破'); }
    if(LIUHE[yueDz] === dz){ scores.push(1); reason.push('月建合'); }

    // 日辰
    if(dz === riDz){ scores.push(2); reason.push('临日辰'); }
    else if(sheng(riWx, wx)){ scores.push(1); reason.push('日辰生扶'); }
    else if(ke(riWx, wx)){ scores.push(-1); reason.push('日辰克'); }
    else if(riWx === wx){ scores.push(1); reason.push('日辰同气'); }
    if(CHONG[riDz] === dz){
      if(yao.dong){ scores.push(1); reason.push('动逢日冲为暗动'); }
      else if(scores.reduce((a,b)=>a+b,0) <= -2){ scores.push(-2); reason.push('休囚逢冲为日破'); }
      else { scores.push(0); reason.push('日冲（需观旺衰）'); }
    }
    if(LIUHE[riDz] === dz){ scores.push(1); reason.push('日辰合'); }
    if(yao.kong){ scores.push(-2); reason.push('旬空'); }

    // 动爻生克（其他动爻）
    for(const d of allYaos){
      if(d.pos === yao.pos || !d.dong) continue;
      const dwx = WX_MAP[d.wuxing];
      if(sheng(dwx, wx)){ scores.push(1); reason.push(`${POS_NAME[d.pos]}爻动来生`); }
      if(ke(dwx, wx)){ scores.push(-1); reason.push(`${POS_NAME[d.pos]}爻动来克`); }
    }

    const total = scores.reduce((a,b)=>a+b,0);
    let level = '平';
    if(total >= 5) level='极旺';
    else if(total >= 3) level='旺';
    else if(total >= 1) level='偏旺';
    else if(total === 0) level='平';
    else if(total >= -2) level='偏弱';
    else if(total >= -4) level='衰';
    else level='极衰';

    return { level, score: total, reason, wx };
  }

  /**
   * 根据 value 算出变爻的干支/五行
   * value 变：6→阳、9→阴；7/8不变
   * 变爻的纳甲需重新按变卦上下卦算，这里简化：取同一位置变值后、按变卦的纳甲干支；
   * 为避免复杂的变卦干支推算，我们直接根据engine的findGong结果给出一个简化处理：
   *  变爻的干支按变卦（翻转后的卦象）重新算，需要najiaForTrigram支持。
   */
  function getBianGuaYaos(pan){
    // 构造变卦 lines：动爻翻转
    const lines = pan.yaos.map(y=>y.yinyang);
    pan.yaos.forEach((y,i)=>{ if(y.dong) lines[i] = 1 - lines[i]; });
    // 把lines映射回yaoValues（1→7,0→8）
    const vals = lines.map(y=> y?7:8);
    const eng = global.YJ_NAJIA_ENGINE;
    const bianPan = eng.zhuangua(vals, {yue: pan.tiaojian.yue, ri: pan.tiaojian.ri});
    return bianPan.yaos.map(y=>({
      zhi:y.zhi, wuxing:WX_MAP[y.wuxing], yinyang:y.yinyang,
    }));
  }

  /**
   * 主断卦函数
   */
  function duangua(pan, wenshi, gender){
    const rules = YONGSHEN_RULES.find(r=>r.id===wenshi) || YONGSHEN_RULES[0];
    const yongWanted = typeof rules.main==='string' ? rules.main : (rules.main[gender]||rules.main.zizhan||'世爻');

    const yue = pan.tiaojian.yue;
    const ri = pan.tiaojian.ri.slice(-1); // 取最后一个字为地支
    const riGan = pan.tiaojian.ri[0];
    const yaoList = pan.yaos.map(y=>{
      const wx = WX_MAP[y.wuxing];
      const pos = y.pos; // 1-6
      const label = POS_NAME[pos] + (y.yinyang? '阳' : '阴') + '爻';
      return {
        idx: pos-1,
        pos,
        label,
        gz: y.gan + y.zhi,
        dz: y.zhi,
        wx,
        gan: y.gan,
        wuxingRaw: y.wuxing,
        liuqin: y.liuqin.name,
        liuqinKey: y.liuqin.key,
        liuShen: y.liushen,
        isYang: !!y.yinyang,
        isDong: !!y.dong,
        isShi: !!y.shi,
        isYing: !!y.ying,
        kong: !!y.kong,
        value: y.value,
      };
    });

    const shi = yaoList.find(y=>y.isShi);
    const ying = yaoList.find(y=>y.isYing);
    const dongYaos = yaoList.filter(y=>y.isDong);

    // ===== 找用神 =====
    let yong = null, yongType = '';
    const LQ_NAME2KEY = {'父母':'父母','官鬼':'官鬼','妻财':'妻财','子孙':'子孙','兄弟':'兄弟'};

    if(yongWanted === '世爻'){ yong = shi; yongType = '世爻（占者自身为用神）'; }
    else if(yongWanted === '应爻'){ yong = ying; yongType = '应爻（对方/事体为用神）'; }
    else {
      const lqName = LQ_NAME2KEY[yongWanted];
      const candidates = yaoList.filter(y=>y.liuqin===lqName);
      if(candidates.length>0){
        // 临世应优先，次则旺相优先
        candidates.sort((a,b)=>{
          const as = (a.isShi?2:0)+(a.isYing?1:0);
          const bs = (b.isShi?2:0)+(b.isYing?1:0);
          return bs-as;
        });
        yong = candidates[0];
        yongType = `${lqName}${yong.isShi?'（临世）':(yong.isYing?'（临应）':'')}（用神）`;
      } else {
        // 用神不现 → 从伏神取
        const fu = (pan.fushen||[]).find(f=>f.liuqin && f.liuqin.name===lqName);
        if(fu){
          yong = {
            idx: fu.feiPos-1, pos: fu.feiPos,
            label: `伏${POS_NAME[fu.feiPos] || fu.pos}`,
            gz: (fu.gan||'') + (fu.zhi||''),
            dz: fu.zhi,
            wx: WX_MAP[fu.wuxing],
            liuqin: lqName,
            liuShen: '',
            isFu: true,
            feiIdx: (fu.feiPos-1),
            kong: false,
            isDong:false, isShi:false, isYing:false,
          };
          yongType = `${lqName}（伏神，伏于${fu.feiPos?POS_NAME[fu.feiPos]+'爻下':'卦中'}`;
        }
      }
    }

    if(!yong){
      return { error:`用神不现，${yongWanted}不上卦且伏神无着，请重起卦或换占法`, rules };
    }

    // ===== 原神/忌神/仇神/闲神 =====
    const yongWx = yong.wx;
    const yuanShenWx = Object.keys(SHENG).find(w=>SHENG[w]===yongWx);
    const jiShenWx   = Object.keys(KE).find(w=>KE[w]===yongWx);
    const chouShenWx = Object.keys(SHENG).find(w=>SHENG[w]===jiShenWx);
    const xianShenWx = SHENG[yongWx];

    const filterByWx = (wx, fu) => yaoList.filter(y=>y.wx===wx && !y.isFu);
    const yuanShen = filterByWx(yuanShenWx);
    const jiShen   = filterByWx(jiShenWx);
    const chouShen = filterByWx(chouShenWx);

    // ===== 旺衰 =====
    const yongWS = yaowangshuai(yong, yue, ri, yaoList);
    const yuanWS = yuanShen.map(y=>yaowangshuai(y,yue,ri,yaoList));
    const jiWS   = jiShen.map(y=>yaowangshuai(y,yue,ri,yaoList));
    const chouWS = chouShen.map(y=>yaowangshuai(y,yue,ri,yaoList));

    // ===== 动变（回头生克、化进化退）=====
    const dongbian = [];
    const bianYaos = getBianGuaYaos(pan);
    for(const d of dongYaos){
      const bian = bianYaos[d.idx];
      if(!bian) continue;
      const dWx = d.wx;
      const bWx = bian.wuxing;
      let rel = '';
      if(sheng(bWx, dWx)) rel='化回头生：变爻生扶动爻，动爻益旺';
      else if(ke(bWx, dWx)) rel='化回头克：变爻克伤动爻，动爻无力';
      else if(sheng(dWx, bWx)) rel='化泄：动生变，动爻泄气';
      else if(ke(dWx, bWx)) rel='化克：动克变，事有阻隔';
      else if(bWx===dWx){
        const JIN = {寅:'卯',申:'酉',丑:'辰',未:'戌',巳:'午',亥:'子'};
        const TUI = {卯:'寅',酉:'申',辰:'丑',戌:'未',午:'巳',子:'亥'};
        if(JIN[d.dz]===bian.zhi) rel='化进神：力量增强、事态发展';
        else if(TUI[d.dz]===bian.zhi) rel='化退神：力量消退、事情缓散';
        else rel='伏吟：同支呻吟，忧疑不决';
      } else rel='同宫异气';
      dongbian.push({ yao:d, type:rel.split('：')[0], desc:`${d.label}（${d.gz}·${d.liuqin}）动化${bian.zhi}（${bWx}），${rel}` });
    }

    const duiYong = [];
    for(const d of dongYaos){
      if(d.pos === yong.pos) continue;
      if(sheng(d.wx, yongWx)) duiYong.push({yao:d, type:'动来生用', good:true});
      else if(ke(d.wx, yongWx)) duiYong.push({yao:d, type:'动来克用', good:false});
      else if(yongWx===d.wx) duiYong.push({yao:d, type:'动来比扶', good:true});
    }

    // ===== 用神特殊状态 =====
    const yongSpecial = [];
    if(yong.kong) yongSpecial.push('用神旬空：所问之事目前虚无缥缈、时机未到；旺相待出空（冲空、填实）则成，休囚终空');
    if(yongWS.reason.some(r=>r.includes('月破'))) yongSpecial.push('用神月破：事多破散难成，纵有成亦不久');
    if(yongWS.reason.some(r=>r.includes('日破'))) yongSpecial.push('用神日破：休囚逢冲，事被冲散');
    if(yong.isFu){
      const fei = yaoList[yong.feiIdx];
      if(fei){
        const fwx = fei.wx;
        if(sheng(fwx,yongWx)) yongSpecial.push(`用神伏藏于${fei.label}（${fei.gz}·${fei.liuqin}）下，飞神生伏神，易出，待冲飞、露伏之日月可成`);
        else if(ke(fwx,yongWx)) yongSpecial.push(`伏于${fei.label}下，飞来克伏（飞来压伏），用神被压不得出，甚凶`);
        else if(ke(yongWx,fwx)) yongSpecial.push(`伏克飞（伏去克飞为出暴），事可出但急中有悔`);
        else if(yongWx===fwx) yongSpecial.push(`伏与飞比和，事可自然露出`);
        else yongSpecial.push(`伏生飞，泄气，事难成`);
      }
    }

    // ===== 吉凶判定 =====
    const yuanActive = yuanWS.filter((w,i)=>yuanShen[i].isDong && w.score>=0).length;
    const jiActive   = jiWS.filter((w,i)=>jiShen[i].isDong && w.score>=0).length;
    const chouActive = chouWS.filter((w,i)=>chouShen[i].isDong && w.score>=0).length;

    let jiXiong = '平';
    const jiXiongReason = [];

    if(yongWS.score >= 3 && jiActive===0){ jiXiong='大吉'; jiXiongReason.push('用神旺相，无动爻来克，诸事顺遂'); }
    else if(yongWS.score >= 1 && yuanActive>0 && jiActive===0){ jiXiong='吉'; jiXiongReason.push('用神旺相，原神发动来生，事可成'); }
    else if(yongWS.score >= 0 && jiActive===0){ jiXiong='小吉'; jiXiongReason.push('用神尚有力，无动克，事可缓慢成就'); }
    else if(yongWS.score <= -3 && yuanActive===0){ jiXiong='大凶'; jiXiongReason.push('用神休囚破散，无原神救助，事不可为'); }
    else if(jiActive>0 && yuanActive===0){ jiXiong='凶'; jiXiongReason.push('忌神发动克用，原神不现，事有阻难'); }
    else if(yongWS.score <= -1 && jiActive>0){ jiXiong='凶'; jiXiongReason.push('用神衰弱又见忌神动克'); }
    else if(yongWS.score >= 0 && jiActive>0 && yuanActive>0){ jiXiong='先难后易'; jiXiongReason.push('忌神虽动，但原神亦动通关，凶中有救，先阻后成'); }
    else if(chouActive>0){ jiXiong='凶中加重'; jiXiongReason.push('仇神发动生忌克原，凶势加重'); }
    else { jiXiong='平'; jiXiongReason.push('用神旺衰与动克平衡，事在两可，需观时日'); }

    if(yong.kong && yongWS.score<2){ jiXiong='空待'; jiXiongReason.push('用神空亡，事未到时候，待出空、冲空之日方可论吉凶'); }
    if(yongWS.reason.some(r=>r.includes('月破')) && yongWS.score<3){
      jiXiongReason.push('用神月破，纵成易破');
    }

    // 疾病专项
    if(wenshi==='jibing'){
      const ghost = yaoList.find(y=>y.liuqin==='官鬼');
      const med   = yaoList.find(y=>y.liuqin==='子孙');
      if(ghost){
        const gws = yaowangshuai(ghost,yue,ri,yaoList);
        const mws = med ? yaowangshuai(med,yue,ri,yaoList) : null;
        if(gws.score>=2 && (!mws || mws.score<=0)){
          jiXiong='病重';
          jiXiongReason.push('官鬼（病）旺而无制，子孙（药）无力或不现，病重难愈');
        } else if(mws && mws.score>=1 && ke(mws.wx,gws.wx)){
          jiXiongReason.push('子孙旺相克官鬼，医药有效，病可愈');
        }
      }
    }

    const shiWS = yaowangshuai(shi, yue, ri, yaoList);
    const yingWS= yaowangshuai(ying, yue, ri, yaoList);

    return {
      rules, yongWanted, yong, yongType, yongWS,
      yuanShenWx, jiShenWx, chouShenWx, xianShenWx,
      yuanShen, yuanWS, jiShen, jiWS, chouShen, chouWS,
      dongbian, duiYong, yongSpecial,
      jiXiong, jiXiongReason,
      shi, ying, shiWS, yingWS,
      yue, ri, riGan,
    };
  }

  global.YJ_NAJIA_DUANGUA = {
    LIUQIN_WANWU,
    LIUSHEN_WANWU,
    YONGSHEN_RULES,
    duangua,
    yaowangshuai,
    WX_MAP,
  };
})(window);
