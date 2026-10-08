// 図の関数。どの関数も SVG 文字列を返す。座標は px(右が x、下が y)。
// 作用点の約束(重要):
//   重力 mg … 重心 / 垂直抗力 N・摩擦力 f … 接触面の上 / 張力 T … 糸との接点 / 手の力 … ふれている点
import { C, tex, arrow, accel, force, line, box, ball, dot, floor, dim, stateLabel, jp, arc, hatch, figure } from './draw.mjs';

// ============ A 運動量・エネルギー: 状態1(t=0)と状態2(t=t1)を並べる ============
export const figA = (o = {}) => {
  const L = 160;                 // 物体の左端(P も Q も同じ位置から出発)
  const P = { w: 30 }, Q = { w: 195, h: 32 };
  const dxP = 405, dxQ = 360;    // 状態2までの移動距離(図の上の長さ)
  let s = '';
  s += stateLabel(205, 52, o.states?.[0] ?? 't=0') + stateLabel(595, 52, o.states?.[1] ?? 't=t_1');
  // --- P(上段) ---
  const py = 96;                 // P の上端 → 下端 126(これが接触面)
  s += tex(130, 80, 'm', { size: 22 });
  s += box(L, py, P.w, P.w);
  s += arrow(L + P.w + 6, py + 15, L + P.w + 72, py + 15, { w: 2 });
  s += tex(L + P.w + 84, py + 22, 'v_0', { size: 22 });
  // 動摩擦力 μ'mg は P の下面(Q との接触面)から左向き
  s += force(L + P.w / 2, py + P.w, L - 48, py + P.w) + dot(L + P.w / 2, py + P.w);
  s += tex(L - 54, py + P.w + 5, "\\mu' m g", { size: 22, color: C.force, anchor: 'end' });
  s += box(L + dxP, py + 2, P.w, P.w);
  s += arrow(L + dxP + P.w + 6, py + 17, L + dxP + P.w + 72, py + 17, { w: 2 });
  s += tex(L + dxP + P.w + 84, py + 24, 'v_1', { size: 22 });
  // x_P
  s += dim(L, L + dxP, 160, { gap: [L + 112, L + 190] });
  s += tex(L + 151, 168, 'x_P', { size: 22, anchor: 'middle' });
  // --- Q(下段) ---
  const qy = 240;
  s += jp(L - 40, qy + 24, '止', { size: 16 });
  s += tex(L + 20, qy - 12, '4m', { size: 22 });
  s += box(L, qy, Q.w, Q.h);
  // 動摩擦力 μ'mg は Q の上面(P との接触面)から右向き
  s += force(L + Q.w / 2, qy, L + Q.w / 2 + 70, qy) + dot(L + Q.w / 2, qy);
  s += tex(L + Q.w / 2 + 35, qy - 10, "\\mu' m g", { size: 22, color: C.force, anchor: 'middle' });
  s += box(L + dxQ, qy - 12, Q.w, Q.h);
  s += arrow(L + dxQ + Q.w + 14, qy + 4, L + dxQ + Q.w + 80, qy + 4, { w: 2 });
  s += tex(L + dxQ + Q.w + 92, qy + 12, 'v_1', { size: 22 });
  // x_Q と ℓ(求める量は緑)
  s += dim(L, L + dxQ, 313, { gap: [L + 100, L + 180] });
  s += tex(L + 140, 322, 'x_Q', { size: 22, anchor: 'middle' });
  s += arrow(L + dxQ, 313, L + dxP, 313, { color: C.target, w: 2.6 }) + line(L + dxQ, 300, L + dxQ, 326, { color: C.target, w: 2.6 });
  s += tex(L + (dxQ + dxP) / 2, 352, '\\ell', { size: 22, color: C.target, anchor: 'middle' });
  s += jp(20, 392, '右向きを正とする.', { size: 16 });
  return figure(880, 400, s);
};

// ============ B 力の図示(作用点を正しく) ============
export const figB = (o = {}) => {
  // 粗い水平面上を右へすべる物体。重心 G=(160,120)、接触面は y=140
  let s = floor(60, 260, 140);
  s += box(140, 100, 40, 40);
  // mg: 重心から  /  N, μN: 接触面から
  s += force(160, 120, 160, 200) + dot(160, 120);
  s += force(174, 140, 174, 44) + dot(174, 140);   // N は重力と重ならないよう、接触面上で右にずらす
  s += force(160, 140, 80, 140);
  s += tex(186, 56, 'N', { size: 22 }) + tex(168, 196, 'mg', { size: 22 }) + tex(70, 126, '\\mu N', { size: 22, anchor: 'middle' });
  s += arrow(196, 120, 246, 120, { w: 1.8 });      // 運動の向き(力ではないので黒・細く)
  s += jp(196, 108, '運動の向き', { size: 16 });
  s += accel(150, 76, 96, 76) + tex(123, 66, 'a', { size: 22, color: C.force, anchor: 'middle' });   // 減速するので加速度は左向き
  return figure(320, 220, s);
};

// ============ C 壁との衝突: 速度を成分に分け、力積 |I| を示す ============
export const figC = (o = {}) => {
  const Cx = 230, Cy = 276;       // 衝突点
  const Bx = 135, By = 111.5;     // 入射前のボール中心(v0 は壁と60°)
  let s = floor(30, 430, Cy);
  s += ball(Bx, By, 14);
  s += arrow(142, 123.6, Cx - 3, Cy - 6, { w: 2 });
  s += tex(150, 212, 'v_0', { size: 22 });
  // v0 の成分(ボールの位置から)
  s += arrow(150, By, Cx, By, { color: C.compB, w: 2 });
  s += arrow(Bx, 127, Bx, Cy - 4, { color: C.compA, w: 2 });
  s += tex(188, 80, '\\frac{1}{2}v_0', { size: 22, color: C.compB, anchor: 'middle' });
  s += tex(84, 205, '\\frac{\\sqrt{3}}{2}v_0', { size: 22, color: C.compA, anchor: 'middle' });
  // 反射 v(壁と30°)と成分(衝突点から)
  s += arrow(Cx + 3, Cy - 2, 325, 221, { w: 2 }) + tex(333, 216, 'v', { size: 22 });
  s += arrow(Cx + 3, Cy, 326, Cy, { color: C.compB, w: 2 });
  s += arrow(248, Cy, 248, 222, { color: C.compA, w: 2 });
  s += `<path d="M272,206 Q256,208 249,220" fill="none" stroke="${C.ink}" stroke-width="1.1"/>`;
  s += tex(286, 196, '\\frac{1}{2}v', { size: 22, color: C.compA, anchor: 'middle' });
  s += tex(268, 318, '\\frac{\\sqrt{3}}{2}v', { size: 22, color: C.compB, anchor: 'middle' });
  // 力積 |I|: 壁が球に与える。衝突点から鉛直上向き
  s += arrow(Cx, Cy - 8, Cx, 176, { w: 3.6 }) + tex(Cx - 16, 166, '|I|', { size: 22, anchor: 'middle' });
  // 角度
  s += arc(Cx, Cy, 40, 180, 120) + jp(150, 266, '60°', { size: 16 });
  s += arc(Cx, Cy, 50, 0, 30) + jp(338, 262, '30°', { size: 16 });
  return figure(460, 335, s);
};

// ============ D v-t グラフ: 面積 = 相対変位 ============
export const figD = (o = {}) => {
  const O = [60, 235], v0y = 75, v1y = 203, t1x = 230;   // v1 = v0/5 の縮尺
  let s = hatch([[O[0], v0y], [O[0], O[1]], [t1x, v1y]], { id: 'hD' });
  s += arrow(O[0], O[1], O[0], 28, { w: 2 }) + arrow(O[0], O[1], 335, O[1], { w: 2 });
  s += line(O[0], v0y, t1x, v1y, { w: 2.2 }) + line(O[0], O[1], t1x, v1y, { w: 2.2 });
  if (o.names) s += tex(118, 104, o.names[0], { size: 22 }) + tex(188, 232, o.names[1], { size: 22 });
  s += line(t1x, v1y, t1x, O[1], { w: 1.2, dash: '5 4' }) + line(O[0], v1y, t1x, v1y, { w: 1.2, dash: '5 4' });
  s += tex(44, 30, 'v', { size: 22, anchor: 'end' }) + tex(342, 258, 't', { size: 22 });
  s += tex(48, 82, 'v_0', { size: 22, anchor: 'end' }) + tex(48, 210, 'v_1', { size: 22, anchor: 'end' });
  s += tex(42, 256, '\\mathrm{O}', { size: 22, anchor: 'end' }) + tex(t1x, 258, 't_1', { size: 22, anchor: 'middle' });
  s += jp(150, 118, '斜線部の面積 = ', { size: 16, color: C.target });
  s += tex(256, 118, '\\ell', { size: 22, color: C.target });
  return figure(360, 280, s);
};

