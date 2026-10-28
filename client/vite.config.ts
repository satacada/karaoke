import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { transform as lightningTransform } from 'lightningcss';

function stripCssLayersAndModernSupports(css: string): string {
  let out = css.replace(/@layer\s+[a-zA-Z0-9_.,\s-]+;/g, '');
  out = out.replace(
    /@supports\s*\(\(\(-webkit-hyphens:none\)\)[\s\S]*?\)\)\s*\{/g,
    '@media all {'
  );
  while (true) {
    const match = /@layer\s+[a-zA-Z0-9_.-]*\s*\{/.exec(out);
    if (!match) break;
    const startIdx = match.index;
    const openBraceIdx = startIdx + match[0].length - 1;
    let depth = 1;
    let i = openBraceIdx + 1;
    while (i < out.length && depth > 0) {
      if (out[i] === '{') depth++;
      else if (out[i] === '}') depth--;
      i++;
    }
    const inner = out.slice(openBraceIdx + 1, i - 1);
    out = out.slice(0, startIdx) + inner + out.slice(i);
  }
  return out;
}

function convertCssForLegacyWebView(rawCss: string, fileName = 'style.css'): string {
  const unwrapped = stripCssLayersAndModernSupports(rawCss);
  const res = lightningTransform({
    filename: fileName,
    code: Buffer.from(unwrapped, 'utf8'),
    minify: true,
    targets: { chrome: 52 << 16, android: 52 << 16 },
  });
  return Buffer.from(res.code).toString('utf8');
}

function legacyTvBoxCompatPlugin(): Plugin {
  return {
    name: 'legacy-tvbox-compat',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('.css')) {
        try {
          return { code: convertCssForLegacyWebView(code, 'index.css'), map: null };
        } catch {
          return null;
        }
      }
      return null;
    },
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && chunk.type === 'asset') {
          const rawCss = typeof chunk.source === 'string' ? chunk.source : Buffer.from(chunk.source).toString('utf8');
          chunk.source = convertCssForLegacyWebView(rawCss, fileName);
        } else if (fileName.endsWith('.js') && chunk.type === 'chunk') {
          let code = chunk.code;
          if (code.includes('@layer')) code = stripCssLayersAndModernSupports(code);
          chunk.code = 'if(typeof globalThis==="undefined"){window.globalThis=window;}\n' + code;
        }
      }
    },
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>')
        .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, '<link rel="stylesheet" href="$1">');
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), legacyTvBoxCompatPlugin()],
  envDir: '../',
  build: {
    target: 'es2015',
    cssTarget: 'chrome52',
    rolldownOptions: {
      output: {
        format: 'iife',
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
