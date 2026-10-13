// 高２ 物理基礎 ２学期中間試験(円運動・力のつりあい・運動方程式、大問1〜8)の解答解説。
// 問題集に印刷されている解答と照合済み(吟味に「印刷の解答と一致」と書かない。照合結果は報告で伝える)。
// 実行: node answers/set2-circular-forces.mjs [none]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C, tex, arrow, accel, force, line, box, ball, dot, jp, curve, circ, arc, vdim, figure, FS, JS } from '../tools/draw.mjs';
import { setCalc, page, qa, head, eq, p, note, fig } from '../tools/answer.mjs';

const MODE = process.argv[2] ?? 'show';
setCalc(MODE);
const T = String.raw;
const U = (s) => T`\underbracket[0.4pt][2pt]{${s}}`;
const L = (x, y, src, color = C.ink, anchor = 'start') => tex(x, y, src, { color, anchor });
const INERT = C.inertia;                       // 慣性力(遠心力)は朱

// ============ 図 ============
/** 大問1・2: 円運動(上から見た図)。物体は右端、速度は上向き、加速度は中心向き */
const figCircle = ({ r = '5.0\\ \\mathrm{m}', v = T`v`, withA = true, vLab = null } = {}) => {
  const O = [130, 130], R = 100;
  let s = circ(O[0], O[1], R, { fill: 'none', w: 1.6 }) + dot(...O, 3, C.ink) + line(...O, O[0] + R, O[1], { w: 1.4 }) + L(O[0] + R / 2, O[1] + 24, r, C.ink, 'middle');
  s += ball(O[0] + R, O[1], 12) + arrow(O[0] + R, O[1] - 14, O[0] + R, O[1] - 76, { w: 2.2 }) + L(O[0] + R + 10, O[1] - 52, vLab ?? v);
  if (withA) s += accel(O[0] + R - 16, O[1], O[0] + R - 70, O[1]) + L(O[0] + R - 44, O[1] - 16, 'a', C.force, 'middle');
  return figure(300, 260, s);
};

/** 大問3: 円すい振り子。上から見ると半径 r、横から見ると糸が鉛直と θ。小球とともに回る観測者から見た力 */
const figConical = () => {
  const P = [120, 30], th = Math.PI / 6, Lg = 130;
  const B = [P[0] + Lg * Math.sin(th), P[1] + Lg * Math.cos(th)];
  let s = line(60, 30, 180, 30, { color: C.wall, w: 3 }) + L(P[0] - 14, 24, 'p', C.ink, 'end');
  s += line(...P, P[0], B[1] + 30, { w: 1.2, dash: '5 4' }) + line(P[0], B[1], B[0], B[1], { w: 1.2, dash: '5 4' }) + L(P[0] + 32, B[1] + 22, 'r', C.ink, 'middle') + L(P[0] - 14, B[1] + 6, T`\mathrm{o}`, C.ink, 'end');
  s += line(...P, ...B, { w: 2 }) + arc(P[0], P[1], 40, 270, 270 + 30, {}) + L(P[0] + 4, P[1] + 56, T`\theta`);
  s += ball(...B, 11);
  // 小球とともに回る観測者から見て: 糸の張力 S(糸に沿って p へ)、重力 mg、遠心力 mrω²(外向き)
  s += force(...B, B[0] - 70 * Math.sin(th), B[1] - 70 * Math.cos(th)) + dot(...B, 3) + L(B[0] - 70 * Math.sin(th) - 6, B[1] - 70 * Math.cos(th) - 6, 'S', C.force, 'end');
  s += force(...B, B[0], B[1] + 70) + L(B[0] + 8, B[1] + 80, 'mg', C.force);
  s += arrow(...B, B[0] + 76, B[1], { color: INERT, w: 2.8 }) + L(B[0] + 80, B[1] + 6, T`mr\omega^2`, INERT);
  return figure(330, 250, s);
};

/** 大問4: 円筒面の一部。A から B へすべる。B の直前に、小球とともに円運動する観測者から見た力(N₁ = 3mg、mg、遠心力 mv²/r = 2mg。長さは大きさに比例) */
const figQuarter = () => {
  const O = [270, 70], R = 220;
  let s = line(O[0] - R - 30, O[1] + R, O[0] + 150, O[1] + R, { color: C.wall, w: 2.6 });
  s += arc(O[0], O[1], R, 180, 270, { w: 2.6 });
  s += dot(...O, 3, C.ink) + L(O[0] + 10, O[1] - 8, T`\mathrm{O}`) + line(...O, O[0], O[1] + R, { w: 1.2, dash: '5 4' }) + L(O[0] + 12, O[1] + R / 2, 'r');
  s += ball(O[0] - R, O[1], 12) + L(O[0] - R - 18, O[1] + 6, 'A', C.ink, 'end') + L(O[0] - R, O[1] - 20, 'm', C.ink, 'middle');
  s += L(O[0] + 110, O[1] + R + 24, 'B', C.ink, 'start');
  // B の直前: 小球と、小球が受ける力(3 本を横にずらして描く)
  const B = [O[0] - 8, O[1] + R - 13];
  s += ball(...B, 12);
  s += force(B[0] - 40, B[1] + 12, B[0] - 40, B[1] + 12 - 90) + dot(B[0] - 40, B[1] + 12, 3) + L(B[0] - 50, B[1] - 66, T`N_1`, C.force, 'end');
  s += force(...B, B[0], B[1] + 30) + dot(...B, 3) + L(B[0] - 10, B[1] + 52, 'mg', C.force, 'end');
  s += arrow(B[0] + 40, B[1], B[0] + 40, B[1] + 60, { color: INERT, w: 2.8 }) + L(B[0] + 52, B[1] + 44, T`m\frac{v^2}{r}`, INERT);
  return figure(480, 340, s);
};

/** 大問5: 半球面。点 P(角 θ)で、小球とともに動く観測者から見た力(重力 mg、垂直抗力 N、遠心力 mv²/R)。半径方向に N と遠心力、重力は鉛直下向き */
const figHemi = () => {
  const O = [210, 300], R = 230, th = Math.PI / 6;
  let s = line(20, O[1], 420, O[1], { color: C.wall, w: 2.6 }) + arc(O[0], O[1], R, 0, 180, { w: 2.6 });
  s += dot(...O, 3, C.ink) + L(O[0] + 10, O[1] + 22, T`\mathrm{O}`) + L(O[0] - 8, O[1] - R - 12, 'A', C.ink, 'end');
  const P = [O[0] + R * Math.sin(th), O[1] - R * Math.cos(th)];
  s += line(...O, O[0], O[1] - R, { w: 1.2, dash: '5 4' }) + line(...O, ...P, { w: 1.2, dash: '5 4' }) + arc(O[0], O[1], 70, 90, 60) + L(O[0] + 6, O[1] - 76, T`\theta`);
  s += ball(...P, 12) + L(P[0] + 18, P[1] - 16, 'P', C.ink);
  const rr = [Math.sin(th), -Math.cos(th)], tt = [Math.cos(th), Math.sin(th)];        // OP 方向(外向き)、接線方向
  const sh = (v, k) => [P[0] + tt[0] * k + v[0] * 0, P[1] + tt[1] * k + v[1] * 0];
  // N(OP 方向・外向き。接線方向にずらして描く)
  const Pn = [P[0] - tt[0] * 26, P[1] - tt[1] * 26];
  s += force(...Pn, Pn[0] + rr[0] * 70, Pn[1] + rr[1] * 70) + dot(...Pn, 3) + L(Pn[0] + rr[0] * 70 - 8, Pn[1] + rr[1] * 70 - 8, 'N', C.force, 'end');
  // 遠心力(OP 方向・外向き)
  const Pc = [P[0] + tt[0] * 26, P[1] + tt[1] * 26];
  s += arrow(...Pc, Pc[0] + rr[0] * 56, Pc[1] + rr[1] * 56, { color: INERT, w: 2.8 }) + L(Pc[0] + rr[0] * 56 + 10, Pc[1] + rr[1] * 56 + 6, T`m\frac{v^2}{R}`, INERT);
  // 重力(重心から鉛直下向き)
  s += force(...P, P[0], P[1] + 80) + dot(...P, 3) + L(P[0] + 10, P[1] + 92, 'mg', C.force);
  return figure(440, 340, s);
};

/** 大問6: 3つの小球 A, B, C をつなぎ、A を力 F で引き上げる。力の図(力の長さは大きさに比例) */
const figThree = () => {
  const x = 200, ys = [90, 230, 400], rs = [18, 24, 32], names = ['A', 'B', 'C'], ms = ['m', '2m', '3m'];
  let s = '';
  ys.forEach((y, i) => { s += ball(x, y, rs[i]) + L(x - 70, y + 7, names[i], C.ink, 'end') + L(x + 6, y + 7, ms[i], C.ink, 'start'); });
  s += line(x, ys[0] + rs[0], x, ys[1] - rs[1], { w: 1.8 }) + jp(x + 70, 168, '糸 1', { size: JS }) + line(x, ys[1] + rs[1], x, ys[2] - rs[2], { w: 1.8 }) + jp(x + 70, 320, '糸 2', { size: JS });
  // F
  s += force(x, ys[0] - rs[0], x, 8) + L(x + 12, 28, 'F', C.force);
  // 重力 mg(重心から下向き。長さは質量に比例)
  [40, 80, 120].forEach((len, i) => { s += force(x - 18, ys[i], x - 18, ys[i] + len) + dot(x - 18, ys[i], 3); });
  s += L(x - 26, ys[0] + 52, 'mg', C.force, 'end') + L(x - 26, ys[1] + 92, '2mg', C.force, 'end') + L(x - 26, ys[2] + 132, '3mg', C.force, 'end');
  // 張力(糸が球を引く)。球の上側は上向き、下側は下向き
  s += force(x + 18, ys[0] + rs[0], x + 18, ys[0] + rs[0] + 36) + L(x + 30, ys[0] + rs[0] + 34, T`T_1`, C.force);
  s += force(x + 18, ys[1] - rs[1], x + 18, ys[1] - rs[1] - 36) + L(x + 30, ys[1] - rs[1] - 22, T`T_1`, C.force);
  s += force(x + 18, ys[1] + rs[1], x + 18, ys[1] + rs[1] + 36) + L(x + 30, ys[1] + rs[1] + 34, T`T_2`, C.force);
  s += force(x + 18, ys[2] - rs[2], x + 18, ys[2] - rs[2] - 36) + L(x + 30, ys[2] - rs[2] - 22, T`T_2`, C.force);
  ys.forEach((y, i) => { s += accel(300, y + 40, 300, y - 40) + L(316, y + 8, 'a', C.force); });          // 加速度は物体ごと(上向きが正)
  return figure(420, 580, s);
};

/** 大問7: ばねでつながった小球 1, 2。糸をはなす前(つりあい)とはなした直後。小球ごとに力を左右に分けて描く */
const figSpring2 = () => {
  const sp = (x, y1, y2) => { const pts = [[x, y1]]; const n = 14; for (let i = 1; i < n; i++) pts.push([x + (i % 2 ? 10 : -10), y1 + ((y2 - y1) * i) / n]); pts.push([x, y2]); return curve(pts, { w: 2 }); };
  let s = jp(10, 26, '(1) はなす前', { color: C.label }) + jp(300, 26, '(2) はなした直後', { color: C.label });
  const panel = (x0, withT) => {
    let q = '';
    const y1 = 150, y2 = 340;
    q += ball(x0, y1, 14) + ball(x0, y2, 14) + sp(x0, y1 + 14, y2 - 14) + L(x0 - 70, y1 + 8, '小球 1', C.ink, 'end') + L(x0 - 70, y2 + 8, '小球 2', C.ink, 'end');
    if (withT) q += line(x0, y1 - 14, x0, 60, { w: 1.8 }) + force(x0 + 18, y1 - 8, x0 + 18, y1 - 78) + L(x0 + 30, y1 - 52, 'T', C.force);
    // 小球 1: mg(下、重心から)、ks(下、ばねから)
    q += force(x0 - 22, y1, x0 - 22, y1 + 56) + dot(x0 - 22, y1, 3) + L(x0 - 30, y1 + 80, 'mg', C.force, 'end');
    q += force(x0 + 22, y1 + 10, x0 + 22, y1 + 66) + L(x0 + 32, y1 + 62, 'ks', C.force);
    // 小球 2: mg(下)、ks(上、ばねから)
    q += force(x0 - 22, y2, x0 - 22, y2 + 56) + dot(x0 - 22, y2, 3) + L(x0 - 30, y2 + 80, 'mg', C.force, 'end');
    q += force(x0 + 22, y2 - 10, x0 + 22, y2 - 66) + L(x0 + 32, y2 - 40, 'ks', C.force);
    return q;
  };
  s += panel(130, true) + panel(400, false);
  s += accel(500, 110, 500, 190) + L(514, 162, T`a_1`, C.force) + L(500, 346, T`a_2 = 0`, C.force, 'middle');          // 小球 1 は下向きに a₁、小球 2 は a₂ = 0
  return figure(560, 450, s);
};

/** 大問8: 斜面の A と、滑車 P で結ばれた B。斜面は右上がり(問題の図と同じ)、滑車は斜面の上端。A が受ける力(静止) */
const figPulley = ({ theta = 60, move = false } = {}) => {
  const rad = (theta * Math.PI) / 180;
  const U = [Math.cos(rad), -Math.sin(rad)];       // 斜面を上る向き(右上)
  const Nv = [-Math.sin(rad), -Math.cos(rad)];     // 斜面から外向き(左上)
  const at = (P, v, k) => [P[0] + v[0] * k, P[1] + v[1] * k];
  const O = [50, 360], len = 300, E = at(O, U, len), hang = Math.min(130, O[1] - E[1] - 50);
  let s = `<polygon points="${O.join(',')} ${E.join(',')} ${E[0]},${O[1]}" fill="#EDEDED"/>`;
  s += line(O[0] - 30, O[1], E[0] + 120, O[1], { color: C.wall, w: 2.4 }) + line(...O, ...E, { color: C.wall, w: 2.6 });
  s += arc(O[0], O[1], 44, 0, theta) + L(O[0] + 52, O[1] - 8, T`\theta`);
  // 滑車 P と、B(鉛直につるす)
  s += circ(...E, 12, { w: 2.2 }) + L(E[0] + 2, E[1] - 20, 'P', C.ink, 'middle');
  s += line(E[0] + 12, E[1], E[0] + 12, E[1] + hang, { w: 1.8 }) + box(E[0] - 8, E[1] + hang, 40, 36) + L(E[0] + 12, E[1] + hang + 62, 'B', C.ink, 'middle');
  // 物体 A(斜面上。左上の面)
  const F = at(O, U, 150), w = 70, h = 40, a = at(F, U, -w / 2), b = at(F, U, w / 2);
  s += `<polygon points="${[a, b, at(b, Nv, h), at(a, Nv, h)].map((q) => q.join(',')).join(' ')}" fill="#fff" stroke="${C.ink}" stroke-width="2.2"/>`;
  const Cc = at(F, Nv, h / 2);
  s += L(...at(at(Cc, U, -8), Nv, 40), 'A', C.ink, 'middle');
  // 糸(A の上端から滑車まで、斜面に平行)
  s += line(...at(at(b, Nv, h / 2), U, 0), E[0] - 6 * U[0] + Nv[0] * 10, E[1] - 6 * U[1] + Nv[1] * 10, { w: 1.8 });
  // 力: 重力 mg(破線)と、斜面に沿う成分(朱)・垂直な成分(青)。N と T は接触面・糸の根元から
  const g = 90;
  s += `<path d="M${Cc[0]},${Cc[1]} L${Cc[0]},${Cc[1] + g - 8}" stroke="${C.force}" stroke-width="1.6" stroke-dasharray="5 4" fill="none"/>` + arrow(Cc[0], Cc[1] + g - 10, Cc[0], Cc[1] + g, { color: C.force, w: 1.6 });
  const tipS = at(Cc, U, -g * Math.sin(rad)), tipC = at(Cc, Nv, -g * Math.cos(rad));
  s += arrow(...Cc, ...tipS, { color: C.compA, w: 2.4 }) + arrow(...Cc, ...tipC, { color: C.compB, w: 2.4 }) + dot(...Cc, 3, C.force);
  const Pn = at(F, U, -10), Pt = at(F, U, w / 2 - 6), Pf = at(F, U, 16);
  const tipN = at(Pn, Nv, 70), tipT = at(Pt, U, 56), tipF = at(Pf, U, -44);
  s += force(...Pn, ...tipN, { color: C.compB }) + dot(...Pn, 3, C.compB) + force(...Pt, ...tipT, { color: C.compA }) + dot(...Pt, 3, C.compA) + force(...Pf, ...tipF, { color: C.compA }) + dot(...Pf, 3, C.compA);   // 斜面に垂直な力(青)、斜面に沿う力(朱)
  s += L(tipN[0] - 10, tipN[1] - 6, 'N', C.compB, 'end') + L(tipT[0] + 12, tipT[1] - 6, 'T', C.compA) + L(tipF[0] + 12, tipF[1] + 20, move ? T`\mu N` : 'f', C.compA);
  s += L(Cc[0] + 12, Cc[1] + g + 8, 'mg', C.force);
  if (move) {
    const Aa = at(at(Cc, Nv, 56), U, -10);                                    // A の加速度(斜面を上る向き)
    s += accel(...Aa, ...at(Aa, U, 70)) + L(...at(Aa, U, 70).map((v, i) => v + (i ? -10 : 14)), 'a', C.force);
    const bx = E[0] + 12, by = E[1] + hang + 18;                                     // B の力(重力 mg 下、張力 T 上)と加速度 a(下)
    s += force(bx - 12, by, bx - 12, by - 56) + L(bx - 20, by - 36, T`T'`, C.force, 'end') + force(bx + 12, by, bx + 12, by + 56) + dot(bx + 12, by, 3) + L(bx + 20, by + 58, 'mg', C.force);
    s += accel(bx + 60, by - 20, bx + 60, by + 50) + L(bx + 76, by + 30, 'a', C.force);
  }
  s += L(tipS[0] - 8, tipS[1] + 28, T`mg\sin\theta`, C.compA, 'end');
  s += L(tipC[0] + 2, tipC[1] + 44, T`mg\cos\theta`, C.compB, 'end');
  return figure(520, 470, `<g transform="translate(50,0)">${s}</g>`);
};

// ============ 答案 ============
const body = [
  // ---------- 1 ----------
  qa('1 (a)', {
    genshou: [fig(figCircle({ vLab: T`2.0\ \mathrm{m/s}` }), { cap: '半径 $5.0\\ \\mathrm{m}$、速さ $2.0\\ \\mathrm{m/s}$ の等速円運動(質量 $10\\ \\mathrm{kg}$)。速度は円の接線方向、加速度は中心向き' })],
    kaihou: p('[[角速度 ω]] → 速さ・半径・角速度の関係 $v = r\\omega$.'),
    tate: [head('円運動の関係式', '$\\omega$:角速度'), eq(T`v = r\omega`)],
    keisan: eq(T`\omega = \frac{v}{r} = \frac{2.0}{5.0}`),
    ans: eq(T`\omega = 0.40\ [\mathrm{rad/s}]`, { ther: true }),
    gimmi: p('周期は $T = \\frac{2\\pi}{\\omega} \\approx 15.7$ s. 半径 $5.0$ m の円周($31.4$ m)を速さ $2.0$ m/s で回る時間と合う.'),
  }),
  qa('(b)', {
    genshou: p('等速円運動の加速度は、中心向きの向心加速度.'),
    kaihou: p('[[加速度の大きさ a]] → 向心加速度 $a = \\frac{v^2}{r}$.'),
    tate: [head('向心加速度'), eq(T`a = \frac{v^2}{r}`)],
    keisan: eq(T`a = \frac{2.0^2}{5.0}`),
    ans: eq(T`a = 0.80\ [\mathrm{m/s^2}]`, { ther: true }),
    gimmi: p('$a = r\\omega^2 = 5.0 \\times 0.40^2 = 0.80$ と一致する.'),
  }),
  qa('(c)', {
    genshou: p('物体には、中心向きの力(向心力)がはたらく.'),
    kaihou: p('[[物体にはたらいている力の大きさ F]] → 円運動の運動方程式 $ma = F$.'),
    tate: [head('運動方程式(中心向き)'), eq(T`ma = F`)],
    keisan: eq(T`F = 10\times0.80`),
    ans: eq(T`F = 8.0\ [\mathrm{N}]`, { ther: true }),
    gimmi: p('$F = m\\frac{v^2}{r} = 10 \\times \\frac{4.0}{5.0} = 8.0$ と一致する.'),
  }),

  // ---------- 2 ----------
  qa('2 (a)', {
    genshou: [fig(figCircle({ r: '0.80\\ \\mathrm{m}', vLab: T`v`, withA: false }), { cap: '半径 $0.80\\ \\mathrm{m}$ の円周上を、周期 $2.0\\ \\mathrm{s}$ で等速円運動する' })],
    kaihou: p('[[回転数 n]] → 1 秒間に回る回数は、周期の逆数.'),
    tate: [head('回転数と周期の関係'), eq(T`n = \frac{1}{T}`)],
    keisan: eq(T`n = \frac{1}{2.0}`),
    ans: eq(T`n = 0.50\ [\mathrm{Hz}]`, { ther: true }),
    gimmi: p('周期 $2.0$ s なので、1 秒間に半周(0.50 回).'),
  }),
  qa('(b)', {
    genshou: p('1 周($2\\pi$ rad)にかかる時間が周期.'),
    kaihou: p('[[角速度 ω]] → 周期と角速度の関係.'),
    tate: [head('周期と角速度の関係'), eq(T`\omega = \frac{2\pi}{T}`)],
    keisan: eq(T`\omega = \frac{2\pi}{2.0}`),
    ans: eq(T`\omega = 1.0\pi\ [\mathrm{rad/s}]`, { ther: true }),
    gimmi: p('1 秒間に半周($\\pi$ rad)進むので、$\\omega = \\pi$ rad/s と合う.'),
  }),
  qa('(c)', {
    genshou: p('速さは、円周の長さを周期で割った値でも求まる.'),
    kaihou: p('[[速さ v]] → $v = r\\omega$.'),
    tate: [head('円運動の関係式'), eq(T`v = r\omega`)],
    keisan: eq(T`v = 0.80\times1.0\pi`),
    ans: eq(T`v = 0.80\pi\ [\mathrm{m/s}]`, { ther: true }),
    gimmi: p('円周 $2\\pi \\times 0.80 = 1.6\\pi$ m を $2.0$ s で進むので $0.80\\pi$ m/s と合う.'),
  }),

  // ---------- 3 ----------
  qa('3 (1)', {
    genshou: [fig(figConical(), { cap: '小球とともに回る観測者から見た力:糸の張力 $S$(糸に沿って p へ)、重力 $mg$、遠心力 $mr\\omega^2$(外向き、朱)' }),
      p('小球は水平面内で半径 $r$ の等速円運動をする. 小球とともに回る観測者から見ると、小球は静止していて、力がつりあっている.')],
    kaihou: p('[[小球とともに回転する立場]] → 重力・張力・遠心力の 3 力のつりあい → [[水平方向と鉛直方向についてそれぞれ小球にはたらく力のつりあい]].'),
    tate: [head('力のつりあい(小球とともに回る観測者から見て)', '$S$:糸の張力、$mr\\omega^2$:遠心力'),
      eq(T`\text{水平方向:}\ \ ${U('S\\sin\\theta')}_{\\displaystyle\\text{張力の水平成分(内向き)}} - ${U('mr\\omega^2')}_{\\displaystyle\\text{遠心力(外向き)}} = 0`.replace(/\\\\/g, '\\'), { no: '①' }),
      eq(T`\text{鉛直方向:}\ \ ${U('S\\cos\\theta')}_{\\displaystyle\\text{張力の鉛直成分(上向き)}} - ${U('mg')}_{\\displaystyle\\text{重力(下向き)}} = 0`.replace(/\\\\/g, '\\'), { no: '②' })],
    keisan: '—',
    ans: p('①, ②.'),
    gimmi: p('遠心力は、小球とともに回る観測者から見たときの見かけの力.'),
  }),
  qa('(2)', {
    genshou: p('①, ② から $S$, $\\omega$, $T$ を求める.'),
    kaihou: p('[[糸が小球を引く力の大きさ S、角速度 ω、周期 T]] → ② から $S$、① に代入して $\\omega$、$T = \\frac{2\\pi}{\\omega}$.'),
    tate: [head('②より、①に代入', '$T$:周期'), eq(T`S = \frac{mg}{\cos\theta}`, { lead: '② より' }), eq(T`\frac{mg}{\cos\theta}\sin\theta = mr\omega^2`, { lead: '① に代入して' })],
    keisan: [eq(T`\omega^2 = \frac{g\tan\theta}{r}`), eq(T`T = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac{r}{g\tan\theta}}`)],
    ans: [eq(T`S = \frac{mg}{\cos\theta}`, { ther: true }), eq(T`\omega = \sqrt{\frac{g\tan\theta}{r}}`, { ther: true }), eq(T`T = 2\pi\sqrt{\frac{r}{g\tan\theta}}`, { ther: true })],
    gimmi: p('$\\theta \\to 0$ で $\\omega \\to 0$、$S \\to mg$(ほぼ鉛直). $\\theta$ が大きいほど、速く回る.'),
  }),
  qa('(3)', {
    genshou: p('質量を $2m$ にしたときの周期 $T\'$.'),
    kaihou: p('[[質量を 2 倍にしたときの周期]] → (2) の $\\omega$, $T$ の式に、質量 $m$ が入っているか調べる.'),
    tate: [head('(2) の式の質量'), eq(T`T = 2\pi\sqrt{\frac{r}{g\tan\theta}}`)],
    keisan: '—',
    ans: eq(T`T' = T = 2\pi\sqrt{\frac{r}{g\tan\theta}}`, { ther: true }),
    gimmi: p('質量 $m$ は ①, ② の両方にあって消える. 周期は質量によらない.'),
  }),
  qa('(4)', {
    genshou: p('等速円運動の加速度は、つねに円の中心(o)向き(向心加速度).'),
    kaihou: p('[[円運動の加速度の向き]] → 向心加速度.'),
    tate: '—',
    keisan: '—',
    ans: eq(T`\text{o 方向}`, { ther: true }),
    gimmi: p('p の方向(糸の方向)は、張力 $S$ の向き. 加速度は、合力の向き(水平で o 向き)になる.'),
  }),

  // ---------- 4 ----------
  qa('4 (1)', {
    genshou: [fig(figQuarter(), { cap: '点 A から初速 0 ですべり、B を通る(点 B を含む水平面を、位置エネルギーの基準にする)' }),
      p('面はなめらか. 小球が受ける力のうち、仕事をするのは重力だけ.')],
    kaihou: p('[[なめらかな円筒の内面]]、[[初速 0 ですべらせる]] → 垂直抗力は仕事をしない → 力学的エネルギー保存則(A と B).'),
    tate: [head('力学的エネルギー保存則(B を含む水平面が基準)'),
      eq(T`${U('0 + mgr')}_{\displaystyle\text{A(止、高さ }r\text{)}} = ${U(T`\frac{1}{2}mv^2 + 0`)}_{\displaystyle\text{B(速さ }v\text{)}}`)],
    keisan: eq(T`v^2 = 2gr`),
    ans: eq(T`v = \sqrt{2gr}`, { ther: true }),
    gimmi: p('自由落下で $r$ だけ落ちた速さ $\\sqrt{2gr}$ と同じ.'),
  }),
  qa('(2)', {
    genshou: p('B の直前は円運動の一部(半径 $r$). 小球とともに円運動する観測者から見ると、小球は重力 $mg$、垂直抗力 $N_1$、遠心力 $m\\frac{v^2}{r}$ を受けてつりあう(図).'),
    kaihou: p('[[点 B を通過する直前]] → まだ円運動の途中 → 小球とともに運動する観測者から見て、力のつりあい(鉛直方向).'),
    tate: [head('力のつりあい(鉛直方向。上向きを正)', '$N_1$:B の直前の垂直抗力'),
      eq(T`${U('N_1')}_{\displaystyle\text{垂直抗力(上向き)}} - ${U('mg')}_{\displaystyle\text{重力(下向き)}} - ${U(T`m\frac{v^2}{r}`)}_{\displaystyle\text{遠心力(下向き)}} = 0`)],
    keisan: eq(T`N_1 = mg + m\frac{2gr}{r}`, { lead: '(1) の $v^2 = 2gr$ を代入して' }),
    ans: eq(T`N_1 = 3mg`, { ther: true }),
    gimmi: p('静止しているときの垂直抗力 $mg$ より大きい. 円運動のぶん、面に強く押しつけられる.'),
  }),
  qa('(3)', {
    genshou: p('B を過ぎると、水平面上の直線運動になる(円運動ではない).'),
    kaihou: p('[[点 B を通過した直後]]、[[水平面上を直線運動]] → 遠心力はなく、鉛直方向の力のつりあい.'),
    tate: [head('力のつりあい(鉛直方向)', '$N_2$:B の直後の垂直抗力'), eq(T`${U('N_2')}_{\displaystyle\text{垂直抗力(上向き)}} - ${U('mg')}_{\displaystyle\text{重力(下向き)}} = 0`)],
    keisan: '—',
    ans: eq(T`N_2 = mg`, { ther: true }),
    gimmi: p('B の前後で垂直抗力が $3mg$ から $mg$ に急に変わる. 面の曲がり方が急に変わるから.'),
  }),

  // ---------- 5 ----------
  qa('5 (1)', {
    genshou: [fig(figHemi(), { cap: '点 A(頂点)から点 P(角 $\\theta$)まですべる。P で、小球とともに動く観測者から見た力(重力 $mg$、垂直抗力 $N$、遠心力 $m\\frac{v^2}{R}$)' }),
      p('A は球の頂点で、P は、中心 O から見て鉛直から角 $\\theta$ の位置. A から P までは、$R(1 - \\cos\\theta)$ だけ下がる.')],
    kaihou: p('[[なめらかな半球の頂点 A から初速 0]] → 面からの垂直抗力は仕事をしない → 力学的エネルギー保存則(A と P). 床を位置エネルギーの基準にする.'),
    tate: [head('力学的エネルギー保存則(床が基準)'),
      eq(T`${U('0 + mgR')}_{\displaystyle\text{A(止、高さ }R\text{)}} = ${U(T`\frac{1}{2}mv^2 + mgR\cos\theta`)}_{\displaystyle\text{P(速さ }v\text{)}}`)],
    keisan: eq(T`v^2 = 2gR(1 - \cos\theta)`),
    ans: eq(T`v = \sqrt{2gR(1 - \cos\theta)}`, { ther: true }),
    gimmi: p('$\\theta = 0$ で $v = 0$(頂点で静止). $\\theta$ が大きいほど速い.'),
  }),
  qa('(2)', {
    genshou: p('小球とともに動く観測者から見て、P では OP 方向に、$mg\\cos\\theta$(重力の成分、内向き)、$N$(外向き)、遠心力(外向き)がつりあう.'),
    kaihou: p('[[点 P で面が小球に及ぼす力の大きさ N]] → OP 方向(半径方向)の力のつりあい. 遠心力 $m\\frac{v^2}{R}$ を加える.'),
    tate: [head('半径方向の力のつりあい(O から P の向きを正)', '$N$:垂直抗力'),
      eq(T`${U('mg\\cos\\theta')}_{\\displaystyle\\text{重力の成分(内向き)}} - ${U('N')}_{\\displaystyle\\text{垂直抗力(外向き)}} - ${U(T`m\frac{v^2}{R}`)}_{\displaystyle\text{遠心力(外向き)}} = 0`.replace(/\\\\/g, '\\'))],
    keisan: eq(T`N = mg\cos\theta - m\frac{2gR(1 - \cos\theta)}{R} = (3\cos\theta - 2)\,mg`, { lead: '(1) の $v^2$ を代入して' }),
    ans: eq(T`N = (3\cos\theta - 2)\,mg`, { ther: true }),
    gimmi: p('$\\theta = 0$ で $N = mg$(頂点で静止のとき). $\\theta$ が大きいほど $N$ は小さい.'),
  }),
  qa('(3)', {
    genshou: p('点 B で、小球は面から離れる(面からの垂直抗力が 0 になる).'),
    kaihou: p('[[ある点 B で球面を離れて]] → $\\theta = \\theta_0$ で $N = 0$.'),
    tate: [head('離れる条件', '$\\theta_0$:離れる点の角'), eq(T`N = (3\cos\theta_0 - 2)\,mg = 0`)],
    keisan: eq(T`3\cos\theta_0 = 2`),
    ans: eq(T`\cos\theta_0 = \frac{2}{3}`, { ther: true }),
    gimmi: p('$\\theta_0 \\approx 48^\\circ$. $0 < \\cos\\theta_0 < 1$ を満たす.'),
    note: note('別解:半径方向の運動方程式 $m\\frac{v^2}{R} = mg\\cos\\theta - N$ から、同じ式が得られる.'),
  }),

  // ---------- 6 ----------
  qa('6 (1)', {
    genshou: [fig(figThree(), { cap: '小球 A, B, C(質量 $m$, $2m$, $3m$)を糸でつなぎ、A を力 $F$ で鉛直上向きに引き上げる。上向きを正とし、A, B, C それぞれの加速度は同じ $a$' }),
      p('小球 C の質量は $3m$.')],
    kaihou: p('[[小球 C にはたらく重力の大きさ]] → 重力 = 質量 × $g$.'),
    tate: '—',
    keisan: '—',
    ans: eq(T`3mg\ [\mathrm{N}]`, { ther: true }),
    gimmi: p('質量 $3m$ なので $3mg$.'),
  }),
  qa('(2)', {
    genshou: p('C は、重力 $3mg$(下向き)と、糸 2 の張力 $T_2$(上向き)を受ける.'),
    kaihou: p('[[鉛直上向きを正の向き]]、[[小球 C の運動方程式]] → 小球 C にはたらく力を、上向きを正として足す.'),
    tate: [head('運動方程式(小球 C。鉛直上向きを正)'),
      eq(T`${U('3ma')}_{\displaystyle\text{質量 × 加速度}} = ${U('T_2')}_{\displaystyle\text{糸 2 の張力(上向き)}} - ${U('3mg')}_{\displaystyle\text{重力(下向き)}}`)],
    keisan: '—',
    ans: eq(T`3ma = T_2 - 3mg`, { ther: true }),
    gimmi: p('静止のとき($a = 0$)は $T_2 = 3mg$ で、C の重さを糸 2 が支える.'),
  }),
  qa('(3)', {
    genshou: p('A, B, C は一体で、同じ加速度 $a$ で上がる. 内力の張力 $T_1$, $T_2$ は、足すと消える.'),
    kaihou: p('[[a を F, g, m を用いて表せ]] → A, B, C それぞれの運動方程式を立て、辺々を足して $T_1$, $T_2$ を消去.'),
    tate: [head('運動方程式(上向きを正)'),
      eq(T`\mathrm{A}:\ ma = F - T_1 - mg`, { no: '①' }), eq(T`\mathrm{B}:\ 2ma = T_1 - T_2 - 2mg`, { no: '②' }), eq(T`\mathrm{C}:\ 3ma = T_2 - 3mg`, { no: '③' })],
    keisan: [eq(T`6ma = F - 6mg`, { lead: '① + ② + ③ より' })],
    ans: eq(T`a = \frac{F}{6m} - g\ [\mathrm{m/s^2}]`, { ther: true }),
    gimmi: p('$F = 6mg$ のとき $a = 0$(つりあい). $F > 6mg$ で上向きに加速する.'),
  }),
  qa('(4)', {
    genshou: p('糸 1 には $T_1$、糸 2 には $T_2$ がかかる. どちらも $10\\ \\mathrm{N}$ をこえると切れる.'),
    kaihou: p('[[糸 1 は T₁ が 10 N をこえると切れる…糸 2 も…]] → $T_1$, $T_2$ を $F$ で表し、それぞれ $10$ N 以下になる条件を求める → 厳しいほうが最大値.'),
    tate: [head('B, C をまとめた運動方程式、C の運動方程式', ''),
      eq(T`5ma = T_1 - 5mg`, { lead: '(B + C)' }), eq(T`3ma = T_2 - 3mg`, { lead: '(C)' })],
    keisan: [eq(T`T_1 = 5m(a + g) = \frac{5}{6}F,\qquad T_2 = 3m(a + g) = \frac{1}{2}F`, { lead: '(3) の $a$ を代入して' }),
      eq(T`T_1 = \frac{5}{6}F \le 10 \Rightarrow F \le 12,\qquad T_2 = \frac{1}{2}F \le 10 \Rightarrow F \le 20`)],
    ans: eq(T`F_{\max} = 12\ [\mathrm{N}]`, { lead: '両方を満たす(小さいほう)', ther: true }),
    gimmi: p('$F$ を大きくしていくと、先に糸 1($F = 12$ N)が切れる. 糸 2 は $20$ N まで耐えられるので、その前に切れる側で決まる.'),
  }),

  // ---------- 7 ----------
  qa('7 (1)', {
    genshou: [fig(figSpring2(), { cap: '糸でつり下げて静止した小球 1, 2(質量 $m$、ばね定数 $k$、ばねの伸び $s$)' }),
      p('糸をはなす前は、小球 1, 2 とも静止している(つりあい). ばねは自然長より $s$ だけ伸びていて、ばねの力 $ks$ は、小球 1 には下向き、小球 2 には上向き.')],
    kaihou: p('[[この状態で、ばねは自然の長さより s だけ伸びており、糸が小球 1 を引く張力の大きさは T]] → 小球 1, 2 それぞれで力のつりあい.'),
    tate: [head('力のつりあい(上向きを正)'),
      eq(T`\text{小球 1:}\ \ T - mg - ks = 0`, { no: '①' }), eq(T`\text{小球 2:}\ \ ks - mg = 0`, { no: '②' })],
    keisan: [eq(T`s = \frac{mg}{k}`, { lead: '② より' }), eq(T`T = mg + ks = 2mg`, { lead: '① に代入して' })],
    ans: eq(T`s = \frac{mg}{k},\quad T = 2mg`, { ther: true, ch: '④' }),
    gimmi: p('小球 1 は、小球 2 と自分の重さの合計 $2mg$ を、糸で支えている.'),
  }),
  qa('(2)', {
    genshou: p('糸をはなした直後、糸の張力 $T$ はなくなる. ばねの伸び $s$ は、すぐには変わらず、ばねの力 $ks = mg$ はそのまま.'),
    kaihou: p('[[糸を静かにはなした直後]] → $T = 0$ にして、小球 1, 2 の運動方程式(下向きを正)を立てる.'),
    tate: [head('運動方程式(下向きを正)'),
      eq(T`\text{小球 1:}\ \ ma_1 = mg + ks`, { no: '①' }), eq(T`\text{小球 2:}\ \ ma_2 = mg - ks`, { no: '②' })],
    keisan: [eq(T`ma_1 = mg + mg = 2mg,\quad ma_2 = mg - mg = 0`, { lead: '$ks = mg$ を代入して' })],
    ans: eq(T`a_1 = 2g,\quad a_2 = 0`, { ther: true, ch: '④' }),
    gimmi: p('小球 2 は、重力とばねの力がつりあったままなので、加速度 0. 小球 1 は、重力とばねの力の両方が下向きで、$2g$.'),
  }),

  // ---------- 8 ----------
  qa('8 (1)', {
    genshou: [fig(figPulley({ theta: 60 }), { cap: '$\\theta = 60^\\circ$ のとき、A と B は静止. A が受ける力(重力は重心、重力の成分は斜面に沿う方向=朱、垂直な方向=青)' }),
      p('B は鉛直につるされて静止している.')],
    kaihou: p('[[物体 B を鉛直につるした…静止していた]] → B の力のつりあい. 糸は軽く、滑車はなめらかなので、糸の張力は A でも B でも同じ.'),
    tate: [head('力のつりあい(B。鉛直方向)', '$T$:糸の張力'), eq(T`${U('T')}_{\displaystyle\text{張力(上向き)}} - ${U('mg')}_{\displaystyle\text{重力(下向き)}} = 0`)],
    keisan: '—',
    ans: eq(T`T = mg\ [\mathrm{N}]`, { ther: true }),
    gimmi: p('A の張力も同じ大きさ $mg$(軽い糸、なめらかな滑車).'),
  }),
  qa('(2)', {
    genshou: p('A は斜面に垂直な方向には動かない.'),
    kaihou: p('[[物体 A についての斜面に垂直な方向の力のつりあい]] → 斜面に垂直な方向の力のつりあい.'),
    tate: [head('斜面に垂直な方向の力のつりあい', '$N$:垂直抗力'), eq(T`${U('N')}_{\displaystyle\text{垂直抗力}} - ${U('mg\\cos60^\\circ')}_{\\displaystyle\\text{重力の成分}} = 0`.replace(/\\\\/g, '\\'))],
    keisan: eq(T`N = mg\cos60^\circ`),
    ans: eq(T`N = \frac{1}{2}\,mg\ [\mathrm{N}]`, { ther: true }),
    gimmi: p('$\\theta = 60^\\circ$ の斜面なので、垂直抗力は重さの半分.'),
  }),
  qa('(3)', {
    genshou: p('A は静止. 斜面に平行な方向の力は、張力 $T$(斜面を上る向き)、重力の成分 $mg\\sin60^\\circ$(斜面を下る向き)、摩擦力 $f$(斜面を下る向き).'),
    kaihou: p('[[斜面に平行な力のつりあいを考えて、物体 A にはたらく摩擦力の大きさ]] → 斜面に平行な方向の力のつりあい. 摩擦力の向きは、(1) の $T = mg$ が重力の成分 $\\frac{\\sqrt{3}}{2}mg$ より大きいので、斜面を下る向き.'),
    tate: [head('斜面に平行な方向の力のつりあい(斜面を上る向きを正)', '$f$:静止摩擦力(斜面を下る向き)'),
      eq(T`${U('T')}_{\displaystyle\text{張力(上り)}} - ${U('mg\\sin60^\\circ')}_{\\displaystyle\\text{重力の成分(下り)}} - ${U('f')}_{\\displaystyle\\text{静止摩擦力(下り)}} = 0`.replace(/\\\\/g, '\\'))],
    keisan: eq(T`f = mg - \frac{\sqrt{3}}{2}\,mg`, { lead: '$T = mg$ を代入して' }),
    ans: eq(T`f = \frac{2 - \sqrt{3}}{2}\,mg\ [\mathrm{N}]`, { ther: true }),
    gimmi: p('$f > 0$($2 > \\sqrt{3}$)で、仮定した向き(斜面を下る向き)で合っている. 数値は $f \\approx 0.13\\,mg$.'),
  }),
  qa('(4)', {
    genshou: p('$\\theta = 45^\\circ$ のとき、A が斜面をすべり上がり始める → 静止摩擦力が最大値(最大摩擦力 $\\mu_0 N^{\\prime}$)に達した限界.'),
    kaihou: p('[[θ = 45° のときに物体 A が斜面をすべり上がり始めた]] → 限界のつりあい: 斜面に平行な方向のつりあいで、摩擦力を最大摩擦力 $\\mu_0 N^{\\prime}$ とおく(垂直方向のつりあいで $N^{\\prime}$ を求める).'),
    tate: [head('限界のつりあい($\\theta = 45^\\circ$)', "$N'$:垂直抗力、$F$:最大摩擦力、$\\mu_0$:静止摩擦係数"),
      eq(T`N' = mg\cos45^\circ = \frac{\sqrt{2}}{2}\,mg`),
      eq(T`F = T - mg\sin45^\circ = mg - \frac{\sqrt{2}}{2}\,mg = \frac{2 - \sqrt{2}}{2}\,mg`),
      eq(T`\mu_0 = \frac{F}{N'}`)],
    keisan: eq(T`\mu_0 = \frac{\dfrac{2 - \sqrt{2}}{2}}{\dfrac{\sqrt{2}}{2}} = \frac{2 - \sqrt{2}}{\sqrt{2}} = \sqrt{2} - 1`.replace(/\\dfrac/g, '\\frac')),
    ans: eq(T`\mu_0 = \sqrt{2} - 1\ (\approx 0.41)`, { ther: true }),
    gimmi: p('$0 < \\mu_0 < 1$ で、もっともらしい. $\\theta = 60^\\circ$ では、(3) の $f = 0.13\\,mg$ と、最大摩擦力 $\\mu_0 N = 0.41 \\times 0.5\\,mg = 0.21\\,mg$ を比べると $f$ は最大値より小さく、静止できる.'),
  }),
  qa('(5)', {
    genshou: [fig(figPulley({ theta: 30, move: true }), { cap: '$\\theta = 30^\\circ$。A は斜面を上る向きに、B は下向きに、同じ大きさ $a$ の加速度で動く(加速度は物体ごとに描く)。斜面に沿う力は朱、垂直な力は青' }),
      p('$\\theta = 30^\\circ$ のとき、A は斜面をすべり上がり、B は下がる. 糸は伸び縮みしないので、A と B の加速度の大きさは等しい(共通の加速度 $a$). 動摩擦力は A の運動と逆(斜面を下る向き).')],
    kaihou: p('[[物体 A は斜面を一定の加速度ですべり上がった]]、[[A と B に共通な加速度の大きさ]] → A, B それぞれの運動方程式を立て、$T\'$ を消去する.'),
    tate: [head('運動方程式(A:斜面を上る向きを正、B:鉛直下向きを正)', "$T'$:糸の張力、$a$:加速度"),
      eq(T`\mathrm{A}:\ ma = T' - mg\sin30^\circ - \mu\,mg\cos30^\circ`, { no: '①' }),
      eq(T`\mathrm{B}:\ ma = mg - T'`, { no: '②' })],
    keisan: [eq(T`2ma = mg - mg\sin30^\circ - \mu\,mg\cos30^\circ = mg\left(\frac{1}{2} - \frac{\sqrt{3}}{2}\mu\right)`, { lead: "① + ② より $T'$ を消去して" })],
    ans: eq(T`a = \frac{1 - \sqrt{3}\,\mu}{4}\,g\ [\mathrm{m/s^2}]`, { ther: true }),
    gimmi: p('$a > 0$(すべり上がる)には $\\mu < \\frac{1}{\\sqrt{3}}$ が必要. $\\mu = 0$ なら $a = \\frac{g}{4}$.'),
  }),
].join('\n');

const html = page({
  title: '高２ 物理基礎　２学期中間試験・解答解説',
  lead: '数値計算の指示:$\\sqrt{2} = 1.41$、$\\sqrt{3} = 1.73$、$\\sqrt{5} = 2.23$。文字計算は分数、数値計算は小数で答え、答えには [ ] で単位を書く.',
  body,
});
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), MODE === 'show' ? 'set2-circular-forces.html' : `set2-circular-forces.${MODE}.html`);
fs.writeFileSync(out, html);
console.log('wrote', out);
