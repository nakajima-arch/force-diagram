// 力の図示の部品。数研の教材(力の表し方・摩擦力・運動方程式・浮力)の決まりを部品にしたもの。
//   1. 作用点は ● で示す。重力は重心、ほかは物体が触れている点(面・糸・ばね・手)から出す。
//   2. 矢印の長さは力の大きさに比例させる(つりあう力は同じ長さで、「=」の印を付ける)。
//   3. 加速度 ⇨ は物体ごとに、力とは別に描く。運動の向きは細い黒矢印(力ではない)。
//   4. 注目する物体は点線の枠で囲む。作用・反作用は別々の物体の図に描く。
//   5. 斜面では、重力を点線の長方形で斜面方向(朱)と垂直方向(青)に分け、辺の比の三角形を添える。
import { C, tex, arrow, accel, force, line, dot, jp, arc, JS } from './draw.mjs';

export const at = (P, v, k) => [P[0] + v[0] * k, P[1] + v[1] * k];

/** 力の矢印。P:作用点(●を打つ)、v:向きの単位ベクトル、len:長さ(大きさに比例)。label は先端のそばに、色は矢印と同じ */
export function fvec(P, v, len, { label = '', color = C.force, dx = 8, dy = 0, anchor = 'start', ticks = 0, w = 2.8 } = {}) {
  const Q = at(P, v, len);
  let s = force(P[0], P[1], Q[0], Q[1], { color, w });
  if (ticks) s += eqTick(at(P, v, len / 2), v, ticks, color);
  if (label) s += tex(Q[0] + dx, Q[1] + dy, label, { color, anchor });
  return s;
}

/** 「=」の印(つりあう力に同じ印を付ける)。M:矢印の中点、v:矢印の向き、n:印の数 */
export function eqTick(M, v, n = 1, color = C.ink) {
  const nv = [-v[1], v[0]];
  let s = '';
  for (let i = 0; i < n; i++) {
    const c = at(M, v, (i - (n - 1) / 2) * 6);
    s += line(...at(c, nv, -6), ...at(c, nv, 6), { color, w: 1.6 });
  }
  return s;
}

/** 重力。重心 G から鉛直下向きに len */
export const gravity = (G, len, label = 'mg', o = {}) => fvec(G, [0, 1], len, { label, dx: 8, dy: 10, ...o });

/** 注目する物体を囲む点線の枠 */
export const focusBox = (x, y, w, h, label = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#C06C9B" stroke-width="1.6" stroke-dasharray="6 4" rx="4"/>` + (label ? jp(x + w / 2, y + h + 22, label, { size: JS, color: '#9A3C74', anchor: 'middle' }) : '');

/** 運動の向き(細い黒矢印。力ではない) */
export const motion = (P, v, len = 60, label = '運動の向き') => arrow(P[0], P[1], P[0] + v[0] * len, P[1] + v[1] * len, { w: 1.8 }) + (label ? jp(P[0] + v[0] * len + 8, P[1] + v[1] * len + 6, label, { size: JS }) : '');

/** 加速度 ⇨(物体ごと、力とは別に)。P:根元、v:向き */
export const acc = (P, v, len = 56, label = 'a') => {
  const Q = at(P, v, len);
  return accel(P[0], P[1], Q[0], Q[1]) + tex(Q[0] + (v[0] >= 0 ? 10 : -10), Q[1] + 8, label, { color: C.force, anchor: v[0] >= 0 ? 'start' : 'end' });
};

/** 重力の分解(斜面)。G:重心、U:斜面を上る向き、N:斜面から外向き、len:重力の長さ。
 *  点線の長方形、斜面方向の成分(朱)、垂直方向の成分(青)。返り値は SVG */
export function resolveGravity(G, U, N, len, theta, { labels = true } = {}) {
  const sinT = Math.sin(theta), cosT = Math.cos(theta);
  const par = at(G, U, -len * sinT), perp = at(G, N, -len * cosT), tip = at(G, [0, 1], len);
  let s = `<path d="M${par[0]},${par[1]} L${tip[0]},${tip[1]} L${perp[0]},${perp[1]}" fill="none" stroke="#B05A8C" stroke-width="1.2" stroke-dasharray="4 4"/>`;
  s += fvec(G, [0, 1], len, { color: C.force, w: 1.8 });
  s += fvec(G, U.map((x) => -x), len * sinT, { color: C.compA, w: 2.6 });
  s += fvec(G, N.map((x) => -x), len * cosT, { color: C.compB, w: 2.6 });
  if (labels) {
    s += tex(tip[0] + 10, tip[1] + 8, 'mg', { color: C.force });
    s += tex(par[0] - 8, par[1] + 22, T`mg\sin\theta`, { color: C.compA, anchor: 'end' });
    s += tex(perp[0] + 8, perp[1] + 24, T`mg\cos\theta`, { color: C.compB });
  }
  return s;
}
const T = String.raw;

/** 辺の比の三角形(30°・60°・90° は 1 : 2 : √3)。左上 (x, y) */
export function ratioTriangle(x, y, s = 60) {
  const p1 = [x, y], p2 = [x, y + s * 1.73], p3 = [x + s, y + s * 1.73];     // 縦 √3・横 1・斜辺 2 の三角形(角 30° が上)
  let q = `<polygon points="${p1} ${p2} ${p3}" fill="#FBEFF6" stroke="#B05A8C" stroke-width="1.4"/>`;
  q += tex(x - 8, y + s * 0.87 + 7, T`\sqrt{3}`, { size: 18, color: '#9A3C74', anchor: 'end' }) + tex(x + s / 2, y + s * 1.73 + 20, '1', { size: 18, color: '#9A3C74', anchor: 'middle' }) + tex(x + s * 0.62, y + s * 0.8, '2', { size: 18, color: '#9A3C74' });
  return q;
}
