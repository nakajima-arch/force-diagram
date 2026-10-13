// R-7 理科(物理) 大問1(あらい斜面上の物体 A, B: 摩擦・衝突・エネルギー)の模範解答。
// 実行: node answers/r7-p1-slope.mjs        → answers/r7-p1-slope.html(途中式つき)
//       node answers/r7-p1-slope.mjs none   → answers/r7-p1-slope.none.html(答案だけ)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C, tex, arrow, accel, force, line, dot, jp, arc, circ, figure, FS, JS } from '../tools/draw.mjs';
import { setCalc, page, qa, head, eq, p, note, fig } from '../tools/answer.mjs';

const MODE = process.argv[2] ?? 'show';
setCalc(MODE);
const T = String.raw;

// ============ 斜面の作図部品(θ = 30°。画面の右上がり) ============
const th = Math.PI / 6;
const U = [Math.cos(th), -Math.sin(th)];          // 斜面を上る向き
const N = [-Math.sin(th), -Math.cos(th)];         // 斜面から外向きの法線
const at = (P, v, k) => [P[0] + v[0] * k, P[1] + v[1] * k];
const pts = (a) => a.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
const L = (P, dx, dy, src, color = C.ink, anchor = 'start') => tex(P[0] + dx, P[1] + dy, src, { color, anchor });

/** 斜面(点 O から長さ len)。斜面の下は薄い灰色の面。水平面は点線、角 θ */
function slope(O, len, { theta = true } = {}) {
  const E = at(O, U, len);
  let s = `<polygon points="${pts([O, E, [E[0], O[1]]])}" fill="#EDEDED"/>`;
  s += line(O[0], O[1], E[0] + 4, O[1], { w: 1.2, dash: '5 4' });
  s += line(O[0], O[1], E[0], E[1], { color: C.wall, w: 2.6 });
  if (theta) s += arc(O[0], O[1], 40, 0, 30) + tex(O[0] + 48, O[1] - 5, T`\theta`);
  return s;
}
/** 斜面上の箱(足元の中心 F、斜面方向の幅 w、高さ h)。{ poly, C(重心) } */
function block(F, w, h, { fill = '#fff' } = {}) {
  const a = at(F, U, -w / 2), b = at(F, U, w / 2);
  const poly = `<polygon points="${pts([a, b, at(b, N, h), at(a, N, h)])}" fill="${fill}" stroke="${C.ink}" stroke-width="2.2"/>`;
  return { poly, C: at(F, N, h / 2) };
}

// ---- 力の図: 斜面上の物体が受ける力。重力は重心から(細い破線)、成分は朱と青、N・摩擦力は接触面から ----
//  kind: static(静止)/ sliding(すべり下りる。加速度 a)/ uniform(等速。速さ v)
const figForce = ({ kind = 'static', mass = 'm', name = 'A' } = {}) => {
  const O = [30, 250], g = 90;
  const F = at(O, U, 150), w = 70, h = 40;
  const B = block(F, w, h), Cc = B.C;
  let s = slope(O, 270) + B.poly + L(at(at(Cc, U, 66), N, 16), 0, 0, name, C.ink, 'middle');
  // 重力 mg(破線)と、その成分(斜面に沿う成分=朱、垂直な成分=青)
  const tipG = [Cc[0], Cc[1] + g];
  s += `<path d="M${Cc[0]},${Cc[1]} L${tipG[0]},${tipG[1] - 6}" stroke="${C.force}" stroke-width="1.6" stroke-dasharray="5 4" fill="none"/>`;
  s += arrow(tipG[0], tipG[1] - 8, tipG[0], tipG[1], { color: C.force, w: 1.6 });
  const tipS = at(Cc, U, -g * 0.5), tipC = at(Cc, N, -g * Math.cos(th));
  s += arrow(...Cc, ...tipS, { color: C.compA, w: 2.4 }) + arrow(...Cc, ...tipC, { color: C.compB, w: 2.4 }) + dot(...Cc, 3, C.force);
  // 垂直抗力 N と摩擦力(接触面から。N は斜面の上側にずらす)
  const Pn = at(F, U, 30), Pf = at(F, U, -34);
  const tipN = at(Pn, N, g * Math.cos(th)), fl = kind === 'sliding' ? g * 0.25 : g * 0.5, tipF = at(Pf, U, fl);
  s += force(...Pn, ...tipN, { color: C.compB }) + dot(...Pn, 3, C.compB) + force(...Pf, ...tipF, { color: C.compA }) + dot(...Pf, 3, C.compA);   // 垂直な力は青、斜面に沿う力は朱
  // ラベル(矢印と同じ色)
  s += L(tipN, 8, -2, 'N', C.compB);
  s += L(tipF, 4, 22, kind === 'sliding' ? T`\frac{\mu}{2}N` : kind === 'uniform' ? T`\mu_B N` : 'f', C.compA);
  s += L(tipG, 8, 18, T`${mass}g`, C.force);
  s += L(tipS, -8, 14, T`${mass}g\sin\theta`, C.compA, 'end');
  s += L(tipC, 8, 20, T`${mass}g\cos\theta`, C.compB);
  if (kind === 'sliding') { const S0 = at(Cc, N, 44), S1 = at(S0, U, -56); s += accel(...S0, ...S1) + L(S1, -4, -12, 'a', C.force, 'end'); }
  if (kind === 'uniform') { const S0 = at(Cc, N, 44), S1 = at(S0, U, -56); s += arrow(...S0, ...S1, { w: 2 }) + L(S1, -4, -12, 'v', C.ink, 'end'); }
  return figure(300, 285, s);
};

// ---- 状態の図: A は O から d + l、B は d の位置。A の移動(→ B のところまで)と B の移動(→ O まで)を緑で ----
const figStates = () => {
  const O = [56, 250], d = 130, l = 110;
  let s = slope(O, 310) + L(O, -10, 22, T`\mathrm{O}`, C.ink, 'end');
  const FB = at(O, U, d), FA = at(O, U, d + l);
  const bb = block(FB, 52, 30), ba = block(FA, 52, 30);
  s += bb.poly + ba.poly;
  s += L(at(bb.C, N, 34), 0, 0, 'B', C.ink, 'middle') + jp(...at(at(bb.C, N, 34), U, 20), '止', { size: JS });
  s += L(at(ba.C, N, 34), 0, 0, 'A', C.ink, 'middle') + jp(...at(at(ba.C, N, 34), U, 20), '止', { size: JS });
  // 距離 d, l(斜面の上側に平行な寸法線)
  const off = 64;
  const mk = (a, b, lab) => {
    const P = at(at(O, U, a), N, off), Q = at(at(O, U, b), N, off), M = at(P, U, (b - a) / 2);
    return line(...P, ...Q, { w: 1.4 }) + line(...at(P, N, -6), ...at(P, N, 6)) + line(...at(Q, N, -6), ...at(Q, N, 6)) + L(at(M, N, 12), 0, 6, lab, C.ink, 'middle');
  };
  s += mk(0, d, 'd') + mk(d, d + l, 'l');
  // 移動(緑): A は B のところまで、B は O まで。斜面の下側(灰色の面の中)に描く
  const mv = (a, b) => arrow(...at(at(O, U, a), N, -26), ...at(at(O, U, b), N, -26), { color: C.target, w: 2.6 });
  s += mv(d + l - 10, d + 12) + mv(d - 12, 14);
  return figure(350, 290, s);
};

// ---- 衝突の図: 衝突直前(A は速さ v、B は止)と、衝突直後(A は止、B は速さ V)を並べる。斜面下向きを正 ----
const figCollision = () => {
  const half = (O, who) => {
    let s = slope(O, 190, { theta: false });
    const FB = at(O, U, 70), FA = at(O, U, 70 + 56);
    const bb = block(FB, 56, 34), ba = block(FA, 56, 34);
    s += bb.poly + ba.poly + L(at(at(bb.C, U, -4), N, 38), 0, 0, 'B', C.ink, 'middle') + L(at(at(ba.C, U, 4), N, 38), 0, 0, 'A', C.ink, 'middle');
    // 速さの矢印は、動く物体の上(斜面の上側)に、下向き(−U)に描く
    const sp = (blk, src) => { const S0 = at(at(blk.C, N, 78), U, 30), S1 = at(S0, U, -66); return arrow(...S0, ...S1, { w: 2.2 }) + L(S1, -6, -4, src, C.ink, 'end'); };
    s += who === 'before' ? sp(ba, 'v') + jp(...at(bb.C, U, -2), '', {}) + jp(...at(at(bb.C, U, -44), N, 14), '止', { size: JS })
                          : sp(bb, 'V') + jp(...at(at(ba.C, U, 44), N, 14), '止', { size: JS });
    return s;
  };
  let s = jp(110, 22, '衝突直前', { color: C.label, anchor: 'middle' }) + jp(340, 22, '衝突直後', { color: C.label, anchor: 'middle' });
  s += half([16, 240], 'before') + half([250, 240], 'after');
  return figure(450, 260, s);
};

// ---- エネルギーの図: 初め(A は d + l、B は d、ともに止)と、最後(A は d で止、B は O で速さ V) ----
const figEnergy = () => {
  const half = (O, who) => {
    const d = 100, l = 80;
    let s = slope(O, 215, { theta: false }) + L(O, -8, 24, T`\mathrm{O}`, C.ink, 'end');
    const pos = who === 'first' ? { A: d + l, B: d } : { A: d, B: 26 };
    const ba = block(at(O, U, pos.A), 46, 28), bb = block(at(O, U, pos.B), 46, 28);
    s += ba.poly + bb.poly + L(at(ba.C, N, 34), -10, 0, 'A', C.ink, 'middle') + L(at(bb.C, N, 34), -10, 0, 'B', C.ink, 'middle');
    const stop = (blk) => jp(...at(at(blk.C, N, 34), U, 18), '止', { size: JS });
    if (who === 'last') { const S0 = at(at(bb.C, N, 70), U, 20), S1 = at(S0, U, -56); s += arrow(...S0, ...S1, { w: 2.2 }) + L(S1, -6, -4, 'V', C.ink, 'end') + stop(ba); }
    else s += stop(ba) + stop(bb);
    return s;
  };
  let s = jp(130, 24, '初め', { color: C.label, anchor: 'middle' }) + jp(400, 24, '最後', { color: C.label, anchor: 'middle' });
  s += half([44, 240], 'first') + half([314, 240], 'last');
  return figure(530, 280, s);
};

// ============ 答案 ============
const body = [
  qa('(1)', {
    genshou: [fig(figForce({ kind: 'static' }), { cap: 'A が受ける力(重力は重心、垂直抗力・静止摩擦力は接触面から。重力は斜面方向と垂直方向に分ける)' }),
      p('A は斜面上にあり、斜面に垂直な方向には動かない.')],
    kaihou: p('[[物体 A が斜面から受ける垂直抗力の大きさ]] → 斜面に垂直な方向の力のつりあい.'),
    tate: [head('斜面に垂直な方向の力のつりあい', '$N$:垂直抗力'),
      eq(T`\underbracket[0.4pt][2pt]{0}_{\displaystyle\text{合力}} = \underbracket[0.4pt][2pt]{N}_{\displaystyle\text{垂直抗力}} - \underbracket[0.4pt][2pt]{mg\cos\theta}_{\displaystyle\text{重力の成分}}`)],
    keisan: '—',
    ans: eq(T`N = mg\cos\theta`, { ther: true }),
    gimmi: p(T`$\theta = 0$ で $N = mg$(水平面)となり、合う.`),
  }),

  qa('(2)', {
    genshou: p('A は静止している。静止摩擦力 $f$ は、最大値とは限らない.'),
    kaihou: p('[[物体 A が静止している場合]] → 斜面に沿う方向の力のつりあいで、静止摩擦力を決める.'),
    tate: [head('斜面に沿う方向の力のつりあい', '$f$:静止摩擦力'),
      eq(T`\underbracket[0.4pt][2pt]{0}_{\displaystyle\text{合力}} = \underbracket[0.4pt][2pt]{mg\sin\theta}_{\displaystyle\text{重力の成分(下向き)}} - \underbracket[0.4pt][2pt]{f}_{\displaystyle\text{静止摩擦力(上向き)}}`)],
    keisan: '—',
    ans: eq(T`f = mg\sin\theta`, { ther: true }),
    gimmi: p(T`静止できる条件 $f \le \mu N$ より $\tan\theta \le \mu$ となる(最大静止摩擦力 $\mu N$ をこえない).`),
  }),

  qa('(3)', {
    genshou: p('A がすべり下りているときは、動摩擦力がはたらく(向きは斜面を上る向き).'),
    kaihou: p(T`[[すべり下りる場合]] → 動摩擦力は、動摩擦係数 $\frac{\mu}{2}$ と垂直抗力 $N$ の積で決まる.`),
    tate: [head('動摩擦力の式', "$f'$:動摩擦力"), eq(T`f' = \underbracket[0.4pt][2pt]{\frac{\mu}{2}}_{\displaystyle\text{動摩擦係数}}\ \underbracket[0.4pt][2pt]{N}_{\displaystyle\text{(1) の値}}`)],
    keisan: eq(T`f' = \frac{\mu}{2}\,mg\cos\theta`),
    ans: eq(T`f' = \frac{\mu}{2}\,mg\cos\theta`, { ther: true }),
    gimmi: p('静止摩擦係数 $\\mu$ より動摩擦係数 $\\frac{\\mu}{2}$ が小さい(動摩擦力は最大静止摩擦力より小さい)ので、つじつまが合う.'),
  }),

  qa('(4)', {
    genshou: p(T`以下は $\mu$ を使わず、$\theta = \frac{\pi}{6}$ とする。小さな力を加えただけで A がすべり出す = 静止摩擦力が最大値にちょうど達している.`),
    kaihou: p('[[無視できるほど小さな力を斜面に沿って下向きに物体Aに加えると、物体Aだけがすべり下り始めた]] → 静止摩擦力が最大値 $\\mu N$ のとき(限界). 斜面に沿う方向のつりあいで、$f = \\mu N$ とおく.'),
    tate: [head('斜面に沿う方向の力のつりあい(限界)'),
      eq(T`\underbracket[0.4pt][2pt]{mg\sin\theta}_{\displaystyle\text{重力の成分}} = \underbracket[0.4pt][2pt]{\mu\,mg\cos\theta}_{\displaystyle\text{最大静止摩擦力}}`)],
    keisan: [eq(T`\mu = \frac{\sin\theta}{\cos\theta} = \tan\theta`), eq(T`\mu = \tan\frac{\pi}{6}`)],
    ans: eq(T`\mu = \frac{1}{\sqrt{3}}`, { ther: true }),
    gimmi: p(T`$\frac{1}{\sqrt{3}} \approx 0.58 < 1$ で、摩擦係数としてもっともらしい.`),
  }),

  qa('(5)', {
    genshou: [fig(figStates(), { cap: '初め(A は O から $d + l$、B は $d$、ともに止)。A は $l$ だけすべって B に衝突する(緑)' }),
      fig(figForce({ kind: 'sliding' }), { cap: 'すべり下りる A が受ける力。加速度 $a$ は斜面下向き(正の向き)' }),
      p('A は静止から動き始め、斜面に沿って一定の加速度で $l$ だけ進んで B に衝突する.')],
    kaihou: p('[[物体Aが動き始めた瞬間を時刻の原点]]、[[物体Bと衝突する]] → A の運動方程式で加速度 $a$ を求め、等加速度運動の式で時間を求める.'),
    tate: [head('運動方程式(斜面に沿う方向)', '$a$:A の加速度(斜面下向きを正)'),
      eq(T`ma = \underbracket[0.4pt][2pt]{mg\sin\theta}_{\displaystyle\text{重力の成分}} - \underbracket[0.4pt][2pt]{\frac{\mu}{2}\,mg\cos\theta}_{\displaystyle\text{動摩擦力}}`),
      head('等加速度運動の式', '$t_1$:衝突までの時間'), eq(T`l = \frac{1}{2}\,a\,t_1^{\,2}`)],
    keisan: [eq(T`a = g\cdot\frac{1}{2} - \frac{1}{2\sqrt{3}}\,g\cdot\frac{\sqrt{3}}{2} = \frac{g}{2} - \frac{g}{4} = \frac{g}{4}`),
      eq(T`t_1^{\,2} = \frac{2l}{a} = \frac{8l}{g}`)],
    ans: eq(T`t_1 = \sqrt{\frac{8l}{g}}\ \left(= 2\sqrt{\frac{2l}{g}}\right)`, { ther: true }),
    gimmi: p(T`$0 < a < g\sin\theta = \frac{g}{2}$ で、摩擦のぶんだけ重力の成分より小さい. $l$ が長いほど $t_1$ は長い.`),
  }),

  qa('(6)', {
    genshou: p('衝突の直前の A の速さ $v$. A は静止から $l$ だけ進んだ.'),
    kaihou: p('時間を使わずに、等加速度運動の式 $v^2 - v_0^2 = 2ax$ で求める(別解:$v = a t_1$).'),
    tate: [head('等加速度運動の式'), eq(T`v^2 - 0^2 = 2\,a\,l`)],
    keisan: eq(T`v^2 = 2\cdot\frac{g}{4}\cdot l = \frac{gl}{2}`),
    ans: eq(T`v = \sqrt{\frac{gl}{2}}`, { ther: true }),
    gimmi: p(T`$v = a t_1 = \frac{g}{4}\sqrt{\frac{8l}{g}} = \sqrt{\frac{gl}{2}}$ と一致する.`),
  }),

  qa('(7)', {
    genshou: [fig(figCollision(), { cap: '衝突直前(A は速さ $v$、B は止)と衝突直後(A は止、B は速さ $V$)。斜面下向きを正とする' }),
      p('A が B に衝突する.')],
    kaihou: p('[[衝突している時間は十分短いので、衝突における重力と摩擦力の影響を考える必要はない]] → 外力を無視できる → 運動量保存則.'),
    tate: [head('運動量保存則(斜面下向きを正)', '$V$:衝突直後の B の速さ'),
      eq(T`\underbracket[0.4pt][2pt]{mv + M\cdot 0}_{\displaystyle\text{衝突直前}} = \underbracket[0.4pt][2pt]{m\cdot 0 + MV}_{\displaystyle\text{衝突直後}}`)],
    keisan: eq(T`V = \frac{m}{M}\,v`),
    ans: eq(T`V = \frac{m}{M}\sqrt{\frac{gl}{2}}`, { ther: true }),
    gimmi: p(T`$M > m$ なので $V < v$(重い B は、A より遅く動き出す).`),
  }),

  qa('(8)', {
    genshou: [fig(figForce({ kind: 'uniform', mass: 'M', name: 'B' }), { cap: 'すべり下りる B が受ける力。等速なので合力は 0' }),
      p('衝突後の B は、等速直線運動をする.')],
    kaihou: p('[[その後、物体Bは等速直線運動を始めた]] → 合力が 0 → 斜面に沿う方向の力のつりあい.'),
    tate: [head('斜面に沿う方向の力のつりあい', '$\\mu_B$:斜面と B の間の動摩擦係数'),
      eq(T`\underbracket[0.4pt][2pt]{Mg\sin\theta}_{\displaystyle\text{重力の成分}} = \underbracket[0.4pt][2pt]{\mu_B\,Mg\cos\theta}_{\displaystyle\text{動摩擦力}}`)],
    keisan: eq(T`\mu_B = \tan\theta = \tan\frac{\pi}{6}`),
    ans: eq(T`\mu_B = \frac{1}{\sqrt{3}}`, { ther: true }),
    gimmi: p(T`B は初め静止していた。静止摩擦係数は $\tan\theta$ 以上、動摩擦係数は $\tan\theta$ で、動 ≦ 静 となり、つじつまが合う.`),
  }),

  qa('(9)', {
    genshou: [fig(figStates(), { cap: 'A は $l$ だけすべって B に衝突し(緑)、B は $d$ だけ等速で進んで O に達する(緑)' }),
      p('はじめに A が衝突まですべり($t_1$)、その後 B が O まで進む($t_2$).')],
    kaihou: p('[[物体Aがすべり下り始めてから物体Bが斜面の下端点Oに達するまでに要する時間]] → (5) の $t_1$ と、衝突後に B が距離 $d$ を等速で進む時間 $t_2$ の和.'),
    tate: [head('等速直線運動の式', '$t_2$:衝突後に B が O に達するまでの時間'),
      eq(T`d = V\,t_2`), eq(T`t = t_1 + t_2`)],
    keisan: [eq(T`t_2 = \frac{d}{V} = \frac{Md}{m}\sqrt{\frac{2}{gl}}`)],
    ans: eq(T`t = \sqrt{\frac{8l}{g}} + \frac{Md}{m}\sqrt{\frac{2}{gl}}`, { ther: true }),
    gimmi: p(T`第1項、第2項とも時間の次元になる. $\frac{M}{m} > 1$ のぶん、B が遅く、時間が長くなる.`),
  }),

  qa('(10)', {
    genshou: [fig(figEnergy(), { cap: '初め(A は O から $d + l$、B は $d$、ともに止)と、最後(A は $d$ で止、B は O で速さ $V$)' }),
      p('A は $d$ のところで止まり、B は O に達している.')],
    kaihou: p('[[この間の運動で失った力学的エネルギー]] → 最初と最後の力学的エネルギーの差. O を高さ 0 とし、$\\sin\\theta = \\frac{1}{2}$.'),
    tate: [head('力学的エネルギーの差', '$\\Delta E$:失った力学的エネルギー'),
      eq(T`\Delta E = \underbracket[0.4pt][2pt]{mg(d+l)\sin\theta + Mgd\sin\theta}_{\displaystyle\text{最初}} - \underbracket[0.4pt][2pt]{\left(mgd\sin\theta + \frac{1}{2}MV^2\right)}_{\displaystyle\text{最後}}`)],
    keisan: [eq(T`\Delta E = mgl\sin\theta + Mgd\sin\theta - \frac{1}{2}MV^2`),
      eq(T`\Delta E = \frac{1}{2}mgl + \frac{1}{2}Mgd - \frac{1}{2}M\cdot\frac{m^2}{M^2}\cdot\frac{gl}{2}`)],
    ans: eq(T`\Delta E = \frac{1}{2}mgl + \frac{1}{2}Mgd - \frac{m^2gl}{4M}`, { ther: true }),
    gimmi: p('(11)(12)(13) の和と一致するかを、あとで確かめる.'),
  }),

  qa('(11)', {
    genshou: p('A は斜面を距離 $l$ すべる間、動摩擦力を受ける.'),
    kaihou: p('[[物体Aの運動で失った力学的エネルギー]] → 動摩擦力が A にした仕事の大きさ(失われた分は、摩擦力 × 距離).'),
    tate: [head('動摩擦力がする仕事', '$\\Delta E_A$:A の運動で失った力学的エネルギー'),
      eq(T`\Delta E_A = \underbracket[0.4pt][2pt]{\frac{\mu}{2}\,mg\cos\theta}_{\displaystyle\text{動摩擦力}} \times \underbracket[0.4pt][2pt]{l}_{\displaystyle\text{距離}}`)],
    keisan: eq(T`\Delta E_A = \frac{1}{2\sqrt{3}}\,mg\cdot\frac{\sqrt{3}}{2}\cdot l = \frac{1}{4}mgl`),
    ans: eq(T`\Delta E_A = \frac{1}{4}mgl`, { ther: true }),
    gimmi: p('(5) の運動方程式の摩擦の項 $\\frac{mg}{4}$ と、距離 $l$ の積になっている.'),
  }),

  qa('(12)', {
    genshou: p('衝突後の B は、斜面を距離 $d$ だけ等速ですべる.'),
    kaihou: p('[[物体Bの運動で失った力学的エネルギー]] → 動摩擦力が B にした仕事の大きさ.'),
    tate: [head('動摩擦力がする仕事', '$\\Delta E_B$:B の運動で失った力学的エネルギー'),
      eq(T`\Delta E_B = \underbracket[0.4pt][2pt]{\mu_B\,Mg\cos\theta}_{\displaystyle\text{動摩擦力}} \times \underbracket[0.4pt][2pt]{d}_{\displaystyle\text{距離}}`)],
    keisan: eq(T`\Delta E_B = Mg\sin\theta\cdot d = \frac{1}{2}Mgd`),
    ans: eq(T`\Delta E_B = \frac{1}{2}Mgd`, { ther: true }),
    gimmi: p('B は等速で、運動エネルギーは変わらない。失った分は、位置エネルギーの減少 $Mgd\\sin\\theta$ と同じになっている.'),
  }),

  qa('(13)', {
    genshou: p('A と B の衝突で、運動エネルギーが失われる(位置エネルギーは変わらない).'),
    kaihou: p('[[衝突の際に失った力学的エネルギー]] → 衝突直前の運動エネルギー(A)と、衝突直後の運動エネルギー(B)の差.'),
    tate: [head('衝突での運動エネルギーの減少', '$\\Delta E_C$:衝突で失った力学的エネルギー'),
      eq(T`\Delta E_C = \underbracket[0.4pt][2pt]{\frac{1}{2}mv^2}_{\displaystyle\text{衝突直前}} - \underbracket[0.4pt][2pt]{\frac{1}{2}MV^2}_{\displaystyle\text{衝突直後}}`)],
    keisan: eq(T`\Delta E_C = \frac{1}{4}mgl - \frac{m^2gl}{4M}`),
    ans: eq(T`\Delta E_C = \frac{mgl}{4}\left(1 - \frac{m}{M}\right)`, { ther: true }),
    gimmi: [p(T`$M > m$ なので $\Delta E_C > 0$(衝突でエネルギーは失われる).`),
      p(T`(11)+(12)+(13) $= \frac{1}{4}mgl + \frac{1}{2}Mgd + \frac{1}{4}mgl - \frac{m^2gl}{4M}$ となり、(10) と一致する.`)],
  }),
].join('\n');

const html = page({
  title: 'R-7 理科(物理) 大問1  あらい斜面上の物体 A, B(模範解答)',
  lead: T`あらい斜面(角 $\theta$)に、質量 $m$ の A と質量 $M$ の B($M > m$)。O から A までの距離は $d + l$、B までは $d$。A と斜面の静止摩擦係数は $\mu$、動摩擦係数は $\frac{\mu}{2}$.`,
  body,
});
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), MODE === 'show' ? 'r7-p1-slope.html' : `r7-p1-slope.${MODE}.html`);
fs.writeFileSync(out, html);
console.log('wrote', out);
