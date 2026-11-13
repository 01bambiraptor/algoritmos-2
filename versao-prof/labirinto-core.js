/* Algoritmos II com jogos e animações · feito a partir do material da disciplina CI1056 (UFPR) · CC BY-NC-SA 4.0 · veja LICENSE.txt */
/* labirinto-core.js: o labirinto.c do professor, em JS, gravando cada passo.
   Usado pela aula de Backtracking e pelo jogo do Ratinho. */
"use strict";
const LAB = {
  MAPAS: {
    prof:  {nome:'Do professor (4 × 4)', dirs:2, m:[[1,0,0,0],[1,1,0,1],[0,1,0,0],[1,1,1,1]],
            desc:'O labirinto do main() do labirinto.c. Repara: o rato acha o caminho sem precisar voltar nenhuma vez!'},
    beco:  {nome:'Com becos (4 × 4)', dirs:2, m:[[1,1,1,1],[1,0,0,1],[1,1,0,1],[0,1,0,1]],
            desc:'Descer primeiro parece bom, mas leva a becos. Aqui o backtracking trabalha de verdade.'},
    quatro:{nome:'Só com 4 direções (5 × 5)', dirs:4, m:[[1,0,1,1,1],[1,0,1,0,1],[1,1,1,0,1],[0,0,0,0,1],[0,0,0,0,1]],
            desc:'Com só ↓ e → não tem saída. Precisa da alteração com ↑ e ←.'},
  },
  aleatorio(N){
    for(;;){
      const m=Array.from({length:N},()=>Array(N).fill(0));
      let x=0,y=0; m[0][0]=1;
      while(x<N-1||y<N-1){ if(x===N-1)y++; else if(y===N-1)x++; else if(Math.random()<.5)x++; else y++; m[x][y]=1; }
      for(let i=0;i<N;i++)for(let j=0;j<N;j++) if(Math.random()<.38) m[i][j]=1;
      const r=LAB.gerar(m,2); // exige algumas voltas pra ficar interessante
      if(r.ok&&r.voltas>=2&&r.voltas<=14) return m;
    }
  },
  DIRS:[{dx:1,dy:0,id:'down',s:'↓',txt:'x + 1, y',nome:'desce'},{dx:0,dy:1,id:'right',s:'→',txt:'x, y + 1',nome:'vai pra direita'},
        {dx:-1,dy:0,id:'up',s:'↑',txt:'x - 1, y',nome:'sobe'},{dx:0,dy:-1,id:'left',s:'←',txt:'x, y - 1',nome:'vai pra esquerda'}],
  codigo(dirs){
    const c=[
      ['bool solveMazeUtil(int maze[N][N], int x, int y, int sol[N][N])','sig'],
      ['{',''],
      ['    // if (x, y is goal) return true',''],
      ['    if (x == N - 1 && y == N - 1 && maze[x][y] == 1) {','goal'],
      ['        sol[x][y] = 1;','goalM'],
      ['        return true;','goalM'],
      ['    }',''],
      ['    // Check if maze[x][y] is valid',''],
      ['    if (isSafe(maze, x, y) == true) {','safe'],
      ['        if (sol[x][y] == 1)','vis'],
      ['            return false;','vis'],
      ['        sol[x][y] = 1;','mark'],
      ['        if (solveMazeUtil(maze, x + 1, y, sol) == true)','down'],
      ['            return true;','prop'],
      ['        if (solveMazeUtil(maze, x, y + 1, sol) == true)','right'],
      ['            return true;','prop'],
    ];
    if(dirs===4) c.push(
      ['        // alteração: também sobe e vai pra esquerda',''],
      ['        if (solveMazeUtil(maze, x - 1, y, sol) == true)','up'],
      ['            return true;','prop'],
      ['        if (solveMazeUtil(maze, x, y - 1, sol) == true)','left'],
      ['            return true;','prop']);
    c.push(
      ['        sol[x][y] = 0;    // BACKTRACK','unmark'],
      ['        return false;','ret0'],
      ['    }',''],
      ['    return false;','unsafe'],
      ['}','']);
    return c;
  },
  /* roda o algoritmo e grava os quadros */
  gerar(m,dirs,limite=20000){
    const N=m.length, sol=m.map(r=>r.map(()=>0)), pilha=[], F=[], becos=new Set(); let cham=0,voltas=0,parou=false;
    const k=(x,y)=>x+','+y;
    const snap=(linha,msg,o={})=>{ if(F.length<limite) F.push({linha,msg,sol:sol.map(r=>r.slice()),pilha:pilha.slice(),becos:new Set(becos),cham,voltas,probe:null,ton:'',...o}); };
    const ds=LAB.DIRS.slice(0,dirs);
    function rec(x,y,de){
      cham++; if(cham>limite){parou=true;return false;}
      pilha.push([x,y]);
      snap('sig',`Chamou <code>solveMazeUtil(maze, ${x}, ${y}, sol)</code>${de?` (${de})`:''}.`,{probe:{x,y,ok:null}});
      const dentro=x>=0&&x<N&&y>=0&&y<N;
      if(dentro&&x===N-1&&y===N-1&&m[x][y]===1){
        snap('goal',`(${x},${y}) é a saída e está livre! 🧀`,{probe:{x,y,ok:true}});
        sol[x][y]=1; snap('goalM',`<code>sol[${x}][${y}] = 1; return true;</code> Achou o caminho!`,{ton:'bom'});
        pilha.pop(); return true;
      }
      const safe=dentro&&m[x][y]===1;
      snap('safe',`<code>isSafe(maze, ${x}, ${y})</code>? ${!dentro?`(${x},${y}) está fora do labirinto: <b>false</b>.`:m[x][y]===0?`(${x},${y}) é parede: <b>false</b>.`:`(${x},${y}) é caminho: <b>true</b>.`}`,{probe:{x,y,ok:safe}});
      if(!safe){ snap('unsafe',`Então pula o if inteiro e <code>return false</code>. Volta pra quem chamou.`,{probe:{x,y,ok:false},ton:'ruim'}); pilha.pop(); return false; }
      if(sol[x][y]===1){ snap('vis',`<code>sol[${x}][${y}] == 1</code>: essa casa já está no caminho! Andar nela de novo seria andar em círculo. <code>return false</code>.`,{probe:{x,y,ok:false},ton:'ruim'}); pilha.pop(); return false; }
      sol[x][y]=1; becos.delete(k(x,y));
      snap('mark',`<code>sol[${x}][${y}] = 1</code>: marca (${x},${y}) como parte do caminho. O rato está aqui.`);
      for(const d of ds){
        snap(d.id,`Tenta <code>solveMazeUtil(maze, ${d.txt}, sol)</code>: ${d.nome} ${d.s} pra (${x+d.dx},${y+d.dy}).`);
        if(rec(x+d.dx,y+d.dy,`${d.nome} ${d.s}`)){ snap('prop',`A chamada de (${x+d.dx},${y+d.dy}) devolveu true, então esta também devolve true. O sucesso sobe pela pilha.`,{ton:'bom'}); pilha.pop(); return true; }
        if(parou) return false;
      }
      sol[x][y]=0; voltas++; becos.add(k(x,y));
      snap('unmark',`Nenhuma direção deu certo a partir de (${x},${y}). <code>sol[${x}][${y}] = 0; // BACKTRACK</code>: desmarca.`,{ton:'ruim'});
      snap('ret0',`<code>return false</code>: (${x},${y}) sai da pilha e quem chamou tenta a próxima direção.`,{ton:'ruim'});
      pilha.pop(); return false;
    }
    snap('',`Começa com <code>sol</code> toda zerada e a chamada <code>solveMazeUtil(maze, 0, 0, sol)</code>.`);
    const ok=rec(0,0,'');
    snap('',ok?`Fim: <code>solveMaze</code> imprime a matriz <code>sol</code> com o caminho em 1. ${cham} chamadas e ${voltas} volta${voltas===1?'':'s'}.`:parou?'Passou do limite de passos.':`Fim: nenhum caminho. O programa imprime <b>"Solution doesn't exist"</b>. ${cham} chamadas.`,{ton:ok?'bom':'ruim'});
    return {F,ok,cham,voltas};
  },
  /* desenha a grade */
  grade(el,m,Q,extra={}){
    const N=m.length; el.style.gridTemplateColumns=`repeat(${N},1fr)`;
    const top=Q.pilha.length?Q.pilha[Q.pilha.length-1]:null;
    const rato=extra.rato||[...Q.pilha].reverse().find(([x,y])=>x>=0&&y>=0&&x<N&&y<N&&Q.sol[x][y])||top;
    let h='';
    for(let x=0;x<N;x++)for(let y=0;y<N;y++){
      let c='casa'+(m[x][y]?' livre':' parede');
      if(Q.sol[x][y]) c+=' cam';
      if(Q.becos&&Q.becos.has(x+','+y)&&!Q.sol[x][y]) c+=' beco';
      if(Q.probe&&Q.probe.x===x&&Q.probe.y===y&&Q.probe.ok!==null) c+=Q.probe.ok?' ok':' nao';
      if(extra.alvos&&extra.alvos.has(x+','+y)) c+=' alvo';
      let in_='';
      if(rato&&rato[0]===x&&rato[1]===y) in_='🐭';
      else if(x===N-1&&y===N-1) in_='🧀';
      h+=`<div class="${c}" data-x="${x}" data-y="${y}"><span class="ico">${in_}</span><span class="xy">${x},${y}</span></div>`;
    }
    // sonda fora da grade
    el.innerHTML=h;
    el.dataset.fora=Q.probe&&(Q.probe.x<0||Q.probe.y<0||Q.probe.x>=N||Q.probe.y>=N)?'1':'';
  },
  matriz(el,sol){ el.textContent=sol.map(r=>r.map(v=>' '+v+' ').join('')).join('\n'); },
  CSS:`
  .grade{display:grid;gap:4px;width:100%;max-width:420px;aspect-ratio:1/1;margin:0 auto;padding:8px;background:#8fbf7f;border-radius:16px;position:relative}
  .grade[data-fora="1"]{box-shadow:0 0 0 4px #d9485f}
  .grade .casa{position:relative;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:clamp(20px,5vw,34px);transition:background .2s}
  .grade .casa.parede{background:repeating-linear-gradient(45deg,#6e9e5f 0 6px,#79a96a 6px 12px);box-shadow:inset 0 -3px 0 #0002}
  .grade .casa.livre{background:#fff8ea}
  .grade .casa.cam{background:#ffd6b0}
  .grade .casa.beco{background:#eceff1}
  .grade .casa.beco::after{content:'✕';position:absolute;color:#b0bec5;font-size:.6em}
  .grade .casa.ok{box-shadow:inset 0 0 0 4px #2f9e5a}
  .grade .casa.nao{box-shadow:inset 0 0 0 4px #d9485f}
  .grade .casa.alvo{box-shadow:inset 0 0 0 3px #2c7be5;cursor:pointer}
  .grade .casa .xy{position:absolute;bottom:2px;right:4px;font-size:10px;color:#a1887f;font-family:'JetBrains Mono',monospace}
  .grade .casa.parede .xy{color:#ffffff99}
  .grade .ico{position:relative;z-index:1}
  pre.solmat{font-family:'JetBrains Mono',monospace;background:#f8fbfe;border-radius:10px;padding:6px 8px;margin:0;font-size:.95rem;line-height:1.5}
  `
};
