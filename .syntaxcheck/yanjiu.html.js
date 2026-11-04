
// 根据hash自动打开对应tab
const hash = window.location.hash.replace('#','');
if(hash) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const target = document.querySelector(`.tab[data-tab="${hash}"]`);
  const content = document.getElementById(hash);
  if(target && content) {
    target.classList.add('active');
    content.classList.add('active');
  }
}

// Tab切换
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// 大衍筮法模拟
function daYan() {
  let n = 49;
  for(let i=0;i<3;i++) {
    const left = Math.floor(Math.random()*(n-2))+1;
    const right = n - left - 1;
    const lrem = left%4 || 4;
    const rrem = right%4 || 4;
    n = n - 1 - lrem - rrem;
  }
  return n/4; // 6/7/8/9
}
const yaoMap = {6:'老阴（×）变阳',7:'少阳（—）',8:'少阴（- -）',9:'老阳（○）变阴'};
const yaoSym = {6:'- -',7:'——',8:'- -',9:'——'};
function doShiYi() {
  let yaos = [];
  for(let i=0;i<6;i++) yaos.push(daYan());
  yaos = yaos.reverse(); // 初爻到上爻
  let benGua = '';
  let bianGua = '';
  let bianYao = [];
  yaos.forEach((y,i) => {
    benGua += yaoSym[y];
    if(y===6||y===9) {
      bianYao.push(i+1);
      bianGua += (y===6)?'——':'- -';
    } else {
      bianGua += yaoSym[y];
    }
    benGua += '<br>';
    bianGua += '<br>';
  });
  document.getElementById('shifaResult').innerHTML = `
    <div class="shi-yi-box">
      本卦（初→上）<br>${benGua.replace(/<br>$/,'')}
      ${bianYao.length?`<br><br>变卦（变爻第${bianYao.join('、')}爻）<br>${bianGua.replace(/<br>$/,'')}`:'<br>无动爻，以本卦卦辞断'}
    </div>
    <div class="shi-yi-result">
      <strong>六爻：</strong>初${yaoMap[yaos[0]]}、二${yaoMap[yaos[1]]}、三${yaoMap[yaos[2]]}、四${yaoMap[yaos[3]]}、五${yaoMap[yaos[4]]}、上${yaoMap[yaos[5]]}<br>
      <strong>断法参考：</strong>${bianYao.length===0?'本卦卦辞为断':bianYao.length===1?'以本卦变爻爻辞断':bianYao.length===2?'以本卦两变爻爻辞断，上者为主':bianYao.length===3?'以本卦卦辞+变卦卦辞合断，本卦为主':'多数变爻以变卦卦辞为主'}
    </div>
  `;
}
function clearResult() { document.getElementById('shifaResult').innerHTML = ''; }
