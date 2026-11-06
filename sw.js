/* Service worker do jogo: deixa o emulador de GBA (e os jogos da pasta roms/) funcionarem sem internet.
   - cdn.emulatorjs.org e roms/*.gba: guarda na primeira vez e depois usa a cópia local.
   - o resto do mesmo site (index.html, roms.json): tenta a internet primeiro; sem internet, usa a cópia guardada. */
const CACHE = 'dz-gba-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled([c.add('./'), c.add('./index.html'), c.add('./roms/roms.json')])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.startsWith('dz-gba-')).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function put(req, res){
  try{ if(res && (res.ok || res.type === 'opaque')){ const c = await caches.open(CACHE); await c.put(req, res.clone()); } }catch(e){}
  return res;
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const isEjs = url.hostname === 'cdn.emulatorjs.org';
  const isRom = same && /\/roms\/[^/]+$/.test(url.pathname) && !url.pathname.endsWith('roms.json');
  if(isEjs || isRom){
    e.respondWith(caches.match(req).then(hit => {
      if(hit) return hit;
      const net = isEjs
        ? fetch(new Request(req.url, { mode:'cors', credentials:'omit' })).catch(() => fetch(req))
        : fetch(req);
      return net.then(res => put(req, res));
    }));
  } else if(same){
    e.respondWith(fetch(req).then(res => put(req, res)).catch(() => caches.match(req, { ignoreSearch:true }).then(hit => hit || Response.error())));
  }
});
