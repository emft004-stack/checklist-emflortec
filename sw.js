const VERSAO = "checklist-emflortec-v9";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
const CDN = [
  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSAO).then(async (c) => {
      await c.addAll(ARQUIVOS);
      for (const url of CDN) {
        try {
          const resposta = await fetch(new Request(url, { mode: "no-cors" }));
          if (resposta.ok || resposta.type === "opaque") await c.put(url, resposta);
        } catch (_) {}
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith("checklist-emflortec-") && k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((emCache) => {
      const rede = fetch(e.request).then((resp) => {
        if (resp && (resp.ok || resp.type === "opaque")) {
          const copia = resp.clone();
          caches.open(VERSAO).then((c) => c.put(e.request, copia));
        }
        return resp;
      }).catch(() => caches.match("./index.html"));
      return emCache || rede;
    })
  );
});
