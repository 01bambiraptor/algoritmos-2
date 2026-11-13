/* Algoritmos II · chave "aprender / especialista" dos jogos.
 * A escolha vale pra todos os jogos (localStorage 'modo-alg2') e pode ser trocada a qualquer momento.
 * O jogo põe <div id="modoSlot"></div> onde quer a chave e escuta o evento 'modo' na window.
 *   🌱 aprender: sem relógio, sem perder vida, dica e linha do código acesas, botão "a máquina mostra".
 *   🏆 especialista: relógio, 3 vidas, sem dicas; só aqui contam as estrelas.
 */
(function(){
  const K='modo-alg2';
  let m='aprender'; try{m=localStorage.getItem(K)||'aprender';}catch(e){}
  window.MODO=()=>m;
  window.ESP=()=>m==='especialista';
  const st=document.createElement('style');
  st.textContent=`.modoSw{display:inline-flex;background:#fff;border:2px solid #d5e6f3;border-radius:999px;padding:3px;gap:2px;vertical-align:middle}
.modoSw button{font:inherit;font-weight:600;font-size:.92rem;border:0;background:none;border-radius:999px;padding:5px 13px;cursor:pointer;color:#6b7785;min-height:36px;transition:background .2s,color .2s}
.modoSw button.on.a{background:#d8f2e1;color:#1f7a45}
.modoSw button.on.e{background:#ffe3c9;color:#8a4b14}
.modoAviso{font-size:.85rem;color:#6b7785;margin-left:8px}
html.modo-esp .soAprender{display:none!important}
html:not(.modo-esp) .soEsp{display:none!important}
html.modo-esp .cod .on{background:none!important;box-shadow:none!important}
.maqBt{background:#eef7f1!important;border-color:#9fd3b0!important;color:#1f7a45!important}`;
  document.head.appendChild(st);
  const aplica=()=>document.documentElement.classList.toggle('modo-esp',m==='especialista');
  aplica();
  function desenha(){
    const s=document.getElementById('modoSlot'); if(!s) return;
    s.innerHTML=`<span class="modoSw" role="group" aria-label="modo de jogo"><button type="button" class="a${m==='aprender'?' on':''}" title="sem relógio, sem perder vida, com dicas e a máquina mostrando">🌱 aprender</button><button type="button" class="e${m==='especialista'?' on':''}" title="relógio, 3 vidas, sem dicas: as estrelas só contam aqui">🏆 especialista</button></span><span class="modoAviso">${m==='aprender'?(s.dataset.ap||'sem relógio e sem perder vida'):(s.dataset.esp||'relógio, 3 vidas, sem dicas')}</span>`;
    s.querySelector('.a').onclick=()=>window.setModo('aprender');
    s.querySelector('.e').onclick=()=>window.setModo('especialista');
  }
  window.setModo=n=>{ if(n===m) return; m=n; try{localStorage.setItem(K,m);}catch(e){} aplica(); desenha(); window.dispatchEvent(new CustomEvent('modo',{detail:m})); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',desenha); else desenha();
})();
