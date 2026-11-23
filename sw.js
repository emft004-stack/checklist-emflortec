const VERSAO = "checklist-emflortec-v4";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
const CDN = [
  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSAO).then(async (c) => {
      await c.addAll(ARQUIVOS);
      for (const url of CDN) {
        try { await c.add(new Request(url, { mode: "no-cors" })); } catch (_) {}
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
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
      });
      return emCache || rede.catch(() => caches.match("./index.html"));
    })
  );
});
