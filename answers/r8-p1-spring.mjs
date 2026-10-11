// R-8 理科(物理) 大問1(ばねと板 A、小球 B・C: つりあい・衝突・単振動)の模範解答。
// 実行: node answers/r8-p1-spring.mjs        → answers/r8-p1-spring.html(途中式つき)
//       node answers/r8-p1-spring.mjs none   → answers/r8-p1-spring.none.html(答案だけ)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C, tex, arrow, accel, force, line, box, ball, dot, floor, jp, curve, circ, vdim, figure, FS, JS } from '../tools/draw.mjs';
import { setCalc, page, qa, head, eq, p, note, fig } from '../tools/answer.mjs';

const MODE = process.argv[2] ?? 'show';
setCalc(MODE);
const T = String.raw;
const L = (x, y, src, color = C.ink, anchor = 'start') => tex(x, y, src, { color, anchor });

// ============ 作図部品: ばね・板・小球(鉛直下向きが x の正) ============
/** ばね(コイル)。中心 x、上端 y1、下端 y2 */
const spring = (x, y1, y2, { turns = 8, amp = 15 } = {}) => {
  const pts = [[x, y1], [x, y1 + 6]];
  const a = y1 + 6, b = y2 - 6, n = turns * 2;
  for (let i = 1; i < n; i++) pts.push([x + (i % 2 ? amp : -amp), a + ((b - a) * i) / n]);
  pts.push([x, y2 - 6], [x, y2]);
  return curve(pts, { color: C.ink, w: 2 });
};
/** 板 A(厚さを無視できる板)。中心 (x, y) */
const plate = (x, y) => box(x - 30, y - 4, 60, 8, { fill: '#BDBDBD', sw: 2 });
/** ばねと板の1本。floorY は床、level は板の位置 */
const column = (x, level, floorY = 320) => spring(x, level + 4, floorY) + plate(x, level);

/** 左の x 軸(下向き)と、0・x₀・x₃ などの高さの点線 */
function axis(levels, x0 = 42, xEnd = 540, top = 24, bottom = 300) {
  let s = arrow(x0, top, x0, bottom, { w: 1.6 }) + L(x0 + 8, bottom, 'x');
  for (const [y, lab] of levels) {
    s += line(x0 - 5, y, xEnd, y, { w: 1.1, dash: '5 4' }) + L(x0 - 10, y + 7, lab, C.ink, 'end');
  }
  return s;
}

// ---- 図1: 板 A とばねのつりあい。重力 mg は重心、ばねの力 kx₀ は板の下面(接点)から、重ならないようにずらす ----
const figEquilibrium = () => {
  const yN = 70, y0 = 130, cx = 150;
  let s = axis([[yN, '0'], [y0, T`x_0`]], 42, 270) + floor(80, 220, 322) + column(cx, y0, 322);
  s += force(cx - 16, y0, cx - 16, y0 + 56) + dot(cx - 16, y0, 3) + L(cx - 24, y0 + 40, 'mg', C.force, 'end');
  s += force(cx + 16, y0 + 4, cx + 16, y0 - 52) + dot(cx + 16, y0 + 4, 3) + L(cx + 24, y0 - 40, T`kx_0`, C.force);
  s += L(cx + 40, y0 + 8, T`\text{板 A}`);
  return figure(280, 350, s);
};

// ---- 図2: 小球 B の運動。①射出(x₀ から h 上、速さ v₀)→ ②衝突直前(v₁)→ ③衝突直後(一体、v₂)→ ④最下点 x₃(止) ----
const figBall = () => {
  const yN = 70, y0 = 130, y3 = 200, floorY = 318, xs = [130, 245, 360, 475];
  let s = axis([[yN, '0'], [y0, T`x_0`], [y3, T`x_3`]], 42, 540, 20, 300) + floor(90, 520, floorY + 2);
  const tag = (x, n) => jp(x - 8, 34, n, { color: C.label });
  // ① B は x₀ から h だけ上。速さ v₀(下向き)
  s += column(xs[0], y0, floorY) + ball(xs[0], 50, 11) + arrow(xs[0], 66, xs[0], 100, { w: 2 }) + L(xs[0] + 10, 96, T`v_0`);
  s += vdim(xs[0] + 46, 50, y0 - 4) + L(xs[0] + 56, 94, 'h') + tag(xs[0], '①');
  // ② 板に達する直前。速さ v₁
  s += column(xs[1], y0, floorY) + ball(xs[1], y0 - 22, 11) + arrow(xs[1], y0 - 66, xs[1], y0 - 38, { w: 2 }) + L(xs[1] + 12, y0 - 44, T`v_1`) + tag(xs[1], '②');
  // ③ 衝突直後。A と B は一体、速さ v₂
  s += column(xs[2], y0, floorY) + ball(xs[2], y0 - 14, 11) + arrow(xs[2] + 26, y0 - 36, xs[2] + 26, y0 - 8, { w: 2 }) + L(xs[2] + 36, y0 - 14, T`v_2`) + tag(xs[2], '③');
  // ④ 最も縮んだ位置 x₃。速さ 0
  s += column(xs[3], y3, floorY) + ball(xs[3], y3 - 14, 11) + jp(xs[3] + 22, y3 - 8, '止', { size: JS }) + tag(xs[3], '④');
  return figure(560, 350, s);
};

// ---- 図3: 力の図(板 A と小球 C を離して描く)。加速度 a は下向き(正の向き)にとる ----
const figForces = () => {
  const cy = 150;
  let s = L(110, 40, T`\text{小球 C}`, C.ink, 'middle') + L(330, 40, T`\text{板 A}`, C.ink, 'middle');
  // 小球 C: 重力 mg(重心から)、板からの垂直抗力 F(接触面=下面から、左にずらす)
  s += ball(110, cy, 20);
  s += force(110, cy, 110, cy + 78) + dot(110, cy, 3) + L(120, cy + 80, 'mg', C.force);
  s += force(94, cy + 19, 94, cy - 64) + dot(94, cy + 19, 3) + L(86, cy - 62, 'F', C.force, 'end');
  s += accel(168, cy - 14, 168, cy + 52) + L(182, cy + 42, 'a', C.force);
  // 板 A: 重力 mg(重心から)、C から受ける力 F(上面から、下向き)、ばねの力 kx(下面から、上向き)
  s += plate(330, cy);
  s += force(330, cy, 330, cy + 78) + dot(330, cy, 3) + L(340, cy + 80, 'mg', C.force);
  s += force(306, cy - 4, 306, cy + 56) + dot(306, cy - 4, 3) + L(298, cy + 54, 'F', C.force, 'end');
  s += force(354, cy + 4,354, cy - 80) + dot(354, cy + 4, 3) + L(364, cy - 70, T`kx`, C.force);
  s += accel(400, cy - 14, 400, cy + 52) + L(414, cy + 42, 'a', C.force);
  return figure(450, 280, s);
};

// ---- 図4: 小球 C と板 A。①つりあい(x₄)→ ②手で d だけ下げて静かに離す(止)→ ③ x = 0(ばねが自然長)で C が離れる(速さ v₅、上向き) ----
const figSep = () => {
  const yN = 96, y4 = 160, y5 = 218, floorY = 330, xs = [140, 270, 400];
  let s = axis([[yN, '0'], [y4, T`x_4`], [y5, T`x_4 + d`]], 42, 520, 40, 312) + floor(100, 480, floorY + 2);
  const tag = (x, n) => jp(x - 8, 24, n, { color: C.label });
  s += column(xs[0], y4, floorY) + ball(xs[0], y4 - 14, 11) + jp(xs[0] + 22, y4 - 8, '止', { size: JS }) + tag(xs[0], '①');
  s += column(xs[1], y5, floorY) + ball(xs[1], y5 - 14, 11) + jp(xs[1] + 22, y5 - 8, '止', { size: JS }) + tag(xs[1], '②');
  s += vdim(xs[1] + 52, y4, y5) + L(xs[1] + 62, (y4 + y5) / 2 + 8, 'd');
  s += column(xs[2], yN, floorY) + ball(xs[2], yN - 14, 11) + arrow(xs[2], yN - 28, xs[2], yN - 58, { w: 2 }) + L(xs[2] + 12, yN - 36, T`v_5`) + tag(xs[2], '③');
  return figure(560, 360, s);
};

// ---- 図5: 参照円と x-t グラフ(板 A だけの単振動。1周期 T)。円は1周(ωt: 0 → 2π)、グラフは t = 0 → T ----
const figSHM = () => {
  const cx = 110, cy = 140, R = 80, gx = 290, Tpx = 210;
  let s = '';
  s += arrow(cx, cy - R - 20, cx, cy + R + 28, { w: 1.6 }) + L(cx + 10, cy + R + 28, 'x');          // x は下向きが正
  s += arrow(gx, cy - R - 20, gx, cy + R + 28, { w: 1.6 }) + L(gx + 10, cy + R + 28, 'x');
  s += arrow(gx, cy, gx + Tpx + 40, cy, { w: 1.6 }) + L(gx + Tpx + 44, cy + 18, 't');
  s += circ(cx, cy, R, { fill: 'none', color: C.target, w: 3.4 }) + dot(cx, cy, 2.5, C.ink) + jp(cx + 10, cy - 8, '中心', { size: JS });
  s += arrow(cx + R, cy - 10, cx + R, cy + 14, { color: C.target, w: 3.4 });                          // 円は1周(3 時の向きから時計まわり)
  s += line(cx, cy - R, gx + Tpx, cy - R, { w: 1.1, dash: '5 4' }) + line(cx, cy + R, gx + Tpx, cy + R, { w: 1.1, dash: '5 4' });
  const all = [];
  for (let i = 0; i <= 80; i++) { const u = i / 80; all.push([gx + Tpx * u, cy + R * Math.sin(2 * Math.PI * u)]); }
  s += curve(all, { color: C.target, w: 3.4 });
  s += jp(gx - 12, cy - R + 6, '振幅', { anchor: 'end', size: JS }) + jp(gx - 12, cy + R + 6, '振幅', { anchor: 'end', size: JS });
  s += line(gx + Tpx, cy - 5, gx + Tpx, cy + 5) + L(gx + Tpx, cy + 28, 'T', C.ink, 'middle');
  return figure(580, 290, s);
};

// ============ 答案 ============
const U = (s) => T`\underbracket[0.4pt][2pt]{${s}}`;
const body = [
  qa('問1 (1)', {
    genshou: [fig(figEquilibrium(), { cap: '板 A が受ける力(重力は重心、ばねの力は板の下面から。$x$ は鉛直下向きが正、ばねの自然長の上端が $x = 0$)' }),
      p('板 A とばねが静止している(つりあい). 板は $x_0$ にあり、ばねは自然長から $x_0$ だけ縮んでいる.')],
    kaihou: p('[[板Aとばねが静止し、つりあいの状態にあるとき]] → 板 A にはたらく力のつりあい.'),
    tate: [head('力のつりあい(板 A)'),
      eq(T`${U('0')}_{\displaystyle\text{合力}} = ${U('mg')}_{\displaystyle\text{重力(下向き)}} - ${U('kx_0')}_{\displaystyle\text{ばねの力(上向き)}}`)],
    keisan: '—',
    ans: eq(T`x_0 = \frac{mg}{k}`, { ther: true }),
    gimmi: p(T`$x_0 > 0$(縮んでいる). $\frac{mg}{k}$ の単位は $\frac{\mathrm{N}}{\mathrm{N/m}} = \mathrm{m}$ で、長さになる.`),
  }),

  qa('(2)', {
    genshou: [fig(figBall(), { cap: '①射出 → ②衝突直前 → ③衝突直後(一体)→ ④最も縮んだ位置(止)' }),
      p('小球 B は、$x_0$ から $h$ だけ上の位置から速さ $v_0$ で鉛直下向きに射出され、$x_0$ にある板 A に衝突する直前の速さが $v_1$.')],
    kaihou: p('[[小球Bを、x0から鉛直上向きに距離h[m]だけ離れた位置から速さv0[m/s]で鉛直下向きに射出]]、[[空気抵抗は無視できる]] → B は重力だけを受ける → 力学的エネルギー保存則(①と②).'),
    tate: [head('力学的エネルギー保存則(小球 B。板の位置 $x_0$ を高さの基準)'),
      eq(T`${U(T`\frac{1}{2}mv_0^2 + mgh`)}_{\displaystyle\text{①(射出直後)}} = ${U(T`\frac{1}{2}mv_1^2`)}_{\displaystyle\text{②(衝突直前)}}`)],
    keisan: eq(T`v_1^2 = v_0^2 + 2gh`),
    ans: eq(T`v_1 = \sqrt{v_0^2 + 2gh}`, { ther: true }),
    gimmi: p(T`$h = 0$ で $v_1 = v_0$ となり、合う. $h$ が大きいほど $v_1$ は大きい.`),
  }),

  qa('(3)', {
    genshou: p('B は板 A に完全非弾性衝突し、一体となって動く. 衝突の直前、A は静止している.'),
    kaihou: p('[[完全非弾性衝突(反発係数 e = 0)]]、[[板Aと一体となって運動]] → 衝突の前後で、運動量が保存する(鉛直下向きを正とする).'),
    tate: [head('運動量保存則(鉛直下向きを正)'),
      eq(T`${U('mv_1 + m\\cdot 0')}_{\displaystyle\text{衝突直前(B と A)}} = ${U('(m+m)\\,v_2')}_{\displaystyle\text{衝突直後(一体)}}`)],
    keisan: eq(T`2m\,v_2 = m\,v_1`),
    ans: eq(T`v_2 = \frac{v_1}{2}`, { ther: true }),
    gimmi: p(T`質量が 2 倍になるので、速さは半分になる($v_2 < v_1$).`),
  }),

  qa('(4)', {
    genshou: p('衝突の前後で、運動エネルギーが失われる. 衝突の間に、位置は変わらない(位置エネルギーは変わらない).'),
    kaihou: p('[[衝突の前後で失われる力学的エネルギー]] → 衝突直前と直後の運動エネルギーの差.'),
    tate: [head('運動エネルギーの減少', '$\\Delta E$:失われる力学的エネルギー'),
      eq(T`\Delta E = ${U(T`\frac{1}{2}mv_1^2`)}_{\displaystyle\text{衝突直前}} - ${U(T`\frac{1}{2}(2m)\,v_2^2`)}_{\displaystyle\text{衝突直後}}`)],
    keisan: eq(T`\Delta E = \frac{1}{2}mv_1^2 - m\left(\frac{v_1}{2}\right)^2 = \frac{1}{2}mv_1^2 - \frac{1}{4}mv_1^2`),
    ans: eq(T`\Delta E = \frac{1}{4}mv_1^2`, { ther: true }),
    gimmi: p(T`衝突直前の運動エネルギー $\frac{1}{2}mv_1^2$ の、ちょうど半分が失われる(同じ質量で $e = 0$).`),
  }),

  qa('(5)', {
    genshou: [p('A と B は一体のまま(質量 $2m$)、衝突直後の位置 $x_0$ から速さ $v_2$ で下向きに動き、ばねを縮める. 最も下の位置 $x_3$ で速さが 0 になる(図の③ → ④).')],
    kaihou: p('[[ばねは縮み、板Aと小球Bは一体のまま、座標x3[m]で速さが0m/sとなった]] → 重力とばねの力だけが仕事をする → 力学的エネルギー保存則(③と④). 重力の位置エネルギーは、$x$ を下向きにとるので $-2mg\\,x$.'),
    tate: [head('力学的エネルギー保存則(板 A + 小球 B)'),
      eq(T`${U(T`\frac{1}{2}(2m)v_2^2 + \frac{1}{2}kx_0^2 - 2mg\,x_0`)}_{\displaystyle\text{③(衝突直後)}} = ${U(T`0 + \frac{1}{2}kx_3^2 - 2mg\,x_3`)}_{\displaystyle\text{④(最下点)}}`)],
    keisan: [eq(T`x_0 = \frac{mg}{k}\ \text{を代入して整理すると}\quad kx_3^2 - 4mg\,x_3 - 2mv_2^2 + \frac{3m^2g^2}{k} = 0`),
      eq(T`x_3 = \frac{2mg \pm \sqrt{m^2g^2 + 2mk\,v_2^2}}{k}`)],
    ans: eq(T`x_3 = \frac{2mg + \sqrt{m^2g^2 + 2mk\,v_2^2}}{k}`, { lead: '$x_3 > x_0$ より、+ の解', ther: true }),
    gimmi: [p(T`解が 2 つ. $-$ の解は $x_3 < \frac{mg}{k} = x_0$ となり、「縮んで最も下にきた位置」にならない → $+$ の解.`),
      p(T`$v_2 = 0$ のとき $x_3 = \frac{3mg}{k}$. つりあいの位置 $\frac{2mg}{k}$ から振幅 $\frac{mg}{k}$ だけ下がった位置と一致する.`)],
  }),

  qa('問2 (6)', {
    genshou: [fig(figForces(), { cap: '板 A と小球 C を離して描く。加速度 $a$ は下向き(正の向き)にとる' }),
      p('板 A と小球 C は一体で運動している. 座標 $x$ のとき、ばねは自然長から $x$ だけ縮んでいる.')],
    kaihou: p('[[任意の座標x[m]における板Aと小球Cの加速度をa[m/s²](鉛直下向きを正とする)]]、[[板Aと小球Cの間に作用する垂直抗力の大きさをF[N]]] → 板 A にはたらく力を、下向きを正として足して、運動方程式.'),
    tate: [head('運動方程式(板 A。鉛直下向きを正)'),
      eq(T`ma = ${U('mg')}_{\displaystyle\text{重力(下向き)}} + ${U('F')}_{\displaystyle\text{C から(下向き)}} - ${U('kx')}_{\displaystyle\text{ばねの力(上向き)}}`)],
    keisan: '—',
    ans: eq(T`ma = mg + F - kx`, { ther: true }),
    gimmi: p('$x < 0$(ばねが伸びている)のときは $-kx > 0$ となり、ばねの力は下向きになる. 符号は自動的に合っている.'),
  }),

  qa('(7)', {
    genshou: p('小球 C は、重力と、板 A から受ける垂直抗力 $F$ だけを受けている(図の左).'),
    kaihou: p('小球 C の運動方程式を、下向きを正として立てる.'),
    tate: [head('運動方程式(小球 C。鉛直下向きを正)'),
      eq(T`ma = ${U('mg')}_{\displaystyle\text{重力(下向き)}} - ${U('F')}_{\displaystyle\text{A から(上向き)}}`)],
    keisan: '—',
    ans: eq(T`ma = mg - F`, { ther: true }),
    gimmi: p('つりあいのとき($a = 0$)は $F = mg$ となり、板が C を支える力になっている.'),
  }),

  qa('(8)', {
    genshou: p('$d$ が十分大きいと、ばねが伸びきる前に、C が A から離れる瞬間がくる.'),
    kaihou: p('[[小球Cは板Aから離れて飛び出す]] → 垂直抗力は、板が C を押す力だけで、引く力にはならない. 離れる瞬間は、板が C を押す力がちょうど 0.'),
    tate: '—',
    keisan: '—',
    ans: eq(T`F = 0`, { ther: true }),
    gimmi: p('$F \\ge 0$ の間は接触していて、$F$ が 0 になった瞬間に離れる(その先は $F < 0$ になってしまうので接触できない).'),
  }),

  qa('(9)', {
    genshou: p('$F = 0$ の瞬間の座標 $x$ を求める.'),
    kaihou: p('(7) に $F = 0$ を入れて $a$ を求め、(6) に代入する.'),
    tate: [head('運動方程式(小球 C、板 A)', '$F = 0$ を代入'),
      eq(T`${U('ma = mg')}_{\displaystyle\text{(7) より}} \quad\Rightarrow\quad ma = mg + 0 - kx`)],
    keisan: [eq(T`a = g\ \text{を (6) に代入して}\quad mg = mg - kx`), eq(T`kx = 0`)],
    ans: eq(T`x = 0`, { ther: true }),
    gimmi: p('$x = 0$ は、ばねが自然長の位置. ばねの力が 0 なので、板 A も小球 C も重力だけで動き、同じ加速度 $g$ になる. つじつまが合う.'),
  }),

  qa('(10)', {
    genshou: [fig(figSep(), { cap: '①つりあい($x_4$)→ ②手で $d$ だけ下げて静かに離す(止)→ ③ $x = 0$ で C が離れる(速さ $v_5$、上向き)' }),
      p('静かに手を離した位置($x_4 + d$、止)から、板 A と小球 C が一体で上へ動き、$x = 0$ で C が離れる(図の② → ③).')],
    kaihou: p('[[静かに手を離す]]、[[その瞬間の小球Cの速さをv5]] → 重力とばねの力だけが仕事をする → 力学的エネルギー保存則(②と③). つりあいの位置 $x_4$ は、$2mg = kx_4$ より $x_4 = \\frac{2mg}{k}$.'),
    tate: [head('力学的エネルギー保存則(板 A + 小球 C)'),
      eq(T`${U(T`\frac{1}{2}k(x_4+d)^2 - 2mg\,(x_4+d)`)}_{\displaystyle\text{②(止)}} = ${U(T`\frac{1}{2}(2m)v_5^2`)}_{\displaystyle\text{③($x = 0$)}}`)],
    keisan: [eq(T`x_4 + d = \frac{2mg}{k} + d \ \text{を代入して}\quad mv_5^2 = \frac{(kd + 2mg)(kd - 2mg)}{2k}`),
      eq(T`v_5^2 = \frac{k^2d^2 - 4m^2g^2}{2mk}`)],
    ans: eq(T`v_5 = \sqrt{\frac{k^2d^2 - 4m^2g^2}{2mk}}`, { ther: true }),
    gimmi: [p('$kd > 2mg$($d$ が十分大きい)のとき、根号の中が正になる. 問題文の「$d$ が十分大きいとき」の条件と合う.'),
      p(T`単振動(中心 $x_4$、振幅 $d$、$\omega^2 = \frac{k}{2m}$)の速さの式 $v^2 = \omega^2\{d^2 - x_4^{\,2}\}$ に $x_4 = \frac{2mg}{k}$ を入れても、同じになる.`)],
  }),

  qa('(11)', {
    genshou: [fig(figSHM(), { cap: '参照円(1周、$\\omega t$:$0 \\to 2\\pi$。中心はつりあいの位置)と $x$-$t$ グラフ(1周期 $T$)。$x$ は下向きが正' }),
      p('C を回収すると、板 A(質量 $m$)だけがばねにつながって、つりあいの位置を中心に単振動する.')],
    kaihou: p('[[板Aはばねに取り付けられたまま周期(11)の単振動]] → 板 A の運動方程式を $a = -\\omega^2 X$ の形に直して $\\omega$ を求め、$T = \\frac{2\\pi}{\\omega}$.'),
    tate: [head('運動方程式(板 A。鉛直下向きを正)', '$X$:つりあいの位置 $\\frac{mg}{k}$ からの変位'),
      eq(T`ma = mg - kx = -k\left(x - \frac{mg}{k}\right) = -k\,X`)],
    keisan: [eq(T`a = -\frac{k}{m}\,X`), eq(T`\omega = \sqrt{\frac{k}{m}}`, { lead: '$a = -\\omega^2 X$ より' })],
    ans: eq(T`T = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac{m}{k}}`, { ther: true }),
    gimmi: p(T`板 A だけなので質量は $m$. A と C が一体のとき($2m$)の周期 $2\pi\sqrt{\frac{2m}{k}}$ より短い.`),
  }),
].join('\n');

const html = page({
  title: 'R-8 理科(物理) 大問1  ばねと板 A・小球 B, C(模範解答)',
  lead: T`質量 $m$ の板 A がばね(ばね定数 $k$)にのっている. 鉛直下向きを $x$ の正とし、自然長の上端を $x = 0$ とする. 空気抵抗は無視できる.`,
  body,
});
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), MODE === 'show' ? 'r8-p1-spring.html' : `r8-p1-spring.${MODE}.html`);
fs.writeFileSync(out, html);
console.log('wrote', out);
