// 2026年度 P3 物理 大問1(惑星上・惑星内部の小球の運動)の模範解答。選択式なので、導出のあとに番号を書く。
// 実行: node answers/2026-p3-1.mjs  →  answers/2026-p3-1.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C, tex, arrow, accel, force, line, ball, dot, jp, curve, circ, vdim, figure, JS } from '../tools/draw.mjs';
import { page, sub, head, op, eq, p, note, check, fig } from '../tools/answer.mjs';

const T = String.raw;
const choice = (c) => `<div class="eq"><span class="th">∴</span><span class="f"><b>${c}</b> .</span></div>`;

// ---- 図1: 打ち上げ(状態①: 表面 / 状態②: 高さ h) ----
const fig1 = () => {
  const O = [110, 250], R = 80;
  let s = circ(O[0], O[1], R) + tex(O[0] - 34, O[1] - 18, 'M', { anchor: 'middle' });
  s += dot(O[0], O[1], 2.5, C.ink) + tex(O[0] + 12, O[1] + 24, T`\mathrm{O}`);
  // 状態①: 表面、速さ v
  const y1 = O[1] - R;                                   // 表面(中心から R)
  s += ball(O[0], y1 - 7, 7) + arrow(O[0] + 18, y1 - 7, O[0] + 18, y1 - 47, { w: 2 }) + tex(O[0] + 28, y1 - 22, 'v');
  s += jp(O[0] - 42, y1 - 4, '①', { color: C.label });
  // 状態②: 高さ h、速さ v_h
  const y2 = y1 - 100;
  s += ball(O[0], y2 - 7, 7) + arrow(O[0] + 18, y2 - 7, O[0] + 18, y2 - 33, { w: 2 }) + tex(O[0] + 28, y2 - 12, 'v_h');
  s += jp(O[0] - 42, y2 - 4, '②', { color: C.label });
  s += line(O[0], O[1], O[0], y2 + 1, { w: 1.2, dash: '5 4' });
  // 寸法: R(中心→表面)と h(表面→②)
  s += vdim(O[0] + 66, O[1], y1) + tex(O[0] + 84, (O[1] + y1) / 2 + 8, 'R');
  s += vdim(O[0] + 66, y1, y2) + tex(O[0] + 84, (y1 + y2) / 2 + 8, 'h');
  return figure(250, 340, `<g transform="translate(0,-20)">${s}</g>`);
};

// ---- 図2: トンネルと、半径 r の球(質量 M_r)。小球が受ける万有引力 F は O 向き ----
const fig2 = () => {
  const O = [120, 130], R = 100, r = 55;
  let s = circ(O[0], O[1], R) + circ(O[0], O[1], r, { dash: '5 4', w: 1.4 });
  s += `<rect x="${O[0] - 4}" y="${O[1] - R - 12}" width="8" height="${2 * R + 24}" fill="#fff" stroke="${C.ink}" stroke-width="1.6"/>`;
  s += tex(O[0] + 12, O[1] - R - 16, 'A') + tex(O[0] + 12, O[1] + R + 28, 'B');
  s += dot(O[0], O[1], 2.5, C.ink) + tex(O[0] - 16, O[1] + 22, T`\mathrm{O}`, { anchor: 'end' });
  s += ball(O[0], O[1] - r, 6) + force(O[0], O[1] - r, O[0], O[1] - r + 38) + dot(O[0], O[1] - r, 2.5);
  s += tex(O[0] + 12, O[1] - r + 34, 'F', { color: C.force });
  s += line(O[0], O[1], O[0] + R, O[1], { w: 1.2, dash: '5 4' }) + tex(O[0] + R / 2 + 4, O[1] + 24, 'R', { anchor: 'middle' });
  s += vdim(O[0] - 34, O[1], O[1] - r) + tex(O[0] - 44, O[1] - r / 2 + 8, 'r', { anchor: 'end' });
  s += tex(O[0] - 62, O[1] + 66, T`M_r`) + tex(O[0] - 70, O[1] - 52, 'M', { anchor: 'middle' });
  return figure(260, 300, `<g transform="translate(0,16)">${s}</g>`);
};

// ---- 図3: M_r と F のグラフ(左 M_r、右 F) ----
const fig3 = () => {
  const ax = (ox, ytop) => arrow(ox, 150, ox + 190, 150, { w: 2 }) + arrow(ox, 150, ox, ytop, { w: 2 });
  const Rx = 90, top = 45;                                       // r=R の x、最大の y
  let s = ax(40, 20) + ax(280, 20);
  // M_r: r^3 で増加して r=R で M、以後一定
  const mr = []; for (let i = 0; i <= 40; i++) { const r = (i / 40) * Rx; mr.push([40 + r, 150 - (150 - top) * (r / Rx) ** 3]); }
  s += curve(mr) + line(40 + Rx, top, 40 + 175, top);
  s += line(40 + Rx, top, 40 + Rx, 150, { w: 1.2, dash: '5 4' }) + line(40, top, 40 + Rx, top, { w: 1.2, dash: '5 4' });
  s += tex(30, 24, T`M_r`, { anchor: 'end' }) + tex(40 + 200, 168, 'r') + tex(30, top + 8, 'M', { anchor: 'end' }) + tex(40 + Rx, 172, 'R', { anchor: 'middle' });
  // F: r に比例して増加し、r=R で最大、以後 1/r^2 で減少
  const f = []; for (let i = 0; i <= 40; i++) { const r = (i / 40) * Rx; f.push([280 + r, 150 - (150 - top) * (r / Rx)]); }
  for (let i = 1; i <= 50; i++) { const r = Rx * (1 + (i / 50) * 1.1); f.push([280 + r, 150 - (150 - top) * (Rx / r) ** 2]); }
  s += curve(f);
  s += line(280 + Rx, top, 280 + Rx, 150, { w: 1.2, dash: '5 4' });
  s += tex(270, 24, 'F', { anchor: 'end' }) + tex(280 + 200, 168, 'r') + tex(280 + Rx, 172, 'R', { anchor: 'middle' });
  s += tex(280 + Rx + 8, top - 10, T`\frac{GMm}{R^2}`, { anchor: 'start' });
  return figure(510, 200, `<g transform="translate(10,0)">${s}</g>`);
};

// ---- 図4: トンネル内の単振動。A で静止、O が振動中心、振幅 R ----
const fig4 = () => {
  const O = [110, 150], R = 110, x = 60;
  let s = `<rect x="${O[0] - 4}" y="${O[1] - R - 10}" width="8" height="${2 * R + 20}" fill="#fff" stroke="${C.ink}" stroke-width="1.6"/>`;
  s += tex(O[0] + 12, O[1] - R - 8, 'A') + tex(O[0] + 12, O[1] + R + 24, 'B') + jp(O[0] - 44, O[1] - R - 6, 'A で静止', { size: JS, anchor: 'end' });
  s += dot(O[0], O[1], 2.5, C.ink) + tex(O[0] - 14, O[1] + 20, T`\mathrm{O}`, { anchor: 'end' }) + jp(O[0] + 14, O[1] + 20, '振動中心', { size: JS });
  s += arrow(O[0] + 52, O[1], O[0] + 52, O[1] - R - 6, { w: 1.8 }) + tex(O[0] + 62, O[1] - R + 8, 'x');   // x 軸(A の向きが正)
  s += vdim(O[0] - 36, O[1], O[1] - R) + tex(O[0] - 46, O[1] - R / 2 + 8, 'R', { anchor: 'end' });
  s += ball(O[0], O[1] - x, 6) + force(O[0], O[1] - x, O[0], O[1] - x + 40) + dot(O[0], O[1] - x, 2.5);
  s += tex(O[0] - 14, O[1] - x + 38, 'F', { color: C.force, anchor: 'end' });
  s += accel(O[0] + 30, O[1] - x - 6, O[0] + 30, O[1] - x + 44) + tex(O[0] + 44, O[1] - x + 30, 'a', { color: C.force });
  return figure(250, 330, `<g transform="translate(0,8)">${s}</g>`);
};

const body = [
  sub('(1)ア', fig(fig1(), { cap: '状態①(表面)から状態②(高さ $h$)まで' }),
    head('エネルギー保存則', '$v_h$:高さ $h$ での速さ'),
    op('万有引力による位置エネルギーは $-\\frac{GMm}{r}$(無限遠が基準)'),
    eq(T`\frac12 mv^2 - \frac{GMm}{R} = \frac12 mv_h^2 - \frac{GMm}{R+h}`),
    eq(T`v_h^2 = v^2 - 2GM\left(\frac1R - \frac1{R+h}\right) = v^2 - \frac{2GMh}{R(R+h)}`),
    eq(T`v_h = \sqrt{v^2 - \frac{2GMh}{R(R+h)}}`, { ther: true }),
    choice('①')),

  sub('イ',
    head('エネルギー保存則', '$H$:最高点の表面からの距離'),
    op('(ア) の式で $v_h = 0$, $h = H$ とおくと'),
    eq(T`0 = v^2 - \frac{2GMH}{R(R+H)}`),
    eq(T`v^2 R(R+H) = 2GMH \quad\Rightarrow\quad H\,(2GM - v^2R) = v^2R^2`),
    eq(T`H = \frac{v^2R^2}{2GM - v^2R}`, { ther: true }),
    choice('④')),

  sub('ウ',
    p('最高点が有限の位置にならない(戻ってこない)のは、(イ) の分母が 0 以下のとき.'),
    eq(T`2GM - v^2R \le 0`),
    eq(T`v \ge \sqrt{\frac{2GM}{R}}`, { ther: true }),
    choice('④'),
    note(T`全エネルギーが 0 以上のとき無限遠に達する: $\frac12 mv^2 - \frac{GMm}{R} \ge 0$ でも同じ.`),
    check(T`$2GM - v^2R > 0$ なら $H > 0$ で有限(戻ってくる)。$v = \sqrt{2GM/R}$ は脱出速度で、(ウ) はこの境界を含む.`)),

  sub('(2)(a)エ オ', fig(fig2(), { cap: '半径 $r$ の球(質量 $M_r$)と、小球が受ける万有引力 $F$' }),
    p('$r \\ge R$ のとき、半径 $r$ の球は惑星全体を含む.'),
    eq('M_r = M', { ther: true }),
    choice('⓪ (エ)'),
    p('$r < R$ のとき、密度は一様なので、質量は体積に比例する.'),
    eq(T`M_r : M = \frac43\pi r^3 : \frac43\pi R^3`),
    eq(T`M_r = M\,\frac{r^3}{R^3}`, { ther: true }),
    choice('③ (オ)')),

  sub('カ', fig(fig3(), { cap: '左:$M_r$、右:$F$' }),
    p('$r < R$ では $r^3$ に比例して増え、$r = R$ で $M$ に達して、以後は一定.'),
    choice('⓪')),

  sub('キ ク ケ',
    head('万有引力の法則'),
    p('$M_r$ が中心 $\\mathrm{O}$ に集まったとみなせるので'),
    eq(T`F = G\,\frac{m M_r}{r^2}`),
    p('$r \\ge R$ のとき ($M_r = M$)'),
    eq(T`F = G\,\frac{mM}{r^2}`, { ther: true }),
    choice('⓪ (キ)'),
    p('$r < R$ のとき ($M_r = M\\frac{r^3}{R^3}$)'),
    eq(T`F = G\,\frac{m}{r^2}\cdot M\frac{r^3}{R^3} = G\,\frac{mM}{R^3}\,r`, { ther: true }),
    choice('③ (ク)'),
    p('$r < R$ では $r$ に比例、$r \\ge R$ では $\\frac{1}{r^2}$ で減少する.'),
    choice('① (ケ)'),
    check(T`$r = R$ で (キ)(ク) はどちらも $G\frac{mM}{R^2}$ となり、$F$ は連続.`)),

  sub('(b)コ', fig(fig4(), { cap: '$x$:$\\mathrm{O}$ から A の向きを正とする' }),
    head('運動方程式', '$x$:$\\mathrm{O}$ から A の向きの位置、$a$:加速度'),
    p('力は常に $\\mathrm{O}$ を向くので ($x>0$ では負の向き)'),
    eq(T`ma = -G\,\frac{mM}{R^3}\,x`),
    eq(T`a = -\frac{GM}{R^3}\,x`, { ther: true }),
    p('$a = -\\omega^2 x$ の形なので、単振動.'),
    eq(T`\omega = \sqrt{\frac{GM}{R^3}}`),
    choice('⓪')),

  sub('サ',
    p('A で静止して始まるので、A と B は振動の両端(振幅 $R$、中心 $\\mathrm{O}$). A から B までは半周期.'),
    eq(T`T = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac{R^3}{GM}}`),
    eq(T`\frac T2 = \pi\sqrt{\frac{R^3}{GM}}`, { ther: true }),
    choice('⓪')),

  sub('シ',
    head('エネルギー保存則', '中心 $\\mathrm{O}$ が基準'),
    eq(T`\frac12 mv^2 + \frac12\cdot\frac{GMm}{R^3}\,r^2 = 0 + \frac12\cdot\frac{GMm}{R^3}\,R^2`),
    eq(T`v^2 = \frac{GM}{R^3}\,(R^2 - r^2)`),
    eq(T`v = \sqrt{\frac{GM}{R}\left(1 - \frac{r^2}{R^2}\right)}`, { ther: true }),
    choice('②'),
    note(T`復元力 $-kx$ ($k = \frac{GMm}{R^3}$) の位置エネルギーは $\frac12 kx^2$. 参照円に着目して $v = \omega\sqrt{R^2 - r^2}$ としても同じ.`),
    check(T`$r = R$ で $v = 0$(端で静止)、$r = 0$ で最大 $v = \sqrt{GM/R}$ となり、単振動の様子と合う.`)),

  sub('ス',
    p('(サ) の結果に数値を代入する.'),
    eq(T`\sqrt{\frac{R^3}{GM}} = \sqrt{\frac{(6.7\times10^6)^3}{6.7\times10^{-11}\times 1.0\times10^{25}}} = \sqrt{6.7^2\times10^4} = 6.7\times10^2`),
    eq(T`t = 3.1 \times 6.7\times10^2 \approx 2.1\times10^3\ [\mathrm{s}]`),
    eq(T`\frac{2.1\times10^3}{60} \approx 35\ [\text{分}]`, { ther: true }),
    choice('③'),
    check(T`地球 ($R = 6.4\times10^6$ m, $GM = gR^2$) では $\pi\sqrt{R/g} \approx 42$ 分. 同程度なので妥当.`)),
].join('\n');

const html = page({
  title: '2026年度 P3 物理 大問1  惑星上・惑星内部の小球の運動(模範解答)',
  lead: '半径 $R$・質量 $M$ の一様な惑星と質量 $m$ の小球。万有引力定数 $G$. 選択問題なので、導出のあとに解答群の番号を書く.',
  body,
});
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '2026-p3-1.html');
fs.writeFileSync(out, html);
console.log('wrote', out);
