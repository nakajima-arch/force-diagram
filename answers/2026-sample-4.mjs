// 2026年度サンプル 大問4(P が Q の上をすべる: 運動量・エネルギー)の答案。
// 実行: node answers/2026-sample-4.mjs  →  answers/2026-sample-4.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tex, force, box, dot, floor, jp, figure, JS } from '../tools/draw.mjs';
import { figA, figD } from '../tools/figures.mjs';
import { page, sub, head, op, eq, p, note, check, fig } from '../tools/answer.mjs';

// (1) P が受ける力(重力・垂直抗力・動摩擦力)。速さの情報は描かない。
// 作用点: mg は重心、N と μ'N は接触面。重なって見えないよう、N は重力から横にずらす。
const figForce = () => {
  let s = floor(80, 240, 140) + jp(88, 166, 'Q の上面', { size: JS });
  s += box(140, 100, 40, 40) + tex(120, 98, 'm', { anchor: 'end' });
  s += force(160, 120, 160, 196) + dot(160, 120);       // mg: 重心から
  s += force(174, 140, 174, 56) + dot(174, 140);        // N: 接触面から
  s += force(146, 140, 78, 140) + dot(146, 140);        // μ'N: 接触面から(P は Q に対して右へすべるので左向き)
  s += tex(186, 70, 'N') + tex(170, 200, 'mg') + tex(112, 128, "\\mu' N", { anchor: 'middle' });
  return figure(230, 180, `<g transform="translate(-45,-40)">${s}</g>`);   // 余白を切り詰めて図を大きく見せる
};

const body = [
  sub('(1)', fig(figForce(), { cap: 'P が受ける力(重力は重心、垂直抗力・摩擦力は接触面から)' }),
    head('鉛直方向の力のつりあい'),
    eq('0 = N - mg'),
    eq('N = mg\\ .', { ther: true })),

  sub('(2)',
    head('動摩擦力'),
    eq("f = \\mu' N = \\mu' m g\\ .")),

  sub('(3)',
    p('P, Q の水平方向には外力がはたらかない(床はなめらか)ので、運動量の和は保存する.'),
    p('動摩擦力(非保存力)が仕事をするので、力学的エネルギーの和は保存しない.'),
    eq('\\text{ウ}\\ .', { ther: true })),

  sub('(4)', fig(figA({ states: ['状態1', '状態2'] }), { cap: '状態1(P が Q に乗った直後)と状態2(一体)。右向きを正とする' }),
    head('力積と運動量の関係', '右向きを正'),
    eq('\\mathrm{P}:\\ m v_1 - m v_0 = -\\mu\' m g\\, t_1', { no: '①' }),
    eq('\\mathrm{Q}:\\ 4m v_1 - 4m\\cdot 0 = +\\mu\' m g\\, t_1', { no: '②' })),

  sub('(5)',
    op('①+② より $t_1$ を消去して'),
    eq('5m v_1 - m v_0 = 0'),
    eq('v_1 = \\frac{v_0}{5}\\ .', { ther: true })),

  sub('(6)',
    op('② に $v_1$ を代入して'),
    eq("\\frac{4}{5} m v_0 = \\mu' m g\\, t_1"),
    eq("t_1 = \\frac{4 v_0}{5\\mu' g}\\ .", { ther: true })),

  sub('(7)',
    head('仕事とエネルギーの関係', '右向きを正'),
    eq("\\mathrm{P}:\\ \\frac{1}{2} m v_1^{2} - \\frac{1}{2} m v_0^{2} = -\\mu' m g\\, x_P", { no: '③' }),
    eq("\\mathrm{Q}:\\ \\frac{1}{2}(4m) v_1^{2} - 0 = +\\mu' m g\\, x_Q", { no: '④' })),

  sub('(8)',
    op('③ に $v_1 = \\frac{v_0}{5}$ を代入して'),
    eq("\\frac{1}{2} m \\cdot \\frac{24}{25} v_0^{2} = \\mu' m g\\, x_P"),
    eq("x_P = \\frac{12 v_0^{2}}{25\\mu' g}\\ .", { ther: true })),

  sub('(9)', fig(figD({ names: ['\\mathrm{P}', '\\mathrm{Q}'] }), { cap: 'P は減速($v_0\\to v_1$)、Q は加速($0\\to v_1$)' }),
    head('$v$-$t$ グラフの斜線部の面積より'),
    p('斜線部は、Q に対する P の移動距離 $\\ell$ を表す.'),
    eq('\\ell = \\frac{1}{2} v_0 t_1\\ .'),
    note("(6) の $t_1$ を代入すると $\\ell = \\frac{2 v_0^{2}}{5\\mu' g}$ ."),
    check("④ より $x_Q = \\frac{2 v_1^{2}}{\\mu' g} = \\frac{2 v_0^{2}}{25\\mu' g}$。$x_P - x_Q = \\frac{12 - 2}{25}\\cdot\\frac{v_0^{2}}{\\mu' g} = \\frac{2 v_0^{2}}{5\\mu' g}$ で $\\ell$ と一致する.")),
].join('\n');

const html = page({
  title: '2026年度サンプル 大問4  P が Q の上をすべる運動',
  lead: "中島テンプレによる答案(下書き)。質量 $m$ の P が速さ $v_0$ で、なめらかな床の上の質量 $4m$ の Q に乗る。P–Q 間の動摩擦係数は $\\mu'$。",
  body,
});
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '2026-sample-4.html');
fs.writeFileSync(out, html);
console.log('wrote', out);
