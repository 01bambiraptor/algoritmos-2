/*
 * Algoritmos II com jogos e animações
 * Feito a partir do material da disciplina CI1056 (UFPR). Licença: CC BY-NC-SA 4.0
 * Mostra só as seções de UMA aula do professor, põe a porta que abre,
 * o mundo do tema no topo e a navegação entre aulas.
 */
(function(){
"use strict";
const B=document.body, D=B.dataset;
const BASE=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,''); // pasta deste script (funciona também nas subpastas)
const secs=(D.secoes||'').split(',').filter(Boolean);
const ORDEM=JSON.parse(D.ordem||'[]');           // [[arquivo, rotulo], ...]
const ME=D.eu||D.arquivo||'';   // data-eu: caminho da página na lista (versão desmembrada)
const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. mostra só as seções desta aula e renumera */
if(secs.length){
  document.querySelectorAll('main > section').forEach(s=>{ if(!secs.includes(s.id)) s.style.display='none'; });
  let n=0;
  secs.forEach(id=>{
    const s=document.getElementById(id); if(!s) return;
    const sp=s.querySelector('h2 .n'); const num=sp && /^\d+$/.test(sp.textContent.trim());
    if(num){ n++; sp.textContent=n; }
    const a=document.querySelector('#caps a[href="#'+id+'"]');
    if(a && num) a.textContent=a.textContent.replace(/^\d+/,n);
  });
  document.querySelectorAll('#caps a').forEach(a=>{ if(!secs.includes(a.getAttribute('href').slice(1))) a.remove(); });
}

/* 1b. põe as seções na ordem pedida em data-secoes (ex.: a prática do bloco no fim do tópico) */
if(secs.length){ const mm=document.querySelector('main'); const ult=[...mm.children].filter(e=>e.tagName==='SECTION').pop();
  let ref=ult?ult.nextSibling:null; secs.forEach(id=>{const e=document.getElementById(id); if(e) mm.insertBefore(e,ref);}); }

/* 2. mundo do tema (topo da página) */
const main=document.querySelector('main');
function el(tag,cls,html){const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e;}
const css=el('style',null,`
.mundo{margin:14px auto 4px;max-width:900px;padding:0 14px}
.mundo .cena{position:relative;background:linear-gradient(180deg,#e7f2fb,#fff7ee);border:2px solid var(--borda);border-radius:20px;padding:10px 12px 14px;overflow:hidden}
.mundo svg{display:block;width:100%;height:auto;max-height:300px}
.mundo .legE{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:6px;font-size:.98rem;color:var(--ink)}
.mundo .legE b{color:var(--titulo)}
.mundo .legE button{font:inherit;font-weight:600;border:0;border-radius:10px;padding:7px 13px;background:#fff;color:var(--titulo);box-shadow:0 1px 4px #0002;cursor:pointer}
.mundo .legE button:disabled{opacity:.4}
.mundo .frase{text-align:center;color:var(--muted);font-size:.95rem;margin-top:2px}
.mundoS{display:flex;gap:14px;align-items:center;background:linear-gradient(180deg,#e7f2fb,#fff7ee);border:2px solid var(--borda);border-radius:20px;padding:12px 16px}
.mundoS .selo{font-size:2.2rem;line-height:1}
.mundoS b{color:var(--titulo)}
@keyframes bobe{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.parado .bob{animation:none!important}
.vaiVolta{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;max-width:900px;margin:22px auto 8px;padding:0 14px}
.vaiVolta a{flex:1 1 220px;text-decoration:none;color:var(--titulo);background:#fff;border:2px solid var(--borda);border-radius:14px;padding:10px 14px;font-weight:600}
.vaiVolta a small{display:block;color:var(--muted);font-weight:400}
.vaiVolta a.pro{text-align:right;background:var(--ceu)}
.assina{max-width:900px;margin:14px auto 30px;padding:0 14px;text-align:center;color:var(--muted);font-size:.9rem}
.assina b{color:var(--titulo)}
.freire{display:inline-block;margin-top:6px;color:#2f5d7c;font-size:.95em}
table.map{display:block;overflow-x:auto;max-width:100%}
.codigo{overflow-x:auto;max-width:100%}
main{overflow-x:clip}
#porta{position:fixed;inset:0;z-index:100;background:#f2f7fb;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;transition:opacity .45s;cursor:pointer}
#porta.some{opacity:0;pointer-events:none}
#porta .luz{position:absolute;width:360px;height:480px;border-radius:50%;background:radial-gradient(circle at 50% 45%,#fff 0,#fff7e0 45%,#f2f7fb00 72%)}
#porta .batente{position:relative;width:200px;height:300px;perspective:700px;border-radius:100px 100px 6px 6px;background:#fff7e0;box-shadow:0 0 0 10px #c9a27a,0 0 60px #ffe08a99}
#porta .folha{position:absolute;inset:0;border-radius:100px 100px 6px 6px;background:linear-gradient(90deg,#e9b98a,#f6cfa4);border:3px solid #c9a27a;transform-origin:left center;animation:abre 1.1s .35s ease-in forwards}
#porta .folha:after{content:"";position:absolute;right:20px;top:55%;width:14px;height:14px;border-radius:50%;background:#f0a81c}
#porta .folha:before{content:"";position:absolute;inset:26px 26px 40% 26px;border:3px solid #c9a27a;border-radius:70px 70px 6px 6px}
@keyframes abre{to{transform:rotateY(-105deg)}}
#porta .nome{font:600 1.35rem Fredoka,system-ui,sans-serif;color:#2f5d7c;text-align:center;z-index:2}
#porta .nome small{display:block;font-weight:400;color:#6b7785;font-size:.95rem}
`);
document.head.appendChild(css);

if(D.mundo==='espelhos'||D.mundo==='recursao'){
  /* recursão em movimento: árvore de chamadas, pilha e código (recursao-viz.js) */
  const w=el('div',null); main.prepend(w);
  const sc=document.createElement('script'); sc.src=BASE+'recursao-viz.js';
  sc.onload=()=>{ if(window.RecViz) window.RecViz(w,{fn:D.recFn||'fat'}); };
  document.body.appendChild(sc);
} else if(D.resumo){
  const w=el('div','mundo');
  w.innerHTML=`<div class="mundoS"><div class="selo">${D.selo||'🚪'}</div><div><b>${D.resumo}</b></div></div>`;
  main.prepend(w);
}

/* 2b. bônus de memória (memoria-viz.js), depois das seções */
if(D.memoria){
  const cenas=D.memoria.split(',').map(c=>c.trim()).filter(Boolean);   // ex.: "pilha,busca"
  const ws=cenas.map(()=>{ const w=el('div',null); main.appendChild(w); return w; });
  const sc=document.createElement('script'); sc.src=BASE+'memoria-viz.js';
  sc.onload=()=>{ if(window.MemViz) cenas.forEach((c,i)=>window.MemViz(ws[i],{cena:c})); };
  document.body.appendChild(sc);
}

/* 3. anterior / próxima aula */
const i=ORDEM.findIndex(o=>o[0]===ME);
if(i>=0){
  const v=el('div','vaiVolta');
  if(i>0) v.innerHTML+=`<a href="${ORDEM[i-1][0]}"><small>◂ aula anterior</small>${ORDEM[i-1][1]}</a>`;
  if(i<ORDEM.length-1) v.innerHTML+=`<a class="pro" href="${ORDEM[i+1][0]}"><small>próxima aula ▸</small>${ORDEM[i+1][1]}</a>`;
  main.appendChild(v);
}

/* 4. assinatura */
main.appendChild(el('div','assina','Feito a partir do material da disciplina CI1056 · Algoritmos e Estruturas de Dados II · UFPR<br>Este material não substitui o material do professor: é uma ferramenta visual de apoio ao entendimento.<br><span class="freire"><i>“Ninguém nasce feito, é experimentando-nos no mundo que nós nos fazemos.”</i> Paulo Freire, <i>Política e educação</i></span>'));

/* 5. canto de cima: robozinho que dá oi e para, e o botão de tema claro/escuro */
const temaCss=el('style',null,`
html{overflow-x:clip}
.canto{display:flex;align-items:center;gap:8px;margin-left:auto}
.temaBt{font:600 .85rem Inter,Fredoka,system-ui,sans-serif;border:0;border-radius:999px;padding:7px 12px;background:var(--ceu);color:var(--titulo);cursor:pointer;min-height:38px}
.robo{width:104px;height:56px;cursor:pointer;flex:none;overflow:visible}
.robo *{transform-box:fill-box}
.robo .corpo{transform-origin:50% 100%}
.robo .braco{transform-origin:15% 85%}
.robo .olhos{transform-origin:50% 50%}
.robo .boca{transform-origin:50% 50%}
.robo .prop{opacity:0}
.robo.oi .corpo{animation:rSobe .55s cubic-bezier(.3,1.5,.5,1) both}
.robo.oi .braco{animation:rAceno .32s .5s 3 alternate ease-in-out both}
.robo.oi .olhos{animation:rPisca .2s 1.3s 2 alternate both}
.robo.oi .luzA{animation:rLuz .5s .4s 3 alternate both}
@keyframes rSobe{from{transform:translateY(60%) scale(.6);opacity:0}to{transform:none;opacity:1}}
@keyframes rAceno{from{transform:rotate(0)}to{transform:rotate(-38deg)}}
@keyframes rPisca{to{transform:scaleY(.1)}}
@keyframes rLuz{to{fill:#fff3b0}}
@keyframes rVe{to{opacity:1}}
@keyframes rPop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:none}}
/* gesto de cada assunto (toca uma vez, depois fica) */
.robo.oi .prop{animation:rVe .3s 1.6s both}
.robo .p1,.robo .p2{transform-origin:50% 100%}
.robo.oi.t-rec .p1{animation:rPop .45s 1.9s cubic-bezier(.3,1.6,.5,1) both}
.robo.oi.t-rec .p2{animation:rPop .45s 2.3s cubic-bezier(.3,1.6,.5,1) both}
.robo .tampa{transform-origin:0% 100%}
.robo.oi.t-busca .tampa{animation:rTampa .5s 2.1s both}
.robo.oi.t-busca .brilho{animation:rPop .4s 2.5s both}
@keyframes rTampa{to{transform:rotate(-55deg)}}
.robo .corte{transform-origin:50% 0%}
.robo.oi.t-bin .corte{animation:rCai .35s 2.0s ease-in both}
.robo.oi.t-bin .metade{animation:rApaga .4s 2.4s both}
@keyframes rCai{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes rApaga{to{opacity:.18}}
.robo.oi.t-ord .b1{animation:rB1 .6s 2.0s ease-in-out both}
.robo.oi.t-ord .b3{animation:rB3 .6s 2.0s ease-in-out both}
@keyframes rB1{to{transform:translateX(32px)}}
@keyframes rB3{to{transform:translateX(-32px)}}
.robo.oi.t-heap .grande{animation:rSobeF .6s 2.0s ease-in-out both}
.robo.oi.t-heap .pequena{animation:rDesceF .6s 2.0s ease-in-out both}
@keyframes rSobeF{to{transform:translate(8px,-16px)}}
@keyframes rDesceF{to{transform:translate(-8px,16px)}}
.robo.oi.t-bt .bola{animation:rBt 1.6s 1.9s ease-in-out both}
@keyframes rBt{0%{transform:none}30%{transform:translateX(16px)}36%{transform:translateX(13px)}42%{transform:translateX(16px)}70%{transform:none}100%{transform:translateY(14px)}}
.robo.oi.t-bt .x{animation:rPop .3s 2.4s both}
/* reação ao trocar o tema */
.robo .cordao,.robo .lua,.robo .sol,.robo .farol,.robo .bocejo{opacity:0}
.robo .cordao{transform-origin:50% 0%}
.robo.vaiEscuro .cordao{animation:rCordao 1s both}
@keyframes rCordao{0%{opacity:0;transform:translateY(-6px)}20%{opacity:1;transform:none}45%{transform:translateY(5px)}65%,85%{opacity:1;transform:none}100%{opacity:0}}
.robo.vaiEscuro .braco{animation:rPuxa .5s .2s both}
@keyframes rPuxa{50%{transform:rotate(-70deg)}to{transform:rotate(0)}}
.robo.vaiEscuro .farol{animation:rFarol .6s .7s both}
@keyframes rFarol{0%{opacity:0}40%{opacity:1}100%{opacity:.9}}
.robo.vaiEscuro .lua{animation:rPop .5s .8s both}
.robo.vaiClaro .sol{animation:rNasce 1.2s .3s ease-out both}
@keyframes rNasce{from{opacity:0;transform:translateY(12px)}50%{opacity:1}to{opacity:0;transform:translateY(-4px)}}
.robo.vaiClaro .bocejo{animation:rBoceja 1.1s both}
@keyframes rBoceja{0%{opacity:0;transform:scale(.3)}30%,70%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.3)}}
.robo.vaiClaro .olhos{animation:rSono 1.1s both}
@keyframes rSono{30%,70%{transform:scaleY(.15)}}
html.escuro .robo .cab{fill:#dfe9f1}
html.escuro .robo .peito{fill:#cdd9e3}
html.escuro .robo .farol{opacity:.75}
/* ---------- tema escuro ---------- */
html.escuro{--titulo:#9fd3f2;--ceu:#1a2b39;--gelo:#0f1a24;--pessego:#b9835a;--rosa:#3a2430;--ink:#dde7ef;--muted:#93a4b3;--borda:#25384a;--ok:#3fbf86;--red:#ef6f84;--gold:#f2b84b;color-scheme:dark}
html.escuro body{background:var(--gelo);color:var(--ink)}
html.escuro header{background:#13202bee;border-color:var(--borda)}
html.escuro .voltar{background:var(--ceu);color:var(--titulo)}
html.escuro nav.caps a{background:#15222e;border-color:var(--borda);color:var(--titulo)}
html.escuro nav.caps a.on{background:#2f6d93;border-color:#2f6d93;color:#fff}
html.escuro section{background:#15222e;border-color:var(--borda);box-shadow:0 2px 14px #0006}
html.escuro section h2 .n{background:#f2b07a;color:#1f3346}
html.escuro code,html.escuro .mono{background:var(--ceu)}
html.escuro .caixa.pessego,html.escuro .prof,html.escuro .explica{background:#251f18;border-color:#5a4330}
html.escuro .codigo,html.escuro .saida,html.escuro .abre{background:#101b25;border-color:var(--borda)}
html.escuro .codigo div.cl:hover{background:#1a2a38}
html.escuro .codigo div.sel,html.escuro .pilha div:last-child{background:#2e2417}
html.escuro .codigo div.on,html.escuro .vet div.cur,html.escuro .cel.sel,html.escuro .abre .nova{background:#3a3018}
html.escuro .codigo div.on.r,html.escuro .q .ops button.certa,html.escuro .cel.ordC,html.escuro .abre .fim,html.escuro .narra.bom{background:#16342a;border-color:#2c6a50}
html.escuro .codigo .cm{color:#6f8496}
html.escuro .codigo .kw{color:#9fd3f2}
html.escuro .arvore{background:#eef3f7;border-color:var(--borda)}
html.escuro .narra,html.escuro .mini,html.escuro .q,html.escuro .vaiVolta a{background:#15222e;border-color:var(--borda);color:var(--ink)}
html.escuro .vaiVolta a.pro{background:var(--ceu)}
html.escuro .narra.ruim{background:var(--rosa);border-color:#6a3a48}
html.escuro .btn{background:#182634;border-color:var(--borda);color:var(--titulo)}
html.escuro .btn.pri,html.escuro .jogo .ir{background:#2f6d93;border-color:#2f6d93;color:#fff}
html.escuro .vet div,html.escuro .vetLinha .cel,html.escuro .ulin .cel,html.escuro .barras{background:#101b25;border-color:var(--borda)}
html.escuro .cel i,html.escuro .bar i{color:#f0a070}
html.escuro .seg button.on{background:#25384a}
html.escuro .mundoS{background:linear-gradient(180deg,#1a2b39,#1d2530);border-color:var(--borda)}
html.escuro .rv-palco{background:radial-gradient(ellipse at 50% 0%,#1d3142 0,#142230 60%,#0f1a24 100%)}
html.escuro .rv-palco:before{background-image:radial-gradient(#2b4459 1px,transparent 1.2px)}
html.escuro .rv-top h2{color:#cfe8f8}
html.escuro .rv-card,html.escuro .rv-narra,html.escuro .rv-bar button{background:#15222e;color:#cfe8f8;box-shadow:0 2px 14px #0006}
html.escuro .rv-bar button.pri,html.escuro .rv-sel button.on,html.escuro .rv-fr.topo{background:#2f6d93;color:#fff}
html.escuro .rv-sel button,html.escuro .rv-n,html.escuro .rv-fr{background:#1a2b39;color:#cfe8f8}
html.escuro .rv-narra b{color:#9fd3f2}
html.escuro .rv-cod{color:#cfe8f8}
html.escuro .rv-cod div.on{background:#12384a;color:#e6f6ff}
html.escuro .rv-cod div.on.b{background:#3a2a1a}
html.escuro .rv-cod div.on.v{background:#16342a}
html.escuro .rv-hud span{background:#15222ed9;color:#cfe8f8}
html.escuro .rv-prof i{background:#2b4459}
html.escuro .rv-n span{color:#cfe8f8}
`);
document.head.appendChild(temaCss);
let tema='claro'; try{tema=localStorage.getItem('tema-alg2')||'claro';}catch(e){}
const aplicaTema=()=>{document.documentElement.classList.toggle('escuro',tema==='escuro');};
aplicaTema();
const topo=document.querySelector('header .top')||document.querySelector('header');
if(topo){
  const c=el('div','canto');
  const A=(D.arquivo||location.pathname.split('/').pop()||'');
  const ASS=/^(a02|a03|t01|t02|t18|rev-recursao|aula-recursao)/.test(A)?'rec':/^(a04|t03|t04)/.test(A)?'busca':/^(a06|t05)/.test(A)?'bin':
    /^(a0[789]|a10|t0[6-9]|t19|rev-ordenacao|aula-ordenacao)/.test(A)?'ord':/^(a1[123]|t1[0-3]|rev-heap|aula-heap)/.test(A)?'heap':/^(bt-|t1[4-7]|rev-backtracking|aula-backtracking)/.test(A)?'bt':'rec';
  const ROBO=`<g class="corpo">
    <ellipse cx="30" cy="57" rx="14" ry="2.5" fill="#2f5d7c" opacity=".18"/>
    <line x1="30" y1="10" x2="30" y2="5" stroke="#8fa9bd" stroke-width="2" stroke-linecap="round"/>
    <circle class="luzA" cx="30" cy="4.5" r="3.2" fill="#ffb98a"/>
    <rect class="peito" x="20" y="36" width="20" height="17" rx="7" fill="#eef4f9" stroke="#9db6c9" stroke-width="1.3"/>
    <circle cx="30" cy="44" r="3.2" fill="#2fbfe9"/>
    <path d="M21 41 Q14 45 15 51" stroke="#c9d8e4" stroke-width="4" stroke-linecap="round" fill="none"/>
    <g class="braco"><path d="M39 41 Q46 37 47 30" stroke="#c9d8e4" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="47" cy="28.5" r="3" fill="#ffb98a"/></g>
    <rect class="cab" x="13" y="10" width="34" height="25" rx="11" fill="#f6f9fc" stroke="#9db6c9" stroke-width="1.3"/>
    <rect x="17" y="15" width="26" height="15" rx="7" fill="#1f4560"/>
    <g class="olhos"><circle cx="24.5" cy="22.5" r="3.1" fill="#7fe3ff"/><circle cx="35.5" cy="22.5" r="3.1" fill="#7fe3ff"/>
      <circle cx="23.6" cy="21.6" r="1" fill="#fff"/><circle cx="34.6" cy="21.6" r="1" fill="#fff"/></g>
    <ellipse class="bocejo" cx="30" cy="28" rx="2.6" ry="1.8" fill="#7fe3ff"/>
    <path d="M18 13 Q24 11 31 11.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".8"/>
   </g>`;
  /* o objeto de cada assunto, à esquerda do robô (x de -48 a 8) */
  const PROPS={
   rec:`<defs><g id="rbMini">${ROBO.replace('class="corpo"','')}</g></defs>
     <g class="prop"><g class="p1"><use href="#rbMini" transform="translate(-14 26) scale(.5)"/></g><g class="p2"><use href="#rbMini" transform="translate(-32 41) scale(.25)"/></g></g>`,
   busca:`<g class="prop"><rect x="-38" y="38" width="30" height="16" rx="3" fill="#d79a5a" stroke="#9a6430" stroke-width="1.2"/>
     <rect class="tampa" x="-38" y="31" width="30" height="8" rx="3" fill="#e8b276" stroke="#9a6430" stroke-width="1.2"/>
     <rect x="-25" y="38" width="4" height="16" fill="#f2c64e"/>
     <g class="brilho"><circle cx="-23" cy="30" r="7" fill="#fff3b0" opacity=".9"/><text x="-23" y="33" font-size="9" text-anchor="middle">✨</text></g></g>`,
   bin:`<g class="prop"><g class="metade">${[0,1,2].map(i=>`<rect x="${-46+i*9}" y="42" width="7" height="10" rx="2" fill="#9fd3f2"/>`).join('')}</g>
     ${[3,4,5].map(i=>`<rect x="${-46+i*9}" y="42" width="7" height="10" rx="2" fill="#2f5d7c"/>`).join('')}
     <rect class="corte" x="-19.5" y="30" width="2" height="26" rx="1" fill="#ff9f5a"/></g>`,
   ord:`<g class="prop"><rect class="b1" x="-42" y="30" width="12" height="24" rx="3" fill="#ffb98a"/><rect x="-26" y="40" width="12" height="14" rx="3" fill="#9fd3f2"/><rect class="b3" x="-10" y="46" width="12" height="8" rx="3" fill="#7fd6a8"/></g>`,
   heap:`<g class="prop"><line x1="-22" y1="34" x2="-32" y2="48" stroke="#b98a5a" stroke-width="2"/><line x1="-22" y1="34" x2="-12" y2="48" stroke="#b98a5a" stroke-width="2"/>
     <circle class="pequena" cx="-22" cy="33" r="4" fill="#ffd27a"/><circle class="grande" cx="-30" cy="49" r="6.5" fill="#f0626f"/><circle cx="-12" cy="49" r="4.5" fill="#ffa24f"/></g>`,
   bt:`<g class="prop"><path d="M-46 40 H-14 M-14 34 V46 M-30 40 V56" stroke="#7fbf7a" stroke-width="3" stroke-linecap="round" fill="none"/>
     <text class="x" x="-11" y="33" font-size="9" fill="#ef6f84" font-weight="700">✕</text><circle class="bola" cx="-30" cy="40" r="4" fill="#2fbfe9"/></g>`
  };
  c.innerHTML=`<button class="temaBt" type="button"></button>
  <svg class="robo t-${ASS}" viewBox="-50 -6 112 66" role="button" aria-label="robozinho: toque pra ele repetir o gesto">
   <g class="sol"><circle cx="54" cy="10" r="7" fill="#ffd27a"/>${[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return `<line x1="${54+Math.cos(a)*9}" y1="${10+Math.sin(a)*9}" x2="${54+Math.cos(a)*12}" y2="${10+Math.sin(a)*12}" stroke="#ffd27a" stroke-width="1.8" stroke-linecap="round"/>`;}).join('')}</g>
   <g class="lua"><path d="M56 3 a8 8 0 1 0 4 14 a6.5 6.5 0 1 1 -4 -14 z" fill="#ffe7a8"/></g>
   <g class="cordao"><line x1="10" y1="-6" x2="10" y2="18" stroke="#9db6c9" stroke-width="1.2"/><circle cx="10" cy="19.5" r="2" fill="#ffb98a"/></g>
   ${PROPS[ASS]}
   ${ROBO}
   <g class="farol"><path d="M24.5 22.5 L-6 14 L-6 31 Z" fill="#7fe3ff" opacity=".18"/><circle cx="24.5" cy="22.5" r="4.5" fill="#7fe3ff" opacity=".5"/><circle cx="35.5" cy="22.5" r="4.5" fill="#7fe3ff" opacity=".5"/></g>
  </svg>`;
  topo.appendChild(c);
  const bt=c.querySelector('.temaBt'), rb=c.querySelector('.robo');
  const rotulo=()=>{bt.textContent=tema==='escuro'?'☀️ claro':'🌙 escuro'; bt.setAttribute('aria-label',tema==='escuro'?'mudar para o tema claro':'mudar para o tema escuro');};
  rotulo();
  const reinicia=(cl)=>{ if(reduz) return; rb.classList.remove('oi','vaiEscuro','vaiClaro'); void rb.getBoundingClientRect(); rb.classList.add(cl); };
  bt.onclick=()=>{tema=tema==='escuro'?'claro':'escuro'; try{localStorage.setItem('tema-alg2',tema);}catch(e){}
    if(reduz){aplicaTema();rotulo();return;}
    if(tema==='escuro'){ reinicia('vaiEscuro'); setTimeout(()=>{aplicaTema();rotulo();},550); }   // puxa a cordinha, aí apaga
    else { aplicaTema(); rotulo(); reinicia('vaiClaro'); }};
  rb.addEventListener('click',()=>reinicia('oi'));
  reinicia('oi');
  if(reduz) rb.querySelectorAll('.prop').forEach(e=>e.style.opacity=1);
}
})();

/* ---------- sinaliza o quiz (pra não confundir com texto da aula) ---------- */
(function(){
  const st=document.createElement('style');
  st.textContent=`.quizTag{display:inline-flex;align-items:center;gap:4px;font:700 .72rem/1 Fredoka,Inter,sans-serif;letter-spacing:.05em;text-transform:uppercase;
  color:#1d4ed8;background:#dbeafe;border:1.5px solid #93c5fd;border-radius:999px;padding:5px 10px;margin-right:8px;vertical-align:middle}
.quizBan{display:flex;align-items:center;gap:12px;border-radius:14px;padding:10px 14px;margin:10px 0 4px;background:#3b82f614;border:1.5px solid #bfdbfe;font-size:.95rem}
.quizBan .qi{font-size:1.4rem}
#quiz{counter-reset:qq}
#quiz .q{counter-increment:qq;border-left:5px solid #3b82f6!important}
#quiz .q:before{content:"❓ quiz";display:block;font:700 .74rem Fredoka,Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#2563eb;margin-bottom:4px}`;
  document.head.appendChild(st);
  function marca(){
    const z=document.getElementById('quiz'); if(!z||z.dataset.marcado) return;
    z.dataset.marcado=1;
    const sec=z.closest('section'), h=sec&&sec.querySelector('h2');
    if(h&&!h.querySelector('.quizTag')){ const n=h.querySelector('.n'); const t=document.createElement('span'); t.className='quizTag'; t.textContent='❓ quiz';
      if(n&&n.nextSibling) h.insertBefore(t,n.nextSibling); else h.prepend(t); }
    const ban=document.createElement('div'); ban.className='quizBan';
    const conta=()=>{ const q=z.querySelectorAll('.q').length; ban.innerHTML=`<span class="qi">❓</span><span><b>Hora do quiz.</b> ${q?q+' perguntas, ':''}cada uma com uma resposta certa. Toque numa opção pra ver se acertou e a explicação. O placar aparece no título.</span>`; };
    conta(); z.parentNode.insertBefore(ban,z); setTimeout(conta,600);
    // chip do menu de seções
    if(sec&&sec.id) setTimeout(()=>document.querySelectorAll(`a[href="#${sec.id}"]`).forEach(a=>{ if(!/❓/.test(a.textContent)) a.insertAdjacentText('afterbegin','❓ '); }),400);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',marca); else marca();
  window.addEventListener('load',marca);
})();

/* ---------- visual de site: Inter, paleta neutra com um azul, menos caixas ---------- */
(function(){
  if(!document.querySelector('link[href*="family=Inter"]')){ const l=document.createElement('link'); l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'; document.head.appendChild(l); }
  const st=document.createElement('style');
  st.textContent=`
html:not(.escuro){--titulo:#1d4ed8;--ceu:#eff6ff;--gelo:#ffffff;--pessego:#fde68a;--rosa:#fef2f2;--ink:#1e293b;--muted:#64748b;--ok:#16a34a;--red:#dc2626;--gold:#d97706;--borda:#e2e8f0}
body{font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif!important;font-size:16.5px;line-height:1.65;letter-spacing:-.003em}
html:not(.escuro) body{background:#f1f5f9}
h1,h2,h3,h4{font-family:Inter,system-ui,sans-serif;letter-spacing:-.015em}
html:not(.escuro) h1,html:not(.escuro) section h2{color:#0f172a}
header{border-bottom:1px solid var(--borda)!important;box-shadow:none}
.top h1{font-weight:700;font-size:1.3rem}
.voltar{border-radius:8px!important;font-weight:500!important}
nav.caps a{border-width:1px!important;border-radius:8px!important;font-weight:500!important;font-size:.88rem!important}
html:not(.escuro) nav.caps a{background:#fff;color:#334155;border-color:var(--borda)}
html:not(.escuro) nav.caps a.on{background:#1d4ed8;color:#fff;border-color:#1d4ed8}
main{max-width:980px!important}
section{background:transparent!important;box-shadow:none!important;border:0!important;border-bottom:1px solid var(--borda)!important;border-radius:0!important;padding:34px 2px!important;margin:0!important}
section:last-of-type{border-bottom:0!important}
section h2{font-size:1.55rem;font-weight:700;display:flex;align-items:center;flex-wrap:wrap;gap:6px}
section h2 .n{width:30px!important;height:30px!important;border-radius:8px!important;font-size:.95rem!important;font-weight:700;margin-right:6px!important}
html:not(.escuro) section h2 .n{background:#dbeafe!important;color:#1d4ed8!important}
.lead{font-size:1.02rem}
.caixa{border-radius:10px!important;border:0!important;border-left:4px solid #93c5fd!important;padding:12px 16px!important}
html:not(.escuro) .caixa{background:#fff!important}
html:not(.escuro) .caixa.pessego{border-left-color:#f59e0b!important;background:#fffbeb!important}
html:not(.escuro) .caixa.rosa{border-left-color:#f87171!important;background:#fef2f2!important}
.prof,.explica{border-radius:10px!important;border:0!important;border-left:4px solid #f59e0b!important}
html:not(.escuro) .prof,html:not(.escuro) .explica{background:#fffbeb!important}
.codigo,.anim{border-width:1px!important;border-radius:10px!important}
html:not(.escuro) .codigo{background:#fff!important}
html:not(.escuro) .codigo .kw{color:#1d4ed8}
html:not(.escuro) .codigo div.sel{background:#eff6ff}
html:not(.escuro) .codigo div.on{background:#fef3c7}
html:not(.escuro) code,html:not(.escuro) .mono{background:#f1f5f9;color:#0f172a}
.btn,button{font-family:inherit}
.q{border-radius:10px!important;border-width:1px!important}
.q .ops button{border-width:1px!important;border-radius:8px!important}
html.escuro .arvoreBox,html.escuro .arvoreBox *{color:#1e293b}
html.escuro .cel.sel,html.escuro .cel.filho,html.escuro .cel.pai{color:#1e293b}`;
  document.head.appendChild(st);
})();
