import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Build alternativo que produce un bundle único (sin PWA ni code-splitting)
// para luego incrustarlo en un solo archivo HTML: ver scripts/pagina.mjs.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist-pagina',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: 'pagina.html',
      output: { inlineDynamicImports: true, entryFileNames: 'app.js', assetFileNames: 'app.[ext]' },
    },
  },
});
