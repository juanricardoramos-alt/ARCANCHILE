/**
 * Toma el resultado de `vite build -c vite.config.pagina.ts` y lo funde en un
 * único archivo HTML autocontenido (CSS, JS y logo incrustados), pensado para
 * abrirse desde cualquier navegador o publicarse como página.
 *
 * Uso:  node scripts/pagina.mjs [salida.html]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const dist = 'dist-pagina';
const out = process.argv[2] ?? 'dist-pagina/arcanchile.html';

const css = readFileSync(`${dist}/app.css`, 'utf8');
let js = readFileSync(`${dist}/app.js`, 'utf8');
const logo = readFileSync(`${dist}/logo-mark.svg`, 'utf8');
const logoUri = `data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`;

// El logo vive en /public: en un archivo único va incrustado como data URI.
js = js.split('"/logo-mark.svg"').join(JSON.stringify(logoUri));
js = js.split("'/logo-mark.svg'").join(JSON.stringify(logoUri));
// Evita que el navegador corte el <script> si la secuencia aparece en un string.
js = js.split('</script').join('<\\/script');

/*
 * Las descargas (CSV, backup JSON, informe de gestión) se hacen con un <a
 * download> sobre un blob. Dentro de un visor embebido eso queda bloqueado, así
 * que se redirige al guardado del anfitrión (window.claude.use('downloads'))
 * cuando existe. Fuera de ese contexto no se toca nada: el <a> nativo funciona.
 */
const shim = `
(function () {
  if (typeof window === 'undefined') return;
  var blobs = new Map();
  var crear = URL.createObjectURL.bind(URL);
  var revocar = URL.revokeObjectURL.bind(URL);
  URL.createObjectURL = function (obj) {
    var url = crear(obj);
    if (obj instanceof Blob) blobs.set(url, obj);
    return url;
  };
  URL.revokeObjectURL = function (url) {
    // El blob se conserva un momento: el guardado del anfitrión es asíncrono.
    setTimeout(function () { blobs.delete(url); }, 60000);
    return revocar(url);
  };

  function aviso(texto) {
    var t = document.createElement('div');
    t.textContent = texto;
    t.style.cssText =
      'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;' +
      'max-width:min(90vw,420px);padding:12px 16px;border-radius:10px;' +
      'background:#0f2a43;color:#fff;font:500 14px/1.4 system-ui,sans-serif;' +
      'box-shadow:0 8px 24px rgba(0,0,0,.35);text-align:center';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 5000);
  }

  var clickNativo = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    var nombre = this.getAttribute('download');
    var blob = nombre ? blobs.get(this.href) : null;
    if (!blob || !window.claude || typeof window.claude.use !== 'function') {
      return clickNativo.call(this);
    }
    (function (nombre, blob) {
      window.claude.use('downloads').then(function (descargas) {
        if (!descargas) throw { code: 'unavailable' };
        return descargas.save({ filename: nombre, data: blob }).catch(function (e) {
          // Algunos visores solo admiten un set básico de extensiones.
          if (e && e.code === 'extension_not_enabled') {
            return descargas.save({ filename: nombre.replace(/\\.[^.]+$/, '') + '.txt', data: blob });
          }
          throw e;
        });
      }).catch(function (e) {
        var code = e && e.code;
        if (code === 'declined') return;
        aviso(
          code === 'too_large'
            ? 'El archivo supera el límite de descarga del visor.'
            : 'Esta vista no permite descargar archivos. Abre la plataforma en tu navegador (npm run dev o el sitio publicado) para exportar.'
        );
      });
    })(nombre, blob);
  };
})();
`;

const html = `<title>ARCANCHILE · Plataforma Comercial</title>
<style>
${css}
html, body, #root { min-height: 100%; }
</style>
<div id="root"></div>
<script>${shim}</script>
<script type="module">
${js}
</script>
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`${out} · ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
