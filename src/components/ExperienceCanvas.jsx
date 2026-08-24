'use client';
import { useEffect, useRef } from 'react';

export default function ExperienceCanvas({ progressRef, mousePosRef, lookRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let W = 1, H = 1;
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const FINE = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    const isMobile = window.matchMedia("(pointer:coarse)").matches || window.innerWidth < 760;
    let PS = isMobile ? 0.5 : 0.9;
    let tG = 0;

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function fract(v) { return v - Math.floor(v); }
    function hash(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
    function smooth(a, b, v) { v = clamp((v - a) / (b - a), 0, 1); return v * v * (3 - 2 * v); }
    function mixc(c1, c2, k) { return [lerp(c1[0], c2[0], k) | 0, lerp(c1[1], c2[1], k) | 0, lerp(c1[2], c2[2], k) | 0]; }
    function css(c) { return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; }
    function modPos(v, m) { return ((v % m) + m) % m; }

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function makeSprite(size, color) {
      var c = document.createElement("canvas"); c.width = c.height = size;
      var g = c.getContext("2d");
      var gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gr.addColorStop(0, color.replace("A)", "0.9)"));
      gr.addColorStop(0.45, color.replace("A)", "0.32)"));
      gr.addColorStop(1, color.replace("A)", "0)"));
      g.fillStyle = gr; g.fillRect(0, 0, size, size);
      return c;
    }

    var SPR = {
      glowW: makeSprite(256, "rgba(255,255,255,A)"),
      glowWarm: makeSprite(256, "rgba(255,176,102,A)"),
      glowFire: makeSprite(256, "rgba(255,122,46,A)"),
      glowEmber: makeSprite(128, "rgba(255,90,26,A)"),
      smoke: makeSprite(256, "rgba(150,140,126,A)"),
      soft: makeSprite(64, "rgba(225,240,248,A)")
    };

    function blit(img, x, y, s, alpha, comp) {
      if (alpha <= 0) return;
      ctx.save();
      if (comp) ctx.globalCompositeOperation = comp;
      ctx.globalAlpha *= alpha;
      ctx.drawImage(img, x - s / 2, y - s / 2, s, s);
      ctx.restore();
    }

    function breathe(t) {
      if (RM) return { x: 0, y: 0 };
      return { x: Math.sin(t * 0.5) * 3 + Math.sin(t * 1.7) * 0.8, y: Math.cos(t * 0.42) * 2.4 + Math.sin(t * 2.3) * 0.6 };
    }

    function drawFringe(a) {
      if (a <= 0.01) return;
      var gl = ctx.createLinearGradient(0, 0, W * 0.22, 0);
      gl.addColorStop(0, "rgba(80,220,255," + (a * 0.16) + ")"); gl.addColorStop(1, "rgba(80,220,255,0)");
      ctx.fillStyle = gl; ctx.fillRect(0, 0, W * 0.22, H);
      var gr2 = ctx.createLinearGradient(W, 0, W * 0.78, 0);
      gr2.addColorStop(0, "rgba(255,90,70," + (a * 0.14) + ")"); gr2.addColorStop(1, "rgba(255,90,70,0)");
      ctx.fillStyle = gr2; ctx.fillRect(W * 0.78, 0, W * 0.22, H);
    }

    var farFish = [];
    for (var i = 0; i < 18; i++) farFish.push({ x: hash(i * 3.7), y: hash(i * 9.1), sp: 5 + hash(i * 5.3) * 9, dir: i % 2 ? 1 : -1, s: 4 + hash(i * 7.7) * 7, ph: hash(i) * 6.28 });
    var schools = [];
    for (var s0 = 0; s0 < 3; s0++) schools.push({ n: 7 + (s0 % 2), dir: s0 % 2 ? 1 : -1, y: 0.18 + hash(s0 * 17) * 0.55, sp: 13 + hash(s0 * 31) * 11, gap: 0.032 + hash(s0 * 13) * 0.02, sz: 9 + hash(s0 * 7) * 7, bx: hash(s0 * 23) });
    var midFish = [];
    for (i = 0; i < 8; i++) midFish.push({ x: hash(i * 13.7 + 3), y: hash(i * 4.9 + 1), sp: 12 + hash(i * 6.1) * 16, dir: hash(i * 2.2) > 0.5 ? 1 : -1, s: 0.026 + hash(i * 8.8) * 0.03, pal: i % 3, ph: hash(i * 7.1) * 6.28 });
    var driftFish = [{ x: 0.22, sp: 9, dir: 1, off: 0.1, s: 0.02 }, { x: 0.72, sp: 6.5, dir: -1, off: 0.55, s: 0.024 }, { x: 0.45, sp: 11, dir: 1, off: 0.82, s: 0.017 }];
    var nearFish = [{ y: 0.3, s: 0.2, sp: 26, off: 0.2, dir: 1 }, { y: 0.7, s: 0.16, sp: 20, off: 0.7, dir: -1 }];
    var bokeh = [];
    for (i = 0; i < 18; i++) bokeh.push({ x: hash(i * 3.3), y: hash(i * 7.9) * 0.6, r: 0.008 + hash(i * 5.1) * 0.034, a: 0.09 + hash(i * 9.7) * 0.22, tw: 0.5 + hash(i * 4.4) * 1.8, ph: hash(i) * 6.28 });
    var MIDS = [["#31586d", "#9fb9c4", "#e6efe9"], ["#3d5a56", "#a9c2b4", "#e8ecdb"], ["#445a70", "#b4c3cf", "#eae9e0"]];

    function drawFish(g, f) {
      var L = f.len, Hh = L * 0.34, ph = f.phase || 0;
      var b = Math.sin(ph) * L * 0.045;
      g.save();
      g.translate(f.x, f.y);
      if (f.rot) g.rotate(f.rot);
      g.scale(f.dir || 1, 1);
      var tw = Math.sin(ph + 1.1) * L * 0.055;
      g.fillStyle = f.fin;
      g.beginPath();
      g.moveTo(-L * 0.32, b * 0.7);
      g.quadraticCurveTo(-L * 0.5, tw * 0.4 - Hh * 0.08, -L * 0.62, -Hh * 0.52 + tw);
      g.quadraticCurveTo(-L * 0.48, tw * 0.5, -L * 0.62, Hh * 0.56 + tw);
      g.quadraticCurveTo(-L * 0.5, tw * 0.4 + Hh * 0.08, -L * 0.32, b * 0.7);
      g.closePath(); g.fill();
      if (f.detail > 0.35) {
        g.beginPath();
        g.moveTo(L * 0.14, -Hh * 0.56 + b * 0.5);
        g.quadraticCurveTo(0, -Hh * 1.06 + b, -L * 0.2, -Hh * 0.5 + b * 0.8);
        g.quadraticCurveTo(-L * 0.02, -Hh * 0.6 + b, L * 0.14, -Hh * 0.56 + b * 0.5);
        g.closePath(); g.fill();
      }
      var gr = g.createLinearGradient(0, -Hh * 0.7, 0, Hh * 0.7);
      gr.addColorStop(0, f.back); gr.addColorStop(0.5, f.mid); gr.addColorStop(1, f.belly);
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(L * 0.5, 0);
      g.bezierCurveTo(L * 0.24, -Hh * 0.68 + b * 0.4, -L * 0.06, -Hh * 0.74 + b, -L * 0.36, -Hh * 0.2 + b * 0.8);
      g.quadraticCurveTo(-L * 0.44, b * 0.6, -L * 0.36, Hh * 0.2 + b * 0.8);
      g.bezierCurveTo(-L * 0.06, Hh * 0.7 + b, L * 0.24, Hh * 0.64 + b * 0.4, L * 0.5, 0);
      g.closePath(); g.fill();
      if (f.accent && f.detail > 0.5) {
        g.strokeStyle = f.accent; g.lineWidth = L * 0.05; g.lineCap = "round";
        g.beginPath(); g.moveTo(L * 0.38, -Hh * 0.04);
        g.quadraticCurveTo(0, -Hh * 0.12 + b, -L * 0.34, b * 0.7); g.stroke();
      }
      if (f.detail > 0.5) {
        g.save(); g.translate(L * 0.16, Hh * 0.14); g.rotate(0.55 + Math.sin(ph * 1.3) * 0.35);
        g.globalAlpha *= 0.75;
        g.beginPath(); g.ellipse(0, 0, L * 0.1, L * 0.036, 0, 0, Math.PI * 2); g.fill();
        g.restore();
        g.strokeStyle = "rgba(0,0,0,0.2)"; g.lineWidth = L * 0.012;
        g.beginPath(); g.moveTo(L * 0.24, -Hh * 0.32); g.quadraticCurveTo(L * 0.16, 0, L * 0.24, Hh * 0.3); g.stroke();
        g.fillStyle = "#0c1014";
        g.beginPath(); g.arc(L * 0.34, -Hh * 0.16, L * 0.03, 0, Math.PI * 2); g.fill();
        g.fillStyle = "rgba(255,255,255,0.75)";
        g.beginPath(); g.arc(L * 0.348, -Hh * 0.172, L * 0.009, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = L * 0.01;
        g.beginPath(); g.moveTo(L * 0.5, 0.01 * L); g.lineTo(L * 0.44, Hh * 0.08); g.stroke();
      }
      g.restore();
    }

    function smallFish(g, x, y, s, dir, ph, col) {
      g.save(); g.translate(x, y); g.scale(dir, 1);
      g.fillStyle = col;
      var tw = Math.sin(ph) * s * 0.22;
      g.beginPath();
      g.moveTo(s * 0.55, 0);
      g.quadraticCurveTo(0, -s * 0.32, -s * 0.4, tw * 0.3);
      g.quadraticCurveTo(0, s * 0.32, s * 0.55, 0);
      g.closePath(); g.fill();
      g.beginPath();
      g.moveTo(-s * 0.35, 0); g.lineTo(-s * 0.62, -s * 0.26 + tw); g.lineTo(-s * 0.62, s * 0.26 + tw); g.closePath(); g.fill();
      g.restore();
    }

    function drawSurface(p, t) {
      if (p >= 0.245) return;
      var q = smooth(0, 0.205, p);
      var zoom = 1 + q * q * 2.9;
      var horY = H * 0.5, bx = W * 0.5, by = horY + H * 0.055;
      var entry = { x: bx + H * 0.062, y: by + H * 0.01 };
      var br = breathe(t);
      var fx, fy;
      if (q < 0.5) { var k1 = smooth(0, 0.5, q); fx = lerp(W / 2, bx, k1); fy = lerp(H * 0.52, by - H * 0.035, k1); }
      else { var k2 = smooth(0.5, 1, q); fx = lerp(bx, entry.x, k2); fy = lerp(by - H * 0.035, entry.y, k2); }
      fx += lookRef.current.x * H * 0.012 - br.x * 0.4; fy += lookRef.current.y * H * 0.008 - br.y * 0.4;
      ctx.save();
      ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-fx, -fy);
      var g = ctx.createLinearGradient(0, -H * 0.6, 0, horY);
      g.addColorStop(0, "#081326"); g.addColorStop(0.55, "#23395a");
      g.addColorStop(0.85, "#8a5a54"); g.addColorStop(1, "#e2995a");
      ctx.fillStyle = g; ctx.fillRect(-W * 0.6, -H * 0.6, W * 2.2, horY + H * 0.6);
      var sx = W * 0.5, sy = horY - H * 0.075, sr = H * 0.042;
      blit(SPR.glowWarm, sx, sy, H * 0.72, 0.5, "lighter");
      ctx.fillStyle = "#ffeccb";
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      if (zoom < 2.2) {
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        var lg = ctx.createLinearGradient(sx - W * 0.28, 0, sx + W * 0.28, 0);
        lg.addColorStop(0, "rgba(255,210,150,0)"); lg.addColorStop(0.5, "rgba(255,214,160,0.28)"); lg.addColorStop(1, "rgba(255,210,150,0)");
        ctx.fillStyle = lg; ctx.fillRect(sx - W * 0.28, sy - H * 0.002, W * 0.56, H * 0.004);
        ctx.restore();
      }
      ctx.save(); ctx.globalAlpha = 0.4;
      blit(SPR.smoke, W * 0.2 + Math.sin(t * 0.02) * 20, H * 0.2, H * 0.3, 0.5);
      blit(SPR.smoke, W * 0.78, H * 0.14, H * 0.24, 0.4);
      blit(SPR.smoke, W * 0.55, H * 0.3, H * 0.2, 0.35);
      ctx.restore();
      ctx.strokeStyle = "rgba(10,16,26,0.75)"; ctx.lineWidth = Math.max(0.7, H * 0.0012);
      for (var bi = 0; bi < 3; bi++) {
        var bxp = ((t * 9 + bi * W * 0.4) % (W * 1.4)) - W * 0.2;
        var byp = H * (0.16 + bi * 0.06) + Math.sin(t * 1.2 + bi * 3) * H * 0.008;
        var fl = Math.sin(t * 6 + bi * 2) * H * 0.006;
        ctx.beginPath();
        ctx.moveTo(bxp - H * 0.012, byp - fl); ctx.quadraticCurveTo(bxp, byp + H * 0.004, bxp, byp);
        ctx.quadraticCurveTo(bxp, byp + H * 0.004, bxp + H * 0.012, byp - fl); ctx.stroke();
      }
      var sg = ctx.createLinearGradient(0, horY, 0, H * 1.6);
      sg.addColorStop(0, "#c98850"); sg.addColorStop(0.05, "#33566b");
      sg.addColorStop(0.35, "#12314a"); sg.addColorStop(1, "#050f1c");
      ctx.fillStyle = sg; ctx.fillRect(-W * 0.6, horY, W * 2.2, H * 2.2);
      for (var wi = 1; wi <= 26; wi++) {
        var pr = wi / 26;
        var yy = horY + Math.pow(pr, 1.65) * (H * 1.35 - horY);
        ctx.strokeStyle = (wi % 2) ? "rgba(9,26,42,0.5)" : "rgba(64,120,148,0.16)";
        ctx.lineWidth = 0.5 + wi * 0.13;
        ctx.beginPath();
        var off = Math.sin(t * 0.4 + wi) * 10;
        ctx.moveTo(-W * 0.5 + off, yy);
        ctx.quadraticCurveTo(W * 0.25 + off, yy + Math.sin(t * 0.7 + wi * 2) * 2, W * 0.5 + off, yy);
        ctx.quadraticCurveTo(W * 0.75 + off, yy - Math.sin(t * 0.6 + wi) * 2, W * 1.5 + off, yy);
        ctx.stroke();
      }
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (var k = 0; k < 56; k++) {
        var gp = k / 56;
        var gy2 = horY + Math.pow(gp, 1.7) * H * 0.55;
        var hw = 6 + gp * W * 0.06;
        var gx = W * 0.5 + (hash(k * 3) - 0.5) * 2 * hw;
        var gw = (2 + hash(k * 7) * 6) * (1 + gp * 2);
        var gA = (0.04 + 0.1 * hash(k * 5)) * (0.55 + 0.45 * Math.sin(t * 2.6 + k * 1.7));
        ctx.fillStyle = "rgba(255,207,147," + gA + ")";
        ctx.fillRect(gx - gw / 2, gy2 - 0.7, gw, 1.4 + gp * 1.3);
      }
      ctx.restore();
      var bob = Math.sin(t * 0.9) * H * 0.0045, rot = Math.sin(t * 0.62) * 0.022;
      ctx.save();
      ctx.translate(bx, by + bob); ctx.rotate(rot);
      var L = H * 0.15, deck = -L * 0.12, hh = H * 0.052;
      ctx.fillStyle = "#080c12";
      ctx.beginPath();
      ctx.moveTo(-L * 0.145, deck); ctx.lineTo(-L * 0.055, deck);
      ctx.lineTo(-L * 0.04, deck - hh * 0.45); ctx.lineTo(-L * 0.022, deck - hh * 0.8);
      ctx.lineTo(-L * 0.078, deck - hh * 0.86); ctx.lineTo(-L * 0.1, deck - hh * 0.48);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(-L * 0.043, deck - hh * 0.97, hh * 0.12, 0, Math.PI * 2); ctx.fill();
      var shX = -L * 0.03, shY = deck - hh * 0.75, haX = L * 0.03, haY = deck - hh * 0.55;
      ctx.strokeStyle = "#080c12"; ctx.lineCap = "round";
      ctx.lineWidth = hh * 0.09;
      ctx.beginPath(); ctx.moveTo(shX, shY); ctx.lineTo(haX, haY); ctx.stroke();
      ctx.lineWidth = hh * 0.075;
      ctx.beginPath(); ctx.moveTo(shX - L * 0.012, shY + hh * 0.06); ctx.lineTo(haX - L * 0.012, haY + hh * 0.04); ctx.stroke();
      ctx.fillStyle = "#0a0e15";
      ctx.beginPath();
      ctx.moveTo(-L * 0.52, -L * 0.1);
      ctx.lineTo(L * 0.38, -L * 0.16);
      ctx.quadraticCurveTo(L * 0.55, -L * 0.14, L * 0.56, -L * 0.02);
      ctx.quadraticCurveTo(L * 0.5, L * 0.1, L * 0.28, L * 0.13);
      ctx.lineTo(-L * 0.36, L * 0.13);
      ctx.quadraticCurveTo(-L * 0.52, L * 0.1, -L * 0.52, -L * 0.1);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,178,102,0.55)"; ctx.lineWidth = Math.max(0.8, H * 0.0012);
      ctx.beginPath(); ctx.moveTo(-L * 0.52, -L * 0.1); ctx.lineTo(L * 0.38, -L * 0.16); ctx.stroke();
      ctx.restore();
      var hand = { x: bx + L * 0.03, y: by + bob + deck - hh * 0.55 };
      var tip = { x: bx + H * 0.052, y: by + bob - H * 0.082 };
      ctx.strokeStyle = "#0c1017"; ctx.lineWidth = Math.max(1, H * 0.0016);
      ctx.beginPath(); ctx.moveTo(hand.x, hand.y);
      ctx.quadraticCurveTo(hand.x + H * 0.02, hand.y - H * 0.05, tip.x, tip.y); ctx.stroke();
      var hd = smooth(0.05, 0.15, p);
      var hook = { x: lerp(tip.x + H * 0.004, entry.x, hd), y: lerp(tip.y + H * 0.035, entry.y, hd) };
      ctx.strokeStyle = "rgba(225,240,248,0.55)"; ctx.lineWidth = Math.max(0.7, H * 0.001);
      ctx.beginPath(); ctx.moveTo(tip.x, tip.y);
      ctx.quadraticCurveTo((tip.x + hook.x) / 2 + Math.sin(t * 1.8) * H * 0.004, (tip.y + hook.y) / 2 + H * 0.012 * (1 - hd * 0.6), hook.x, hook.y);
      ctx.stroke();
      ctx.fillStyle = "#e8b17a";
      ctx.beginPath(); ctx.arc(hook.x, hook.y, H * 0.0022, 0, Math.PI * 2); ctx.fill();
      var p0 = 0.152;
      if (p > p0) {
        for (var j = 0; j < 3; j++) {
          var rp = clamp((p - p0) * 26 - j * 0.4, 0, 1);
          if (rp > 0 && rp < 1) {
            ctx.strokeStyle = "rgba(230,245,252," + ((1 - rp) * 0.5) + ")";
            ctx.lineWidth = H * 0.0012;
            ctx.beginPath();
            ctx.ellipse(entry.x, entry.y, rp * H * 0.035 * (1 + j * 0.4) + H * 0.002, rp * H * 0.01 * (1 + j * 0.4) + H * 0.0007, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        var tau = clamp((p - p0) / 0.028, 0, 1);
        if (tau < 1) {
          ctx.fillStyle = "rgba(255,235,205," + ((1 - tau) * 0.85) + ")";
          for (var di = 0; di < 16; di++) {
            var ang = -Math.PI * 0.14 - hash(di) * Math.PI * 0.72;
            var v = H * (0.028 + hash(di + 9) * 0.035);
            ctx.beginPath();
            ctx.arc(entry.x + Math.cos(ang) * v * tau * 4, entry.y + Math.sin(ang) * v * 4 * tau + H * 0.09 * tau * tau, H * 0.0016 * (1 - tau * 0.5) + 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = "overlay";
      var ll = ctx.createRadialGradient(W * 0.12, H * 0.1, 0, W * 0.12, H * 0.1, H * 0.7);
      ll.addColorStop(0, "rgba(255,170,90," + (0.06 + 0.02 * Math.sin(t * 0.7)) + ")"); ll.addColorStop(1, "rgba(255,170,90,0)");
      ctx.fillStyle = ll; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      if (FINE && p < 0.19) {
        var rr = fract(t * 0.7) * 34;
        ctx.strokeStyle = "rgba(200,230,250," + ((1 - rr / 34) * 0.14) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(mousePosRef.current.x, mousePosRef.current.y, rr + 4, 0, Math.PI * 2); ctx.stroke();
      }
      var dv = smooth(0.205, 0.238, p);
      if (dv > 0) { ctx.fillStyle = "rgba(9,40,64," + (dv * 0.7) + ")"; ctx.fillRect(0, 0, W, H); }
    }

    function heroState(p, t, hookX, hookY) {
      if (p < 0.295 || p > 0.61) return null;
      var x, y, s = 1, dir = -1, rot = 0, spd = 8, h, k;
      if (p < 0.465) {
        h = clamp((p - 0.3) / 0.165, 0, 1);
        if (h < 0.22) {
          k = smooth(0, 0.22, h);
          x = lerp(W * 1.14, hookX + H * 0.24, k); y = lerp(H * 0.36, hookY - H * 0.05, k);
          s = lerp(0.35, 0.88, k); spd = 9; dir = -1;
        } else if (h < 0.62) {
          k = (h - 0.22) / 0.4;
          var a = -0.6 + k * Math.PI * 1.85;
          var r = H * 0.17 * (1 + 0.18 * Math.sin(k * 7));
          x = hookX + Math.cos(a) * r * 1.3; y = hookY + Math.sin(a) * r * 0.8;
          dir = Math.sin(a) > 0 ? -1 : 1; s = 0.9; spd = 6.5;
        } else if (h < 0.78) {
          k = smooth(0.62, 0.78, h);
          x = hookX + lerp(H * 0.2, H * 0.31, k); y = hookY - lerp(H * 0.02, H * 0.09, k);
          dir = 1; s = 0.92; spd = 4;
        } else {
          k = smooth(0.78, 1, h);
          x = lerp(hookX + H * 0.31, hookX + H * 0.05, k); y = lerp(hookY - H * 0.09, hookY - H * 0.004, k);
          dir = -1; s = lerp(0.92, 1, k); spd = lerp(4, 2.2, k);
        }
      } else if (p < 0.487) {
        x = hookX + H * 0.05 + Math.sin(t * 38) * H * 0.004;
        y = hookY - H * 0.004 + Math.sin(t * 31) * H * 0.003;
        dir = -1; s = 1; spd = 16;
      } else {
        k = smooth(0.487, 0.585, p);
        x = lerp(hookX + H * 0.05, W * 0.5, k) + Math.sin(t * 2.2) * 6;
        y = H * 0.5 + Math.sin(t * 1.7) * 5;
        dir = 1; rot = lerp(-0.25, -1.1, smooth(0, 0.35, k)); s = lerp(1, 0.96, k); spd = lerp(13, 9, k);
      }
      return { x: x, y: y, s: s, dir: dir, rot: rot, phase: t * spd };
    }

    function drawCaustics(t, light) {
      if (light <= 0.28) return;
      var a = (light - 0.28) / 0.72;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (var ci = 0; ci < 8; ci++) {
        blit(SPR.soft, modPos((ci / 8) * W + Math.sin(t * 0.3 + ci * 1.9) * W * 0.06, W), H * 0.08 + Math.cos(t * 0.23 + ci * 1.7) * H * 0.05, H * (0.1 + hash(ci) * 0.08), a * 0.055);
      }
      ctx.strokeStyle = "rgba(190,235,255," + (a * 0.05) + ")"; ctx.lineWidth = 1.6;
      for (var j2 = 0; j2 < 4; j2++) {
        ctx.beginPath();
        for (var x = 0; x <= W; x += 24) {
          var y = H * (0.06 + j2 * 0.05) + Math.sin(x * 0.02 + t * (1.1 + j2 * 0.2)) * H * 0.012 + Math.sin(x * 0.008 - t * 0.7) * H * 0.016;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawUnderwater(p, t) {
      var ga = smooth(0.205, 0.238, p) * (1 - smooth(0.585, 0.61, p));
      if (ga <= 0.002) return;
      var pd = smooth(0.238, 0.465, p);
      var pa = p > 0.487 ? smooth(0.487, 0.585, p) : 0;
      var depth = p < 0.487 ? pd : 1 - pa;
      var light = clamp(1 - depth * 0.85 + pa * 0.3, 0, 1);
      var camOff = depth * 3400;
      var beat = (p >= 0.465 && p <= 0.495) ? Math.sin(clamp((p - 0.465) / 0.022, 0, 1) * Math.PI) : 0;
      var br = breathe(t);
      ctx.save();
      ctx.globalAlpha = ga;
      ctx.translate(-lookRef.current.x * 10 + br.x * 0.5, -lookRef.current.y * 8 + br.y * 0.5);
      if (beat > 0 && !RM) ctx.translate(Math.sin(p * 1500) * 4 * beat, Math.cos(p * 1200) * 3 * beat);
      var topC = mixc([52, 118, 150], [7, 22, 42], Math.pow(depth, 0.9));
      var botC = mixc([12, 44, 66], [2, 7, 14], depth);
      var g = ctx.createLinearGradient(0, -H * 0.1, 0, H * 1.1);
      g.addColorStop(0, css(topC)); g.addColorStop(1, css(botC));
      ctx.fillStyle = g; ctx.fillRect(-W * 0.1, -H * 0.1, W * 1.2, H * 1.2);
      drawCaustics(t, light);
      if (light > 0.12) {
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        for (var ri = 0; ri < 6; ri++) {
          var rx = W * (0.1 + ri * 0.16) + Math.sin(t * 0.07 + ri * 2) * W * 0.03;
          var wT = H * 0.02 + hash(ri) * H * 0.03, wB = H * (0.12 + hash(ri + 4) * 0.12);
          var sk = (hash(ri + 8) - 0.5) * H * 0.35;
          var rA = 0.13 * light * (0.6 + 0.4 * Math.sin(t * 0.3 + ri * 1.7));
          var rg = ctx.createLinearGradient(0, 0, 0, H * 0.9);
          rg.addColorStop(0, "rgba(190,232,255," + rA + ")"); rg.addColorStop(1, "rgba(190,232,255,0)");
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(rx - wT, -20); ctx.lineTo(rx + wT, -20);
          ctx.lineTo(rx + wB + sk, H * 0.9); ctx.lineTo(rx - wB + sk, H * 0.9);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      if (light > 0.42) {
        var sa = (light - 0.42) / 0.58;
        ctx.save(); ctx.globalAlpha *= sa;
        var sgr = ctx.createLinearGradient(0, 0, 0, H * 0.17);
        sgr.addColorStop(0, "rgba(198,236,248,0.85)"); sgr.addColorStop(1, "rgba(198,236,248,0)");
        ctx.fillStyle = sgr; ctx.fillRect(0, 0, W, H * 0.17);
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(225,248,255,0.4)"; ctx.lineWidth = 2;
        ctx.beginPath();
        for (var x2 = 0; x2 <= W; x2 += 14) {
          var y2 = H * 0.065 + Math.sin(x2 * 0.018 + t * 1.6) * H * 0.008 + Math.sin(x2 * 0.007 - t * 0.9) * H * 0.012;
          x2 === 0 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2);
        }
        ctx.stroke(); ctx.restore();
      }
      var farCol = "rgba(" + (20 + light * 30 | 0) + "," + (40 + light * 40 | 0) + "," + (62 + light * 44 | 0) + ",0.55)";
      for (var fi = 0; fi < farFish.length; fi++) {
        var f = farFish[fi];
        smallFish(ctx, modPos(f.x * (W + 120) + t * f.sp * f.dir, W + 120) - 60, modPos(f.y * (H + 80) - camOff * 0.3, H + 80) - 40 + Math.sin(t * 0.8 + f.ph) * 5, f.s, f.dir, t * 3 + f.ph, farCol);
      }
      for (var sIdx = 0; sIdx < schools.length; sIdx++) {
        var sc = schools[sIdx];
        var baseY = sc.y * H * 1.3;
        for (var sfi = 0; sfi < sc.n; sfi++) {
          var span = W + 220;
          smallFish(ctx, modPos(sc.bx * span + t * sc.sp * sc.dir - sfi * sc.gap * W, span) - 110,
            modPos(baseY - camOff * 0.45, H * 1.3) - H * 0.15 + Math.sin((sfi / (sc.n - 1)) * Math.PI) * H * 0.02 + Math.sin(t * 1.6 + sfi * 1.3 + sIdx) * 5,
            sc.sz * (0.85 + 0.3 * Math.sin(sfi * 2.7)), sc.dir, t * (3.4 + sIdx) + sfi * 0.7, farCol);
        }
      }
      ctx.fillStyle = "rgba(200,225,238,1)";
      var nf = Math.floor(50 * PS);
      for (var ni = 0; ni < nf; ni++) {
        ctx.globalAlpha = ga * 0.12 * (0.5 + hash(ni));
        ctx.fillRect(modPos(hash(ni * 3.1) * W + t * (2 + hash(ni) * 4), W), modPos(hash(ni * 7.7) * H - camOff * 0.25 - t * 5, H), 1.3, 1.3);
      }
      ctx.globalAlpha = ga;
      var hookX = W * 0.5 + Math.sin(t * 0.6) * H * 0.01;
      var hookY = H * 0.52 + Math.sin(t * 0.8) * H * 0.008;
      var jit = beat * Math.sin(t * 45) * H * 0.008;
      ctx.strokeStyle = "rgba(222,238,244," + (0.5 + beat * 0.3) + ")";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(hookX - H * 0.07, -H * 0.05);
      ctx.quadraticCurveTo(hookX - H * 0.03 + jit, H * 0.22 + jit, hookX + jit, hookY);
      ctx.stroke();
      ctx.strokeStyle = "rgba(222,242,252,0.4)"; ctx.lineWidth = 1;
      for (var lb = 0; lb < 6; lb++) {
        var lt = fract(t * 0.4 + lb * 0.17);
        ctx.beginPath();
        ctx.arc(hookX - H * 0.07 + (hookX + jit - (hookX - H * 0.07)) * lt + Math.sin(t * 3 + lb) * 2, -H * 0.05 + (hookY + H * 0.05) * lt, 1.2 + lt * 1.6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(210,220,226,0.8)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(hookX + jit + 3, hookY + 5, 5, Math.PI * 0.1, Math.PI * 1.15); ctx.stroke();
      ctx.fillStyle = "#c96f5a";
      ctx.beginPath(); ctx.ellipse(hookX + jit + 2, hookY + 3, 4, 2.4, 0.4, 0, Math.PI * 2); ctx.fill();
      if (beat > 0) {
        blit(SPR.glowW, hookX, hookY, H * 0.5, beat * 0.14 * ga, "lighter");
        var tb = clamp((p - 0.465) / 0.035, 0, 1);
        if (tb > 0 && tb < 1) {
          ctx.fillStyle = "rgba(220,240,250," + ((1 - tb) * 0.6) + ")";
          for (var bb = 0; bb < 20; bb++) {
            var a2 = bb / 20 * Math.PI * 2;
            var r2 = tb * H * 0.13 + hash(bb) * tb * H * 0.05;
            ctx.beginPath(); ctx.arc(hookX + Math.cos(a2) * r2, hookY + Math.sin(a2) * r2 - tb * tb * H * 0.04, 1.6 + hash(bb + 3) * 2, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      var hero = heroState(p, t, hookX, hookY);
      if (hero) {
        var hA = smooth(0.295, 0.315, p) * (1 - smooth(0.598, 0.61, p));
        ctx.save(); ctx.globalAlpha = ga * hA;
        drawFish(ctx, { x: hero.x, y: hero.y, len: H * 0.17 * hero.s, dir: hero.dir, rot: hero.rot, phase: hero.phase, detail: 1,
          back: "#39626c", mid: "#b9c9c4", belly: "#ece7d6", fin: "rgba(96,128,132,0.85)", accent: "rgba(216,178,104,0.45)" });
        ctx.restore();
        if (p > 0.487) {
          ctx.save(); ctx.strokeStyle = "rgba(220,240,250," + (ga * 0.5) + ")"; ctx.lineWidth = 1;
          for (var hbi = 0; hbi < 9; hbi++) {
            var tb2 = fract(t * 0.9 + hbi * 0.13);
            ctx.globalAlpha = (1 - tb2) * 0.5;
            ctx.beginPath();
            ctx.arc(hero.x + Math.sin(hbi * 3 + t) * 10 + (hash(hbi) - 0.5) * 16, hero.y + tb2 * H * 0.16 + 10, 1.5 + tb2 * 3, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
      for (var mi = 0; mi < midFish.length; mi++) {
        var mf = midFish[mi];
        var pal = MIDS[mf.pal];
        ctx.save(); ctx.globalAlpha = ga * 0.92;
        drawFish(ctx, { x: modPos(mf.x * (W + 200) + t * mf.sp * mf.dir, W + 200) - 100, y: modPos(mf.y * (H * 1.4) - camOff * 0.6, H * 1.4) - H * 0.2 + Math.sin(t * 0.5 + mf.ph) * 8,
          len: H * mf.s * 1.9, dir: mf.dir, phase: t * (2.5 + hash(mi) * 2) + mf.ph, detail: 0.6,
          back: pal[0], mid: pal[1], belly: pal[2], fin: "rgba(120,150,158,0.7)" });
        ctx.restore();
      }
      for (var dfi = 0; dfi < driftFish.length; dfi++) {
        var df = driftFish[dfi];
        ctx.save(); ctx.globalAlpha = ga * 0.8;
        drawFish(ctx, { x: df.x * W + Math.sin(t * 0.4 + dfi * 2) * W * 0.02, y: modPos(df.off * H + t * df.sp * df.dir, H + 120) - 60,
          len: H * df.s * 2, dir: 1, rot: df.dir > 0 ? -1.2 : 1.2, phase: t * 3 + dfi * 2, detail: 0.5,
          back: "#2c4c5e", mid: "#7fa0ac", belly: "#cfe0e2", fin: "rgba(90,120,130,0.7)" });
        ctx.restore();
      }
      for (var nfi = 0; nfi < nearFish.length; nfi++) {
        var nfsh = nearFish[nfi];
        var span2 = W + 900;
        var nfx = modPos(t * nfsh.sp + nfsh.off * span2, span2) - 450;
        if (nfsh.dir < 0) nfx = W - nfx;
        ctx.save(); ctx.globalAlpha = ga * 0.9;
        drawFish(ctx, { x: nfx, y: modPos(nfsh.y * (H + 400) - camOff * 1.15, H + 400) - 200 + Math.sin(t * 0.4 + nfi * 4) * 14,
          len: H * nfsh.s, dir: nfsh.dir, phase: t * 2 + nfi * 3, detail: 0.3,
          back: "#04101c", mid: "#071a2c", belly: "#0a2136", fin: "rgba(5,16,28,0.9)" });
        ctx.restore();
      }
      var nmid = Math.floor(36 * PS), nnear = Math.floor(20 * PS);
      ctx.fillStyle = "rgba(215,235,245,1)";
      for (var mi2 = 0; mi2 < nmid; mi2++) {
        ctx.globalAlpha = ga * 0.22 * (0.5 + hash(mi2 + 40));
        ctx.fillRect(modPos(hash(mi2 * 5.3 + 40) * W + t * (3 + hash(mi2 + 40) * 5) * (mi2 % 2 ? 1 : -1), W), modPos(hash(mi2 * 9.2 + 40) * H - camOff * 0.55 - t * 6, H), 2, 2);
      }
      for (var ni2 = 0; ni2 < nnear; ni2++) {
        blit(SPR.soft, modPos(hash(ni2 * 6.1 + 90) * W + t * (5 + hash(ni2 + 90) * 7) * (ni2 % 2 ? 1 : -1), W), modPos(hash(ni2 * 8.3 + 90) * H - camOff - t * 8, H), 5 + hash(ni2) * 5, ga * 0.3 * (0.5 + hash(ni2 + 90)));
      }
      ctx.globalAlpha = ga;
      var nb = Math.floor((12 + 40 * pa + 12 * beat) * PS);
      ctx.strokeStyle = "rgba(222,242,252,0.6)"; ctx.lineWidth = 1;
      for (var bi2 = 0; bi2 < nb; bi2++) {
        ctx.globalAlpha = ga * (0.15 + 0.3 * hash(bi2 * 1.7));
        ctx.beginPath();
        ctx.arc(hash(bi2 * 2.9) * W + Math.sin(t * 2 + bi2) * 6, modPos(hash(bi2 * 6.6) * H - t * (26 + hash(bi2 * 4.4) * 44) + camOff * 0.5, H), 1.4 + hash(bi2 * 8.1) * 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = ga;
      if (pa > 0.05) {
        ctx.strokeStyle = "rgba(200,235,250," + (pa * 0.25) + ")"; ctx.lineWidth = 1.4;
        for (var sti = 0; sti < 12; sti++) {
          var sty = modPos(hash(sti * 3.8) * H + t * H * 0.55 * (0.6 + hash(sti)), H);
          ctx.beginPath(); ctx.moveTo(hash(sti * 7.4) * W, sty); ctx.lineTo(hash(sti * 7.4) * W, sty + H * 0.09); ctx.stroke();
        }
      }
      var brk = smooth(0.572, 0.602, p);
      if (brk > 0) {
        ctx.fillStyle = "rgba(230,246,255," + (brk * 0.92) + ")"; ctx.fillRect(-W * 0.1, -H * 0.1, W * 1.2, H * 1.2);
      }
      ctx.restore();
      drawFringe(brk * 0.7 + beat * 0.4);
    }

    function drawCatch(p, t) {
      if (p <= 0.575 || p >= 0.69) return;
      var ga = smooth(0.576, 0.602, p);
      var lift = smooth(0.586, 0.64, p);
      var cz = 1 + smooth(0.586, 0.668, p) * 1.7;
      var br = breathe(t);
      ctx.save(); ctx.globalAlpha = ga;
      ctx.translate(W / 2, H / 2); ctx.scale(cz, cz); ctx.translate(-W / 2 + br.x * 0.3 - lookRef.current.x * 8, -H / 2 + br.y * 0.3 - lookRef.current.y * 6);
      var g = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      g.addColorStop(0, "#3d4a6e"); g.addColorStop(0.7, "#c07a55"); g.addColorStop(1, "#f0b070");
      ctx.fillStyle = g; ctx.fillRect(-W * 0.3, -H * 0.3, W * 1.6, H * 0.85);
      blit(SPR.glowWarm, W * 0.32, H * 0.4, H * 0.8, 0.4, "lighter");
      g = ctx.createLinearGradient(0, H * 0.5, 0, H * 1.3);
      g.addColorStop(0, "#d08a52"); g.addColorStop(0.08, "#2c506a"); g.addColorStop(1, "#0a1c2e");
      ctx.fillStyle = g; ctx.fillRect(-W * 0.3, H * 0.5, W * 1.6, H);
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (var k = 0; k < 36; k++) {
        var pr = k / 36, yy = H * 0.5 + Math.pow(pr, 1.6) * H * 0.4;
        ctx.fillStyle = "rgba(255,205,150," + (0.05 + 0.08 * hash(k * 3) * (0.5 + 0.5 * Math.sin(t * 3 + k))) + ")";
        ctx.fillRect(W * 0.32 + (hash(k * 7) - 0.5) * (10 + pr * W * 0.1), yy, 3 + hash(k) * 6, 1.6);
      }
      ctx.restore();
      var sb = 1 - smooth(0.585, 0.615, p);
      if (sb > 0) {
        ctx.strokeStyle = "rgba(235,248,255," + (sb * 0.7) + ")"; ctx.lineWidth = H * 0.002;
        for (var j = 0; j < 3; j++) {
          ctx.beginPath(); ctx.ellipse(W * 0.42, H * 0.6, (1 - sb) * H * 0.09 * (1 + j * 0.5) + H * 0.01, ((1 - sb) * H * 0.09 * (1 + j * 0.5) + H * 0.01) * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = "rgba(240,250,255," + (sb * 0.8) + ")";
        for (var i2 = 0; i2 < 18; i2++) {
          var a2 = -Math.PI * (0.1 + hash(i2) * 0.8), v = H * (0.04 + hash(i2 + 5) * 0.06);
          var tt = 1 - sb;
          ctx.beginPath();
          ctx.arc(W * 0.42 + Math.cos(a2) * v * tt * 3.4, H * 0.6 + Math.sin(a2) * v * 3.4 * tt + H * 0.14 * tt * tt, H * 0.003 * (sb + 0.3), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = "#07090e";
      ctx.beginPath();
      ctx.moveTo(W * 1.02, H * 0.95); ctx.lineTo(W * 0.8, H * 0.78); ctx.lineTo(W * 0.79, H * 0.5);
      ctx.lineTo(W * 0.845, H * 0.36); ctx.lineTo(W * 0.905, H * 0.4); ctx.lineTo(W * 0.93, H * 0.62);
      ctx.lineTo(W * 1.05, H * 0.72); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(W * 0.868, H * 0.315, H * 0.036, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#07090e"; ctx.lineCap = "round"; ctx.lineWidth = H * 0.02;
      ctx.beginPath(); ctx.moveTo(W * 0.85, H * 0.42); ctx.lineTo(W * 0.815, H * 0.47); ctx.stroke();
      ctx.strokeStyle = "rgba(255,170,96,0.3)"; ctx.lineWidth = H * 0.002;
      ctx.beginPath(); ctx.moveTo(W * 0.79, H * 0.5); ctx.lineTo(W * 0.845, H * 0.36); ctx.stroke();
      var tip = { x: W * 0.8, y: H * 0.13 };
      ctx.strokeStyle = "#0b0f15"; ctx.lineWidth = H * 0.004;
      ctx.beginPath(); ctx.moveTo(W * 0.818, H * 0.47);
      ctx.quadraticCurveTo(W * 0.74, H * 0.3, tip.x, tip.y); ctx.stroke();
      var sw = Math.sin(p * 130) * 0.3 * (1 - lift * 0.45) + Math.sin(t * 2.4) * 0.08;
      var fx = lerp(W * 0.42, W * 0.46, lift);
      var fy = lerp(H * 0.6, H * 0.4, lift) + Math.sin(t * 1.8) * H * 0.006 * lift;
      var len = lerp(H * 0.13, H * 0.3, smooth(0.59, 0.67, p));
      ctx.strokeStyle = "rgba(230,242,248,0.7)"; ctx.lineWidth = 1;
      var mouthX = fx + Math.cos(sw - 0.4) * len * 0.46, mouthY = fy + Math.sin(sw - 0.4) * len * 0.46;
      ctx.beginPath(); ctx.moveTo(tip.x, tip.y);
      ctx.quadraticCurveTo((tip.x + mouthX) / 2 + Math.sin(t * 30) * 2 * (1 - lift * 0.5), (tip.y + mouthY) / 2, mouthX, mouthY);
      ctx.stroke();
      drawFish(ctx, { x: fx, y: fy, len: len, dir: 1, rot: sw - 0.35, phase: t * 10, detail: 1,
        back: "#41636e", mid: "#a8c0c6", belly: "#e9edea", fin: "rgba(110,140,148,0.85)", accent: "rgba(216,180,110,0.4)" });
      if (lift > 0.15) {
        ctx.fillStyle = "rgba(225,242,250,0.6)";
        for (var i3 = 0; i3 < 13; i3++) {
          var tt2 = fract(t * 0.85 + hash(i3));
          ctx.globalAlpha = ga * (1 - tt2) * 0.6;
          ctx.beginPath();
          ctx.arc(fx + (hash(i3 + 4) - 0.5) * len * 0.6, fy + tt2 * H * 0.24 + 8, H * 0.002, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = ga;
      }
      ctx.fillStyle = "#0a0c11";
      ctx.beginPath();
      ctx.moveTo(-W * 0.1, H * 0.92);
      ctx.quadraticCurveTo(W * 0.5, H * 0.8, W * 1.1, H * 0.94);
      ctx.lineTo(W * 1.1, H * 1.3); ctx.lineTo(-W * 0.1, H * 1.3);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,168,92,0.28)"; ctx.lineWidth = H * 0.0024;
      ctx.beginPath(); ctx.moveTo(-W * 0.1, H * 0.92); ctx.quadraticCurveTo(W * 0.5, H * 0.8, W * 1.1, H * 0.94); ctx.stroke();
      ctx.restore();
      drawFringe(sb * 0.5);
      var dk = smooth(0.642, 0.676, p);
      if (dk > 0) { ctx.fillStyle = "rgba(0,0,0," + dk + ")"; ctx.fillRect(0, 0, W, H); }
    }

    function drawGrill(p, t) {
      if (p <= 0.66 || p >= 0.9) return;
      var ga = smooth(0.668, 0.7, p);
      if (ga <= 0.002) return;
      var cook = smooth(0.69, 0.81, p);
      var gz = 1 + smooth(0.675, 0.85, p) * 0.3;
      var br = breathe(t);
      ctx.save(); ctx.globalAlpha = ga;
      ctx.translate(W / 2 + br.x * 0.4, H * 0.55 + br.y * 0.3); ctx.scale(gz, gz); ctx.translate(-W / 2, -H * 0.55);
      ctx.fillStyle = "#050302"; ctx.fillRect(-W * 0.3, -H * 0.3, W * 1.6, H * 1.6);
      var flick = RM ? 0.9 : (0.82 + 0.13 * Math.sin(t * 7.3) + 0.07 * Math.sin(t * 13.7));
      blit(SPR.glowFire, W * 0.5, H * 0.72, H * 1.25 * (0.7 + cook * 0.3), 0.5 * flick, "lighter");
      var gy = H * 0.6, fL = Math.min(W * 0.52, H * 0.6), fx = W * 0.5, fy = gy - H * 0.048;

      ctx.save(); ctx.globalCompositeOperation = "lighter";
      var ne = Math.floor(32 * PS);
      for (var ei = 0; ei < ne; ei++) {
        blit(ei % 3 ? SPR.glowEmber : SPR.glowFire, W * 0.26 + hash(ei * 3.9) * W * 0.48, gy + H * 0.03 + hash(ei * 7.2) * H * 0.1,
          H * (0.012 + hash(ei + 2) * 0.02), (0.35 + 0.65 * Math.abs(Math.sin(t * (1 + hash(ei) * 3) + ei * 2))) * 0.9 * ga);
      }
      ctx.restore();

      var nBars = 7;
      for (var gb = 0; gb < nBars; gb++) {
        var bxx = fx - fL * 0.45 + gb * (fL * 0.9 / (nBars - 1));
        var bow = (gb - (nBars - 1) / 2) * H * 0.004;
        ctx.strokeStyle = "#191a1d"; ctx.lineWidth = H * 0.0075; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(bxx + bow, gy - H * 0.012);
        ctx.quadraticCurveTo(bxx + bow * 1.7, gy + H * 0.038, bxx + bow, gy + H * 0.088);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,122,46," + (0.32 * flick) + ")"; ctx.lineWidth = H * 0.0018;
        ctx.beginPath();
        ctx.moveTo(bxx + bow - H * 0.0032, gy - H * 0.01);
        ctx.quadraticCurveTo(bxx + bow * 1.7 - H * 0.0032, gy + H * 0.038, bxx + bow - H * 0.0032, gy + H * 0.082);
        ctx.stroke();
        if (gb < nBars - 1) {
          blit(SPR.glowFire, bxx + bow + (fL * 0.9 / (nBars - 1)) * 0.5, gy + H * 0.05, H * 0.05, 0.16 * flick * ga, "lighter");
        }
      }
      ctx.strokeStyle = "#141416"; ctx.lineWidth = H * 0.006;
      ctx.beginPath();
      ctx.moveTo(fx - fL * 0.52, gy + H * 0.078);
      ctx.quadraticCurveTo(fx, gy + H * 0.1, fx + fL * 0.52, gy + H * 0.078);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,122,46," + (0.14 * flick) + ")"; ctx.lineWidth = H * 0.0014;
      ctx.beginPath();
      ctx.moveTo(fx - fL * 0.52, gy + H * 0.075);
      ctx.quadraticCurveTo(fx, gy + H * 0.097, fx + fL * 0.52, gy + H * 0.075);
      ctx.stroke();

      var nF = Math.floor(60 * PS);
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (var fli = 0; fli < nF; fli++) {
        var tau = fract(t * (0.9 + hash(fli) * 0.9) + hash(fli * 3));
        var x0 = fx + (hash(fli * 2) - 0.5) * fL * 0.95 + Math.sin(t * 3 + fli) * 4 * (1 - tau);
        var tall = hash(fli * 5) > 0.92 ? 1.9 : 1;
        var yy2 = gy + H * 0.012 - tau * H * (0.1 + 0.16 * hash(fli * 7)) * tall;
        var s = (1 - tau) * H * 0.036 * (0.65 + hash(fli * 11));
        blit(SPR.glowFire, x0, yy2, s, (1 - tau) * 0.5 * ga);
        if (tau < 0.45) blit(SPR.glowWarm, x0, yy2 + H * 0.008, s * 0.55, (0.45 - tau) * 1.4 * ga);
      }
      var nE2 = Math.floor(14 * PS);
      for (var ei2 = 0; ei2 < nE2; ei2++) {
        var tau2 = fract(t * 0.22 * (0.5 + hash(ei2 * 6)) + hash(ei2 * 9));
        blit(SPR.glowEmber, fx + (hash(ei2 * 4) - 0.5) * fL * 0.8 + Math.sin(t * 1.2 + ei2 * 2) * 14 * tau2, gy - tau2 * H * 0.5,
          (1 - tau2) * H * 0.014, (1 - tau2) * 0.8 * ga * Math.abs(Math.sin(t * 4 + ei2)));
      }
      ctx.strokeStyle = "rgba(255,190,120,0.05)"; ctx.lineWidth = H * 0.012;
      for (var hsi = 0; hsi < 4; hsi++) {
        ctx.beginPath();
        for (var hy3 = gy - H * 0.02; hy3 > gy - H * 0.3; hy3 -= 8) {
          var hx3 = fx + (hsi - 1.5) * fL * 0.22 + Math.sin(hy3 * 0.04 + t * 4 + hsi) * H * 0.012;
          hy3 === gy - H * 0.02 ? ctx.moveTo(hx3, hy3) : ctx.lineTo(hx3, hy3);
        }
        ctx.stroke();
      }
      ctx.restore();

      var rc = mixc([93, 122, 134], [124, 68, 24], cook);
      var mc = mixc([195, 208, 210], [210, 154, 90], cook);
      var bc = mixc([238, 240, 234], [240, 217, 168], cook);
      drawFish(ctx, { x: fx, y: fy, len: fL, dir: 1, rot: 0, phase: RM ? 0.5 : 0.4, detail: 1,
        back: css(rc), mid: css(mc), belly: css(bc),
        fin: "rgba(" + (lerp(123, 138, cook) | 0) + "," + (lerp(143, 85, cook) | 0) + "," + (lerp(150, 39, cook) | 0) + ",0.9)" });
      if (cook > 0.1) {
        ctx.save();
        ctx.beginPath(); ctx.ellipse(fx - fL * 0.04, fy, fL * 0.42, fL * 0.15, 0, 0, Math.PI * 2); ctx.clip();
        ctx.strokeStyle = "rgba(30,14,6," + (cook * 0.55) + ")"; ctx.lineWidth = fL * 0.028; ctx.lineCap = "round";
        for (var ci2 = 0; ci2 < 7; ci2++) {
          var cxx = fx - fL * 0.28 + ci2 * fL * 0.085;
          ctx.beginPath(); ctx.moveTo(cxx, fy - fL * 0.16); ctx.quadraticCurveTo(cxx + fL * 0.02, fy, cxx, fy + fL * 0.16); ctx.stroke();
        }
        ctx.restore();
      }
      if (cook > 0.3) blit(SPR.glowW, fx + Math.sin(t * 0.7) * fL * 0.18, fy - fL * 0.03, fL * 0.22, 0.09 * cook, "lighter");

      if (cook > 0.35) {
        ctx.save(); ctx.strokeStyle = "rgba(240,235,225," + ((cook - 0.35) * 0.35) + ")"; ctx.lineWidth = H * 0.005; ctx.lineCap = "round";
        for (var k2 = 0; k2 < 3; k2++) {
          ctx.beginPath();
          for (var yy3 = fy - fL * 0.1; yy3 > fy - fL * 0.1 - H * 0.14; yy3 -= 7) {
            var xx3 = fx + (k2 - 1) * fL * 0.16 + Math.sin(t * 1.3 + k2 * 2 + yy3 * 0.05) * H * 0.012;
            yy3 < fy - fL * 0.1 - 0.1 ? ctx.lineTo(xx3, yy3) : ctx.moveTo(xx3, yy3);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
      var sd = smooth(0.74, 0.86, p);
      var nS = Math.floor((8 + sd * 24) * PS);
      for (var si2 = 0; si2 < nS; si2++) {
        var tau3 = fract(t * 0.1 * (0.6 + hash(si2 * 5)) + hash(si2 * 8));
        blit(SPR.smoke, fx + (hash(si2 * 3) - 0.5) * fL * 0.9 + Math.sin(tau3 * 5 + si2) * 22, fy - fL * 0.08 - tau3 * H * 0.6,
          H * (0.05 + tau3 * 0.22), (0.1 + sd * 0.3) * (1 - tau3 * 0.4) * ga);
      }
      ctx.restore();
    }

    function drawSmokeTransition(p, t) {
      var a = smooth(0.815, 0.858, p) * (1 - smooth(0.872, 0.915, p));
      if (a <= 0.003) return;
      ctx.save();
      ctx.fillStyle = "rgba(24,20,17," + (a * 0.65) + ")"; ctx.fillRect(0, 0, W, H);
      var n = Math.floor(22 * PS);
      for (var i = 0; i < n; i++) {
        blit(SPR.smoke, modPos(hash(i * 4.4) * W + t * 10 * (hash(i) - 0.5), W), modPos(hash(i * 8.8) * H - t * 14 * hash(i * 2.2), H),
          H * (0.25 + hash(i * 6) * 0.3), a * (0.35 + 0.4 * hash(i * 3)));
      }
      ctx.restore();
    }

function drawRestaurant(p, t) {
  if (p <= 0.85) return;
  var ga = smooth(0.855, 0.882, p);
  var rz = 1 + smooth(0.858, 0.935, p) * 0.42 - smooth(0.945, 1, p) * 0.15;
  var br = breathe(t);
  ctx.save(); ctx.globalAlpha = ga;
  ctx.translate(W / 2 + br.x * 0.3 - lookRef.current.x * 7, H * 0.62 + br.y * 0.25 - lookRef.current.y * 5);
  ctx.scale(rz, rz); ctx.translate(-W / 2, -H * 0.62);
  var g = ctx.createLinearGradient(0, -H * 0.1, 0, H * 1.1);
  g.addColorStop(0, "#160d07"); g.addColorStop(1, "#050302");
  ctx.fillStyle = g; ctx.fillRect(-W * 0.3, -H * 0.3, W * 1.6, H * 1.6);
  ctx.fillStyle = "rgba(58,36,20,0.35)";
  for (var pi = 0; pi < 7; pi++) ctx.fillRect(-W * 0.1 + pi * W * 0.2, H * 0.02, W * 0.09, H * 0.6);
  for (var boi = 0; boi < bokeh.length; boi++) {
    var b = bokeh[boi];
    blit(SPR.glowWarm, b.x * W, b.y * H, b.r * H * 6, b.a * (0.8 + 0.2 * Math.sin(t * b.tw + b.ph)) * ga, "lighter");
  }
  for (var ci = 0; ci < 6; ci++) {
    var cx = W * (0.08 + ci * 0.17), cy = H * (0.56 + hash(ci * 9) * 0.06);
    blit(SPR.glowWarm, cx, cy, H * 0.03, 0.3 * ga, "lighter");
    ctx.fillStyle = "rgba(255,214,150," + (0.7 * ga) + ")";
    ctx.fillRect(cx - 1, cy - 2, 2, 3);
  }
  ctx.strokeStyle = "rgba(30,20,14,0.9)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2, -H * 0.1); ctx.lineTo(W / 2, H * 0.13); ctx.stroke();
  ctx.fillStyle = "#15100b";
  ctx.beginPath(); ctx.moveTo(W / 2 - H * 0.045, H * 0.17); ctx.lineTo(W / 2 + H * 0.045, H * 0.17);
  ctx.lineTo(W / 2 + H * 0.02, H * 0.125); ctx.lineTo(W / 2 - H * 0.02, H * 0.125); ctx.closePath(); ctx.fill();
  blit(SPR.glowWarm, W / 2, H * 0.185, H * 0.22, 0.85 * ga, "lighter");
  var cone = ctx.createLinearGradient(0, H * 0.17, 0, H * 0.72);
  cone.addColorStop(0, "rgba(255,190,110," + (0.16 * ga) + ")"); cone.addColorStop(1, "rgba(255,190,110,0)");
  ctx.fillStyle = cone;
  ctx.beginPath(); ctx.moveTo(W / 2 - H * 0.05, H * 0.175); ctx.lineTo(W / 2 + H * 0.05, H * 0.175);
  ctx.lineTo(W / 2 + H * 0.42, H * 0.74); ctx.lineTo(W / 2 - H * 0.42, H * 0.74); ctx.closePath(); ctx.fill();
  g = ctx.createLinearGradient(0, H * 0.66, 0, H);
  g.addColorStop(0, "#422817"); g.addColorStop(1, "#1c0f07");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(W * 0.16, H * 0.66); ctx.lineTo(W * 0.84, H * 0.66);
  ctx.lineTo(W * 1.12, H); ctx.lineTo(-W * 0.12, H);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1;
  for (var wg = 0; wg < 6; wg++) {
    ctx.beginPath(); ctx.moveTo(W * (0.2 + wg * 0.12), H * 0.66);
    ctx.quadraticCurveTo(W * (0.16 + wg * 0.13), H * 0.85, W * (0.02 + wg * 0.17), H); ctx.stroke();
  }
  var pool = ctx.createRadialGradient(W / 2, H * 0.79, 0, W / 2, H * 0.79, H * 0.34);
  pool.addColorStop(0, "rgba(255,196,120," + (0.34 * ga) + ")"); pool.addColorStop(1, "rgba(255,196,120,0)");
  ctx.fillStyle = pool;
  ctx.save(); ctx.translate(W / 2, H * 0.79); ctx.scale(1, 0.4); ctx.translate(-W / 2, -H * 0.79);
  ctx.beginPath(); ctx.arc(W / 2, H * 0.79, H * 0.34, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  var px = W / 2, py = H * 0.79, rx = H * 0.135, ry = H * 0.053;
  blit(SPR.smoke, px, py + ry * 0.5, rx * 2.9, 0.4 * ga);
  var pg = ctx.createLinearGradient(0, py - ry, 0, py + ry);
  pg.addColorStop(0, "#f6f1e6"); pg.addColorStop(1, "#d8d0bf");
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(120,110,92,0.5)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#ece5d5";
  ctx.beginPath(); ctx.ellipse(px, py + ry * 0.05, rx * 0.76, ry * 0.72, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(140,128,105,0.35)";
  ctx.beginPath(); ctx.ellipse(px, py + ry * 0.05, rx * 0.76, ry * 0.72, 0, 0, Math.PI * 2); ctx.stroke();

  // ===== الشوكة والسكينة (رمادي مطفي - بدون لمعة) =====
  var cutL = H * 0.19;
  var FORK_COL = "#9aa2a7", BLADE_COL = "#a6adb2", HANDLE_COL = "#87909a", BOLSTER_COL = "#c8ced2";
  function cutShadow(cx2, cy2, ang) {
    ctx.save();
    ctx.translate(cx2 + H * 0.005, cy2 + H * 0.009);
    ctx.rotate(ang);
    ctx.fillStyle = "rgba(10,5,2," + (0.3 * ga) + ")";
    ctx.beginPath();
    ctx.ellipse(0, 0, cutL * 0.055, cutL * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawFork(cx2, cy2, ang) {
    cutShadow(cx2, cy2, ang);
    ctx.save();
    ctx.translate(cx2, cy2); ctx.rotate(ang);
    ctx.fillStyle = FORK_COL;
    ctx.strokeStyle = FORK_COL;
    ctx.lineCap = "round";
    var fw = cutL * 0.21;          // عرض رأس الشوكة
    var tineTop = -cutL * 0.5;     // طرف الأسنان
    var tineBot = -cutL * 0.315;   // قاعدة الأسنان
    var neckY = -cutL * 0.13;      // بداية الرقبة
    // الأسنان (4) - مفتوحة شوية وأطرافها مدوّرة
    ctx.lineWidth = cutL * 0.026;
    for (var ti2 = 0; ti2 < 4; ti2++) {
      var k2 = ti2 / 3;
      var xTop = -fw * 0.44 + fw * 0.88 * k2;
      var xBot = -fw * 0.38 + fw * 0.76 * k2;
      ctx.beginPath();
      ctx.moveTo(xBot, tineBot + cutL * 0.005);
      ctx.quadraticCurveTo((xBot + xTop) / 2, (tineBot + tineTop) / 2, xTop, tineTop + cutL * 0.01);
      ctx.stroke();
    }
    // الرأس - كتف عريض منحني
    ctx.beginPath();
    ctx.moveTo(-fw * 0.5, tineBot);
    ctx.quadraticCurveTo(-fw * 0.42, neckY * 1.4, -cutL * 0.024, neckY);
    ctx.lineTo(cutL * 0.024, neckY);
    ctx.quadraticCurveTo(fw * 0.42, neckY * 1.4, fw * 0.5, tineBot);
    ctx.closePath();
    ctx.fill();
    // المقبض - بيفتح تدريجياً لطرف مدوّر
    ctx.beginPath();
    ctx.moveTo(-cutL * 0.024, neckY);
    ctx.bezierCurveTo(-cutL * 0.026, cutL * 0.05, -cutL * 0.034, cutL * 0.22, -cutL * 0.042, cutL * 0.42);
    ctx.quadraticCurveTo(-cutL * 0.044, cutL * 0.5, 0, cutL * 0.5);
    ctx.quadraticCurveTo(cutL * 0.044, cutL * 0.5, cutL * 0.042, cutL * 0.42);
    ctx.bezierCurveTo(cutL * 0.034, cutL * 0.22, cutL * 0.026, cutL * 0.05, cutL * 0.024, neckY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function drawKnife(cx2, cy2, ang) {
    cutShadow(cx2, cy2, ang);
    ctx.save();
    ctx.translate(cx2, cy2); ctx.rotate(ang);
    ctx.lineCap = "round";
    var bw = cutL * 0.075, bolsterY = -cutL * 0.03;
    // النصل (السنّة ناحية الطبق)
    ctx.fillStyle = BLADE_COL;
    ctx.beginPath();
    ctx.moveTo(0, -cutL * 0.5);
    ctx.quadraticCurveTo(bw * 0.95, -cutL * 0.4, bw * 0.7, -cutL * 0.2);
    ctx.lineTo(bw * 0.62, bolsterY);
    ctx.lineTo(-bw * 0.5, bolsterY);
    ctx.quadraticCurveTo(-bw * 0.75, -cutL * 0.28, 0, -cutL * 0.5);
    ctx.closePath();
    ctx.fill();
    // الحلقة الفاصلة
    ctx.fillStyle = BOLSTER_COL;
    ctx.fillRect(-bw * 0.62, bolsterY, bw * 1.24, cutL * 0.026);
    // المقبض
    ctx.strokeStyle = HANDLE_COL;
    ctx.lineWidth = cutL * 0.055;
    ctx.beginPath();
    ctx.moveTo(0, bolsterY + cutL * 0.02);
    ctx.quadraticCurveTo(cutL * 0.014, cutL * 0.22, 0, cutL * 0.5);
    ctx.stroke();
    ctx.restore();
  }
  drawFork(px - rx * 1.6, py + ry * 0.35, 0.5);
  drawKnife(px + rx * 1.6, py + ry * 0.35, -0.5);
  // ===== نهاية الشوكة والسكينة =====

  ctx.strokeStyle = "rgba(70,40,26,0.85)"; ctx.lineWidth = H * 0.008; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(px - rx * 0.62, py + ry * 0.5);
  ctx.quadraticCurveTo(px, py + ry * 0.85, px + rx * 0.66, py + ry * 0.34); ctx.stroke();
  ctx.strokeStyle = "rgba(255,220,180,0.25)"; ctx.lineWidth = H * 0.002;
  ctx.beginPath(); ctx.moveTo(px - rx * 0.6, py + ry * 0.47);
  ctx.quadraticCurveTo(px, py + ry * 0.8, px + rx * 0.6, py + ry * 0.32); ctx.stroke();
  drawFish(ctx, { x: px, y: py - ry * 0.18, len: rx * 1.5, dir: 1, rot: -0.06, phase: 0.4, detail: 1,
    back: "#7c4418", mid: "#d29a5a", belly: "#f0d9a8", fin: "rgba(138,85,39,0.9)", accent: "rgba(246,220,160,0.35)" });
  var lx = px + rx * 0.56, ly = py - ry * 0.62, lr = H * 0.021;
  ctx.fillStyle = "#f3e6a0"; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#faf6e6"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "rgba(210,180,80,0.6)"; ctx.lineWidth = 1;
  for (var li = 0; li < 6; li++) { var a3 = li / 6 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(a3) * lr * 0.85, ly + Math.sin(a3) * lr * 0.85); ctx.stroke(); }
  ctx.strokeStyle = "#557a46"; ctx.lineWidth = H * 0.0026; ctx.lineCap = "round";
  for (var hi = 0; hi < 6; hi++) {
    var hx2 = px - rx * 0.55 + hash(hi * 7) * rx * 1.1, hy2 = py - ry * 0.5 + hash(hi * 3) * ry * 0.8;
    ctx.beginPath(); ctx.moveTo(hx2, hy2);
    ctx.quadraticCurveTo(hx2 + H * 0.004, hy2 - H * 0.008, hx2 + H * 0.009, hy2 - H * 0.011); ctx.stroke();
  }
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (var k3 = 0; k3 < 3; k3++) {
    var sg2 = ctx.createLinearGradient(0, py - ry, 0, py - ry - H * 0.18);
    sg2.addColorStop(0, "rgba(255,248,235," + (0.12 * ga) + ")"); sg2.addColorStop(1, "rgba(255,248,235,0)");
    ctx.strokeStyle = sg2; ctx.lineWidth = H * 0.006; ctx.lineCap = "round";
    ctx.beginPath();
    for (var yy4 = py - ry * 1.1; yy4 > py - ry - H * 0.17; yy4 -= 6) {
      var xx4 = px + (k3 - 1) * H * 0.045 + Math.sin((RM ? 0 : t * 1.2) + k3 * 2.1 + yy4 * 0.045) * H * 0.014 * (0.3 + (py - ry - yy4) / (H * 0.17));
      yy4 < py - ry * 1.1 - 0.1 ? ctx.lineTo(xx4, yy4) : ctx.moveTo(xx4, yy4);
    }
    ctx.stroke();
  }
  ctx.restore();
  var dim = smooth(0.93, 1, p);
  if (dim > 0) { ctx.fillStyle = "rgba(2,3,5," + (dim * 0.42) + ")"; ctx.fillRect(-W * 0.3, -H * 0.3, W * 1.6, H * 1.6); }
  ctx.restore();
}

    function drawVignette() {
      var g = ctx.createRadialGradient(W / 2 - lookRef.current.x * 20, H * 0.5 - lookRef.current.y * 14, H * 0.22, W / 2, H * 0.5, Math.max(W, H) * 0.78);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(2,5,12,0.58)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    function drawCursorGlow(p) {
      if (!FINE) return;
      if (p > 0.22 && p < 0.6) blit(SPR.glowW, mousePosRef.current.x, mousePosRef.current.y, H * 0.42, 0.05, "lighter");
      else if (p > 0.86) blit(SPR.glowWarm, mousePosRef.current.x, mousePosRef.current.y, H * 0.4, 0.05, "lighter");
    }

    let animId;
    let lastT = performance.now();
    let frameCount = 0, accDt = 0, adapted = false;

    function render() {
      var p = progressRef.current, t = tG;
      ctx.fillStyle = "#01040a"; ctx.fillRect(0, 0, W, H);
      drawSurface(p, t);
      drawUnderwater(p, t);
      drawCatch(p, t);
      drawGrill(p, t);
      drawRestaurant(p, t);
      drawSmokeTransition(p, t);
      drawVignette();
      drawCursorGlow(p);
    }

    function loop(now) {
      var dt = Math.min(now - lastT, 80); lastT = now;
      if (!RM) tG += dt / 1000;
      lookRef.current.x += (lookRef.current.tx - lookRef.current.x) * 0.05;
      lookRef.current.y += (lookRef.current.ty - lookRef.current.y) * 0.05;
      try { render(); } catch (err) { }
      if (!adapted) {
        frameCount++; accDt += dt;
        if (frameCount === 140) {
          adapted = true;
          if (accDt / frameCount > 30 && dpr > 1) { dpr = 1; PS = isMobile ? 0.35 : 0.6; resize(); }
        }
      }
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [progressRef, mousePosRef, lookRef]);

  return <canvas id="scene" ref={canvasRef}></canvas>;
}