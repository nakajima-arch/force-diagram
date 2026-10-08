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
  `<div class="eq">${ther ? '<span class="th">∴</span>' : ''}<span class="f">${mathHtml('\\displaystyle ' + tex)}</span>${no ? `<span class="no">…${no}</span>` : ''}</div>`;

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

/** 図(SVG 文字列)を置く。cap は図の説明。表示幅は viewBox の幅 × --k。--k = 本文の文字 ÷ 図の文字(22) なので、図の記号が本文と同じ大きさに見える */
export const fig = (svg, { cap = '' } = {}) => {
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const w = vb ? Math.round(parseFloat(vb[1])) : 600;
  return `<figure>${svg.replace(/<svg ([^>]*)>/, `<svg $1 style="width:calc(${w}px * var(--k))">`)}${cap ? `<figcaption>${rich(cap)}</figcaption>` : ''}</figure>`;
};

/** ページ全体 */
export function page({ title, lead = '', body, layout = 'two' }) {
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--ink:${C.ink};--force:${C.force};--a:${C.compA};--b:${C.compB};--target:${C.target};--rule:#d6d6d6;--bg:#fff;--k:.727}
@media (prefers-color-scheme:dark){:root:not([data-print]){--ink:#eee;--bg:#161616;--rule:#444}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Hiragino Sans","Noto Sans JP","IPAGothic",sans-serif;line-height:1.65;font-size:16px}
main{max-width:860px;margin:0 auto;padding:20px 16px 48px}
h1{font-size:18px;margin:0 0 4px}
.lead{color:#555;margin:0 0 14px}
.q{display:grid;grid-template-columns:3em 1fr;gap:0 10px;padding:10px 0;border-top:1px solid var(--rule);break-inside:avoid}
.lab{font-weight:700}
.head{margin:8px 0 2px}
.head:first-child{margin-top:0}
.def{margin-left:.2em}
.op{margin:6px 0 0}
.eq{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 .5em;margin:.3em 0 .3em .8em}
.eq .th{margin-left:.2em}
.eq .no{margin-left:.4em}
svg.m{display:inline-block;overflow:visible}
figure{margin:4px 0 8px;padding:0}
figure>svg{max-width:100%;height:auto;display:block;background:#fff;border:1px solid var(--rule);border-radius:4px}
figcaption{color:#555;margin-top:2px}
p{margin:.35em 0 .35em .8em}
.note{margin:.6em 0 .3em .8em;padding:.25em .7em;border:1px dashed #999;border-radius:4px}
.note .mk,.check .mk{font-weight:700;margin-right:.5em}
.check{margin:.6em 0 .3em .8em;padding:.25em .7em;border-left:4px solid var(--a)}
.check .mk{color:var(--a)}
/* 左右2段(ノートと同じ)。画面が広いときと印刷のとき */
@media (min-width:1100px){main[data-layout=two]{max-width:1240px;column-count:2;column-gap:32px;column-rule:1px solid var(--ink)}
 main[data-layout=two] h1,main[data-layout=two] .lead{column-span:all}}
@media print{
 @page{size:A4 landscape;margin:9mm}
 :root{--k:.523}
 body{font-size:11.5px;line-height:1.42}
 main,main[data-layout]{max-width:none;padding:0}
 main[data-layout=two]{column-count:2;column-gap:10mm;column-rule:1px solid #000}
 main[data-layout=two] h1,main[data-layout=two] .lead{column-span:all}
 h1{font-size:15px}.lead{margin-bottom:6px}
 .q{padding:3px 0}.eq{margin:.1em 0 .1em .6em}.op{margin-top:2px}.head{margin:4px 0 1px}figure{margin:2px 0 3px}.note,.check{margin:.35em 0 .15em .8em;padding:.15em .6em}p{margin:.2em 0 .2em .8em}
}
</style></head><body><main data-print data-layout="${layout}">
<h1>${esc(title)}</h1>
${lead ? `<p class="lead">${rich(lead)}</p>` : ''}
${body}
</main></body></html>
`;
}
