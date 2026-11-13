/* Algoritmos II · o robô do canto fala num balão (texto digitado).
 * window.roboFala({titulo, texto, botoes:[{rotulo, pri, acao}]}) abre um balão.
 * Falas prontas:
 *   - app: como usar o site como app (PWA). Também registra o sw.js (só com o site online).
 *   - idioma: "viu a lista do professor e não entendeu nada?" → idioma.html
 * Não abre sozinho: tocar no robô abre um menu (idioma e app); o link do rodapé abre a dica do app.
 * Em outra página, defina window.ROBO_PAGINA antes deste script ('idioma' = boas-vindas da página do idioma). */
(function(){
  const PAG=window.ROBO_PAGINA||'inicio';
  const base=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
  const app=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const online=location.protocol==='https:'||location.hostname==='localhost';
  if(online&&'serviceWorker' in navigator) navigator.serviceWorker.register(base+'sw.js').catch(()=>{});
  let pedido=null, aberto=false, bal=null, tipo=null;
  addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); pedido=e; });
  addEventListener('appinstalled',()=>{ marca('app'); fecha(); });
  const ua=navigator.userAgent, ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),
        android=/Android/.test(ua), ff=/Firefox\//.test(ua)||/FxiOS/.test(ua), reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const visto=k=>{try{return !!localStorage.getItem('robo-viu-'+k);}catch(x){return true;}};
  const marca=k=>{try{localStorage.setItem('robo-viu-'+k,'1');}catch(x){}};

  function textoApp(){
    if(app) return 'Você já está usando o site como app. Ele funciona sem internet nas páginas que você já abriu uma vez.';
    if(!online) return 'Dá pra usar este site como um app: ícone na tela, tela cheia e funcionando sem internet. Mas pra instalar ele precisa estar aberto pelo link do site. Pelo arquivo do computador o navegador não deixa.';
    if(pedido) return 'Quer usar o site como um app? Ele ganha um ícone na tela, abre em tela cheia e funciona sem internet depois da primeira visita. É só tocar em Instalar.';
    if(ios) return 'Pra usar como app no iPhone ou iPad: abra no Safari, toque em Compartilhar (o quadrado com a setinha pra cima) e depois em "Adicionar à Tela de Início".';
    if(android&&ff) return 'Pra usar como app no Firefox do Android: toque no menu ⋮ e depois em "Instalar" ou "Adicionar à tela inicial".';
    if(android) return 'Pra usar como app: toque no menu ⋮ do navegador e depois em "Instalar app" ou "Adicionar à tela inicial".';
    if(ff) return 'O Firefox do computador não instala sites como app, mas no celular funciona. No PC dá pra abrir no Chrome ou no Edge e instalar por lá, ou só salvar nos favoritos.';
    return 'Pra usar o site como app: no Chrome ou no Edge, clique no ícone de instalar no canto direito da barra de endereço (um monitor com uma setinha).';
  }
  const FALAS={
    app:()=>({titulo:'📱 usar como app',texto:'Oi! '+textoApp(),botoes:pedido&&!app?[{rotulo:'Instalar',pri:1,acao:async()=>{pedido.prompt();try{await pedido.userChoice;}catch(x){}pedido=null;}},{rotulo:'Agora não'}]:[{rotulo:'Entendi'}]}),
    idioma:()=>({titulo:'📖 idioma das listas',texto:'Oi! Tá com dificuldade em entender os conceitos? Abriu a lista do professor e não entendeu nada? Essa seção é pra você: eu traduzo os símbolos e as palavras dos enunciados, e mostro o que cada exercício quer de verdade.',
      botoes:[{rotulo:'Agora não'},{rotulo:'Me mostra',pri:1,acao:()=>{location.href=base+'idioma.html';}}]}),
    bemvindo:()=>({titulo:'📖 idioma das listas',texto:'Relaxa: a lista é escrita num idioma próprio, e ninguém nasce sabendo ler. Começa pelo "molde" lá em cima, depois use os dicionários quando travar num símbolo ou numa palavra. No decodificador, toque nos pedaços sublinhados do enunciado.',
      botoes:[{rotulo:'Bora'}]}),
    menu:()=>({titulo:'🤖 posso ajudar?',texto:'Escolha uma ajuda:',botoes:[{rotulo:'📖 Idioma das listas',acao:()=>setTimeout(()=>roboFala(FALAS.idioma()),50)},{rotulo:'📱 Usar como app',acao:()=>setTimeout(()=>roboFala(FALAS.app()),50)}]})
  };

  const st=document.createElement('style');
  st.textContent=`.balaoApp{position:fixed;right:16px;bottom:96px;z-index:10000;width:min(340px,calc(100vw - 32px));background:#fff;color:#1e293b;
  border:1px solid #e2e8f0;border-radius:16px;padding:14px 16px 12px;box-shadow:0 12px 32px #0f172a26;font:500 .95rem/1.55 Inter,system-ui,sans-serif;
  transform-origin:90% 100%;animation:balaoEntra .32s cubic-bezier(.3,1.4,.5,1)}
.balaoApp:after{content:"";position:absolute;right:38px;bottom:-8px;width:16px;height:16px;background:#fff;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;transform:rotate(45deg)}
.balaoApp .tt{font:700 .72rem Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#1d4ed8;margin-bottom:4px;display:flex;justify-content:space-between}
.balaoApp .tt button{border:0;background:none;font-size:1.1rem;line-height:1;color:#94a3b8;cursor:pointer;padding:0 2px}
.balaoApp .fala{min-height:3.2em}
.balaoApp .cursor{display:inline-block;width:2px;height:1em;background:#1d4ed8;vertical-align:-2px;margin-left:1px;animation:pisca .8s steps(1) infinite}
.balaoApp .bts{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:10px;opacity:0;transition:opacity .25s}
.balaoApp .bts.on{opacity:1}
.balaoApp .bts button{font:600 .88rem Inter,sans-serif;border-radius:8px;padding:7px 14px;cursor:pointer;border:1px solid #e2e8f0;background:#fff;color:#334155}
.balaoApp .bts .pri{background:#1d4ed8;border-color:#1d4ed8;color:#fff}
.linkApp{font:inherit;border:0;background:none;color:#1d4ed8;text-decoration:underline;cursor:pointer;padding:0}
@keyframes balaoEntra{from{transform:scale(.6);opacity:0}}
@keyframes pisca{50%{opacity:0}}
@media (max-width:600px){.balaoApp{bottom:74px}}`;
  document.head.appendChild(st);

  function digita(el,t,fim){
    if(reduz){ el.textContent=t; fim(); return; }
    let i=0; const cur=document.createElement('span'); cur.className='cursor';
    const passo=()=>{ if(!aberto) return; i=Math.min(t.length,i+(t[i]===' '?2:1)); el.textContent=t.slice(0,i); el.appendChild(cur);
      if(i<t.length) tipo=setTimeout(passo,/[.,:!?]/.test(t[i-1])?160:22); else { cur.remove(); fim(); } };
    passo();
    const pula=ev=>{ if(ev.target.closest('button')) return; clearTimeout(tipo); el.textContent=t; fim(); bal&&bal.removeEventListener('click',pula); };
    bal.addEventListener('click',pula);
  }
  function roboFala(f){
    fecha(); aberto=true;
    bal=document.createElement('div'); bal.className='balaoApp'; bal.setAttribute('role','dialog'); bal.setAttribute('aria-label',f.titulo.replace(/^\S+\s/,''));
    bal.innerHTML=`<div class="tt"><span>${f.titulo}</span><button type="button" aria-label="fechar">×</button></div><div class="fala"></div><div class="bts"></div>`;
    const bts=bal.querySelector('.bts');
    (f.botoes||[{rotulo:'Ok'}]).forEach(b=>{ const e=document.createElement('button'); e.type='button'; e.textContent=b.rotulo; if(b.pri) e.className='pri';
      e.onclick=async()=>{ fecha(); if(b.acao) await b.acao(); }; bts.appendChild(e); });
    document.body.appendChild(bal);
    bal.querySelector('.tt button').onclick=fecha;
    digita(bal.querySelector('.fala'),f.texto,()=>bts.classList.add('on'));
  }
  function fecha(){ aberto=false; clearTimeout(tipo); if(bal){ bal.remove(); bal=null; } }
  window.roboFala=roboFala; window.roboFalas=FALAS;
  window.abreDicaApp=()=>roboFala(FALAS.app());

  function liga(){
    const r=document.querySelector('.rodape');
    if(PAG==='inicio'&&r&&!r.querySelector('.linkApp')){ const b=document.createElement('button'); b.type='button'; b.className='linkApp'; b.textContent='📱 usar como app';
      b.onclick=()=>roboFala(FALAS.app()); r.appendChild(document.createElement('br')); r.appendChild(b); }
    const ligaRobo=()=>{ const rb=document.querySelector('.canto .robo'); if(!rb){ setTimeout(ligaRobo,300); return; }
      rb.addEventListener('click',ev=>{ if(ev.isTrusted===false) return; aberto?fecha():roboFala(PAG==='idioma'?FALAS.bemvindo():FALAS.menu()); }); };
    ligaRobo();
    // sem balão automático: o robô só fala quando alguém toca nele ou no link (pra não atrapalhar)
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',liga); else liga();
})();
