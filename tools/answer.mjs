// 答案(HTML)を組み立てる部品。数式は MathJax で図形化して埋め込む(フォントに依存しない)。
// 使い方の例は answers/*.mjs を見る。
import { mathHtml, C } from './draw.mjs';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 文章の中の $...$ を数式にする。それ以外の文字はそのまま */
export function rich(s) {
  return s.split('$').map((t, i) => (i % 2 ? mathHtml(t) : esc(t))).join('');
}

/** 式を1行。no は式番号(①など)。ther=true で行頭に ∴ */
export const eq = (tex, { no = '', ther = false } = {}) =>
  `<div class="eq">${ther ? '<span class="th">∴</span>' : ''}<span class="f">${mathHtml(tex)}</span>${no ? `<span class="no">…${no}</span>` : ''}</div>`;

/** 見出し(法則名)。note は括弧内の記号の定義 */
export const head = (name, note = '') =>
  `<div class="head"><b>${rich(name)}</b>${note ? `<span class="def">(${rich(note)})</span>` : ''}</div>`;

/** 操作の一言(「①+②より t₁ を消去して」など) */
export const op = (s) => `<div class="op">${rich(s)}</div>`;

/** 文章 */
export const p = (s) => `<p>${rich(s)}</p>`;

/** 補足事項(※)。本論の流れから切り離して別記する */
export const note = (s) => `<div class="note"><span class="mk">※</span>${rich(s)}</div>`;

/** 吟味(最後の確認) */
export const check = (s) => `<div class="check"><span class="mk">吟味</span>${rich(s)}</div>`;

/** 小問ひとまとまり */
export const sub = (label, ...parts) =>
  `<section class="q"><div class="lab">${label}</div><div class="body">${parts.flat().join('\n')}</div></section>`;

/** 図(SVG 文字列)を置く。cap は図の説明 */
export const fig = (svg, { cap = '', width = null } = {}) =>
  `<figure${width ? ` style="max-width:${width}px"` : ''}>${svg.replace(/<\?xml[^>]*>/, '')}${cap ? `<figcaption>${rich(cap)}</figcaption>` : ''}</figure>`;

/** ページ全体 */
export function page({ title, lead = '', body }) {
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--ink:${C.ink};--force:${C.force};--a:${C.compA};--b:${C.compB};--target:${C.target};--rule:#d6d6d6;--bg:#fff}
@media (prefers-color-scheme:dark){:root:not([data-print]){--ink:#eee;--bg:#161616;--rule:#444}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Hiragino Sans","Noto Sans JP","IPAGothic",sans-serif;line-height:1.7;font-size:16px}
main{max-width:860px;margin:0 auto;padding:20px 16px 48px}
h1{font-size:18px;margin:0 0 4px}
.lead{font-size:13px;color:#555;margin:0 0 18px}
.q{display:grid;grid-template-columns:3.4em 1fr;gap:0 12px;padding:14px 0;border-top:1px solid var(--rule)}
.lab{font-weight:700;font-size:18px}
.head{margin:10px 0 2px;display:inline-block;border-bottom:2px solid var(--ink);padding:0 2px}
.head:first-child{margin-top:0}
.def{font-size:.9em;margin-left:.2em}
.op{margin:8px 0 0;font-size:.95em}
.eq{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 .5em;margin:.35em 0 .35em .8em}
.eq .th{margin-left:.2em}
.eq .no{margin-left:.4em;font-size:.95em}
svg.m{display:inline-block;overflow:visible}
figure{margin:6px 0 10px;padding:0}
figure>svg{width:100%;height:auto;display:block;background:#fff;border:1px solid var(--rule);border-radius:4px}
figcaption{font-size:12px;color:#555;margin-top:2px}
p{margin:.4em 0 .4em .8em}
.note{margin:.7em 0 .3em .8em;padding:.3em .7em;border:1px dashed #999;border-radius:4px;font-size:.93em}
.note .mk,.check .mk{font-weight:700;margin-right:.5em}
.check{margin:.7em 0 .3em .8em;padding:.3em .7em;border-left:4px solid var(--a);font-size:.93em}
.check .mk{color:var(--a)}
@media print{@page{size:A4;margin:12mm}body{font-size:12.5px}main{padding:0}.q{break-inside:avoid}}
</style></head><body><main data-print>
<h1>${esc(title)}</h1>
${lead ? `<p class="lead">${rich(lead)}</p>` : ''}
${body}
</main></body></html>
`;
}
