import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // Output directly to the docs/ folder at the repo root.
    // GitHub Pages is configured to serve from docs/.
    // emptyOutDir:true cleans stale hashed files on every build.
    outDir: '../docs',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Content-hash in filenames = permanent cache for assets,
        // while index.html (no hash) is fetched fresh every time.
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (name?.endsWith('.css')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
