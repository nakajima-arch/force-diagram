// 中島テンプレの作図部品。図はすべてここの関数で組み立てる(座標は px、右が x、下が y)。
// 数式は MathJax(TeX)で図形(パス)にするので、フォントに依存せず、HTML・PDF・Word のどれにも貼れる。
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';

// ---- 色(色覚の多様性に配慮した Okabe-Ito 系)。意味ごとにここだけで変える ----
export const C = {
  ink: '#111111',     // 速さ・長さ・軸・文字
  force: '#E69F00',   // 力(オレンジ)。原本でも力はオレンジ
  compA: '#D55E00',   // 分解成分: 注目方向(斜面沿い・向心方向など)。原本の赤を朱に
  compB: '#0072B2',   // 分解成分: それに垂直な方向。原本の青
  inertia: '#D55E00', // 慣性力(見かけの力)。原本では赤
  target: '#009E73',  // 求める量
  label: '#0072B2',   // 状態ラベル(t=0 など)
  wall: '#555555',    // 床・壁
};

// ---- 文字の大きさ(図の中は全部この2つに統一) ----
export const FS = 22;   // 数式・記号
export const JS = 16;   // 日本語

// ---- 数式 ----
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const mj = mathjax.document('', {
  InputJax: new TeX({ packages: ['base', 'ams'] }),
  OutputJax: new SVG({ fontCache: 'none' }),
});

/** TeX を入れ子の <svg> にして返す。(x,y) は文字の基線上の位置。anchor: start | middle | end */
export function tex(x, y, src, { size = FS, color = C.ink, anchor = 'start' } = {}) {
  const html = adaptor.innerHTML(mj.convert(src, { display: false }));
  const m = (re) => html.match(re);
  const w = parseFloat(m(/width="([\d.]+)ex"/)[1]);
  const h = parseFloat(m(/height="([\d.]+)ex"/)[1]);
  const va = parseFloat((m(/vertical-align:\s*(-?[\d.]+)ex/) || [0, '0'])[1]);
  const viewBox = m(/viewBox="([^"]+)"/)[1];
  const inner = html.slice(html.indexOf('>', html.indexOf('<svg')) + 1, html.lastIndexOf('</svg>'));
  const ex = size / 2;
  const W = w * ex, H = h * ex;
  const left = anchor === 'middle' ? x - W / 2 : anchor === 'end' ? x - W : x;
  const top = y - (h + va) * ex;
  return `<svg x="${r(left)}" y="${r(top)}" width="${r(W)}" height="${r(H)}" viewBox="${viewBox}" overflow="visible" style="color:${color}" fill="${color}">${inner}</svg>`;
}

// ---- 基本図形 ----
const r = (n) => Math.round(n * 100) / 100;

/** 矢印。tail → tip。開いた V 字の矢じり(原本の →)。w は線の太さ */
export function arrow(x1, y1, x2, y2, { color = C.ink, w = 2, head = null, dash = null } = {}) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
  const hl = head ?? 7 + w * 2.2;           // 矢じりの長さ
  const a = (26 * Math.PI) / 180;
  const p = (s) => {   // 先端から後ろ向きの単位ベクトルを ±a 回して hl 倍
    const c = Math.cos(s * a), sn = Math.sin(s * a);
    const bx = -ux, by = -uy;
    return [x2 + hl * (bx * c - by * sn), y2 + hl * (bx * sn + by * c)];
  };
  const [ax, ay] = p(1), [bx, by] = p(-1);
  const d = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<path d="M${r(x1)},${r(y1)} L${r(x2 - ux * 0.5)},${r(y2 - uy * 0.5)}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"${d}/>` +
         `<path d="M${r(ax)},${r(ay)} L${r(x2)},${r(y2)} L${r(bx)},${r(by)}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** 力の矢印。tail が作用点。太め・朱色 */
export const force = (x1, y1, x2, y2, o = {}) => arrow(x1, y1, x2, y2, { color: C.force, w: 2.8, ...o });

/** 加速度の矢印 ⇨(白ぬきの太い矢印)。力ではないので、力の矢印とは形で区別する */
export function accel(x1, y1, x2, y2, { color = C.force, w = 2.2 } = {}) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux;
  const sw = 5, hw = 11, hl = Math.min(16, L * 0.45);       // 軸の半幅・矢じりの半幅・矢じりの長さ
  const bx = x2 - ux * hl, by = y2 - uy * hl;               // 矢じりの付け根
  const pt = (x, y, k, m) => `${r(x + nx * k * m)},${r(y + ny * k * m)}`;
  const d = `M${pt(x1, y1, sw, 1)} L${pt(bx, by, sw, 1)} L${pt(bx, by, hw, 1)} L${r(x2)},${r(y2)} L${pt(bx, by, hw, -1)} L${pt(bx, by, sw, -1)} L${pt(x1, y1, sw, -1)} Z`;
  return `<path d="${d}" fill="#fff" stroke="${color}" stroke-width="${w}" stroke-linejoin="round"/>`;
}

/** 線 */
export const line = (x1, y1, x2, y2, { color = C.ink, w = 1.6, dash = null } = {}) =>
  `<path d="M${r(x1)},${r(y1)} L${r(x2)},${r(y2)}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

/** 物体(長方形)。x,y は左上 */
export const box = (x, y, w, h, { fill = '#fff', sw = 2.2 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.ink}" stroke-width="${sw}"/>`;

/** 球。中心 (cx,cy) */
export const ball = (cx, cy, rad) => `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#fff" stroke="${C.ink}" stroke-width="2.2"/>`;

/** 点(作用点など) */
export const dot = (x, y, rad = 3, color = C.force) => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${color}"/>`;

/** 床(下向きの斜線つき) */
export function floor(x1, x2, y, { step = 20, len = 10 } = {}) {
  let s = `<path d="M${x1},${y} H${x2}" stroke="${C.wall}" stroke-width="2.4"/><g stroke="${C.wall}" stroke-width="1.3">`;
  for (let x = x1 + 6; x <= x2 - 2; x += step) s += `<path d="M${x},${y} l${-len * 0.9},${len}"/>`;
  return s + '</g>';
}

/** 寸法線(長さの表示)。左端に縦棒、右端に矢じり。gap=[a,b] の区間は文字用にあける */
export function dim(x1, x2, y, { gap = null, tick = 13, color = C.ink, endTick = false } = {}) {
  let s = line(x1, y - tick / 2, x1, y + tick / 2, { color });
  const segs = gap ? [[x1, gap[0]], [gap[1], x2]] : [[x1, x2]];
  segs.forEach(([a, b], i) => {
    s += i === segs.length - 1 ? arrow(a, y, b, y, { color, w: 1.6 }) : line(a, y, b, y, { color });
  });
  if (endTick) s += line(x2, y - tick / 2, x2, y + tick / 2, { color });
  return s;
}

/** 状態ラベル(t=0 など) */
export const stateLabel = (x, y, src) => tex(x, y, src, { size: FS, color: C.label, anchor: 'middle' });

/** 日本語の短い文字 */
export const jp = (x, y, s, { size = JS, color = C.ink, anchor = 'start' } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-family="'Hiragino Sans','Noto Sans JP','IPAGothic',sans-serif">${s}</text>`;

/** 円弧(角度の表示)。中心 (cx,cy)、半径 rad、角度は数学向き(度、反時計回りが正) a1→a2 */
export function arc(cx, cy, rad, a1, a2, { color = C.ink, w = 1.4 } = {}) {
  const P = (a) => [cx + rad * Math.cos((a * Math.PI) / 180), cy - rad * Math.sin((a * Math.PI) / 180)];
  const [sx, sy] = P(a1), [ex, ey] = P(a2);
  const sweep = a2 > a1 ? 0 : 1;
  return `<path d="M${r(sx)},${r(sy)} A${rad},${rad} 0 0 ${sweep} ${r(ex)},${r(ey)}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
}

/** 斜線の面積(多角形を斜線で塗る) */
export function hatch(points, { color = C.target, gap = 9, id = 'h' } = {}) {
  const pts = points.map((p) => p.join(',')).join(' ');
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  let s = `<clipPath id="${id}"><polygon points="${pts}"/></clipPath><g clip-path="url(#${id})" stroke="${color}" stroke-width="1.4">`;
  for (let k = x0 - (y1 - y0); k <= x1; k += gap) s += `<path d="M${k},${y1} L${k + (y1 - y0)},${y0}"/>`;
  return s + '</g>';
}

/** 図全体を包む */
export const figure = (w, h, body, { bg = true } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
  (bg ? `<rect width="${w}" height="${h}" fill="#fff"/>` : '') + body + '</svg>\n';

/** 文章の中に置く数式(インライン)。TeX を <svg> にして返す。基線は文字にそろう */
export function mathHtml(src, { color = null } = {}) {
  const html = adaptor.innerHTML(mj.convert(src, { display: false }));
  const m = (re) => html.match(re);
  const w = parseFloat(m(/width="([\d.]+)ex"/)[1]);
  const h = parseFloat(m(/height="([\d.]+)ex"/)[1]);
  const va = parseFloat((m(/vertical-align:\s*(-?[\d.]+)ex/) || [0, '0'])[1]);
  const viewBox = m(/viewBox="([^"]+)"/)[1];
  const inner = html.slice(html.indexOf('>', html.indexOf('<svg')) + 1, html.lastIndexOf('</svg>'));
  const e = (n) => r(n / 2) + 'em';        // 1em = 2ex。本文と同じ大きさで並ぶ
  const col = color ? `color:${color};` : '';
  return `<svg class="m" xmlns="http://www.w3.org/2000/svg" width="${e(w)}" height="${e(h)}" viewBox="${viewBox}" style="vertical-align:${e(va)};${col}" fill="currentColor" role="img" aria-label="${src.replace(/"/g, '&quot;')}">${inner}</svg>`;
}
