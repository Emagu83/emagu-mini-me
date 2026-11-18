const CACHE="emagu-mini-me-v03";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-512-maskable.png"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith("emagu-mini-me-")&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;

  const isPage=request.mode==="navigate"||new URL(request.url).pathname.endsWith("/index.html");
  if(isPage){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request,{cache:"no-store"});
        if(response&&response.ok){
          const cache=await caches.open(CACHE);
          await cache.put(request,response.clone());
        }
        return response;
      }catch(error){
        return (await caches.match(request))||(await caches.match("./index.html"));
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(request);
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response&&response.ok){
        const cache=await caches.open(CACHE);
        await cache.put(request,response.clone());
      }
      return response;
    }catch(error){
      return cached;
    }
  })());
});
