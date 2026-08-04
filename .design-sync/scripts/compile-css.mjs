import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '../../');
const pkgDir = resolve(repoRoot, 'packages/ui');
const srcPath = resolve(pkgDir, 'src/styles/globals.css');
const outDir = resolve(pkgDir, '.ds-generated');
const outPath = resolve(outDir, 'globals.compiled.css');

import { mkdirSync } from 'node:fs';
mkdirSync(outDir, { recursive: true });

let css = readFileSync(srcPath, 'utf8');
// Standalone compile: no consuming app to declare @source, so declare the
// package's own component/hook/lib tree here so its own utility usage compiles.
// Also scan .design-sync/previews/ — authored preview compositions often use
// utility classes (layout/spacing wrappers, etc.) that never appear in the
// component source itself. Missing this made classes like `h-56`/`w-96`
// silently compile to nothing (found by the B5-layout batch: ResizablePanelGroup
// collapsed, ScrollArea didn't clip/scroll).
css = css.replace(
  '@import "tailwindcss" source(none);',
  '@import "tailwindcss";\n@source "../src/components/**/*.{ts,tsx}";\n@source "../src/hooks/**/*.{ts,tsx}";\n@source "../src/lib/**/*.{ts,tsx}";\n@source "../../.design-sync/previews/**/*.tsx";'
);

const result = await postcss([tailwind({ base: pkgDir })]).process(css, {
  from: srcPath,
  to: outPath,
});

// packages/ui references var(--font-geist-sans/--font-geist-mono) via its
// @theme inline block but never defines them itself — every consuming app
// (apps/marketing/app/globals.css) supplies the same literal system-font
// stack, not a real shipped webfont. Port that host-provided value verbatim
// so previews don't fall back to the browser default.
const hostFontVars = `
:root {
  --font-geist-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-geist-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
`;

writeFileSync(outPath, result.css + hostFontVars);
console.log(`wrote ${outPath} (${((result.css.length + hostFontVars.length) / 1024).toFixed(1)} KB)`);
