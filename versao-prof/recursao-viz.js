/*
 * Algoritmos II com jogos e animações
 * Feito a partir do material da disciplina CI1056 (UFPR). Licença: CC BY-NC-SA 4.0
 *
 * Recursão em movimento: a chamada se divide em chamadas menores, a câmera
 * desce até o caso base, e depois as chamadas voltam uma por uma, devolvendo
 * os valores pela pilha. Código do professor ao lado, com a linha da vez.
 * Controles: rodar/pausar, passo pra frente e pra trás, início, fim, velocidade.
 *
 * Uso: window.RecViz(elementoOndeMontar, {fn:'fat'|'pot'|'fib', n:4})
 */
(function(){
"use strict";
const NS='http://www.w3.org/2000/svg';
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,k)=>a+(b-a)*k;
const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- as funções, com o código igual ao da aula ---------- */
const FUN={
  fat:{nome:'Fatorial',rot:n=>`f(${n})`,nMin:0,nMax:7,nPad:4,
    cod:['int f(int n) {','  if (n == 0)','    return 1;','  else','    return n * f(n-1);','}'],
    L:{teste:1,base:2,rec:4,volta:4},
    base:n=>n===0, vBase:()=>1, filhos:n=>[n-1],
    espera:(n,vs)=>`${n} · ?`, combina:(n,vs)=>({v:n*vs[0],txt:`${n} · ${vs[0]} = ${n*vs[0]}`})},
  pot:{nome:'Potência',rot:n=>`pot(2,${n})`,nMin:0,nMax:7,nPad:4,
    cod:['float potencia (float x, int n) {','  if (n==0) return 1.0;','  return x * potencia (x,n-1);','}'],
    L:{teste:1,base:1,rec:2,volta:2},
    base:n=>n===0, vBase:()=>1, filhos:n=>[n-1],
    espera:(n,vs)=>`2 · ?`, combina:(n,vs)=>({v:2*vs[0],txt:`2 · ${vs[0]} = ${2*vs[0]}`})},
  fib:{nome:'Fibonacci',rot:n=>`F(${n})`,nMin:1,nMax:6,nPad:4,
    cod:['int F(int n) {','  if (n <= 1)','    return n;','  return F(n-1) + F(n-2);','}'],
    L:{teste:1,base:2,rec:3,volta:3},
    base:n=>n<=1, vBase:n=>n, filhos:n=>[n-1,n-2],
    espera:(n,vs)=>vs.length?`${vs[0]} + ?`:'? + ?', combina:(n,vs)=>({v:vs[0]+vs[1],txt:`${vs[0]} + ${vs[1]} = ${vs[0]+vs[1]}`})}
};

/* ---------- gera a árvore de chamadas e a lista de passos ---------- */
function gera(F,n){
  const nos=[], ev=[];
  function chama(arg,pai,prof){
    const id=nos.length; nos.push({id,arg,pai,prof,filhos:[],rot:F.rot(arg)});
    if(pai>=0) nos[pai].filhos.push(id);
    ev.push({t:'chama',id,linha:pai>=0?F.L.rec:0});
    ev.push({t:'testa',id,linha:F.L.teste});
    if(F.base(arg)){const v=F.vBase(arg); ev.push({t:'base',id,v,linha:F.L.base}); ev.push({t:'volta',id,v,linha:F.L.base}); return v;}
    const vs=[];
    for(const a of F.filhos(arg)){ ev.push({t:'espera',id,arg:a,vs:vs.slice(),linha:F.L.rec}); vs.push(chama(a,id,prof+1)); ev.push({t:'recebe',id,vs:vs.slice(),linha:F.L.rec}); }
    const c=F.combina(arg,vs); ev.push({t:'combina',id,v:c.v,txt:c.txt,linha:F.L.volta}); ev.push({t:'volta',id,v:c.v,linha:F.L.volta});
    return c.v;
  }
  chama(n,-1,0);
  // posições: folhas em ordem, pais no meio dos filhos; recursão linear vira uma escada pra dentro
  const linear=nos.every(x=>x.filhos.length<=1);
  let folha=0;
  (function pos(id){const x=nos[id]; if(!x.filhos.length){x.x=folha++;} else {x.filhos.forEach(pos); x.x=x.filhos.reduce((s,f)=>s+nos[f].x,0)/x.filhos.length;}})(0);
  nos.forEach(x=>{ if(linear){x.px=x.prof*150; x.py=x.prof*96;} else {x.px=x.x*118; x.py=x.prof*104;} x.esc=linear?Math.pow(.93,x.prof):Math.pow(.95,x.prof); });
  return {nos,ev,linear};
}

/* ---------- estado depois de k passos ---------- */
function estado(G,F,k){
  const S={vis:new Set(),st:{},txt:{},val:{},pilha:[],ativo:0,linha:0,ev:null,prof:0,maxProf:0,chamadas:0};
  for(let i=0;i<=k&&i<G.ev.length;i++){
    const e=G.ev[i]; S.ev=e; S.linha=e.linha; const x=G.nos[e.id];
    if(e.t==='chama'){S.vis.add(e.id); S.st[e.id]='ativo'; if(x.pai>=0) S.st[x.pai]='espera'; S.pilha.push(e.id); S.ativo=e.id; S.chamadas++;}
    else if(e.t==='testa'){S.ativo=e.id;}
    else if(e.t==='base'){S.st[e.id]='base'; S.txt[e.id]=`devolve ${e.v}`; S.ativo=e.id;}
    else if(e.t==='espera'){S.st[e.id]='ativo'; S.txt[e.id]=F.espera(x.arg,e.vs); S.ativo=e.id;}
    else if(e.t==='recebe'){S.st[e.id]='ativo'; S.txt[e.id]=F.espera(x.arg,e.vs).replace('?',e.vs[e.vs.length-1]); if(e.vs.length<F.filhos(x.arg).length) S.txt[e.id]=F.espera(x.arg,e.vs); S.ativo=e.id;}
    else if(e.t==='combina'){S.st[e.id]='ativo'; S.txt[e.id]=e.txt; S.ativo=e.id;}
    else if(e.t==='volta'){S.st[e.id]='feito'; S.val[e.id]=e.v; S.txt[e.id]=`= ${e.v}`; S.pilha.pop(); S.ativo=x.pai>=0?x.pai:e.id; if(x.pai>=0) S.st[x.pai]='ativo';}
    S.maxProf=Math.max(S.maxProf,S.pilha.length);
  }
  S.prof=S.pilha.length;
  return S;
}
function narra(G,F,S){
  const e=S.ev; if(!e) return ''; const x=G.nos[e.id], R=x.rot;
  switch(e.t){
    case 'chama': return x.pai<0?`Começa: <b>${R}</b> entra na pilha.`:`<b>${G.nos[x.pai].rot}</b> não sabe a resposta ainda: chama <b>${R}</b>, um caso menor. A pilha cresce.`;
    case 'testa': return `${R} testa: já é o caso base?${F.base(x.arg)?' <b>Sim.</b>':' Não, então vai precisar de ajuda.'}`;
    case 'base': return `<b>Caso base!</b> ${R} sabe a resposta direto: ${e.v}. Ninguém mais é chamado.`;
    case 'espera': return `${R} vai chamar ${F.rot(e.arg)} e fica <b>esperando</b> com a conta pela metade: ${F.espera(x.arg,e.vs)}.`;
    case 'recebe': return `${R} recebeu ${e.vs[e.vs.length-1]} e continua de onde parou.`;
    case 'combina': return `${R} já tem tudo: <b>${e.txt}</b>.`;
    case 'volta': return x.pai<0?`<b>Fim!</b> ${R} devolve <b>${e.v}</b> e a pilha esvazia.`:`${R} devolve <b>${e.v}</b> pra ${G.nos[x.pai].rot} e sai da pilha. A pilha encolhe.`;
  }
  return '';
}

/* ---------- estilos ---------- */
let estiloPronto=false;
function estilos(){
  if(estiloPronto) return; estiloPronto=true;
  if(!document.querySelector('link[href*="Inter"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';document.head.appendChild(l);}
  const s=document.createElement('style'); s.textContent=`
.rv{--p:#2f5d7c;--p2:#1f4560;--ci:#22b8e6;--pe:#ff9f5a;--ok:#1f9d63;--tx:#24303c;--mu:#6b7785;
  font-family:Inter,system-ui,sans-serif;color:var(--tx);max-width:1080px;margin:16px auto 8px;padding:0 4px}
.rv-top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:0 4px 12px}
.rv-top h2{margin:0;font:800 clamp(1.3rem,2.6vw,1.75rem)/1.1 Inter,system-ui,sans-serif;letter-spacing:-.02em;color:var(--p2)}
.rv-top p{margin:4px 0 0;color:var(--mu);font-size:.95rem}
.rv-sel{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.rv-sel button{font:600 .88rem Inter,system-ui,sans-serif;border:0;border-radius:999px;padding:8px 14px;background:#eaf2f8;color:var(--p);cursor:pointer}
.rv-sel button.on{background:var(--p2);color:#fff}
.rv-n{display:inline-flex;align-items:center;background:#eaf2f8;border-radius:999px;padding:2px}
.rv-n button{background:transparent;padding:6px 11px}
.rv-n span{font:700 .9rem 'JetBrains Mono',monospace;color:var(--p2);min-width:2.6em;text-align:center}
.rv-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px}
@media (max-width:860px){.rv-grid{grid-template-columns:1fr}}
.rv-palco{position:relative;border-radius:22px;overflow:hidden;min-height:380px;
  background:radial-gradient(ellipse at 50% 0%,#ffffff 0,#f1f7fc 55%,#e6f0f8 100%);box-shadow:0 1px 2px #1f456014,0 12px 40px #1f45601a}
.rv-palco:before{content:"";position:absolute;inset:0;background-image:radial-gradient(#c9dbe9 1px,transparent 1.2px);background-size:22px 22px;opacity:.55;
  mask-image:linear-gradient(180deg,#000,transparent 85%);-webkit-mask-image:linear-gradient(180deg,#000,transparent 85%)}
.rv-palco svg{position:relative;display:block;width:100%;height:380px}
.rv-hud{position:absolute;left:14px;top:12px;display:flex;gap:8px;flex-wrap:wrap}
.rv-hud span{font:600 .78rem Inter,system-ui,sans-serif;background:#ffffffd9;backdrop-filter:blur(6px);border-radius:999px;padding:5px 11px;color:var(--p2);box-shadow:0 1px 3px #1f456014}
.rv-hud b{font-family:'JetBrains Mono',monospace}
.rv-prof{display:inline-flex;gap:3px;vertical-align:middle;margin-left:4px}
.rv-prof i{width:7px;height:12px;border-radius:2px;background:#d6e4ef;display:inline-block}
.rv-prof i.on{background:var(--ci)}
.rv-lado{display:flex;flex-direction:column;gap:12px;min-width:0}
.rv-card{background:#fff;border-radius:18px;padding:12px 14px;box-shadow:0 1px 2px #1f456014,0 8px 26px #1f456012}
.rv-card h4{margin:0 0 8px;font:700 .72rem Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mu)}
.rv-cod{font:500 .8rem/1.65 'JetBrains Mono',monospace;overflow-x:auto}
.rv-cod div{white-space:pre;padding:0 8px;border-radius:7px;transition:background .25s,color .25s}
.rv-cod div.on{background:#e3f6fc;color:var(--p2);box-shadow:inset 3px 0 0 var(--ci)}
.rv-cod div.on.b{background:#fff1e6;box-shadow:inset 3px 0 0 var(--pe)}
.rv-cod div.on.v{background:#e5f6ee;box-shadow:inset 3px 0 0 var(--ok)}
.rv-pilha{display:flex;flex-direction:column-reverse;gap:5px;min-height:150px;max-height:230px;overflow:auto;justify-content:flex-start}
.rv-fr{display:flex;justify-content:space-between;gap:8px;align-items:center;font:600 .82rem 'JetBrains Mono',monospace;padding:7px 10px;border-radius:11px;
  background:#f2f6fa;color:var(--p2);animation:rvEntra .28s ease-out}
.rv-fr small{font:500 .74rem Inter,system-ui,sans-serif;color:var(--mu)}
.rv-fr.topo{background:linear-gradient(135deg,var(--p2),var(--p));color:#fff}
.rv-fr.topo small{color:#cfe6f5}
.rv-vazia{font:500 .82rem Inter,system-ui,sans-serif;color:var(--mu);text-align:center;padding:14px 0}
@keyframes rvEntra{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
.rv-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px}
.rv-bar button{font:600 .9rem Inter,system-ui,sans-serif;border:0;border-radius:12px;min-width:44px;height:44px;padding:0 12px;background:#fff;color:var(--p2);cursor:pointer;
  box-shadow:0 1px 2px #1f456014,0 4px 14px #1f456012}
.rv-bar button.pri{background:var(--p2);color:#fff;min-width:110px}
.rv-bar button:disabled{opacity:.35;cursor:default}
.rv-bar label{display:flex;align-items:center;gap:8px;font:500 .82rem Inter,system-ui,sans-serif;color:var(--mu);margin-left:auto}
.rv-bar input{accent-color:var(--p2);width:120px}
.rv-narra{margin-top:10px;font-size:1rem;line-height:1.45;min-height:2.9em;padding:10px 14px;border-radius:14px;background:#fff;box-shadow:0 1px 2px #1f456014}
.rv-narra b{color:var(--p2)}
/* nós da árvore */
.rv-no rect{transition:fill .3s,stroke .3s}
.rv-no text{font-family:Inter,system-ui,sans-serif}
.rv-no{transition:opacity .35s}
.rv-aresta{fill:none;stroke:#b9cfe0;stroke-width:2;transition:stroke .3s,opacity .35s}
.rv-aresta.viva{stroke:var(--p)}
.rv-pulso{transform-box:fill-box;transform-origin:center;animation:rvPulso 1.6s ease-out infinite}
@keyframes rvPulso{from{opacity:.55;transform:scale(1)}to{opacity:0;transform:scale(1.35)}}
`;
  document.head.appendChild(s);
}

/* ---------- componente ---------- */
window.RecViz=function(alvo,op){
  estilos();
  op=op||{};
  let fn=op.fn||'fat', n=op.n!=null?op.n:FUN[fn].nPad;
  const raiz=document.createElement('div'); raiz.className='rv';
  raiz.innerHTML=`
  <div class="rv-top">
    <div><h2>Recursão em movimento</h2><p>A chamada se divide em chamadas menores até o caso base. Depois, as respostas voltam pela pilha.</p></div>
    <div class="rv-sel">${Object.keys(FUN).map(k=>`<button data-fn="${k}">${FUN[k].nome}</button>`).join('')}
      <span class="rv-n"><button data-d="-1" aria-label="diminuir n">−</button><span class="rv-nv"></span><button data-d="1" aria-label="aumentar n">+</button></span></div>
  </div>
  <div class="rv-grid">
    <div>
      <div class="rv-palco"><svg aria-label="árvore de chamadas recursivas"></svg>
        <div class="rv-hud"><span>profundidade <b class="rv-pv">0</b><span class="rv-prof"></span></span><span>chamadas <b class="rv-ch">0</b></span><span>passo <b class="rv-ps">0</b></span></div></div>
      <div class="rv-bar">
        <button data-a="ini" aria-label="voltar ao início">⏮</button>
        <button data-a="ant" aria-label="passo anterior">◀</button>
        <button data-a="play" class="pri">▶ Rodar</button>
        <button data-a="prox" aria-label="próximo passo">▶|</button>
        <button data-a="fim" aria-label="ir para o fim">⏭</button>
        <label>velocidade <input type="range" min="1" max="10" value="5"></label>
      </div>
      <div class="rv-narra"></div>
    </div>
    <div class="rv-lado">
      <div class="rv-card"><h4>Código da aula</h4><div class="rv-cod"></div></div>
      <div class="rv-card"><h4>Pilha de execução</h4><div class="rv-pilha"></div></div>
    </div>
  </div>`;
  alvo.appendChild(raiz);
  const q=s=>raiz.querySelector(s), svg=q('svg');
  let G,F,k=-1,S,tm=0,tocando=false;
  // câmera (viewBox) suave
  const cam={x:-200,y:-60,w:600,h:380}, alvoCam={...cam};
  let voo=null; // valor voltando do filho pro pai
  const el=(tag,at,pai)=>{const e=document.createElementNS(NS,tag);for(const a in at)e.setAttribute(a,at[a]);if(pai)pai.appendChild(e);return e;};

  function monta(){
    F=FUN[fn]; n=clamp(n,F.nMin,F.nMax); G=gera(F,n); k=-1; parar();
    raiz.querySelectorAll('.rv-sel [data-fn]').forEach(b=>b.classList.toggle('on',b.dataset.fn===fn));
    q('.rv-nv').textContent=`n = ${n}`;
    q('.rv-cod').innerHTML=F.cod.map(l=>`<div>${l.replace(/</g,'&lt;')}</div>`).join('');
    // desenha todos os nós (escondidos) uma vez só
    svg.innerHTML='';
    const def=el('defs',{},svg);
    const gr=(id,a,b)=>{const g=el('linearGradient',{id,x1:0,y1:0,x2:0,y2:1},def);el('stop',{offset:0,'stop-color':a},g);el('stop',{offset:1,'stop-color':b},g);};
    gr('rvAtivo','#2f6d93','#1f4560'); gr('rvFeito','#effaf4','#d7f1e3'); gr('rvBase','#fff4ea','#ffe0c7'); gr('rvEspera','#ffffff','#f1f6fa');
    const fs=el('filter',{id:'rvSombra',x:'-30%',y:'-30%',width:'160%',height:'190%'},def); el('feDropShadow',{dx:0,dy:6,stdDeviation:7,'flood-color':'#1f4560','flood-opacity':.16},fs);
    G.ares=el('g',{},svg); G.camNos=el('g',{},svg); G.camVoo=el('g',{},svg);
    G.nos.forEach(x=>{
      if(x.pai>=0){const p=G.nos[x.pai]; const my=(p.py+x.py)/2;
        x.ar=el('path',{class:'rv-aresta',d:`M${p.px} ${p.py+24*p.esc} C${p.px} ${my} ${x.px} ${my} ${x.px} ${x.py-24*x.esc}`,opacity:0},G.ares);}
      const g=el('g',{class:'rv-no',transform:`translate(${x.px} ${x.py}) scale(${x.esc})`,opacity:0},G.camNos);
      x.pul=el('rect',{x:-58,y:-24,width:116,height:48,rx:16,fill:'none',stroke:'#22b8e6','stroke-width':3,style:'display:none'},g);
      x.r=el('rect',{x:-58,y:-24,width:116,height:48,rx:16,filter:'url(#rvSombra)'},g);
      x.t1=el('text',{y:-3,'text-anchor':'middle','font-size':16,'font-weight':700},g); x.t1.textContent=x.rot;
      x.t2=el('text',{y:15,'text-anchor':'middle','font-size':12,'font-weight':600},g);
      x.g=g;
    });
    const pf=q('.rv-prof'); pf.innerHTML=Array.from({length:Math.max(...G.nos.map(x=>x.prof))+1},()=>'<i></i>').join('');
    pinta(false);
  }

  function pinta(animado){
    S=estado(G,F,k);
    G.nos.forEach(x=>{
      const vis=S.vis.has(x.id), st=S.st[x.id]||'', at=x.id===S.ativo&&k>=0&&st!=='feito';
      x.g.setAttribute('opacity',vis?1:0); if(x.ar){x.ar.setAttribute('opacity',vis?1:0); x.ar.classList.toggle('viva',vis&&st!=='feito');}
      const cor=at?'url(#rvAtivo)':st==='feito'?'url(#rvFeito)':st==='base'?'url(#rvBase)':'url(#rvEspera)';
      x.r.setAttribute('fill',cor); x.r.setAttribute('stroke',at?'#1f4560':st==='feito'?'#9fd9bb':st==='base'?'#ffb98a':'#c5d8e6'); x.r.setAttribute('stroke-width',1.5);
      x.t1.setAttribute('fill',at?'#fff':'#1f4560'); x.t2.setAttribute('fill',at?'#bfe6f7':st==='feito'?'#1f9d63':st==='base'?'#d26a1e':'#6b7785');
      x.t2.textContent=S.txt[x.id]||(st==='espera'?'esperando…':'');
      x.pul.style.display=at?'':'none'; x.pul.classList.toggle('rv-pulso',at);
    });
    // código e pilha
    raiz.querySelectorAll('.rv-cod div').forEach((d,i)=>{const on=k>=0&&i===S.linha; d.classList.toggle('on',on); d.classList.toggle('b',on&&S.ev&&S.ev.t==='base'); d.classList.toggle('v',on&&S.ev&&(S.ev.t==='volta'||S.ev.t==='combina'));});
    const P=q('.rv-pilha');
    P.innerHTML=S.pilha.length?S.pilha.map((id,i)=>{const x=G.nos[id];const topo=i===S.pilha.length-1;
      return `<div class="rv-fr${topo?' topo':''}"><span>${x.rot}</span><small>${topo?'rodando':'esperando '+(S.txt[id]||'')}</small></div>`;}).join('')
      :`<div class="rv-vazia">${k<0?'vazia: aperte ▶':'vazia: tudo devolvido'}</div>`;
    q('.rv-pv').textContent=S.prof; q('.rv-ch').textContent=S.chamadas; q('.rv-ps').textContent=`${Math.max(0,k+1)}/${G.ev.length}`;
    q('.rv-prof').querySelectorAll('i').forEach((e,i)=>e.classList.toggle('on',i<S.prof));
    q('.rv-narra').innerHTML=k<0?`Vamos calcular <b>${F.rot(n)}</b>. Aperte <b>▶ Rodar</b> ou avance passo a passo.`:narra(G,F,S);
    raiz.querySelector('[data-a="ant"]').disabled=raiz.querySelector('[data-a="ini"]').disabled=k<0;
    raiz.querySelector('[data-a="prox"]').disabled=raiz.querySelector('[data-a="fim"]').disabled=k>=G.ev.length-1;
    // valor voando de volta pro pai
    G.camVoo.innerHTML=''; voo=null;
    if(animado&&S.ev&&S.ev.t==='volta'){const x=G.nos[S.ev.id]; if(x.pai>=0){const p=G.nos[x.pai];
      const g=el('g',{},G.camVoo); el('rect',{x:-20,y:-14,width:40,height:28,rx:14,fill:'#1f9d63'},g); const t=el('text',{y:5,'text-anchor':'middle','font-size':14,'font-weight':800,fill:'#fff','font-family':'Inter,system-ui,sans-serif'},g); t.textContent=S.ev.v;
      voo={g,x0:x.px,y0:x.py,x1:p.px,y1:p.py,t0:performance.now(),d:Math.min(700,passoMs()*.8)};}}
    miraCamera();
  }
  function miraCamera(){
    const vis=G.nos.filter(x=>S.vis.has(x.id)); if(!vis.length){ const r=G.nos[0]; Object.assign(alvoCam,enquadra(r.px-200,r.py-120,r.px+200,r.py+120)); return; }
    const a=G.nos[S.ativo]||G.nos[0];
    let x0=Math.min(...vis.map(x=>x.px)),x1=Math.max(...vis.map(x=>x.px)),y0=Math.min(...vis.map(x=>x.py)),y1=Math.max(...vis.map(x=>x.py));
    if(G.linear){ // a câmera desce junto com a chamada ativa, mostrando de onde ela veio
      x0=a.px-380; x1=a.px+230; y0=a.py-290; y1=a.py+100; }
    else { x0-=90; x1+=90; y0-=70; y1+=70; const cx=(x0+x1)/2*.55+a.px*.45, cy=(y0+y1)/2*.55+a.py*.45, w=x1-x0, h=y1-y0; x0=cx-w/2; x1=cx+w/2; y0=cy-h/2; y1=cy+h/2; }
    Object.assign(alvoCam,enquadra(x0,y0,x1,y1));
  }
  function enquadra(x0,y0,x1,y1){
    const W=svg.clientWidth||600,H=svg.clientHeight||380, ar=W/H; let w=Math.max(x1-x0,320), h=Math.max(y1-y0,200);
    if(w/h<ar) w=h*ar; else h=w/ar; const cx=(x0+x1)/2, cy=(y0+y1)/2;
    return {x:cx-w/2,y:cy-h/2,w,h};
  }
  // laço de animação da câmera e do valor voando
  function quadro(now){
    const k2=reduz?1:.09;
    const longe=Math.abs(cam.x-alvoCam.x)+Math.abs(cam.y-alvoCam.y)+Math.abs(cam.w-alvoCam.w)+Math.abs(cam.h-alvoCam.h)>.3;
    if(longe){ // só redesenha enquanto a câmera ainda está se movendo
      cam.x=lerp(cam.x,alvoCam.x,k2); cam.y=lerp(cam.y,alvoCam.y,k2); cam.w=lerp(cam.w,alvoCam.w,k2); cam.h=lerp(cam.h,alvoCam.h,k2);
      svg.setAttribute('viewBox',`${cam.x.toFixed(1)} ${cam.y.toFixed(1)} ${cam.w.toFixed(1)} ${cam.h.toFixed(1)}`);}
    if(voo){const u=clamp((now-voo.t0)/voo.d,0,1), e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
      voo.g.setAttribute('transform',`translate(${lerp(voo.x0,voo.x1,e)} ${lerp(voo.y0,voo.y1,e)-Math.sin(u*Math.PI)*30}) scale(${1+Math.sin(u*Math.PI)*.25})`);
      voo.g.setAttribute('opacity',u<.9?1:(1-u)*10); if(u>=1){G.camVoo.innerHTML='';voo=null;}}
    requestAnimationFrame(quadro);
  }
  const passoMs=()=>{const v=+q('.rv-bar input').value; return 1700-v*150;};
  function vai(nk,animado){ k=clamp(nk,-1,G.ev.length-1); pinta(animado); }
  function roda(){ if(!tocando) return; if(k>=G.ev.length-1){parar();return;} vai(k+1,true); tm=setTimeout(roda,passoMs()); }
  function parar(){ tocando=false; clearTimeout(tm); const b=raiz.querySelector('[data-a="play"]'); if(b) b.textContent=k>=0&&G&&k>=G.ev.length-1?'↻ De novo':'▶ Rodar'; }
  raiz.querySelector('.rv-bar').addEventListener('click',e=>{const a=e.target.closest('button'); if(!a) return; const ac=a.dataset.a;
    if(ac==='play'){ if(tocando){parar();return;} if(k>=G.ev.length-1) vai(-1,false); tocando=true; a.textContent='⏸ Pausar'; roda(); }
    else { parar(); if(ac==='ini') vai(-1,false); if(ac==='ant') vai(k-1,false); if(ac==='prox') vai(k+1,true); if(ac==='fim') vai(G.ev.length-1,false); parar(); }});
  raiz.querySelector('.rv-sel').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.fn){fn=b.dataset.fn; n=FUN[fn].nPad; monta();}
    if(b.dataset.d){n+=+b.dataset.d; monta();}});
  monta(); Object.assign(cam,alvoCam); requestAnimationFrame(quadro);
  return {vai:(x)=>vai(x,false),estado:()=>S,G:()=>G};
};
})();
