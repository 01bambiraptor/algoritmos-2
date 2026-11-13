/*
 * Algoritmos II com jogos e animações
 * Feito a partir do material da disciplina CI1056 (UFPR). Licença: CC BY-NC-SA 4.0
 *
 * Bônus "e na máquina?": o custo que a contagem de comparações não mostra.
 *  - cena 'pilha': cada chamada recursiva ocupa um bloco na região da pilha;
 *    Fibonacci faz muitas chamadas, mas a pilha nunca passa de n blocos;
 *    sem caso base, a pilha estoura (stack overflow).
 *  - cena 'busca': o vetor mora na RAM e chega na cache de 16 em 16 números
 *    (uma linha de cache de 64 bytes). A busca sequencial aproveita a linha
 *    inteira; a binária pula e quase toda leitura vai até a RAM.
 * Os números de bytes e de ciclos são aproximados e servem pra comparar, não pra medir.
 *
 * Uso: window.MemViz(elemento, {cena:'pilha'|'busca'})
 */
(function(){
"use strict";
const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const fmt=n=>n.toLocaleString('pt-BR');
let estilo=false;
function estilos(){
  if(estilo) return; estilo=true;
  if(!document.querySelector('link[href*="Inter"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';document.head.appendChild(l);}
  const s=document.createElement('style'); s.textContent=`
.mv{--p:#2f5d7c;--p2:#1f4560;--ci:#22b8e6;--pe:#ff9f5a;--ok:#1f9d63;--rd:#d9485f;--tx:#24303c;--mu:#6b7785;--sf:#fff;--sf2:#f2f6fa;--ln:#dfe9f1;
  font-family:Inter,system-ui,sans-serif;color:var(--tx);max-width:1080px;margin:26px auto 10px;padding:0 4px}
.mv-cab{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin:0 4px 12px}
.mv-cab .sup{font:700 .72rem Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--pe)}
.mv-cab h2{margin:2px 0 0;font:800 clamp(1.25rem,2.4vw,1.6rem)/1.15 Inter,sans-serif;letter-spacing:-.02em;color:var(--p2)}
.mv-cab p{margin:4px 0 0;color:var(--mu);font-size:.95rem;max-width:640px}
.mv-sel{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.mv-sel button{font:600 .86rem Inter,sans-serif;border:0;border-radius:999px;padding:8px 13px;background:#eaf2f8;color:var(--p);cursor:pointer}
.mv-sel button.on{background:var(--p2);color:#fff}
.mv-sel button.perigo.on{background:var(--rd)}
.mv-n{display:inline-flex;align-items:center;background:#eaf2f8;border-radius:999px;padding:2px}
.mv-n button{background:transparent!important;color:var(--p2)!important;padding:6px 11px}
.mv-n span{font:700 .88rem 'JetBrains Mono',monospace;color:var(--p2);min-width:2.8em;text-align:center}
.mv-grid{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:14px}
@media (max-width:860px){.mv-grid{grid-template-columns:1fr}}
.mv-palco{position:relative;border-radius:22px;padding:16px;background:linear-gradient(180deg,#fbfdff,#eef5fa);box-shadow:0 1px 2px #1f456014,0 12px 40px #1f456014;min-height:360px;overflow:hidden}
.mv-card{background:var(--sf);border-radius:18px;padding:12px 14px;box-shadow:0 1px 2px #1f456014,0 8px 26px #1f456012}
.mv-card h4{margin:0 0 8px;font:700 .72rem Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mu)}
.mv-num{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mv-num div{background:var(--sf2);border-radius:12px;padding:8px 10px}
.mv-num b{display:block;font:800 1.25rem 'JetBrains Mono',monospace;color:var(--p2)}
.mv-num small{font-size:.74rem;color:var(--mu)}
.mv-num .ok b{color:var(--ok)} .mv-num .ram b{color:var(--rd)}
.mv-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px}
.mv-bar button{font:600 .9rem Inter,sans-serif;border:0;border-radius:12px;min-width:44px;height:44px;padding:0 13px;background:var(--sf);color:var(--p2);cursor:pointer;box-shadow:0 1px 2px #1f456014,0 4px 14px #1f456012}
.mv-bar button.pri{background:var(--p2);color:#fff;min-width:110px}
.mv-bar label{display:flex;align-items:center;gap:8px;font:500 .82rem Inter,sans-serif;color:var(--mu);margin-left:auto}
.mv-bar input{accent-color:var(--p2);width:110px}
.mv-narra{margin-top:10px;font-size:1rem;line-height:1.45;min-height:2.9em;padding:10px 14px;border-radius:14px;background:var(--sf);box-shadow:0 1px 2px #1f456014}
.mv-narra b{color:var(--p2)} .mv-narra.ruim{background:#fdecef} .mv-narra.bom{background:#e9f8f0}
.mv-nota{font-size:.8rem;color:var(--mu);margin:10px 4px 0}
/* ---- pilha ---- */
.mv-mem{display:block}
.mv-reg{display:flex;flex-direction:column;justify-content:space-between;font:600 .7rem 'JetBrains Mono',monospace;color:var(--mu);padding:4px 0;writing-mode:vertical-rl;transform:rotate(180deg);text-align:center}
.mv-col{position:relative;border-radius:14px;background:repeating-linear-gradient(180deg,#ffffff 0 29px,#f3f7fa 29px 30px);border:1.5px solid var(--ln);height:400px;overflow:hidden}
.mv-col .rot{position:absolute;left:10px;font:700 .68rem Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mu)}
.mv-lim{position:absolute;left:0;right:0;border-top:2px dashed var(--rd)}
.mv-lim span{position:absolute;right:8px;top:-18px;font:700 .68rem Inter,sans-serif;color:var(--rd);text-transform:uppercase;letter-spacing:.06em}
.mv-fr{position:absolute;left:8px;right:8px;height:26px;border-radius:9px;display:flex;align-items:center;gap:10px;padding:0 10px;font:600 .8rem 'JetBrains Mono',monospace;
  background:#eef5fa;color:var(--p2);border:1px solid #d3e3ef;transition:transform .35s cubic-bezier(.3,1.3,.5,1),opacity .35s,background .25s}
.mv-fr small{font:500 .72rem Inter,sans-serif;color:var(--mu)}
.mv-fr .end{margin-left:auto;font:500 .68rem 'JetBrains Mono',monospace;color:var(--mu)}
.mv-fr.topo{background:linear-gradient(135deg,#2f6d93,#1f4560);color:#fff;border-color:#1f4560}
.mv-fr.topo small,.mv-fr.topo .end{color:#cfe6f5}
.mv-fr.sai{opacity:0;transform:translateX(30px)}
.mv-fr.novo{opacity:0;transform:translateY(-14px)}
.mv-estouro{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#fdecefcc;font:800 1.1rem Inter,sans-serif;color:var(--rd);opacity:0;transition:opacity .3s;text-align:center;padding:20px}
.mv-estouro.on{opacity:1}
/* ---- busca ---- */
.mv-cpu{display:flex;gap:10px;align-items:stretch;flex-wrap:wrap;margin-bottom:14px}
.mv-box{border-radius:14px;padding:10px 12px;background:var(--sf);border:1.5px solid var(--ln)}
.mv-box h5{margin:0 0 6px;font:700 .68rem Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mu)}
.mv-box.cpu{min-width:130px} .mv-box.cpu b{font:800 1.1rem 'JetBrains Mono',monospace;color:var(--p2)}
.mv-box.cache{flex:1;min-width:260px}
.mv-slot{display:flex;align-items:center;gap:6px;margin:4px 0;min-height:22px}
.mv-slot em{font:600 .68rem 'JetBrains Mono',monospace;color:var(--mu);width:52px;font-style:normal}
.mv-linha{display:grid;grid-template-columns:repeat(16,1fr);gap:2px;flex:1}
.mv-c{height:20px;border-radius:4px;background:#eef3f7;font:600 .58rem 'JetBrains Mono',monospace;color:var(--mu);display:flex;align-items:center;justify-content:center;transition:background .25s,color .25s,transform .25s}
.mv-ram .mv-c{height:24px;background:#fff;border:1px solid var(--ln)}
.mv-ram .lin{display:flex;align-items:center;gap:6px;margin:3px 0;padding:3px;border-radius:8px;transition:background .3s}
.mv-ram .lin em{font:600 .66rem 'JetBrains Mono',monospace;color:var(--mu);width:52px;font-style:normal}
.mv-ram .lin.carrega{background:#dff3fb}
.mv-c.lido{background:#ffe7a8!important;color:#7a5200;transform:scale(1.12)}
.mv-c.hit{background:#d9f3e6!important;color:#1f7a50}
.mv-c.fora{opacity:.28}
.mv-c.achou{background:#1f9d63!important;color:#fff}
.mv-voo{position:absolute;pointer-events:none;border-radius:8px;background:#22b8e633;border:2px solid #22b8e6;transition:all .55s cubic-bezier(.4,.1,.3,1)}
.mv-tab{width:100%;border-collapse:collapse;font-size:.8rem;margin-top:6px;border:0!important}
.mv-tab th,.mv-tab td{text-align:left;padding:6px 4px!important;border:0!important;border-bottom:1px solid var(--ln)!important;background:none!important;vertical-align:top}
.mv-tab small{color:var(--mu);font-size:.72rem}
.mv-tab th{font:700 .7rem Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mu)}
.mv-tab td b{font-family:'JetBrains Mono',monospace;color:var(--p2)}
.mv-tab .barra{height:8px;border-radius:4px;background:var(--pe);display:block;margin-top:3px;min-width:2px}
.mv-tab .barra.b{background:var(--ci)}
/* ---- tema escuro ---- */
html.escuro .mv{--tx:#dde7ef;--mu:#93a4b3;--sf:#15222e;--sf2:#1a2b39;--ln:#25384a}
html.escuro .mv-cab h2,html.escuro .mv-narra b,html.escuro .mv-num b,html.escuro .mv-box.cpu b,html.escuro .mv-tab td b{color:#cfe8f8}
html.escuro .mv-palco{background:linear-gradient(180deg,#18293a,#0f1a24)}
html.escuro .mv-sel button,html.escuro .mv-n{background:#1a2b39;color:#cfe8f8}
html.escuro .mv-sel button.on,html.escuro .mv-bar button.pri{background:#2f6d93;color:#fff}
html.escuro .mv-bar button{color:#cfe8f8}
html.escuro .mv-col{background:repeating-linear-gradient(180deg,#132130 0 29px,#17283a 29px 30px)}
html.escuro .mv-fr{background:#1a2b39;color:#cfe8f8;border-color:#2b4459}
html.escuro .mv-fr.topo{background:linear-gradient(135deg,#3a86b3,#2f6d93);color:#fff;border-color:#3a86b3}
html.escuro .mv-n button,html.escuro .mv-n span{color:#cfe8f8!important}
html.escuro .mv-c{background:#1a2b39;color:#93a4b3}
html.escuro .mv-ram .mv-c{background:#132130}
html.escuro .mv-ram .lin.carrega{background:#12384a}
html.escuro .mv-narra.ruim{background:#3a2430} html.escuro .mv-narra.bom{background:#16342a}
html.escuro .mv-estouro{background:#3a2430cc}
`;
  document.head.appendChild(s);
}
function casca(alvo,html){ const r=document.createElement('div'); r.className='mv'; r.innerHTML=html; alvo.appendChild(r); return r; }
function controles(raiz,passo,reinicia){
  let t=0,tocando=false; const bPlay=raiz.querySelector('[data-a="play"]'), vel=raiz.querySelector('.mv-bar input');
  const ms=()=>1500-(+vel.value)*130;
  function roda(){ if(!tocando) return; if(!passo()){para();return;} t=setTimeout(roda,ms()); }
  function para(){ tocando=false; clearTimeout(t); bPlay.textContent='▶ Rodar'; }
  raiz.querySelector('.mv-bar').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.a==='play'){ if(tocando){para();return;} tocando=true; b.textContent='⏸ Pausar'; roda(); }
    if(b.dataset.a==='passo'){ para(); passo(); }
    if(b.dataset.a==='re'){ para(); reinicia(); }});
  return {para,ms};
}
const BARRA=`<div class="mv-bar"><button data-a="play" class="pri">▶ Rodar</button><button data-a="passo">Passo ▸</button><button data-a="re" aria-label="recomeçar">↺</button>
  <label>velocidade <input type="range" min="1" max="10" value="6"></label></div><div class="mv-narra"></div>`;

/* =================== cena 1: a pilha de chamadas na memória =================== */
function cenaPilha(alvo){
  const BYTES=48, LIM=12, ALTO=0x7ffd0000; // tamanho de um bloco e endereço do topo: ilustrativos
  let fn='fat', n=4, semBase=false, ev=[], k=0, pilha=[], st={};
  const raiz=casca(alvo,`
  <div class="mv-cab"><div><div class="sup">bônus · e na máquina?</div><h2>A pilha de chamadas na memória</h2>
    <p>Cada chamada que ainda não terminou ocupa um bloco de memória na região da <b>pilha</b>. Quando a chamada devolve, o bloco é liberado.</p></div>
    <div class="mv-sel"><button data-fn="fat">Fatorial</button><button data-fn="fib">Fibonacci</button>
      <span class="mv-n"><button data-d="-1" aria-label="diminuir n">−</button><span class="nv"></span><button data-d="1" aria-label="aumentar n">+</button></span>
      <button data-sb class="perigo">💥 tirar o caso base</button></div></div>
  <div class="mv-grid">
    <div><div class="mv-palco"><div class="mv-mem">
      <div class="mv-col"><span class="rot" style="top:6px">pilha · cresce pra baixo ↓</span><div class="mv-lim" style="top:${36+LIM*30}px"><span>limite da pilha</span></div>
        <div class="fr"></div><div class="mv-estouro">💥 Segmentation fault<br><small style="font-weight:600">stack overflow: a pilha passou do limite</small></div></div></div></div>
      ${BARRA}</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="mv-card"><h4>agora</h4><div class="mv-num">
        <div><b class="c1">0</b><small>chamadas feitas</small></div><div><b class="c2">0</b><small>blocos na pilha</small></div>
        <div><b class="c3">0</b><small>maior altura</small></div><div><b class="c4">0 B</b><small>memória da pilha</small></div></div></div>
      <div class="mv-card"><h4>repara</h4><div class="rep" style="font-size:.9rem;line-height:1.45"></div></div>
    </div>
  </div>
  <p class="mv-nota">Valores ilustrativos: o tamanho real de cada bloco depende do compilador, e o limite da pilha no Linux costuma ser 8 MB (veja com <code>ulimit -s</code>). A disciplina conta chamadas e comparações; aqui é o espaço que elas ocupam.</p>`);
  const q=s=>raiz.querySelector(s), col=q('.fr');
  const R=a=>fn==='fat'?`f(${a})`:`F(${a})`;
  function gera(){
    ev=[]; let prof=0;
    (function c(a,pai){
      ev.push({t:'push',a,pai}); prof++;
      if(semBase&&prof>=LIM+1){ ev.push({t:'boom'}); return null; }
      let v;
      if(!semBase&&(fn==='fat'?a===0:a<=1)) v=fn==='fat'?1:a;
      else if(fn==='fat'){ const r=c(a-1,a); if(r===null) return null; v=a*r; }
      else { const r1=c(a-1,a); if(r1===null) return null; const r2=c(a-2,a); if(r2===null) return null; v=r1+r2; }
      ev.push({t:'pop',a,v}); prof--; return v;
    })(n,null);
  }
  function monta(){
    raiz.querySelectorAll('[data-fn]').forEach(b=>b.classList.toggle('on',b.dataset.fn===fn));
    q('[data-sb]').classList.toggle('on',semBase); q('[data-sb]').textContent=semBase?'💥 sem caso base':'💥 tirar o caso base';
    q('.nv').textContent=`n = ${n}`; gera(); k=0; pilha=[]; st={ch:0,max:0}; col.innerHTML=''; q('.mv-estouro').classList.remove('on');
    pinta(); narra(`Vamos ver <b>${R(n)}</b> ocupando memória. Aperte ▶.`);
    q('.rep').innerHTML=fn==='fat'?`O fatorial faz uma chamada por vez: a pilha chega a <b>n + 1</b> blocos e depois esvazia.`
      :`O Fibonacci faz <b>muitas</b> chamadas (repara no contador), mas a pilha nunca passa de <b>n</b> blocos: cada chamada que termina devolve o espaço pra próxima.`;
    if(semBase) q('.rep').innerHTML=`Sem o caso base nada devolve, então nenhum bloco é liberado. A pilha só cresce até bater no limite.`;
  }
  function pinta(){
    const filhos=[...col.children];
    pilha.forEach((f,i)=>{ let e=f.el; if(!e){ e=document.createElement('div'); e.className='mv-fr novo'; col.appendChild(e); f.el=e; requestAnimationFrame(()=>requestAnimationFrame(()=>e.classList.remove('novo'))); }
      e.style.top=(30+i*30)+'px'; e.classList.toggle('topo',i===pilha.length-1);
      e.innerHTML=`<span>${R(f.a)}</span><small>n = ${f.a}${f.pai!==null?` · volta pra ${R(f.pai)}`:' · volta pro main'}</small><span class="end">0x${(ALTO-(i+1)*BYTES).toString(16)}</span>`; });
    q('.c1').textContent=fmt(st.ch); q('.c2').textContent=pilha.length; q('.c3').textContent=st.max; q('.c4').textContent=fmt(pilha.length*BYTES)+' B';
  }
  function narra(h,c){ const e=q('.mv-narra'); e.innerHTML=h; e.className='mv-narra'+(c?' '+c:''); }
  function passo(){
    const e=ev[k++]; if(!e) return false;
    if(e.t==='push'){ pilha.push({a:e.a,pai:e.pai}); st.ch++; st.max=Math.max(st.max,pilha.length); pinta();
      narra(`<b>${R(e.a)}</b> é chamada: ganha um bloco de ${BYTES} bytes no topo da pilha.`); }
    else if(e.t==='pop'){ const f=pilha.pop(); if(f&&f.el){ const el=f.el; el.classList.add('sai'); setTimeout(()=>el.remove(),reduz?0:350); } pinta();
      narra(pilha.length?`<b>${R(e.a)}</b> devolve ${e.v} e libera o bloco. A pilha encolhe.`:`<b>${R(e.a)}</b> devolve <b>${e.v}</b>. Pilha vazia: toda a memória foi liberada. Foram ${fmt(st.ch)} chamadas, mas no máximo ${st.max} blocos ao mesmo tempo.`,pilha.length?'':'bom'); }
    else if(e.t==='boom'){ q('.mv-estouro').classList.add('on'); narra(`Passou do limite: o sistema derruba o programa. É o <b>stack overflow</b>.`,'ruim'); return false; }
    return k<ev.length;
  }
  raiz.querySelector('.mv-sel').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; ctl.para();
    if(b.dataset.fn){ fn=b.dataset.fn; n=fn==='fat'?4:5; }
    if(b.dataset.d){ n=clamp(n+(+b.dataset.d),1,fn==='fat'?8:6); }
    if(b.hasAttribute('data-sb')) semBase=!semBase;
    monta();});
  const ctl=controles(raiz,passo,monta);
  monta();
}

/* =================== cena 2: a busca na memória (cache) =================== */
function cenaBusca(alvo){
  const N=64, L=16, HIT=4, MISS=200;              // 16 ints por linha de cache (64 bytes); ciclos aproximados
  const V=Array.from({length:N},(_,i)=>2*(i+1));  // vetor ordenado: 2, 4, ..., 128
  let alg='seq', x=51, ev=[], k=0, cache=[], cont={}, lidos=new Set();
  const raiz=casca(alvo,`
  <div class="mv-cab"><div><div class="sup">bônus · e na máquina?</div><h2>A busca na memória</h2>
    <p>O vetor mora na RAM. Quando o processador lê um número, ele traz a <b>linha inteira</b> (16 números) pra cache, que é perto e rápida. Ler da cache custa uns ${HIT} ciclos; ir até a RAM, uns ${MISS}.</p></div>
    <div class="mv-sel"><button data-alg="seq">Busca sequencial</button><button data-alg="bin">Busca binária</button>
      <button data-x="51">x = 51 (não está)</button><button data-x="34">x = 34</button></div></div>
  <div class="mv-grid">
    <div><div class="mv-palco">
      <div class="mv-cpu"><div class="mv-box cpu"><h5>processador</h5>procurando<br><b>x = <span class="xv"></span></b></div>
        <div class="mv-box cache"><h5>cache · 2 linhas</h5><div class="slots"></div></div></div>
      <div class="mv-box mv-ram"><h5>RAM · vetor com ${N} números (4 linhas de cache)</h5><div class="lins"></div></div>
    </div>${BARRA}</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="mv-card"><h4>nesta busca</h4><div class="mv-num">
        <div><b class="k1">0</b><small>comparações</small></div><div class="ok"><b class="k2">0</b><small>leituras da cache</small></div>
        <div class="ram"><b class="k3">0</b><small>idas à RAM</small></div><div><b class="k4">0</b><small>ciclos (aprox.)</small></div></div></div>
      <div class="mv-card"><h4>e em vetores maiores? (x não está)</h4><table class="mv-tab"><thead><tr><th>n</th><th>sequencial</th><th>binária</th></tr></thead><tbody class="tab"></tbody></table>
      <p style="font-size:.8rem;line-height:1.4;margin:8px 0 0;color:var(--mu)">Em ciclos (aprox.). Cada comparação da binária custa mais, porque costuma ir até a RAM, mas ela faz tão poucas que, em vetor grande, ganha de longe. Em vetor pequeno, quase empata.</p></div>
    </div>
  </div>
  <p class="mv-nota">Modelo simplificado: cache de 2 linhas, ${HIT} ciclos pra ler da cache e ${MISS} pra ir à RAM. Processadores de verdade ainda adivinham leituras em sequência e trazem a próxima linha antes (prefetch), o que ajuda ainda mais a busca sequencial. A disciplina conta comparações; aqui é o tempo que cada comparação custa.</p>`);
  const q=s=>raiz.querySelector(s);
  // desenha a RAM
  q('.lins').innerHTML=Array.from({length:N/L},(_,l)=>`<div class="lin" data-l="${l}"><em>linha ${l}</em><div class="mv-linha">${V.slice(l*L,l*L+L).map((v,j)=>`<div class="mv-c" data-i="${l*L+j}">${v}</div>`).join('')}</div></div>`).join('');
  const cel=i=>raiz.querySelector(`.lins .mv-c[data-i="${i}"]`);
  function acessos(alg,x,n,vet){ // índices lidos, na ordem do algoritmo da aula
    const o=[]; vet=vet||(i=>2*(i+1));
    if(alg==='seq'){ for(let b=n-1;b>=0;b--){ o.push(b); if(vet(b)===x) break; } } // Busca da aula: olha v[b] e chama pra b−1
    else { let a=0,b=n-1; while(a<=b){ const m=(a+b)>>1; o.push(m); const v=vet(m); if(v===x) break; if(x<v) b=m-1; else a=m+1; } }
    return o;
  }
  function custo(ac){ let c=[],h=0,m=0; for(const i of ac){ const l=Math.floor(i/L); const p=c.indexOf(l); if(p>=0){h++;c.splice(p,1);c.push(l);} else {m++;c.push(l);if(c.length>2)c.shift();} } return {cmp:ac.length,h,m,cic:h*HIT+m*MISS}; }
  function tabela(){
    const linhas=[16,64,1024,65536,1048576].map(n=>{const s=custo(acessos('seq',-1,n)),b=custo(acessos('bin',-1,n));return {n,s,b};});
    const max=Math.max(...linhas.map(r=>Math.max(r.s.cic,r.b.cic)));
    const lg=v=>Math.log10(v+1)/Math.log10(max+1)*100;
    q('.tab').innerHTML=linhas.map(r=>`<tr><td><b>${fmt(r.n)}</b></td><td><b>${fmt(r.s.cic)}</b><br><small>${fmt(r.s.cmp)} comp.</small><span class="barra" style="width:${lg(r.s.cic)}%"></span></td>
      <td><b>${fmt(r.b.cic)}</b><br><small>${fmt(r.b.cmp)} comp.</small><span class="barra b" style="width:${lg(r.b.cic)}%"></span></td></tr>`).join('');
  }
  function monta(){
    raiz.querySelectorAll('[data-alg]').forEach(b=>b.classList.toggle('on',b.dataset.alg===alg));
    raiz.querySelectorAll('[data-x]').forEach(b=>b.classList.toggle('on',+b.dataset.x===x));
    q('.xv').textContent=x; ev=acessos(alg,x,N,i=>V[i]); k=0; cache=[]; lidos=new Set(); cont={cmp:0,h:0,m:0};
    raiz.querySelectorAll('.lins .mv-c').forEach(c=>c.className='mv-c'); raiz.querySelectorAll('.lin').forEach(l=>l.classList.remove('carrega'));
    pintaCache(); numeros();
    narra(alg==='seq'?`A <b>busca da aula</b> olha v[b] e, se não achou, chama pra b − 1: anda pelo vetor de trás pra frente, em fila. Aperte ▶.`
      :`A <b>busca binária</b> olha o meio e descarta metade. Faz poucas comparações, mas pula pra longe. Aperte ▶.`);
  }
  function pintaCache(){
    q('.slots').innerHTML=[0,1].map(s=>{const l=cache[s]; return `<div class="mv-slot"><em>${l===undefined?'vazia':'linha '+l}</em><div class="mv-linha">${
      l===undefined?Array(L).fill('<div class="mv-c"></div>').join(''):V.slice(l*L,l*L+L).map((v,j)=>`<div class="mv-c${lidos.has(l*L+j)?' hit':''}">${v}</div>`).join('')}</div></div>`;}).join('');
  }
  function numeros(){ q('.k1').textContent=cont.cmp; q('.k2').textContent=cont.h; q('.k3').textContent=cont.m; q('.k4').textContent=fmt(cont.h*HIT+cont.m*MISS); }
  function narra(h,c){ const e=q('.mv-narra'); e.innerHTML=h; e.className='mv-narra'+(c?' '+c:''); }
  function voa(l,slot){ if(reduz) return;
    const pal=q('.mv-palco'), r0=pal.getBoundingClientRect(), a=raiz.querySelector(`.lin[data-l="${l}"] .mv-linha`).getBoundingClientRect(), b=raiz.querySelectorAll('.slots .mv-linha')[slot].getBoundingClientRect();
    const v=document.createElement('div'); v.className='mv-voo'; Object.assign(v.style,{left:a.left-r0.left+'px',top:a.top-r0.top+'px',width:a.width+'px',height:a.height+'px'}); pal.appendChild(v);
    requestAnimationFrame(()=>requestAnimationFrame(()=>Object.assign(v.style,{left:b.left-r0.left+'px',top:b.top-r0.top+'px',width:b.width+'px',height:b.height+'px',opacity:.2})));
    setTimeout(()=>v.remove(),650); }
  function passo(){
    if(k>=ev.length) return false;
    const i=ev[k++], l=Math.floor(i/L); cont.cmp++;
    raiz.querySelectorAll('.lins .mv-c.lido').forEach(c=>c.classList.remove('lido')); raiz.querySelectorAll('.lin').forEach(e=>e.classList.remove('carrega'));
    let txt; const p=cache.indexOf(l);
    if(p>=0){ cont.h++; cache.splice(p,1); cache.push(l); txt=`v[${i}] = ${V[i]} já estava na cache (linha ${l}): <b>leitura rápida</b>, uns ${HIT} ciclos.`; }
    else { cont.m++; cache.push(l); if(cache.length>2) cache.shift(); raiz.querySelector(`.lin[data-l="${l}"]`).classList.add('carrega'); setTimeout(()=>voa(l,cache.indexOf(l)),10);
      txt=`v[${i}] = ${V[i]} não estava na cache: <b>vai até a RAM</b> buscar a linha ${l} inteira (16 números), uns ${MISS} ciclos.`; }
    lidos.add(i); cel(i).classList.add('lido');
    if(alg==='bin'){ /* apaga o que a binária já descartou */ }
    pintaCache(); numeros();
    const achou=V[i]===x, fim=k>=ev.length;
    if(achou){ cel(i).classList.add('achou'); }
    if(fim){ const c=cont.h*HIT+cont.m*MISS;
      narra(`${achou?`Achou ${x} em v[${i}].`:`${x} não está no vetor.`} <b>${cont.cmp}</b> comparações, <b>${cont.m}</b> idas à RAM, uns <b>${fmt(c)}</b> ciclos. ${alg==='seq'?`Repara: das ${cont.cmp} leituras, só ${cont.m} foram até a RAM.`:`Repara: poucas comparações, mas quase cada uma no início é uma ida à RAM.`}`,'bom');
      return false; }
    narra(txt);
    return true;
  }
  raiz.querySelector('.mv-sel').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; ctl.para();
    if(b.dataset.alg) alg=b.dataset.alg; if(b.dataset.x) x=+b.dataset.x; monta();});
  const ctl=controles(raiz,passo,monta);
  tabela(); monta();
}

window.MemViz=function(alvo,op){ estilos(); (op&&op.cena==='busca'?cenaBusca:cenaPilha)(alvo); };
})();
