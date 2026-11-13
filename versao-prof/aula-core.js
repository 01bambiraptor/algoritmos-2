/* Algoritmos II com jogos e animações · feito a partir do material da disciplina CI1056 (UFPR) · CC BY-NC-SA 4.0 · veja LICENSE.txt */
/* Motor compartilhado das aulas de Recursão e Ordenação */
"use strict";
const $=id=>document.getElementById(id);
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function realce(t){
  let cm=''; let k=t.indexOf('//'); if(k>=0){cm=t.slice(k);t=t.slice(0,k);}
  t=esc(t).replace(/\b(void|int|float|if|return|else|while|for|Se|Devolva|Enquanto|Para|até|ou|e|Senão)\b/g,'<span class="kw">$1</span>');
  return t+(cm?`<span class="cm">${esc(cm)}</span>`:'');
}
/* código clicável: linhas = [[texto, [titulo, explicacao]?, classe?]] */
function montaCodigo(id,linhas,expId){
  const el=typeof id==='string'?$(id):id;
  el.innerHTML=linhas.map(([t,e,c],k)=>`<div data-k="${k}" class="${e?'cl':''} ${c||''}">${realce(t)||' '}</div>`).join('');
  if(expId) el.querySelectorAll('div.cl').forEach(d=>d.onclick=()=>{
    el.querySelectorAll('div').forEach(x=>x.classList.remove('sel')); d.classList.add('sel');
    const [tit,txt]=linhas[+d.dataset.k][1]; $(expId).innerHTML=`<h4>${tit}</h4>${txt}`;
  });
}
/* quiz */
let acertos=0,resp=0;
function quiz(alvo,lista){
  alvo.innerHTML=lista.map((q,k)=>`<div class="q" data-k="${k}"><div class="enun">${q.e}</div><div class="ops">${q.o.map((o,j)=>`<button data-j="${j}">${o}</button>`).join('')}</div><div class="fb"></div></div>`).join('');
  alvo.querySelectorAll('.q').forEach(div=>{
    const q=lista[+div.dataset.k]; let feito=false;
    div.querySelectorAll('button').forEach(b=>b.onclick=()=>{
      if(feito) return; feito=true; const j=+b.dataset.j;
      div.querySelectorAll('button')[q.c].classList.add('certa'); if(j!==q.c) b.classList.add('errada');
      const fb=div.querySelector('.fb'); fb.classList.add('on'); fb.innerHTML=(j===q.c?'✅ <b>Isso!</b> ':'❌ <b>Não foi dessa vez.</b> ')+q.x;
      resp++; if(j===q.c) acertos++; const p=$('placarQ'); if(p) p.textContent=`· ${acertos}/${resp}`;
    });
  });
}
/* abrir uma recorrência linha a linha */
function abreRec(alvo,linhas,fim){
  let k=1;
  alvo.innerHTML=`<div class="abre"></div><div class="ctrl"><button class="btn pri prox">Próxima linha ▸</button><button class="btn rec">↺ Do começo</button></div>`;
  const box=alvo.querySelector('.abre');
  const pinta=()=>{box.innerHTML=linhas.slice(0,k).map((l,i)=>`<div class="${i===k-1?'nova':''}">${l}</div>`).join('')+(k>=linhas.length&&fim?`<div class="fim">${fim}</div>`:'');
    alvo.querySelector('.prox').disabled=k>=linhas.length;};
  alvo.querySelector('.prox').onclick=()=>{k++;pinta();};
  alvo.querySelector('.rec').onclick=()=>{k=1;pinta();};
  pinta();
}
/* botões de escolha que recriam uma animação */
function escolhas(alvo,ops,cria){
  alvo.innerHTML=`<div class="seg">${ops.map((o,i)=>`<button data-i="${i}" class="${i?'':'on'}">${o.nome}</button>`).join('')}</div><div class="alvoAnim"></div>`;
  const a=alvo.querySelector('.alvoAnim');
  alvo.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{alvo.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x===b));cria(a,ops[+b.dataset.i]);});
  cria(a,ops[0]);
}
/* controles do player */
function player(q,F,desenha,vel){
  const rng=q('input[type=range]'); rng.max=F.length-1; let f=0,timer=null;
  const vai=k=>{f=Math.max(0,Math.min(F.length-1,k));desenha(F[f]);rng.value=f;q('.cont').textContent=`${f+1} / ${F.length}`;};
  const pausa=()=>{clearInterval(timer);timer=null;q('.bp').textContent='▶ Rodar';};
  q('.b0').onclick=()=>{pausa();vai(0);}; q('.bv').onclick=()=>{pausa();vai(f-1);}; q('.ba').onclick=()=>{pausa();vai(f+1);};
  q('.bp').onclick=()=>{if(timer)return pausa(); if(f>=F.length-1)vai(0); q('.bp').textContent='⏸ Pausar'; timer=setInterval(()=>{if(f>=F.length-1)return pausa();vai(f+1);},vel||1000);};
  rng.oninput=()=>{pausa();vai(+rng.value);};
  vai(0); return {vai,get f(){return f;}};
}
const CTRL=`<div class="ctrl"><button class="btn b0" title="começo">⏮</button><button class="btn bv" title="voltar">◀</button><button class="btn pri bp">▶ Rodar</button><button class="btn ba" title="avançar">▶|</button><input type="range" min="0" value="0"><span class="cont"></span></div>`;

/* =====================================================================
   recAnim: árvore de chamadas + pilha + código + vetor + saída
   cfg.run(R) roda o algoritmo chamando R.call / R.ln / R.ret / R.out
   ===================================================================== */
function recAnim(alvo,cfg){
  const F=[], nos=[], pilha=[]; let out='', vec=null, cnt={}, linha=-1;
  const est=new Map(); // id -> {st,val}
  const snap=(txt,ton='')=>F.push({txt,ton,linha,out,pilha:pilha.slice(),est:new Map([...est].map(([k,v])=>[k,{...v}])),vec:vec?JSON.parse(JSON.stringify(vec)):null,cnt:{...cnt}});
  const R={
    call(lbl,txt){const id=nos.length;nos.push({id,lbl,pai:pilha.length?pilha[pilha.length-1]:-1,filhos:[]});if(pilha.length)nos[pilha[pilha.length-1]].filhos.push(id);
      pilha.forEach(p=>est.get(p).st='pilha');pilha.push(id);est.set(id,{st:'ativo'});linha=0;snap(txt||`Chama <code>${esc(lbl)}</code>. Um bloco novo vai pro topo da pilha.`);return id;},
    ln(k,txt,ton){linha=k;snap(txt,ton);},
    ret(val,txt,ton){const id=pilha.pop();est.set(id,{st:'feito',val});if(pilha.length)est.get(pilha[pilha.length-1]).st='ativo';snap(txt||`<code>${esc(nos[id].lbl)}</code> devolve <b>${val}</b> e sai da pilha.`,ton);},
    out(s){out+=s;},
    vec(o){vec=o;},
    conta(k,n=1){cnt[k]=(cnt[k]||0)+n;},
    snap
  };
  cfg.run(R);
  if(cfg.fim) snap(cfg.fim(cnt,out),'bom');
  // layout da árvore: folhas em ordem, pai no meio dos filhos
  let folha=0; const prof=[],x=[];
  (function lay(id,d){prof[id]=d;const n=nos[id];if(!n.filhos.length){x[id]=folha++;return;}n.filhos.forEach(c=>lay(c,d+1));x[id]=(x[n.filhos[0]]+x[n.filhos[n.filhos.length-1]])/2;})(0,0);
  const larg=Math.max(...nos.map(n=>n.lbl.length))*7.4+18, DX=larg+10, DY=cfg.dy||64;
  const W=Math.max(folha*DX,240), H=(Math.max(...prof)+1)*DY+14;
  const temVet=!!F.find(f=>f.vec);
  alvo.innerHTML=`<div class="anim"><div class="narra"></div><div class="palco"><div>
      <div class="arvore"><svg viewBox="0 0 ${W} ${H}" style="width:${Math.min(100,W/3.2)}%;min-width:240px;max-height:${cfg.altura||380}px"></svg></div>
      ${temVet?'<div class="vetLinha vv"></div>':''}${CTRL}</div>
    <div class="painel"><div class="codigo cod">${cfg.codigo.map(t=>`<div>${realce(t)||' '}</div>`).join('')}</div>
      <div class="mini"><h5>Pilha de chamadas <small>(topo em cima)</small></h5><div class="pilha"></div></div>
      ${cfg.saida?'<div class="mini"><h5>Saída na tela</h5><div class="saida"></div></div>':''}
      ${cfg.contadores?'<div class="mini"><h5>Contadores</h5><div class="cnt"></div></div>':''}</div></div></div>`;
  const q=s=>alvo.querySelector(s), svg=q('svg');
  const P=id=>({x:x[id]*DX+DX/2,y:prof[id]*DY+26});
  function desenha(Q){
    let h='';
    nos.forEach(n=>{const s=Q.est.get(n.id);if(!s||n.pai<0)return;const a=P(n.pai),b=P(n.id);h+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${s.st==='feito'?'#a9dcbc':'#bcd3e6'}" stroke-width="2.5"/>`;});
    nos.forEach(n=>{const s=Q.est.get(n.id);if(!s)return;const p=P(n.id),w=n.lbl.length*7.4+14;
      const [fill,stroke]=s.st==='ativo'?['#fff4d6','#f0a81c']:s.st==='pilha'?['#fff9ec','#e8c98a']:['#e2f5ea','#2f9e5a'];
      h+=`<g><rect x="${p.x-w/2}" y="${p.y-14}" width="${w}" height="28" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="${s.st==='ativo'?3:2}"/>
        <text x="${p.x}" y="${p.y+5}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="12.5" fill="#2b3440">${esc(n.lbl)}</text>
        ${s.st==='feito'?`<text x="${p.x}" y="${p.y+29}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="13" fill="#2f9e5a">→ ${esc(s.val)}</text>`:''}</g>`;});
    svg.innerHTML=h;
    const nar=q('.narra'); nar.innerHTML=Q.txt; nar.className='narra '+Q.ton;
    q('.cod').querySelectorAll('div').forEach((d,k)=>d.className=k===Q.linha?'on':'');
    q('.pilha').innerHTML=Q.pilha.map(id=>`<div>${esc(nos[id].lbl)}</div>`).join('')||'<span style="color:#6b7785">vazia</span>';
    if(cfg.saida) q('.saida').textContent=Q.out||' ';
    if(cfg.contadores) q('.cnt').innerHTML=cfg.contadores.map(([k,n])=>`${n}: <b>${Q.cnt[k]||0}</b>`).join(' · ');
    if(temVet){const v=Q.vec; q('.vv').innerHTML=v?v.v.map((val,i)=>i<(v.ini??1)?'':`<div class="cel ${i<v.a||i>v.b?'vaz':''} ${v.cur===i?'sel':''} ${(v.ok||[]).includes(i)?'ordC':''}"><small>${i}</small><b>${val}</b><i>${Object.entries(v.ptr||{}).filter(([,j])=>j===i).map(([nm])=>nm).join(' ')}</i></div>`).join(''):'';}
  }
  player(q,F,desenha,cfg.vel);
  return F;
}

/* =====================================================================
   vetAnim: vetor com barras, ponteiros, faixa ativa, vetor auxiliar u
   frame: {v,a,b,ptr,cmp,troca,ok,u,uk,pilha,linha,txt,ton,cnt}
   ===================================================================== */
function vetAnim(alvo,cfg){
  const F=[]; const v=[null,...cfg.vetor]; const n=cfg.vetor.length; const pilha=[]; let cnt={comp:0,troca:0}; let linha=-1, ok=new Set(), u=null, uk=-1, faixa=[1,n], mmid=null;
  const S={v,
    snap(txt,o={}){F.push({v:v.slice(),a:faixa[0],b:faixa[1],m:mmid,ptr:{},cmp:[],troca:[],ok:[...ok],u:u?u.slice():null,uk,pilha:pilha.slice(),linha,txt,ton:'',cnt:{...cnt},...o});},
    ln(k,txt,o){linha=k;S.snap(txt,o);},
    push(lbl,a,b){pilha.push({lbl,a,b});faixa=[a,b];mmid=null;},
    pop(){pilha.pop();const t=pilha[pilha.length-1];faixa=t?[t.a,t.b]:[1,n];mmid=null;},
    meio(m){mmid=m;},
    troca(i,j){[v[i],v[j]]=[v[j],v[i]];if(i!==j)cnt.troca++;},
    comp(k=1){cnt.comp+=k;},
    ok(i){ok.add(i);}, u(arr,k){u=arr;uk=k??-1;}, semU(){u=null;uk=-1;}
  };
  cfg.run(S);
  S.snap(cfg.fim?cfg.fim(cnt,v):`Pronto: <code>${v.slice(1).join(' ')}</code>.`,{ton:'bom',a:0,b:-1,ok:[...Array(n)].map((_,i)=>i+1)});
  const mx=Math.max(...cfg.vetor);
  alvo.innerHTML=`<div class="anim"><div class="narra"></div><div class="palco"><div>
      <div class="barras"></div><div class="aux"></div>${CTRL}</div>
    <div class="painel"><div class="codigo cod">${cfg.codigo.map(t=>`<div>${realce(t)||' '}</div>`).join('')}</div>
      <div class="mini"><h5>Pilha de chamadas <small>(topo em cima)</small></h5><div class="pilha"></div></div>
      <div class="mini"><h5>Contadores</h5><div class="cnt"></div></div></div></div></div>`;
  const q=s=>alvo.querySelector(s);
  function desenha(Q){
    q('.barras').innerHTML=Q.v.slice(1).map((val,k)=>{const i=k+1;const dentro=i>=Q.a&&i<=Q.b;
      const cls=[Q.troca.includes(i)?'tr':Q.cmp.includes(i)?'cp':'',Q.ok.includes(i)?'okk':'',dentro?'':'fora',Q.m!=null&&dentro&&i<=Q.m?'meta1':''].join(' ');
      const pt=Object.entries(Q.ptr).filter(([,j])=>j===i).map(([nm])=>nm).join(' ');
      return `<div class="bar ${cls}"><div class="col"><span style="height:${18+val/mx*92}px"></span></div><b>${val}</b><small>${i}</small><i>${pt||'&nbsp;'}</i></div>`;}).join('');
    q('.aux').innerHTML=Q.u?`<div class="ulin"><span class="uro">u</span>${Q.u.map((x,k)=>`<div class="cel ${k===Q.uk?'sel':''} ${x==null?'vaz':''}"><small>${k}</small><b>${x??''}</b></div>`).join('')}</div>`:'';
    const nar=q('.narra'); nar.innerHTML=Q.txt; nar.className='narra '+(Q.ton||'');
    q('.cod').querySelectorAll('div').forEach((d,k)=>d.className=k===Q.linha?'on':'');
    q('.pilha').innerHTML=Q.pilha.map(p=>`<div>${esc(p.lbl)}</div>`).join('')||'<span style="color:#6b7785">vazia</span>';
    q('.cnt').innerHTML=`comparações: <b>${Q.cnt.comp}</b> · trocas: <b>${Q.cnt.troca}</b>`;
  }
  player(q,F,desenha,cfg.vel||850);
  return F;
}

/* nav dos capítulos */
function navCaps(){
  const links=[...document.querySelectorAll('#caps a')];
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>{const on=a.getAttribute('href')==='#'+e.target.id;a.classList.toggle('on',on);if(on&&a.parentElement){const n=a.parentElement;n.scrollTo({left:a.offsetLeft-n.clientWidth/2+a.offsetWidth/2,behavior:'smooth'});}  /* só desliza o menu de lado; scrollIntoView puxava a página no Firefox */});}),{rootMargin:'-40% 0px -55% 0px'});
  document.querySelectorAll('main section').forEach(s=>obs.observe(s));
}
