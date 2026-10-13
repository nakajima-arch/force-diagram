// 2026 運動量・衝突の問題集(大問1, 2, 3, 5)の模範解答。大問4(P が Q の上をすべる)は answers/2026-sample-4.mjs。
// 実行: node answers/set1-impulse-collision.mjs        → answers/set1-impulse-collision.html(途中式つき)
//       node answers/set1-impulse-collision.mjs none   → …none.html(答案だけ)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C, tex, arrow, accel, force, line, box, ball, dot, jp, curve, circ, figure, FS, JS } from '../tools/draw.mjs';
import { figC } from '../tools/figures.mjs';
import { setCalc, page, qa, head, eq, p, note, fig } from '../tools/answer.mjs';

const MODE = process.argv[2] ?? 'show';
setCalc(MODE);
const T = String.raw;
const U = (s) => T`\underbracket[0.4pt][2pt]{${s}}`;
const L = (x, y, src, color = C.ink, anchor = 'start') => tex(x, y, src, { color, anchor });

// ============ 図 ============
/** 大問1(1): ボールとバット。前は右へ 30 m/s、後は左へ 40 m/s。右向きを正とする */
const figBat = () => {
  let s = jp(24, 30, '衝突前', { color: C.label }) + jp(24, 130, '衝突後', { color: C.label });
  s += line(300, 8, 300, 156, { w: 8, color: '#8A8A8A' });                               // バット(側面)
  s += ball(150, 66, 14) + arrow(168, 66, 252, 66, { w: 2.2 }) + L(210, 50, T`30\ \mathrm{m/s}`, C.ink, 'middle');
  s += ball(250, 126, 14) + arrow(230, 126, 132, 126, { w: 2.2 }) + L(182, 110, T`40\ \mathrm{m/s}`, C.ink, 'middle');
  s += arrow(24, 168, 100, 168, { w: 1.8 }) + jp(108, 175, '正の向き', { size: JS });
  return figure(340, 190, s);
};

/** 大問1(4): 運動量ベクトル。力積 I = p' - p(同じ点から p, p' を描き、p の先から p' の先へ I) */
const figVec = () => {
  const O = [90, 190];
  let s = arrow(...O, O[0] + 130, O[1], { w: 2.2 }) + L(O[0] + 66, O[1] + 24, 'p', C.ink, 'middle');
  s += arrow(...O, O[0], O[1] - 130, { w: 2.2 }) + L(O[0] - 10, O[1] - 66, T`p'`, C.ink, 'end');
  s += arrow(O[0] + 130, O[1], O[0] + 6, O[1] - 124, { w: 3.8 }) + L(O[0] + 78, O[1] - 76, 'I', C.ink, 'start');
  s += dot(...O, 3, C.ink);
  s += L(O[0] + 140, O[1] + 2, T`\text{右}`, C.ink) + L(O[0] - 4, O[1] - 140, T`\text{上}`, C.ink, 'middle');
  return figure(300, 230, s);
};

/** 2物体の一直線上の衝突: 前後の速度の矢印(長さは速さに比例。左向きは負) */
const figColl = ({ names, masses, before, after, labelsB, labelsA }) => {
  const draw = (y, vs, labs, title) => {
    let s = jp(8, y - 26, title, { color: C.label });
    const xs = [150, 330];
    vs.forEach((v, i) => {
      s += circ(xs[i], y, 18) + L(xs[i], y + 7, names[i], C.ink, 'middle') + L(xs[i], y + 46, masses[i], C.ink, 'middle');
      if (v !== 0) s += arrow(xs[i] + (v > 0 ? 24 : -24), y - 28, xs[i] + (v > 0 ? 24 : -24) + v, y - 28, { w: 2.2 }) + L(xs[i] + (v > 0 ? 24 : -24) + v / 2, y - 40, labs[i], C.ink, 'middle');
    });
    return s;
  };
  return figure(440, 270, draw(70, before, labelsB, '衝突前') + draw(190, after, labelsA, '衝突後') + arrow(8, 258, 70, 258, { w: 1.8 }) + jp(78, 265, '正の向き', { size: JS }));
};

/** 大問2(2)(3): ロケットの分離(前: 一体で速度 v、後: 頭部 A は v_A、尾部 B は v_B) */
const figRocket = () => {
  let s = jp(8, 30, '分離前', { color: C.label }) + jp(8, 130, '分離後', { color: C.label });
  const body = (x, y, w, name) => `<rect x="${x}" y="${y}" width="${w}" height="30" fill="#fff" stroke="${C.ink}" stroke-width="2.2"/>` + L(x + w / 2, y + 22, name, C.ink, 'middle');
  s += body(140, 50, 90, 'B') + body(230, 50, 44, 'A') + arrow(290, 65, 350, 65, { w: 2.2 }) + L(322, 48, 'v', C.ink, 'middle');
  s += body(100, 150, 90, 'B') + body(330, 150, 44, 'A');
  s += arrow(200, 165, 245, 165, { w: 2.2 }) + L(222, 148, T`v_B`, C.ink, 'middle') + arrow(384, 165, 444, 165, { w: 2.2 }) + L(414, 148, T`v_A`, C.ink, 'middle');
  s += arrow(8, 205, 70, 205, { w: 1.8 }) + jp(78, 212, 'ロケットの進む向きが正', { size: JS });
  return figure(470, 230, s);
};

/** 大問3(1): 床ではねかえる小球(落下 → 衝突直前 14 m/s → 直後 7.0 m/s → 上昇) */
const figBounce = () => {
  const fy = 260;
  let s = line(20, fy, 380, fy, { color: C.wall, w: 3 });
  s += ball(90, 46, 12) + line(90, 60, 90, fy - 30, { w: 1.1, dash: '5 4' }) + L(60, 150, 'h', C.ink, 'end');
  s += line(72, 46, 72, fy, { w: 1.4 });
  s += ball(110, fy - 18, 12) + arrow(110, fy - 60, 110, fy - 34, { w: 2.2 });
  s += L(122, fy - 46, T`14\ \mathrm{m/s}`) + jp(70, 24, '落下', { color: C.label });
  s += ball(290, fy - 18, 12) + arrow(290, fy - 34, 290, fy - 76, { w: 2.2 }) + L(302, fy - 52, T`7.0\ \mathrm{m/s}`);
  s += ball(290, fy - 18 - 66, 12, { color: '#fff' }) + line(250, fy - 84, 250, fy, { w: 1.4 }) + L(240, fy - 40, T`h'`, C.ink, 'end') + jp(250, 24, 'はね上がり', { color: C.label });
  s += jp(206, 288, '上向きを正とする', { anchor: 'middle', size: JS });
  return figure(400, 300, s);
};

/** 大問5: 台車 A がばねつきの台車 B に衝突する。①接触前 ②ばねが最大に縮んだ(両台車の速度が等しい) ③ A がばねから離れた後 */
const cart = (x, y, w, name) => `<rect x="${x}" y="${y - 30}" width="${w}" height="30" fill="#fff" stroke="${C.ink}" stroke-width="2.2"/>` + circ(x + 14, y + 5, 7, { w: 2 }) + circ(x + w - 14, y + 5, 7, { w: 2 }) + L(x + w / 2, y - 8, name, C.ink, 'middle');
const springH = (x1, x2, y, turns = 7, amp = 9) => {
  const pts = [[x1, y], [x1 + 4, y]]; const a = x1 + 4, b = x2 - 4, n = turns * 2;
  for (let i = 1; i < n; i++) pts.push([a + ((b - a) * i) / n, y + (i % 2 ? -amp : amp)]);
  pts.push([x2 - 4, y], [x2, y]);
  return curve(pts, { w: 2 });
};
const figCarts = () => {
  let s = line(10, 78, 500, 78, { color: C.wall, w: 2 }) + line(10, 178, 500, 178, { color: C.wall, w: 2 }) + line(10, 278, 500, 278, { color: C.wall, w: 2 });
  // ① 接触前
  s += jp(8, 20, '①', { color: C.label }) + cart(60, 70, 90, 'A') + arrow(160, 52, 230, 52, { w: 2.2 }) + L(194, 36, T`v_0`, C.ink, 'middle');
  s += springH(300, 360, 55) + cart(360, 70, 100, 'B') + L(300, 44, 'k', C.ink, 'middle');
  // ② 最大に縮んだ。速度は共通 V、縮みは x
  s += jp(8, 120, '②', { color: C.label }) + cart(170, 170, 90, 'A') + springH(260, 308, 155, 7, 10) + cart(308, 170, 100, 'B');
  s += arrow(180, 124, 230, 124, { w: 2.2 }) + L(206, 110, 'V', C.ink, 'middle') + arrow(330, 124, 380, 124, { w: 2.2 }) + L(356, 110, 'V', C.ink, 'middle');
  s += line(260, 196, 260, 210, { w: 1.4 }) + line(300, 196, 300, 210, { w: 1.4 }) + line(260, 203, 300, 203, { w: 1.4 }) + L(280, 228, 'x', C.ink, 'middle');
  // ③ ばねから離れた後(速度は右向きを正の向きにとる)
  s += jp(8, 220, '③', { color: C.label }) + cart(60, 270, 90, 'A') + arrow(160, 252, 220, 252, { w: 2.2 }) + L(190, 236, T`v_A'`, C.ink, 'middle');
  s += springH(300, 360, 255) + cart(360, 270, 100, 'B') + arrow(470, 252, 530, 252, { w: 2.2 }) + L(500, 236, T`v_B'`, C.ink, 'middle');
  return figure(560, 300, s);
};

// ============ 答案 ============
const body = [
  // ---------------- 大問1 ----------------
  qa('1 (1)', {
    genshou: [fig(figBat(), { cap: 'ボール(質量 $0.30\\ \\mathrm{kg}$)は、右へ $30\\ \\mathrm{m/s}$ で飛んできて、左へ $40\\ \\mathrm{m/s}$ で打ち返された' }),
      p('右向きを正とすると、衝突前の速度は $+30\\ \\mathrm{m/s}$、衝突後は $-40\\ \\mathrm{m/s}$.')],
    kaihou: p('[[ボールが受けた力積の大きさと向き]] → 力積は運動量の変化に等しい(力積と運動量の関係).'),
    tate: [head('力積と運動量の関係(右向きを正)', '$I$:ボールが受けた力積'),
      eq(T`${U('I')}_{\displaystyle\text{力積}} = ${U('0.30\\times(-40)')}_{\\displaystyle\\text{衝突後の運動量}} - ${U('0.30\\times30')}_{\\displaystyle\\text{衝突前の運動量}}`.replace(/\\\\/g, '\\'))],
    keisan: eq(T`I = -12 - 9.0 = -21`),
    ans: eq(T`I = -21\ [\mathrm{N\cdot s}]`, { ther: true }),
    gimmi: p('$I < 0$ なので、向きは左向き(はね返した向き). 大きさは $21\\ \\mathrm{N\\cdot s}$.'),
  }),

  qa('(2)', {
    genshou: p('バットがボールに力を加えている間(接触時間 $0.010\\ \\mathrm{s}$)の、平均の力を求める.'),
    kaihou: p('[[接触時間を 0.010 s]]、[[平均の力]] → 力積は「力 × 時間」(力積の大きさ $= F\\,t$).'),
    tate: [head('力積と力の関係', '$F$:平均の力の大きさ'), eq(T`${U('21')}_{\displaystyle\text{力積の大きさ}} = F \times ${U('0.010')}_{\displaystyle\text{接触時間}}`)],
    keisan: eq(T`F = \frac{21}{0.010}`),
    ans: eq(T`F = 2.1\times10^3\ [\mathrm{N}]`, { ther: true }),
    gimmi: p('ボールの重さは $0.30 \\times 9.8 \\approx 2.9\\ \\mathrm{N}$ で、$F$ に比べてはるかに小さい. 衝突の間の重力は無視してよい.'),
  }),

  qa('(3)', {
    genshou: p('ボールの運動量の変化(力積)は (1) のまま変わらない. 平均の力を半分にしたときの接触時間 $t\'$ を求める.'),
    kaihou: p('[[平均の力の大きさを半分]] → 力積 $I = F\\,t$ は一定なので、$F$ と $t$ は反比例する.'),
    tate: [head('力積が等しい', "$t'$:力を半分にしたときの接触時間"),
      eq(T`${U('F\\,t')}_{\\displaystyle\\text{もとの力積}} = ${U(T`\frac{F}{2}\,t'`)}_{\displaystyle\text{力を半分にしたときの力積}}`.replace(/\\\\/g, '\\'))],
    keisan: eq(T`t' = 2t`),
    ans: eq(T`2\ \text{倍}`, { ther: true }),
    gimmi: p('力が半分なら、同じ力積を与えるのに時間が 2 倍かかる(力 × 時間が一定).'),
  }),

  qa('(4)', {
    genshou: [fig(figVec(), { cap: '衝突前の運動量 $p$(右向き)、衝突後の運動量 $p\'$(上向き)、力積 $I = p\' - p$' }),
      p('ボールは右へ $30\\ \\mathrm{m/s}$ で飛んできて、上向きに同じ速さ $30\\ \\mathrm{m/s}$ で飛んでいく(向きだけが変わる).')],
    kaihou: p('[[図の上向きに90°方向を変えて同じ速さ]] → 力積は運動量の変化(ベクトルの差). 速さが同じでも、向きが変わるので力積は 0 ではない. 右向き・上向きの成分に分けて求める.'),
    tate: [head('力積と運動量の関係(右向き・上向きを正)', '$I_x$, $I_y$:力積の右向き成分、上向き成分'),
      eq(T`I_x = ${U('0')}_{\displaystyle\text{後(右向き成分)}} - ${U('0.30\\times30')}_{\\displaystyle\\text{前(右向き成分)}}`.replace(/\\\\/g, '\\')),
      eq(T`I_y = ${U('0.30\\times30')}_{\\displaystyle\\text{後(上向き成分)}} - ${U('0')}_{\\displaystyle\\text{前(上向き成分)}}`.replace(/\\\\/g, '\\'))],
    keisan: [eq(T`I_x = -9.0,\quad I_y = +9.0`),
      eq(T`|I| = \sqrt{I_x^{\,2} + I_y^{\,2}} = 9.0\sqrt{2} = 9.0\times1.41 = 12.69`)],
    ans: eq(T`|I| \approx 13\ [\mathrm{N\cdot s}]\quad\text{(向き:左上 45°)}`, { ther: true }),
    gimmi: p('左向きの成分と上向きの成分が等しいので、向きは左上 45°. 有効数字 2 桁で 13.'),
  }),

  // ---------------- 大問2 ----------------
  qa('2 (1)', {
    genshou: [fig(figColl({ names: ['A', 'B'], masses: [T`2.0\ \mathrm{kg}`, T`6.0\ \mathrm{kg}`], before: [75, 30], after: [30, 45], labelsB: [T`5.0`, T`2.0`], labelsA: [T`v_A'`, T`3.0`] }), { cap: '一直線上の衝突(速さの単位は $\\mathrm{m/s}$)。A の進む向きを正とする' }),
      p('2 物体が同じ向きに進み、A が B に追いついて衝突する.')],
    kaihou: p('[[一直線上を運動する物体A, Bが衝突]] → 外力がなく、衝突の前後で運動量の和が保存する.'),
    tate: [head('運動量保存則(A の進む向きを正)', "$v_A'$:衝突後の A の速度"),
      eq(T`${U('2.0\\times5.0 + 6.0\\times2.0')}_{\\displaystyle\\text{衝突前}} = ${U("2.0\\,v_A' + 6.0\\times3.0")}_{\\displaystyle\\text{衝突後}}`.replace(/\\\\/g, '\\'))],
    keisan: eq(T`22 = 2.0\,v_A' + 18`),
    ans: eq(T`v_A' = 2.0\ [\mathrm{m/s}]`, { ther: true }),
    gimmi: p(T`衝突後の速さは A($2.0$)が B($3.0$)より小さく、B が先に離れていく. 反発係数 $e = \frac{3.0 - 2.0}{5.0 - 2.0} = \frac{1}{3}$ で $0 \le e \le 1$ を満たす.`),
  }),

  qa('(2)', {
    genshou: [fig(figRocket(), { cap: 'ロケットが、頭部 A と尾部 B に分離する。進む向きを正とする' }),
      p('B は、A に対して後方へ速さ $u$ で分離する.')],
    kaihou: p('[[尾部Bを頭部Aに対する相対的な速さu[m/s]で後方に分離]] → A から見た B の速度が $-u$ (後ろ向き) → 相対速度の式.'),
    tate: [head('相対速度の式(進む向きを正)'), eq(T`${U('v_B - v_A')}_{\displaystyle\text{A から見た B の速度}} = -u`)],
    keisan: '—',
    ans: eq(T`v_B = v_A - u`, { ther: true }),
    gimmi: p('B は A より後ろへ離れるので $v_B < v_A$ になる. $u = 0$ なら $v_B = v_A$(分離しない).'),
  }),

  qa('(3)', {
    genshou: p('分離は一瞬で、外力の影響を考えない. 分離の前後の運動量が保存する.'),
    kaihou: p('[[ロケットから尾部Bを…一瞬のうちに分離]] → 運動量保存則と、(2) の相対速度の式を連立して $v_B$ を消去する.'),
    tate: [head('運動量保存則(進む向きを正)'), eq(T`${U('(m+M)\\,v')}_{\\displaystyle\\text{分離前}} = ${U('m\\,v_A + M\\,v_B')}_{\\displaystyle\\text{分離後}}`.replace(/\\\\/g, '\\'))],
    keisan: [eq(T`(m+M)v = m\,v_A + M(v_A - u) = (m+M)\,v_A - Mu`)],
    ans: eq(T`v_A = v + \frac{M}{m+M}\,u`, { lead: '(2) の $v_B = v_A - u$ を代入して', ther: true }),
    gimmi: p(T`$u = 0$ で $v_A = v$. $v_A > v$ なので、頭部は加速する. また $v_B = v - \frac{m}{m+M}u < v$ で、B は減速する(質量の大きい B のほうが速さの変化は小さい).`),
  }),

  // ---------------- 大問3 ----------------
  qa('3 (1)(a)', {
    genshou: [fig(figBounce(), { cap: '小球を高さ $h$ から自由落下させ、床ではね返って高さ $h\'$ まで上がる。上向きを正とする' }),
      p('衝突の直前は下向きに $14\\ \\mathrm{m/s}$、直後は上向きに $7.0\\ \\mathrm{m/s}$.')],
    kaihou: p('[[水平な床ではねかえり]] → 床は静止しているので、反発係数は「衝突前後の速さの比」(はねかえりの式).'),
    tate: [head('はねかえりの式(上向きを正)'), eq(T`e = -\frac{(+7.0) - 0}{(-14) - 0}`)],
    keisan: '—',
    ans: eq(T`e = 0.50`, { ther: true }),
    gimmi: p('$0 \\le e \\le 1$ を満たす.'),
  }),

  qa('(b)', {
    genshou: p('小球は静かに(初速 0 で)自由落下し、衝突の直前に $14\\ \\mathrm{m/s}$ に達する.'),
    kaihou: p('[[高さh[m]の所から小球を自由落下]]、[[小球の速さは衝突の直前が14m/s]] → 等加速度運動の式 $v^2 - v_0^{\\,2} = 2ax$(時間を使わない).'),
    tate: [head('等加速度運動の式(下向きを正)'), eq(T`${U('14^2 - 0^2')}_{\\displaystyle\\text{速さの2乗の変化}} = ${U('2\\times9.8\\times h')}_{\\displaystyle\\text{2 × 加速度 × 距離}}`.replace(/\\\\/g, '\\'))],
    keisan: eq(T`h = \frac{14^2}{2\times9.8} = \frac{196}{19.6}`),
    ans: eq(T`h = 10\ [\mathrm{m}]`, { ther: true }),
    gimmi: p('エネルギー保存則 $mgh = \\frac{1}{2}mv^2$ でも同じ結果になる.'),
  }),

  qa('(c)', {
    genshou: p('はね上がった小球は、$7.0\\ \\mathrm{m/s}$ で上へ動き出し、最高点 $h\'$ で速さが 0 になる.'),
    kaihou: p('[[高さh\'[m]は、hの何倍]] → はね上がりも等加速度運動(上向きに初速 $7.0$、加速度は $-9.8$).'),
    tate: [head('等加速度運動の式(上向きを正)'), eq(T`${U('0^2 - 7.0^2')}_{\\displaystyle\\text{速さの2乗の変化}} = ${U("2\\times(-9.8)\\times h'")}_{\\displaystyle\\text{2 × 加速度 × 距離}}`.replace(/\\\\/g, '\\'))],
    keisan: [eq(T`h' = \frac{7.0^2}{2\times9.8} = 2.5`), eq(T`\frac{h'}{h} = \frac{2.5}{10} = \frac{1}{4}`)],
    ans: eq(T`\frac{1}{4}\ \text{倍}`, { ther: true }),
    gimmi: p('速さが $e = 0.50$ 倍なので、高さは $e^2 = 0.25$ 倍. (a) の結果と合う.'),
  }),

  qa('(2)(a)', {
    genshou: [fig(figColl({ names: ['P', 'Q'], masses: [T`4.0\ \mathrm{kg}`, T`m`], before: [63, -42], after: [-24, 14], labelsB: [T`21`, T`14`], labelsA: [T`3.0`, T`2.0`] }), { cap: '右向きを正とする。P は右へ $21$、Q は左へ $14$。衝突後は P は左へ $3.0$、Q は右へ $2.0$' })],
    kaihou: p('[[一直線上を…質点Pと…質点Qが衝突]] → 運動量保存則(右向きを正).'),
    tate: [head('運動量保存則(右向きを正)', '$m$:Q の質量'),
      eq(T`${U('4.0\\times21 + m\\times(-14)')}_{\\displaystyle\\text{衝突前}} = ${U('4.0\\times(-3.0) + m\\times2.0')}_{\\displaystyle\\text{衝突後}}`.replace(/\\\\/g, '\\'))],
    keisan: [eq(T`84 - 14m = -12 + 2m`), eq(T`16m = 96`)],
    ans: eq(T`m = 6.0\ [\mathrm{kg}]`, { ther: true }),
    gimmi: p('質量は正. 左向きの速度は負の符号で式に入れている.'),
  }),

  qa('(b)', {
    genshou: p('(a) で $m$ が分かったので、反発係数を求められる.'),
    kaihou: p('[[質点PとQとの間の反発係数e]] → はねかえりの式(相対速度の比).'),
    tate: [head('はねかえりの式(右向きを正)'), eq(T`e = -\frac{(-3.0) - (+2.0)}{(+21) - (-14)}`)],
    keisan: eq(T`e = \frac{5.0}{35}`),
    ans: eq(T`e = \frac{1}{7}\ (\approx 0.14)`, { ther: true }),
    gimmi: p('$0 \\le e \\le 1$ を満たす(1 を超えたら、エネルギーが増える矛盾).'),
  }),

  qa('(3)(a)', {
    genshou: [fig(figC(), { cap: '小球が、なめらかな壁(水平な線)に 60° で衝突し、壁と 30° の向きにはね返る。速度を壁に平行な成分と垂直な成分に分ける(壁に平行な成分=朱、垂直な成分=青)' }),
      p('壁がなめらかなので、壁に沿う方向には力がはたらかない.')],
    kaihou: p('[[なめらかな壁]] → 壁に平行な方向の力積は 0 → 壁に平行な速さは変化しない.'),
    tate: [head('壁に平行な方向の速さは不変', '$v$:衝突後の速さ'),
      eq(T`${U('v_0\\cos60^\\circ')}_{\\displaystyle\\text{衝突前(平行成分)}} = ${U('v\\cos30^\\circ')}_{\\displaystyle\\text{衝突後(平行成分)}}`.replace(/\\\\/g, '\\'))],
    keisan: eq(T`\frac{1}{2}v_0 = \frac{\sqrt{3}}{2}\,v`),
    ans: eq(T`v = \frac{v_0}{\sqrt{3}}\ \left(= \frac{\sqrt{3}}{3}\,v_0\right)`, { ther: true }),
    gimmi: p('$v < v_0$ で、壁に垂直な成分が小さくなるぶん、速さが減っている.'),
  }),

  qa('(b)', {
    genshou: p('壁に垂直な成分だけが、はねかえりの式に入る.'),
    kaihou: p('[[小球と壁との間の反発係数e]] → 壁に垂直な方向の速さの比.'),
    tate: [head('はねかえりの式(壁に垂直な成分)'), eq(T`e = \frac{v\sin30^\circ}{v_0\sin60^\circ}`)],
    keisan: eq(T`e = \frac{\dfrac{v_0}{\sqrt{3}}\cdot\dfrac{1}{2}}{v_0\cdot\dfrac{\sqrt{3}}{2}}`.replace(/\\dfrac/g, '\\frac')),
    ans: eq(T`e = \frac{1}{3}`, { ther: true }),
    gimmi: p('$0 \\le e \\le 1$ を満たす.'),
  }),

  qa('(c)', {
    genshou: p('力積は、壁に垂直な方向にだけ生じる(壁に平行な方向の力積は 0).'),
    kaihou: p('[[小球が壁から受けた力積の大きさ]] → 壁に垂直な方向の運動量の変化(力積と運動量の関係).'),
    tate: [head('力積と運動量の関係(壁に垂直な方向。壁から離れる向きを正)'),
      eq(T`I = ${U('m\\,v\\sin30^\\circ')}_{\\displaystyle\\text{衝突後}} - ${U('(-m\\,v_0\\sin60^\\circ)')}_{\\displaystyle\\text{衝突前}}`.replace(/\\\\/g, '\\'))],
    keisan: eq(T`I = m\,v_0\left(\frac{1}{2\sqrt{3}} + \frac{\sqrt{3}}{2}\right) = m\,v_0\cdot\frac{1 + 3}{2\sqrt{3}}`),
    ans: eq(T`I = \frac{2}{\sqrt{3}}\,m\,v_0\ \left(= \frac{2\sqrt{3}}{3}\,m\,v_0\right)`, { ther: true }),
    gimmi: p(T`$I = (1 + e)\,m\,v_0\sin60^\circ = \frac{4}{3}\cdot\frac{\sqrt{3}}{2}\,m\,v_0 = \frac{2\sqrt{3}}{3}\,m\,v_0$ と一致する.`),
  }),

  // ---------------- 大問5 ----------------
  qa('5 (1)', {
    genshou: [fig(figCarts(), { cap: '①接触前 → ②ばねが最大に縮んだ(両台車の速度が等しい)→ ③ A がばねから離れた後。右向きを正とする' }),
      p('台車 A がばねに接触している間、ばねは A と B の両方に力を及ぼす.')],
    kaihou: p('[[台車Aと台車Bが及ぼしあう弾性力]] → 作用・反作用の内力. A と B をまとめて見ると、水平方向の外力はない → 運動量が保存する.'),
    tate: '—',
    keisan: '—',
    ans: eq(T`\text{ア}`, { ther: true }),
    gimmi: p('イ・エのように「運動量が保存されない」のは、外力がはたらくときだけ. ばねの力は A・B の間の内力なので、ア.'),
  }),

  qa('(2)', {
    genshou: p('台車 A は右へ動き、ばねを縮める. A が受ける力は、重力・垂直抗力(どちらも鉛直方向)と、ばねの弾性力(水平方向、左向き).'),
    kaihou: p('[[それぞれの力がする仕事は、0、正、負のいずれか]] → 仕事 $W = F\\,x\\cos\\theta$ の符号は、力の向きと変位の向きで決まる.'),
    tate: [p('重力・垂直抗力:鉛直方向の力で、変位は水平 → 力と変位が垂直 → 仕事は 0'),
      p('弾性力:左向き、A の変位は右向き → 力と変位が逆向き → 仕事は負')],
    keisan: '—',
    ans: p('重力 $0$、垂直抗力 $0$、弾性力 $-$'),
    gimmi: p('A の運動エネルギーは減る(ばねに弾性エネルギーとして蓄えられる)ので、弾性力の仕事が負でつじつまが合う.'),
  }),

  qa('(3)', {
    genshou: p('台車 A, B とばねをまとめた全体のエネルギーを考える.'),
    kaihou: p('[[台車Aがばねと接触しているとき…エネルギー]] → なめらかな水平面で、仕事をするのは弾性力(保存力)だけ → A・B・ばね全体の力学的エネルギーが保存する.'),
    tate: '—',
    keisan: '—',
    ans: eq(T`\text{ア}`, { ther: true }),
    gimmi: p('A のエネルギーだけ、B とばねだけ、は保存しない(エネルギーが行き来する). 全体なら保存する.'),
  }),

  qa('(4)', {
    genshou: p('ばねが最も縮んだとき、A と B の速度が等しい(相対速度が 0). この共通の速度を $V$ とする.'),
    kaihou: p('[[衝突後、両台車の速度が等しくなったとき]] → 運動量保存則(外力なし).'),
    tate: [head('運動量保存則(右向きを正)'), eq(T`${U('m\\,v_0 + M\\cdot0')}_{\\displaystyle\\text{はじめ}} = ${U('(m+M)\\,V')}_{\\displaystyle\\text{最も縮んだとき}}`.replace(/\\\\/g, '\\'))],
    keisan: '—',
    ans: eq(T`V = \frac{m}{m+M}\,v_0`, { ther: true }),
    gimmi: p('$V < v_0$(質量が増えるので速さは小さくなる).'),
  }),

  qa('(5)', {
    genshou: p('最も縮んだとき(縮み $x$)は、A と B が同じ速度 $V$. 摩擦はなく、弾性力だけが仕事をする.'),
    kaihou: p('[[ばねの縮みの最大値x]] → 力学的エネルギー保存則((3) より、A・B・ばね全体で保存). (4) の $V$ を使う.'),
    tate: [head('力学的エネルギー保存則(A + B + ばね)'),
      eq(T`${U(T`\frac{1}{2}m\,v_0^{\,2}`)}_{\displaystyle\text{はじめ}} = ${U(T`\frac{1}{2}(m+M)\,V^2`)}_{\displaystyle\text{運動エネルギー}} + ${U(T`\frac{1}{2}k\,x^2`)}_{\displaystyle\text{弾性エネルギー}}`)],
    keisan: [eq(T`k\,x^2 = m\,v_0^{\,2} - (m+M)\left(\frac{m\,v_0}{m+M}\right)^2 = m\,v_0^{\,2} - \frac{m^2\,v_0^{\,2}}{m+M}`),
      eq(T`k\,x^2 = \frac{mM}{m+M}\,v_0^{\,2}`)],
    ans: eq(T`x = v_0\sqrt{\frac{mM}{k(m+M)}}`, { ther: true }),
    gimmi: p('$x > 0$. $M \\to \\infty$(B が動かない壁)のとき $x = v_0\\sqrt{\\frac{m}{k}}$ となり、壁にばねを付けた場合の単振動の振幅と一致する.'),
  }),

  qa('(6)', {
    genshou: p('A がばねから離れたあとの速度を $v_A\'$、B の速度を $v_B\'$ とする(右向きを正). ばねは自然長にもどっていて、弾性エネルギーは 0.'),
    kaihou: p('[[2物体の衝突の前後とみなせる]] → 衝突の前後で、運動量が保存し、力学的エネルギーも保存する(ばねの力は保存力) → 反発係数 $e$ を、はねかえりの式で求める.'),
    tate: [head('運動量保存則・エネルギー保存則・はねかえりの式', "$v_A'$, $v_B'$:A がばねから離れたあとの A, B の速度"),
      eq(T`m\,v_0 = m\,v_A' + M\,v_B'`, { no: '①' }),
      eq(T`\frac{1}{2}m\,v_0^{\,2} = \frac{1}{2}m\,v_A'^{\,2} + \frac{1}{2}M\,v_B'^{\,2}`, { no: '②' }),
      eq(T`e = -\frac{v_A' - v_B'}{v_0 - 0}`)],
    keisan: [eq(T`v_A' = \frac{m-M}{m+M}\,v_0,\qquad v_B' = \frac{2m}{m+M}\,v_0`, { lead: '①, ② より' }),
      eq(T`e = -\frac{\dfrac{m-M}{m+M} - \dfrac{2m}{m+M}}{1}\,= \frac{M + m}{m+M}`.replace(/\\dfrac/g, '\\frac'))],
    ans: eq(T`e = 1`, { ther: true }),
    gimmi: p('ばねは弾性体で、エネルギーが失われないので、完全弾性衝突($e = 1$)になる. ($e \\le 1$ の上限).'),
  }),
].join('\n');

const html = page({
  title: '2026 運動量・衝突の問題集(大問1, 2, 3, 5)模範解答',
  lead: '大問4(P が Q の上をすべる)は、別ファイル(2026-sample-4)にある. 大問ごとに、小問を 現象・解法・立式・計算・答・吟味 の順に書く.',
  body,
});
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), MODE === 'show' ? 'set1-impulse-collision.html' : `set1-impulse-collision.${MODE}.html`);
fs.writeFileSync(out, html);
console.log('wrote', out);
