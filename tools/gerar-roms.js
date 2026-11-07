#!/usr/bin/env node
/* Gera roms/roms.json automaticamente a partir dos arquivos da pasta roms/.
   Na sua máquina:  node tools/gerar-roms.js   (no GitHub roda sozinho: .github/workflows/gerar-roms.yml)

   Reconhece TODOS os consoles que o jogo tem emulador, mesmo sem nenhum jogo ainda.
   Como o console de cada arquivo é descoberto (nesta ordem):
     1) subpasta com nome do console:      roms/psx/Crash.iso   roms/n64/Mario.z64
     2) dupla extensão (para .zip/.7z):    Crash.psx.zip   Sonic.md.zip   Chrono.sfc.zip
     3) extensão:                          .nes .gb .gbc .gba .sfc .smc .z64 .n64 .md .sms .gg .cue .pbp ...
     4) "system" escrito à mão no roms.json (o script nunca apaga o que você escreveu à mão)
   BIOS (opcional): ponha em roms/bios/ (psx.bin, saturn.bin, segacd.bin). Essa pasta é ignorada na lista de jogos. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'roms');
const OUT = path.join(ROOT, 'roms.json');

/* [id, extensões, apelidos aceitos como nome de subpasta / dupla extensão / campo "system"] */
const SYS = [
  ['gba',       ['gba','agb'],                ['gba','gameboyadvance']],
  ['nes',       ['nes','fds','unf','unif'],   ['nes','famicom','nintendo']],
  ['gb',        ['gb'],                       ['gb','gameboy']],
  ['gbc',       ['gbc'],                      ['gbc','gameboycolor']],
  ['snes',      ['sfc','smc','fig','swc'],    ['snes','supernintendo','superfamicom','sfc']],
  ['md',        ['md','gen','smd','bin'],     ['md','megadrive','genesis','segagenesis','segamd']],
  ['ms',        ['sms'],                      ['ms','mastersystem','sms','segamastersystem']],
  ['gg',        ['gg'],                       ['gg','gamegear','segagamegear']],
  ['segacd',    [],                           ['segacd','scd','megacd','mcd','segamegacd']],
  ['sega32x',   ['32x'],                      ['32x','sega32x']],
  ['saturn',    ['ccd','mds'],                ['saturn','segasaturn','ss']],
  ['n64',       ['z64','n64','v64'],          ['n64','nintendo64']],
  ['psx',       ['cue','pbp','m3u','iso','chd'], ['psx','ps1','playstation','playstation1']],
  ['nds',       ['nds','dsi'],                ['nds','ds','nintendods']],
  ['psp',       ['cso'],                      ['psp','playstationportable']],
  ['atari2600', ['a26'],                      ['atari2600','2600']],
  ['atari7800', ['a78'],                      ['atari7800','7800']],
  ['lynx',      ['lnx'],                      ['lynx','atarilynx']],
  ['jaguar',    ['j64','jag'],                ['jaguar','atarijaguar']],
  ['pce',       ['pce','sgx'],                ['pce','pcengine','turbografx','tg16']],
  ['ngp',       ['ngp','ngc'],                ['ngp','neogeopocket']],
  ['ws',        ['ws','wsc'],                 ['ws','wonderswan']],
  ['vb',        ['vb','vboy'],                ['vb','virtualboy']],
  ['coleco',    ['col','cv'],                 ['coleco','colecovision']],
  ['3do',       [],                           ['3do']],
  ['arcade',    [],                           ['arcade','fbneo','mame','neogeo']]
];
const ARCH = ['zip', '7z'];
const norm = x => String(x || '').toLowerCase().replace(/[^a-z0-9]/g, '');
function byToken(t){
  t = norm(t); if(!t) return '';
  for(const [id] of SYS) if(id === t) return id;
  for(const [id, , al] of SYS) if(al.includes(t)) return id;
  for(const [id, ex] of SYS) if(ex.includes(t)) return id;
  return '';
}
const ALLEXT = [].concat(...SYS.map(x => x[1]), ARCH);

function walk(dir, base = ''){
  let out = [];
  for(const n of fs.readdirSync(dir, { withFileTypes:true })){
    const rel = base ? base + '/' + n.name : n.name;
    if(n.isDirectory()){ if(!base && n.name.toLowerCase() === 'bios') continue; out = out.concat(walk(path.join(dir, n.name), rel)); }
    else out.push(rel);
  }
  return out;
}
function titleOf(file){
  let n = path.posix.basename(file).replace(/\.(zip|7z)$/i, '').replace(/\.[^.]+$/, '');
  n = n.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  return n || path.posix.basename(file);
}
function systemOf(file){
  const parts = file.toLowerCase().split('/'), name = parts.pop(), bits = name.split('.');
  const ext = bits.length > 1 ? bits.pop() : '';
  for(const f of parts){ const r = byToken(f); if(r) return r; }          /* 1) subpasta */
  if(ARCH.includes(ext)) return byToken(bits.length > 1 ? bits.pop() : ''); /* 2) Jogo.psx.zip */
  return byToken(ext);                                                      /* 3) extensão */
}

if(!fs.existsSync(ROOT)){ console.error('Pasta roms/ não encontrada.'); process.exit(1); }
let old = [];
try{ const j = JSON.parse(fs.readFileSync(OUT, 'utf8')); old = Array.isArray(j) ? j : (j.games || []); }catch(e){}
const prev = new Map(old.filter(x => x && x.file).map(x => [x.file, x]));

const games = [];
for(const file of walk(ROOT).sort((a, b) => a.localeCompare(b))){
  const ext = file.split('.').pop().toLowerCase();
  if(!ALLEXT.includes(ext)) continue;
  if(/^(readme|license|licenca|leia-?me)/i.test(path.posix.basename(file))) continue;   /* README.md não é jogo de Mega Drive (.md) */
  const mine = prev.get(file) || {};
  const g = Object.assign({ file, title:titleOf(file), system:systemOf(file) }, mine);   /* o que você escreveu à mão vence */
  if(!g.system) console.warn('⚠ sem console definido (fica fora das listas): ' + file + '  → renomeie para "' + path.posix.basename(file).replace(/\.(zip|7z)$/i, '') + '.<console>.zip" (ex.: .psx.zip, .n64.zip) ou ponha em subpasta, ou escreva "system" no roms.json');
  games.push(g);
}
const order = SYS.map(x => x[0]);
games.sort((a, b) => {
  const ia = order.indexOf(a.system), ib = order.indexOf(b.system);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.title.localeCompare(b.title);
});
fs.writeFileSync(OUT, JSON.stringify(games, null, 2) + '\n');
const cnt = {}; games.forEach(g => { cnt[g.system || '?'] = (cnt[g.system || '?'] || 0) + 1; });
console.log('roms.json atualizado: ' + games.length + ' jogos', cnt);
