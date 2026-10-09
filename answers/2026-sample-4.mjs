// 2026年度サンプル 大問4(P が Q の上をすべる: 運動量・エネルギー)の答案。
// 実行: node answers/2026-sample-4.mjs  →  answers/2026-sample-4.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C, tex, force, box, dot, floor, jp, figure, JS } from '../tools/draw.mjs';
import { figA, figD } from '../tools/figures.mjs';
import { setCalc, page, qa, head, eq, p, check, fig } from '../tools/answer.mjs';

const MODE = process.argv[2] ?? 'show';          // show: 途中式を載せる(既定) / none: 答案だけ(途中式を出さない)
setCalc(MODE);

// (1) P が受ける力(重力・垂直抗力・動摩擦力)。速さの情報は描かない。
// 作用点: mg は重心、N と μ'N は接触面。重なって見えないよう、N は重力から横にずらす。
const figForce = () => {
  let s = floor(70, 250, 140) + jp(78, 168, 'Q の上面', { size: JS });
  s += box(132, 84, 56, 56) + tex(206, 104, 'm');                       // P(質量 m)
  s += force(160, 112, 160, 196) + dot(160, 112);                        // mg: 重心から
  s += force(178, 140, 178, 40) + dot(178, 140);                         // N: 接触面から(重力からずらす)
  s += force(146, 140, 56, 140) + dot(146, 140);                         // μ'N: 接触面から(左向き)
  s += tex(190, 56, 'N', { color: C.force }) + tex(172, 204, 'mg', { color: C.force }) + tex(100, 126, "\\mu' N", { anchor: 'middle', color: C.force });
  return figure(260, 192, `<g transform="translate(-30,-24)">${s}</g>`);
};

const choice = (c) => `<div class="eq"><span class="th">∴</span><span class="f"><b>${c}</b> .</span></div>`;

const body = [
  qa('(1)', {
    genshou: [fig(figForce(), { cap: 'P が受ける力(重力は重心、垂直抗力・摩擦力は接触面から)' }),
      p('P は Q の上面をすべる。鉛直方向には動かない.')],
    kaihou: p('[[垂直抗力の大きさ $N$]]。P は Q の上にあり、鉛直方向には動かない → 鉛直方向の力のつりあい.'),
    tate: [head('鉛直方向の力のつりあい'), eq('\\underbracket[0.4pt][2pt]{0}_{\\displaystyle\\text{鉛直の合力}} = \\underbracket[0.4pt][2pt]{N}_{\\displaystyle\\text{上向き}} - \\underbracket[0.4pt][2pt]{mg}_{\\displaystyle\\text{下向き}}')],
    keisan: '—',
    ans: eq('N = mg\\ .', { ther: true }),
    gimmi: p('$N > 0$。すべっていても、鉛直方向の力はつりあう.'),
  }),

  qa('(2)', {
    genshou: p('P は Q に対して右へすべるので、動摩擦力がはたらく.'),
    kaihou: p("[[動摩擦力の大きさ $f$]]、[[動摩擦係数を $\\mu'$]] → 動摩擦力の式 $f = \\mu' N$ に (1) の $N$ を代入する."),
    tate: [head('動摩擦力'), eq("\\underbracket[0.4pt][2pt]{f}_{\\displaystyle\\text{動摩擦力}} = \\mu' \\underbracket[0.4pt][2pt]{N}_{\\displaystyle\\text{(1) の値}}")],
    keisan: eq("f = \\mu' m g"),
    ans: eq("f = \\mu' m g\\ .", { ther: true }),
    gimmi: p('向きは P の運動と逆(P には左向き)。Q には右向きに同じ大きさがはたらく.'),
  }),

  qa('(3)', {
    genshou: p('P と Q が一体になるまで(状態1 → 状態2)の運動。外力の有無と、非保存力の仕事の有無を調べる.'),
    kaihou: p('[[運動量と力学的エネルギーについての文章]] → 保存の条件を調べる。運動量は外力の和が 0 のとき、力学的エネルギーは保存力のみが仕事をするとき保存する.'),
    tate: [p('水平方向:床はなめらかで外力なし → 運動量の和は保存する.'),
      p('動摩擦力(非保存力)が仕事をする → 力学的エネルギーの和は保存しない.')],
    keisan: '—',
    ans: choice('ウ'),
    gimmi: p('摩擦で熱が出る分だけ、力学的エネルギーは減る.'),
  }),

  qa('(4)', {
    genshou: [fig(figA({ states: ['状態1', '状態2'] }), { cap: '状態1(P が Q に乗った直後)と状態2(一体)。右向きを正とする' }),
      p('状態1 から状態2 まで、P は減速し、Q は加速する.')],
    kaihou: p('[[力積と運動量の関係について、右向きを正として、物体P, Qそれぞれ立式]] → P、Q それぞれに立てる(動摩擦力は一定).'),
    tate: [head('力積と運動量の関係', '右向きを正'),
      eq("\\mathrm{P}:\\ \\underbracket[0.4pt][2pt]{m v_1 - m v_0}_{\\displaystyle\\text{運動量の変化}} = \\underbracket[0.4pt][2pt]{-\\mu' m g\\, t_1}_{\\displaystyle\\text{力積(左向き)}}", { no: '①' }),
      eq("\\mathrm{Q}:\\ \\underbracket[0.4pt][2pt]{4m v_1 - 4m\\cdot 0}_{\\displaystyle\\text{運動量の変化}} = \\underbracket[0.4pt][2pt]{+\\mu' m g\\, t_1}_{\\displaystyle\\text{力積(右向き)}}", { no: '②' })],
    keisan: '—',
    ans: p('①, ②.'),
    gimmi: p('P は左向き、Q は右向きに力積を受ける。符号が逆で、大きさが等しい.'),
  }),

  qa('(5)', {
    genshou: p('①, ② には $t_1$ が含まれる.'),
    kaihou: p('[[$v_1$ を $v_0$ を用いて表しなさい]] → ①, ② の和をとり、$t_1$ を消去する.'),
    tate: p('①, ②.'),
    keisan: eq('5m v_1 - m v_0 = 0'),
    ans: eq('v_1 = \\frac{v_0}{5}\\ .', { lead: '①+② より $t_1$ を消去して', ther: true }),
    gimmi: p('$0 < v_1 < v_0$。運動量保存($m v_0 = 5m v_1$)から求めた値と一致する.'),
  }),

  qa('(6)', {
    genshou: p('(5) で $v_1$ が求まったので、①か② に代入すれば $t_1$ が求まる.'),
    kaihou: p("[[$t_1$ を $v_0$, $\\mu'$, $g$ を用いて表しなさい]] → ② に (5) の $v_1$ を代入する."),
    tate: p('②.'),
    keisan: eq("\\frac{4}{5} m v_0 = \\mu' m g\\, t_1"),
    ans: eq("t_1 = \\frac{4 v_0}{5\\mu' g}\\ .", { lead: '② に $v_1$ を代入して', ther: true }),
    gimmi: p('$t_1 > 0$。$\\mu\'$ が大きい(摩擦が大きい)ほど $t_1$ は短い.'),
  }),

  qa('(7)', {
    genshou: p('P、Q はそれぞれ動摩擦力による仕事を受ける。移動距離は $x_P$、$x_Q$.'),
    kaihou: p('[[仕事とエネルギーの関係について、右向きを正として、物体P, Qそれぞれ立式]] → 動摩擦力の仕事を考えて立てる.'),
    tate: [head('仕事とエネルギーの関係', '右向きを正'),
      eq("\\mathrm{P}:\\ \\underbracket[0.4pt][2pt]{\\frac{1}{2} m v_1^{2} - \\frac{1}{2} m v_0^{2}}_{\\displaystyle\\text{運動エネルギーの変化}} = \\underbracket[0.4pt][2pt]{-\\mu' m g\\, x_P}_{\\displaystyle\\text{摩擦力の仕事}}", { no: '③' }),
      eq("\\mathrm{Q}:\\ \\underbracket[0.4pt][2pt]{\\frac{1}{2}(4m) v_1^{2} - 0}_{\\displaystyle\\text{運動エネルギーの変化}} = \\underbracket[0.4pt][2pt]{+\\mu' m g\\, x_Q}_{\\displaystyle\\text{摩擦力の仕事}}", { no: '④' })],
    keisan: '—',
    ans: p('③, ④.'),
    gimmi: p('P は負の仕事(減速)、Q は正の仕事(加速).'),
  }),

  qa('(8)', {
    genshou: p('③ は $x_P$ と $v_1$ だけを含む。(5) で $v_1$ が分かっている.'),
    kaihou: p("[[$x_P$ を $v_0$, $\\mu'$, $g$ を用いて表しなさい]] → ③ に $v_1 = \\frac{v_0}{5}$ を代入する."),
    tate: p('③.'),
    keisan: eq("\\frac{1}{2} m \\cdot \\frac{24}{25} v_0^{2} = \\mu' m g\\, x_P"),
    ans: eq("x_P = \\frac{12 v_0^{2}}{25\\mu' g}\\ .", { lead: '③ に $v_1 = \\frac{v_0}{5}$ を代入して', ther: true }),
    gimmi: p('$x_P > 0$。次の (9) で、$x_P - x_Q$ と照らして確かめる.'),
  }),

  qa('(9)', {
    genshou: [fig(figD({ names: ['\\mathrm{P}', '\\mathrm{Q}'] }), { cap: 'P は減速($v_0 \\to v_1$)、Q は加速($0 \\to v_1$)' }),
      p('求めるのは、Q 上を P が動いた距離 $\\ell$(Q に対する P の移動距離).')],
    kaihou: p('[[物体Q上を物体Pが移動した距離]]、[[$v_0$, $t_1$ を用いて表しなさい]] → $v$-$t$ グラフの斜線部の面積は、P と Q の移動距離の差、つまり $\\ell$ を表す.'),
    tate: [head('$v$-$t$ グラフの面積'), p('斜線部は、底辺 $t_1$、高さ $v_0$ の三角形.')],
    ans: eq('\\ell = \\underbracket[0.4pt][2pt]{\\frac{1}{2} v_0 t_1}_{\\displaystyle\\text{三角形の面積}}\\ .', { ther: true }),
    gimmi: check("④ より $x_Q = \\frac{2 v_1^{2}}{\\mu' g} = \\frac{2 v_0^{2}}{25\\mu' g}$。$x_P - x_Q = \\frac{12 - 2}{25}\\cdot\\frac{v_0^{2}}{\\mu' g} = \\frac{2 v_0^{2}}{5\\mu' g}$。これは (6) の $t_1$ を代入した $\\ell = \\frac{1}{2} v_0 t_1 = \\frac{2 v_0^{2}}{5\\mu' g}$ と一致する."),
  }),
].join('\n');

const html = page({
  title: '2026年度サンプル 大問4  P が Q の上をすべる運動',
  lead: "中島テンプレによる答案(下書き)。質量 $m$ の P が速さ $v_0$ で、なめらかな床の上の質量 $4m$ の Q に乗る。P–Q 間の動摩擦係数は $\\mu'$。",
  body,
});
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), MODE === 'show' ? '2026-sample-4.html' : `2026-sample-4.${MODE}.html`);
fs.writeFileSync(out, html);
console.log('wrote', out);
