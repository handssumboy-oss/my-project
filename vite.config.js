import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({ base: './', build: { rollupOptions: { input: { runner: resolve('index.html'), classic: resolve('classic.html') } } } });
