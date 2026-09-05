import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: './',
  build: {
    outDir: 'source/assets', emptyOutDir: true, manifest: 'manifest.json',
    target: 'es2022', cssCodeSplit: true,
    rollupOptions: { input: { main: resolve('src/main.ts'), appearance: resolve('src/appearance.ts') } }
  }
});
