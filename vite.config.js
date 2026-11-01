import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({ base: './', build: { rollupOptions: { input: { adventure: resolve('index.html'), runner: resolve('retro.html'), classic: resolve('classic.html') } } } });
