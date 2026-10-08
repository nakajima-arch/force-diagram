// 図の見本を figures/*.svg に書き出す。  使い方: npm run figures
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as F from './figures.mjs';

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'figures');
const save = (name, svg) => fs.writeFileSync(path.join(out, name), svg);
save('A_momentum_before_after.svg', F.figA());
save('B_force_on_block.svg', F.figB());
save('C_collision_impulse.svg', F.figC());
save('D_vt_graph_area.svg', F.figD());

// ============ 見本ページ ============
const files = fs.readdirSync(out).filter((f) => f.endsWith('.svg')).sort();
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>中島テンプレ 作図見本</title>
<style>body{font-family:sans-serif;margin:16px;max-width:960px}figure{margin:0 0 20px;border-bottom:1px solid #ccc;padding-bottom:12px}
img{max-width:100%;height:auto;border:1px solid #ddd;background:#fff}figcaption{font-size:13px;color:#555;margin-bottom:6px}</style></head><body>
<h1 style="font-size:18px">中島テンプレ 作図見本</h1>
<p style="font-size:13px">tools/build-figures.mjs で生成。色の意味は tools/draw.mjs の C で定義。</p>
${files.map((f) => `<figure><figcaption>${f}</figcaption><img src="${f}" alt="${f}"></figure>`).join('\n')}
</body></html>
`);
console.log('wrote', files.join(', '));
