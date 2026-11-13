/*
 * Algoritmos II com jogos e animações
 * Feito a partir do material da disciplina CI1056 (UFPR). Licença: CC BY-NC-SA 4.0
 * Canto flutuante dos jogos e da página inicial: o robozinho (com o gesto do assunto
 * e a reação ao trocar o tema) e o botão claro/escuro.
 * O tema escuro aqui inverte as cores da página e "desinverte" imagens, canvas e o robô,
 * pra funcionar em todos os jogos sem mexer no visual de cada um.
 * A escolha do tema é a mesma das aulas (localStorage 'tema-alg2').
 */
(function(){
"use strict";
if(document.querySelector('.canto')) return;
const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
document.head.appendChild(el('style',null,`
.canto{position:fixed;right:14px;bottom:12px;z-index:9999;display:flex;align-items:flex-end;gap:6px;pointer-events:none}
.canto>*{pointer-events:auto}
.temaBt{font:600 .82rem Inter,Fredoka,system-ui,sans-serif;border:0;border-radius:999px;padding:7px 12px;background:#ffffffee;color:#1f4560;cursor:pointer;min-height:36px;box-shadow:0 3px 12px #1f456033;margin-bottom:8px}
.canto .robo{filter:drop-shadow(0 4px 8px #1f456033)}
@media (max-width:600px){.canto .robo{width:78px!important;height:42px!important}.temaBt{font-size:.74rem;padding:5px 9px;min-height:30px}}
html.escuro-inv{filter:invert(.9) hue-rotate(180deg);background:#fff}
html.escuro-inv img,html.escuro-inv video,html.escuro-inv canvas,html.escuro-inv .canto,html.escuro-inv .naoinverte{filter:invert(1) hue-rotate(180deg)}
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

`));
let tema='claro'; try{tema=localStorage.getItem('tema-alg2')||'claro';}catch(e){}
const aplicaTema=()=>document.documentElement.classList.toggle('escuro-inv',tema==='escuro');
aplicaTema();
function monta(){
  const c=el('div','canto');
  const A=(location.pathname.split('/').pop()||'index.html');
  const ASS=/^(baus)/.test(A)?'busca':/^(blocos)/.test(A)?'ord':/^(suika)/.test(A)?'heap':/^(domino|cavalo|labirinto|slide|detetive)/.test(A)?'bt':'rec';
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
  document.body.appendChild(c);
  const bt=c.querySelector('.temaBt'), rb=c.querySelector('.robo');
  const rotulo=()=>{bt.textContent=tema==='escuro'?'☀️ claro':'🌙 escuro'; bt.setAttribute('aria-label',tema==='escuro'?'mudar para o tema claro':'mudar para o tema escuro');};
  rotulo();
  const reinicia=(cl)=>{ if(reduz) return; rb.classList.remove('oi','vaiEscuro','vaiClaro'); void rb.getBoundingClientRect(); rb.classList.add(cl); };
  bt.onclick=()=>{tema=tema==='escuro'?'claro':'escuro'; try{localStorage.setItem('tema-alg2',tema);}catch(e){}
    if(reduz){aplicaTema();rotulo();return;}
    if(tema==='escuro'){ reinicia('vaiEscuro'); setTimeout(()=>{aplicaTema();rotulo();},550); }
    else { aplicaTema(); rotulo(); reinicia('vaiClaro'); }};
  rb.addEventListener('click',()=>reinicia('oi'));
  reinicia('oi');
  if(reduz) rb.querySelectorAll('.prop').forEach(e=>e.style.opacity=1);
}
if(document.body) monta(); else addEventListener('DOMContentLoaded',monta);
})();
