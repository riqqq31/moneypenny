import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const INCLUDE = /<!--\s*include:([a-z0-9-]+)\s*-->/gi;

/**
 * Inlines `<!-- include:name -->` markers from a directory of HTML partials,
 * so the header, footer and week rail are written once for every page.
 *
 * @param {{ dir?: string }} [options]
 */
export function htmlPartials(options = {}) {
  const dir = options.dir ?? 'src/partials';
  const absolute = resolve(process.cwd(), dir);

  const render = (html) =>
    html.replace(INCLUDE, (_marker, name) => {
      try {
        return readFileSync(resolve(absolute, `${name}.html`), 'utf8').trimEnd();
      } catch (error) {
        throw new Error(`html-partials: cannot read "${name}.html" in ${dir} (${error.message})`, {
          cause: error
        });
      }
    });

  return {
    name: 'html-partials',
    enforce: 'pre',

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return render(html);
      }
    },

    configureServer(server) {
      server.watcher.add(absolute);
      server.watcher.on('change', (file) => {
        if (file.startsWith(absolute) && file.endsWith('.html')) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    }
  };
}
