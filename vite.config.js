import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { htmlPartials } from './tooling/vite-plugin-html-partials.js';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ command }) => ({
  // Relative asset URLs keep the GitHub Pages project path working without a
  // second build flag: /moneypenny/add.html resolves its bundle the same way
  // as /add.html does in local development.
  base: command === 'build' ? './' : '/',
  appType: 'mpa',
  plugins: [htmlPartials({ dir: 'src/partials' })],
  server: {
    port: 5173,
    open: '/index.html'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        board: `${root}index.html`,
        add: `${root}add.html`,
        week: `${root}week.html`
      }
    }
  }
}));
