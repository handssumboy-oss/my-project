// Copies src/ranking-core.js into the core section of docs/ranking/apps-script.gs.
// Apps Script has no ES modules, so `export` is dropped; run `npm run ranking:sync` after editing the core.
import { readFileSync, writeFileSync } from 'node:fs';
const START = '// ---- core: copy of src/ranking-core.js (tests keep them identical) ----\n', END = '// ---- end core ----\n';
export function appsScriptCore(source) { return source.split('\n').slice(2).join('\n').replace(/^export (const|function) /gm, '$1 ').trimEnd() + '\n'; }
if (import.meta.url === `file://${process.argv[1]}`) {
 const gsPath = new URL('../docs/ranking/apps-script.gs', import.meta.url), gs = readFileSync(gsPath, 'utf8');
 const core = appsScriptCore(readFileSync(new URL('../src/ranking-core.js', import.meta.url), 'utf8'));
 writeFileSync(gsPath, gs.slice(0, gs.indexOf(START) + START.length) + core + gs.slice(gs.indexOf(END)));
 console.log('apps-script.gs core synced');
}
