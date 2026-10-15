// 力の図示の見本。数研の教材の例題と同じ場面を、tools/forces.mjs の決まりで描く。  使い方: npm run forcedemo
// 長さは「大きさに比例」。1 単位 = U px。つりあう力は同じ長さで「=」の印。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C, tex, arrow, line, box, ball, dot, circ, arc, jp, floor, curve, figure, JS } from './draw.mjs';
import { at, fvec, eqTick, gravity, focusBox, motion, acc, resolveGravity, ratioTriangle } from './forces.mjs';

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'figures');
const T = String.raw;
const L = (P, dx, dy, src, color = C.ink, anchor = 'start') => tex(P[0] + dx, P[1] + dy, src, { color, anchor });
const UP = [0, -1], DN = [0, 1], LT = [-1, 0], RT = [1, 0];
const U = 36;                                                       // 1 単位(例: mg = 2 単位)の長さ
const save = (name, svg) => fs.writeFileSync(path.join(out, name), svg);

// ============ 1. 天井からつるしたおもり A, B(張力は糸との接点、重力は重心) ============
//   おもり A(質量 M = 2 単位)、おもり B(質量 m = 1 単位)。T₁ = (M + m)g、T₂ = mg。
{
  const panel = (x0, focus) => {
    const yA = 230, yB = 380, r = 20;
    let s = line(x0 - 60, 60, x0 + 60, 60, { color: C.wall, w: 4 }) + jp(x0 + 66, 66, '天井', { size: JS });
    s += line(x0, 60, x0, yA - r, { w: 1.4 }) + line(x0, yA + r, x0, yB - r, { w: 1.4 });
    s += ball(x0, yA, r) + ball(x0, yB, r - 4) + L([x0, yA], r + 56, 8, 'A', C.ink, 'start') + L([x0, yB], r + 56, 8, 'B', C.ink, 'start');
    if (focus === 'A') {
      s += focusBox(x0 - 48, yA - 52, 96, 104);
      s += fvec([x0 - 7, yA - r], UP, 3 * U, { label: T`T_1`, dx: -10, dy: 6, anchor: 'end' });               // 糸 1 との接点(上端)から上向き
      s += fvec([x0 - 7, yA + r], DN, 1 * U, { label: T`T_2`, dx: -10, dy: 14, anchor: 'end' });             // 糸 2 との接点(下端)から下向き
      s += gravity([x0 + 8, yA], 2 * U, T`Mg`, { dx: 10, dy: 10 });                                         // 重心から下向き(重ならないよう少し右)
    } else {
      s += focusBox(x0 - 48, yB - 52, 96, 104);
      s += fvec([x0 - 6, yB - r + 4], UP, 1 * U, { label: T`T_2`, dx: -10, dy: 6, anchor: 'end', ticks: 1 });
      s += gravity([x0 + 6, yB], 1 * U, T`mg`, { dx: 10, dy: 10, ticks: 1 });                              // T₂ と mg は同じ長さ(つりあい)
    }
    return s;
  };
  let s = jp(10, 24, '(1) おもり A が受ける力', { color: C.label }) + jp(300, 24, '(2) おもり B が受ける力', { color: C.label });
  s += panel(130, 'A') + panel(430, 'B');
  save('force_1_hanging.svg', figure(640, 470, s));
}

// ============ 2. あらい水平面上の物体(引く力 F、摩擦力 f、垂直抗力 N、重力) ============
//   つりあい: N = mg、f = F。つりあう力は同じ長さ(=の印)。
{
  const fy = 260, x0 = 150, w = 110, h = 70, G = [x0 + w / 2, fy - h / 2];
  let s = floor(40, 460, fy) + jp(330, fy + 38, 'あらい水平面', { size: JS });
  s += box(x0, fy - h, w, h) + L(G, -w / 2 - 60, -h / 2 + 6, '物体', C.ink);
  s += focusBox(x0 - 18, fy - h - 24, w + 36, h + 24);
  s += gravity(G, 2 * U, 'mg', { dx: 10, dy: 8, ticks: 1 });                                               // 重心から
  const Pc = [G[0] + 26, fy];                                                                              // 床との接触点
  s += fvec(Pc, UP, 2 * U, { label: 'N', dx: 10, dy: 4, ticks: 1 });                                       // 接触点から、面の外向き
  s += fvec(Pc, LT, 1.5 * U, { label: 'f', dx: -4, dy: -14, anchor: 'end', ticks: 2 });                    // 接触点から、動こうとする向きと逆
  s += fvec([x0 + w, G[1]], RT, 1.5 * U, { label: 'F', dx: 8, dy: -10, ticks: 2 });                         // 手(糸)がふれている点から
  s += motion([x0 + 10, fy - h - 56], RT, 70, '動こうとする向き');
  save('force_2_friction.svg', figure(600, 340, s));
}

// ============ 3. 斜面上で静止する物体(重力の分解、垂直抗力 N、静止摩擦力 f) ============
{
  const th = Math.PI / 6, Uv = [Math.cos(th), -Math.sin(th)], Nv = [-Math.sin(th), -Math.cos(th)];
  const O = [40, 290], len = 330, E = at(O, Uv, len);
  let s = `<polygon points="${O} ${E} ${E[0]},${O[1]}" fill="#EDEDED"/>` + line(...O, ...E, { color: C.wall, w: 2.6 }) + line(O[0] - 10, O[1], E[0] + 10, O[1], { color: C.wall, w: 2 });
  s += arc(O[0], O[1], 46, 0, 30) + L(O, 56, -6, T`\theta`);
  const F = at(O, Uv, 200), w = 84, h = 52, a = at(F, Uv, -w / 2), b = at(F, Uv, w / 2);
  s += `<polygon points="${[a, b, at(b, Nv, h), at(a, Nv, h)].map((q) => q.join(',')).join(' ')}" fill="#fff" stroke="${C.ink}" stroke-width="2.2"/>`;
  const G = at(F, Nv, h / 2);
  s += resolveGravity(G, Uv, Nv, 3 * U, th);                                                               // mg = 3 単位。成分は ½ × 3、(√3/2) × 3
  const Pn = at(F, Uv, 14);                                                                                // 斜面との接触点
  s += fvec(Pn, Nv, 3 * U * Math.cos(th), { label: 'N', color: C.compB, dx: -8, dy: -6, anchor: 'end', ticks: 1 });
  s += fvec(at(F, Uv, -14), Uv, 3 * U * Math.sin(th), { label: 'f', color: C.compA, dx: 6, dy: -8, ticks: 1 });
  s += ratioTriangle(E[0] - 60, 30, 46);
  s += jp(E[0] - 150, 24, '辺の比', { size: JS, color: '#9A3C74' });
  save('force_3_slope.svg', figure(470, 330, `<g transform="translate(0,0)">${s}</g>`));
}

// ============ 4. 連結した 2 物体(なめらかな滑車):物体ごとに力と加速度を描く ============
{
  const fy = 200, A = { x: 60, w: 110, h: 76 }, pulley = [370, fy - 80], U = 26;
  let s = line(30, fy, 370, fy, { color: C.wall, w: 2.6 }) + line(370, fy, 370, 70, { color: C.wall, w: 2.6 }) + circ(...pulley, 14, { w: 2.2 });
  // 物体 A(机の上、質量 M = 3 単位)
  const GA = [A.x + A.w / 2, fy - A.h / 2];
  s += box(A.x, fy - A.h, A.w, A.h) + L(GA, -42, 6, 'A', C.ink) + focusBox(A.x - 14, fy - A.h - 18, A.w + 28, A.h + 18);
  s += gravity(GA, 3 * U, T`Mg`, { dx: 10, dy: 10, ticks: 1 });
  const Pc = [GA[0] + 26, fy];
  s += fvec(Pc, UP, 3 * U, { label: 'N', dx: 10, dy: 4, ticks: 1 });
  s += fvec(Pc, LT, 0.5 * U, { label: T`f'`, dx: -4, dy: -12, anchor: 'end' });                           // 動く向き(右)と逆
  s += fvec([A.x + A.w, GA[1]], RT, 1.5 * U, { label: 'T', dx: 6, dy: -12, ticks: 3 });                    // 糸との接点から
  s += line(A.x + A.w, GA[1], pulley[0] - 14, pulley[1], { w: 1.4 });
  s += acc([A.x + 10, fy - A.h - 52], RT, 56, 'a');                                                        // A の加速度(右向き)
  // 物体 B(質量 m = 2 単位。ぶら下がる)
  const bx = pulley[0] + 14, by = 330;
  s += line(bx, pulley[1], bx, by - 22, { w: 1.4 }) + ball(bx, by, 22) + L([bx, by], -32, 8, 'B', C.ink, 'end') + focusBox(bx - 40, by - 56, 80, 150);
  s += fvec([bx - 8, by - 22], UP, 1.5 * U, { label: 'T', dx: -10, dy: 4, anchor: 'end', ticks: 3 });     // A の T と同じ長さ・同じ印
  s += gravity([bx + 8, by], 2 * U, 'mg', { dx: 10, dy: 10 });                                              // T より長い(B は下向きに加速)
  s += acc([bx + 70, by - 40], DN, 56, 'a');                                                                // B の加速度(下向き)
  save('force_4_pulley.svg', figure(580, 430, s));
}

// ============ 5. 手で持ち上げる物体(上向きに加速):手の力 f は重力より長い ============
{
  const x0 = 140, fy = 310, w = 90, h = 70, G = [x0 + w / 2, fy - h - 20];
  let s = box(x0, fy - h - 40, w, h) + L(G, -w / 2 - 50, 6, '物体', C.ink) + focusBox(x0 - 24, fy - h - 90, w + 48, h + 110);
  s += gravity(G, 2 * U, 'mg', { dx: 10, dy: 8 });
  s += fvec([G[0] - 24, fy - 40], UP, 2.2 * U, { label: 'f', dx: -10, dy: 6, anchor: 'end' });             // 手がふれている点(底面)から上向き。mg より少し長い
  s += acc([x0 + w + 50, fy - 60], UP, 56, T`0.20\ \mathrm{m/s^2}`);
  s += arrow(60, fy - 20, 60, 70, { w: 1.8, color: '#B05A8C' }) + L([60, 64], 10, 6, 'x', '#B05A8C');       // 軸(上向きを正)
  save('force_5_lift.svg', figure(520, 380, s));
}

// ============ 見本ページ ============
const W = { 'force_1_hanging.svg': 640, 'force_2_friction.svg': 600, 'force_3_slope.svg': 470, 'force_4_pulley.svg': 580, 'force_5_lift.svg': 520 };
const items = [
  ['force_1_hanging.svg', '1. つるしたおもり', '重力は重心から。張力は糸との接点から(糸に沿って、糸の側へ)。注目する物体を点線で囲む。T₂ と mg は同じ長さ(つりあい)で「=」の印。'],
  ['force_2_friction.svg', '2. あらい水平面上の物体', '重力は重心から。N と f は床との接触点から、F は手(糸)がふれている点から。N = mg、f = F はそれぞれ同じ長さで同じ印。摩擦力は、動こうとする向きと逆。'],
  ['force_3_slope.svg', '3. 斜面上で静止する物体', '重力を点線の長方形で、斜面方向(朱)と垂直方向(青)に分ける。f は朱、N は青。成分と同じ長さの力に「=」の印。辺の比(1 : √3 : 2)の三角形を添える。'],
  ['force_4_pulley.svg', '4. 連結した 2 物体', '物体ごとに点線の枠、力、加速度 ⇨ を描く。T は同じ長さ・同じ印(軽い糸の張力はどこでも同じ)。B は下向きに加速するので、mg が T より長い。'],
  ['force_5_lift.svg', '5. 手で持ち上げる', '上向きに加速するので、手の力 f は重力 mg より長い(つりあいではない)。加速度 ⇧ は力とは別に、横に描く。'],
];
fs.writeFileSync(path.join(out, 'force-diagrams.html'), `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>力の図示の見本</title>
<style>body{font-family:"Hiragino Sans","Noto Sans JP","IPAGothic",sans-serif;margin:16px;max-width:820px}
figure{margin:0 0 22px;border-bottom:1px solid #ccc;padding-bottom:12px}img{height:auto;width:calc(var(--w) * 0.727px)}figcaption{font-size:14px;color:#444;margin-top:6px}
h1{font-size:18px}h2{font-size:15px;margin:0 0 6px}ul{font-size:14px;line-height:1.7}</style></head><body>
<h1>力の図示の見本</h1>
<ul><li>作用点は ● 。重力は重心、ほかは物体がふれている点(面・糸・ばね・手)から。</li>
<li>長さは力の大きさに比例。つりあう力は同じ長さで「=」の印。</li>
<li>加速度 ⇨ は物体ごと。運動の向きは細い黒矢印(力ではない)。</li>
<li>注目する物体は点線で囲む。触れていないものから受ける力は描かない。</li></ul>
${items.map(([f, t, c]) => `<figure><h2>${t}</h2><img src="${f}" alt="${t}" style="--w:${W[f]}"><figcaption>${c}</figcaption></figure>`).join('\n')}
</body></html>
`);
console.log('wrote', items.map((i) => i[0]).join(', '));
