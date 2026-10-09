// 2026年度 P3 物理 大問1(惑星上・惑星内部の小球の運動)の模範解答。選択式なので、導出のあとに番号を書く。
// 実行: node answers/2026-p3-1.mjs  →  answers/2026-p3-1.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C, tex, arrow, accel, force, line, ball, dot, jp, curve, circ, arc, dim, vdim, figure, JS } from '../tools/draw.mjs';
import { setCalc, page, qa, head, eq, pc, p, note, fig } from '../tools/answer.mjs';

const T = String.raw;
const MODE = process.argv[2] ?? 'show';          // show: 途中式を載せる(既定) / none: 答案だけ(途中式を出さない)
setCalc(MODE);
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

// ---- 図5: 参照円と x-t グラフ(単振動 = 等速円運動の射影)。x は A の向きが正(上) ----
const fig5 = () => {
  const cx = 110, cy = 150, R = 90, th = 60;                         // 円の中心・半径、点 P の角(A から時計まわりに θ = ωt)
  const gx = 300, Tpx = 200;                                         // グラフの原点(t=0)と、周期 T の長さ
  const rad = (th * Math.PI) / 180;
  const P = [cx + R * Math.sin(rad), cy - R * Math.cos(rad)];       // 参照円上の点 P
  let s = '';
  // 軸: x(トンネルの向き)と、グラフの x と t
  s += arrow(cx, cy + R + 22, cx, cy - R - 24, { w: 1.6 }) + tex(cx + 10, cy - R - 20, 'x');
  s += arrow(gx, cy + R + 22, gx, cy - R - 24, { w: 1.6 }) + tex(gx + 10, cy - R - 20, 'x');
  s += arrow(gx, cy, gx + Tpx + 40, cy, { w: 1.6 }) + tex(gx + Tpx + 44, cy + 18, 't');
  // A と B の高さ
  s += line(cx, cy - R, gx + Tpx + 20, cy - R, { w: 1.1, dash: '5 4' }) + line(cx, cy + R, gx + Tpx + 20, cy + R, { w: 1.1, dash: '5 4' });
  s += tex(cx - 10, cy - R - 2, 'A', { anchor: 'end' }) + tex(cx - 10, cy + R + 18, 'B', { anchor: 'end' });
  s += tex(gx - 10, cy - R + 6, 'R', { anchor: 'end' }) + tex(gx - 10, cy + R + 6, '-R', { anchor: 'end' });
  // 参照円と、半径・角 θ
  s += circ(cx, cy, R, { fill: 'none' }) + dot(cx, cy, 2.5, C.ink) + tex(cx - 12, cy + 20, T`\mathrm{O}`, { anchor: 'end' });
  s += line(cx, cy, P[0], P[1], { w: 1.4 }) + arc(cx, cy, 30, 90, 90 - th) + tex(cx + 18, cy - 38, T`\omega t`);
  // P の速度 Rω(円の接線)を、トンネル方向(朱)と垂直方向(青)に分ける
  const ux = Math.cos(rad), uy = Math.sin(rad), L = 60;               // 時計まわりの接線の向き(画面): (cos θ, sin θ)
  s += arrow(P[0], P[1], P[0] + L * ux, P[1] + L * uy, { w: 2 }) + tex(P[0] + L * ux + 6, P[1] + L * uy + 6, T`R\omega`);
  s += arrow(P[0], P[1], P[0], P[1] + L * uy, { color: C.compA, w: 2 }) + tex(P[0] - 8, P[1] + L * uy / 2 + 8, 'v', { color: C.compA, anchor: 'end' });
  s += arrow(P[0], P[1], P[0] + L * ux, P[1], { color: C.compB, w: 2 });
  s += dot(P[0], P[1], 3, C.ink);
  // トンネル内の小球(P の x への射影)と、グラフ上の対応する点
  s += ball(cx, P[1], 5);
  const u = th / 360, gy = cy - R * Math.cos(rad);
  s += line(P[0], P[1], gx + Tpx * u, gy, { w: 1.1, dash: '5 4' }) + line(gx + Tpx * u, gy, gx + Tpx * u, cy, { w: 1.1, dash: '5 4' });
  // x-t グラフ: x = R cos ωt
  const pts = []; for (let i = 0; i <= 80; i++) { const uu = i / 80; pts.push([gx + Tpx * uu, cy - R * Math.cos(2 * Math.PI * uu)]); }
  s += curve(pts, { w: 2.4 }) + dot(gx + Tpx * u, gy, 3.5, C.ink);
  // 周期: 半周期 T/2 と T
  s += line(gx + Tpx / 2, cy - 5, gx + Tpx / 2, cy + 5) + line(gx + Tpx, cy - 5, gx + Tpx, cy + 5);
  s += dim(gx, gx + Tpx / 2, cy + R + 44, { gap: [gx + Tpx / 4 - 18, gx + Tpx / 4 + 18], color: C.target }) + tex(gx + Tpx / 4, cy + R + 52, T`\frac{T}{2}`, { anchor: 'middle', color: C.target });
  s += tex(gx + Tpx, cy + 24, 'T', { anchor: 'middle' });
  s += tex(gx - 10, cy + 20, T`\mathrm{O}`, { anchor: 'end' });
  return figure(580, 340, `<g transform="translate(0,-10)">${s}</g>`);
};

const body = [
  qa('(1) ア', {
    genshou: [fig(fig1(), { cap: '状態①(表面)から状態②(高さ $h$)まで' }),
      p('小球は表面(状態①、速さ $v$)から高さ $h$(状態②)まで上がる。重力以外の力ははたらかない.')],
    kaihou: p(T`[[大気の抵抗の影響は無視できる]] → はたらく力は万有引力(保存力)だけ → エネルギー保存則。万有引力による位置エネルギーは $-\frac{GMm}{r}$(無限遠が基準).`),
    tate: [head('エネルギー保存則', '$v_h$:高さ $h$ での速さ'),
      eq(T`\underbracket[0.4pt][2pt]{\frac12 mv^2 - \frac{GMm}{R}}_{\displaystyle\text{①の力学的エネルギー}} = \underbracket[0.4pt][2pt]{\frac12 mv_h^2 - \frac{GMm}{R+h}}_{\displaystyle\text{②の力学的エネルギー}}`)],
    keisan: eq(T`v_h^2 = v^2 - 2GM\left(\frac1R - \frac1{R+h}\right) = v^2 - \frac{2GMh}{R(R+h)}`),
    ans: eq(T`v_h = \sqrt{v^2 - \frac{2GMh}{R(R+h)}}`, { ther: true, ch: '①' }),
    gimmi: p('$h = 0$ で $v_h = v$ となり、はじめの速さと一致する。$h$ が大きいほど $v_h$ は小さい(減速).'),
  }),

  qa('イ', {
    genshou: p('最も高い点では、速さが 0 になる.'),
    kaihou: p('[[小球が惑星表面から最も離れていたときの距離]] → 最高点では速さ 0。(ア) の式で $v_h = 0$、$h = H$($H$:最高点の表面からの距離)とおく.'),
    tate: eq(T`0 = v^2 - \frac{2GMH}{R(R+H)}`),
    keisan: [eq(T`v^2 R(R+H) = 2GMH`), eq(T`H\,(2GM - v^2R) = v^2R^2`)],
    ans: eq(T`H = \frac{v^2R^2}{2GM - v^2R}`, { ther: true, ch: '④' }),
    gimmi: p('$2GM - v^2R > 0$ のとき $H > 0$。$v \\to 0$ で $H \\to 0$ となり、もっともらしい.'),
  }),

  qa('ウ', {
    genshou: p('戻ってこない = 最高点が有限の位置にならない.'),
    kaihou: p('[[じゅうぶんに時間が経過しても小球が惑星表面に戻ってこない]] → 最高点がない。(イ) の $H$ が有限にならない条件を考える(分母が 0 以下).'),
    tate: eq(T`2GM - v^2R \le 0`),
    keisan: eq(T`v^2 \ge \frac{2GM}{R}`),
    ans: eq(T`v \ge \sqrt{\frac{2GM}{R}}`, { ther: true, ch: '④' }),
    gimmi: p(T`$v = \sqrt{2GM/R}$ は脱出速度で、(ウ) はこの境界を含む。全エネルギー $\frac12 mv^2 - \frac{GMm}{R} \ge 0$ でも同じ結果になる.`),
  }),

  qa('(2)(a) エ オ', {
    genshou: [fig(fig2(), { cap: '半径 $r$ の球(質量 $M_r$)と、小球が受ける万有引力 $F$' }),
      p('惑星は一様な密度。半径 $r$ の球の質量 $M_r$ を考える.')],
    kaihou: p('[[一様な球]] → 密度が一定。$r < R$ では質量は体積に比例し、$r \\ge R$ では惑星全体の質量.'),
    tate: eq(T`M_r : M = \underbracket[0.4pt][2pt]{\frac43\pi r^3}_{\displaystyle\text{半径 }r\text{ の球の体積}} : \underbracket[0.4pt][2pt]{\frac43\pi R^3}_{\displaystyle\text{惑星の体積}} \quad (r < R)`),
    keisan: eq(T`M_r = M\,\frac{r^3}{R^3}`),
    ans: [eq('M_r = M', { lead: '$r \\ge R$ のとき', ther: true, ch: '⓪ (エ)' }), eq(T`M_r = M\,\frac{r^3}{R^3}`, { lead: '$r < R$ のとき', ther: true, ch: '③ (オ)' })],
    gimmi: p('$r = R$ で (エ)(オ) はどちらも $M$ となり、一致する.'),
  }),

  qa('カ', {
    genshou: [fig(fig3(), { cap: '左:$M_r$、右:$F$' }), p('$M_r$ を $r$ の関数としてグラフにする.')],
    kaihou: p('[[$r$ の関数としてグラフに表す]] → (エ)(オ) の式の形から概形を読み取る.'),
    tate: eq(T`M_r = \begin{cases} M\,\frac{r^3}{R^3} & (r < R)\\ M & (r \ge R) \end{cases}`),
    keisan: p('$r^3$ に比例して 0 から増え、$r = R$ で $M$ に達する.'),
    ans: choice('⓪'),
    gimmi: p('$r = 0$ で 0、$r = R$ で $M$、$r > R$ で一定.'),
  }),

  qa('キ ク ケ', {
    genshou: p('O から距離 $r$ の小球が、惑星から受ける万有引力 $F$. $M_r$ が中心 $\\mathrm{O}$ に集まったとみなせる.'),
    kaihou: p('[[質量 $M_r$ が惑星の中心位置 $\\mathrm{O}$ に集まったとした場合に小球にはたらく万有引力と同じ]] → 万有引力の法則を、$r \\ge R$ と $r < R$ に分けて使う.'),
    tate: [head('万有引力の法則'), eq(T`F = G\,\frac{m M_r}{r^2}`)],
    keisan: [p('$r \\ge R$ ($M_r = M$)'), eq(T`F = G\,\frac{mM}{r^2}`),
      p(T`$r < R$ ($M_r = M\frac{r^3}{R^3}$)`), eq(T`F = G\,\frac{m}{r^2}\cdot M\frac{r^3}{R^3} = G\,\frac{mM}{R^3}\,r`)],
    ans: [eq(T`F = G\,\frac{mM}{r^2}`, { lead: '$r \\ge R$ のとき', ther: true, ch: '⓪ (キ)' }), eq(T`F = G\,\frac{mM}{R^3}\,r`, { lead: '$r < R$ のとき', ther: true, ch: '③ (ク)' }), pc(T`グラフ:$r < R$ では $r$ に比例、$r \ge R$ では $\frac{1}{r^2}$ で減少`, '① (ケ)')],
    gimmi: p(T`$r = R$ で (キ)(ク) はどちらも $G\frac{mM}{R^2}$ となり、$F$ は連続. $r = 0$ で $F = 0$.`),
  }),

  qa('(b) コ', {
    genshou: [fig(fig4(), { cap: '$x$:$\\mathrm{O}$ から A の向きを正とする' }),
      p('小球は A で静止して出発する。力は常に $\\mathrm{O}$ を向く.')],
    kaihou: p('[[運動方程式からトンネル内部における小球は]] → 運動方程式を立て、$a = -\\omega^2 x$ の形なら単振動.'),
    tate: [head('運動方程式', '$x$:$\\mathrm{O}$ から A の向きの位置、$a$:加速度'), eq(T`ma = \underbracket[0.4pt][2pt]{-G\,\frac{mM}{R^3}\,x}_{\displaystyle\mathrm{O}\text{ 向きの万有引力}}`)],
    keisan: [eq(T`a = -\frac{GM}{R^3}\,x`), eq(T`\omega = \sqrt{\frac{GM}{R^3}}`)],
    ans: pc('$a = -\\omega^2 x$ の形なので、単振動.', '⓪'),
    gimmi: p('$x > 0$ で $a < 0$、$x < 0$ で $a > 0$。加速度はつねに $\\mathrm{O}$ 向きで、復元力としてはたらく.'),
  }),

  qa('サ', {
    genshou: [fig(fig5(), { cap: '参照円(半径 $R$、角速度 $\\omega$)と $x$-$t$ グラフ。A から B は半周期' }), p('A で静止して始まるので、A は振動の端。振幅は $R$、中心は $\\mathrm{O}$。B は反対の端で、A から B までは半周期.')],
    kaihou: p(T`[[点 A から静かに落下]] → A は振動の端。[[点 B に初めて到達するまでにかかる時間]] → 半周期。単振動の周期は $T = \frac{2\pi}{\omega}$.`),
    tate: eq(T`t = \underbracket[0.4pt][2pt]{\frac T2}_{\displaystyle\text{半周期}} = \frac{\pi}{\omega}`),
    keisan: eq(T`t = \pi\sqrt{\frac{R^3}{GM}}`),
    ans: eq(T`t = \pi\sqrt{\frac{R^3}{GM}}`, { ther: true, ch: '⓪' }),
    gimmi: p(T`$m$ によらない。$\sqrt{R^3/GM}$ は時間の次元になる.`),
  }),

  qa('シ', {
    genshou: p('A で静止した小球が、中心から距離 $r$ の位置にきたときの速さ $v$.'),
    kaihou: p(T`[[中心からの距離 $r$ の位置にある小球の速さ]] → エネルギー保存則。復元力 $-kx$ ($k = \frac{GMm}{R^3}$) の位置エネルギーは $\frac12 kx^2$.`),
    tate: [head('エネルギー保存則', '中心 $\\mathrm{O}$ が基準'),
      eq(T`\underbracket[0.4pt][2pt]{\frac12 mv^2}_{\displaystyle\text{運動エネルギー}} + \underbracket[0.4pt][2pt]{\frac12\cdot\frac{GMm}{R^3}\,r^2}_{\displaystyle\text{位置エネルギー}} = \underbracket[0.4pt][2pt]{\frac12\cdot\frac{GMm}{R^3}\,R^2}_{\displaystyle\text{A(静止)}}`)],
    keisan: eq(T`v^2 = \frac{GM}{R^3}\,(R^2 - r^2)`),
    ans: eq(T`v = \sqrt{\frac{GM}{R}\left(1 - \frac{r^2}{R^2}\right)}`, { ther: true, ch: '②' }),
    gimmi: p(T`$r = R$ で $v = 0$(端で静止)、$r = 0$ で最大 $v = \sqrt{GM/R}$ となり、単振動の様子と合う.`),
    note: note(T`参照円(上の図)に着目すると、速さ $R\omega$ のうち $x$ 方向の成分が $v = R\omega\sin\omega t = \omega\sqrt{R^2 - r^2}$ となり、同じ結果.`),
  }),

  qa('ス', {
    genshou: p('具体的な惑星の数値で、A から B までの時間を求める.'),
    kaihou: p('[[点 A から静かに落下した小球が点 B に初めて到達するのに要する時間]] → (サ) の式に、与えられた数値を代入する.'),
    tate: eq(T`t = \pi\sqrt{\frac{R^3}{GM}}`),
    keisanKeep: true,
    keisan: [eq(T`\sqrt{\frac{R^3}{GM}} = \sqrt{\frac{(6.7\times10^6)^3}{6.7\times10^{-11}\times 1.0\times10^{25}}} = \sqrt{6.7^2\times10^4} = 6.7\times10^2`),
      eq(T`t = 3.1 \times 6.7\times10^2 \approx 2.1\times10^3\ [\mathrm{s}]`),
      eq(T`\frac{2.1\times10^3}{60} \approx 35\ [\text{分}]`)],
    ans: pc('約 35 分', '③'),
    gimmi: p(T`地球 ($R = 6.4\times10^6$ m, $GM = gR^2$) では $\pi\sqrt{R/g} \approx 42$ 分. 同程度なので妥当.`),
  }),
].join('\n');

const html = page({
  title: '2026年度 P3 物理 大問1  惑星上・惑星内部の小球の運動(模範解答)',
  lead: '半径 $R$・質量 $M$ の一様な惑星と質量 $m$ の小球。万有引力定数 $G$. 選択問題なので、導出のあとに解答群の番号を書く.',
  body,
});
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), MODE === 'show' ? '2026-p3-1.html' : `2026-p3-1.${MODE}.html`);
fs.writeFileSync(out, html);
console.log('wrote', out);
