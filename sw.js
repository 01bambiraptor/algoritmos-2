/* Algoritmos II · deixa o site funcionando como app e sem internet depois da primeira visita.
 * Páginas: tenta a rede primeiro (pra pegar atualização) e cai no cache se estiver offline.
 * Resto (scripts, imagens, fontes): cache primeiro. */
const CACHE='alg2-v1';
const BASICO=['./','./index.html','./canto.js','./modo.js','./aula-core.js','./aula-fatia.js','./manifest.webmanifest','./icone-192.png','./icone-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASICO).catch(()=>{}))); self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const pagina=r.mode==='navigate'||(r.headers.get('accept')||'').includes('text/html');
  if(pagina){
    e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); return res; })
      .catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok||res.type==='opaque'){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })));
});
