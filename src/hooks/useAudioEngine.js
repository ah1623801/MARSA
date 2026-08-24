'use client';
import { useRef, useState, useCallback } from 'react';

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function smooth(a,b,v){v=clamp((v-a)/(b-a),0,1);return v*v*(3-2*v);}

export function useAudioEngine() {
  const [isAudioOn, setIsAudioOn] = useState(false);
  const AU = useRef({ on: false, ctx: null, g: {}, prevP: 0, nextCrk: 0 });

  const noiseBuffer = (c) => {
    const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };

  const mkChain = (buf, filter, fr, q) => {
    const s = AU.current.ctx.createBufferSource(); s.buffer = buf; s.loop = true;
    const f = AU.current.ctx.createBiquadFilter(); f.type = filter; f.frequency.value = fr; f.Q.value = q || 0.7;
    const g = AU.current.ctx.createGain(); g.gain.value = 0;
    s.connect(f); f.connect(g); g.connect(AU.current.master); s.start();
    return g;
  };

  const initAudio = useCallback(() => {
    if (AU.current.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = new AC();
    AU.current.ctx = c;
    AU.current.master = c.createGain(); AU.current.master.gain.value = 0.85; AU.current.master.connect(c.destination);
    const nb = noiseBuffer(c);
    AU.current.g.ocean = mkChain(nb, "lowpass", 420);
    AU.current.g.under = mkChain(nb, "lowpass", 185);
    AU.current.g.fire = mkChain(nb, "bandpass", 850, 0.5);
    AU.current.g.fireLow = mkChain(nb, "lowpass", 120);
    AU.current.g.rest = mkChain(nb, "lowpass", 260);
    const cs = c.createBufferSource(); cs.buffer = nb; cs.loop = true;
    const cf = c.createBiquadFilter(); cf.type = "bandpass"; cf.frequency.value = 2600; cf.Q.value = 1.4;
    AU.current.g.crk = c.createGain(); AU.current.g.crk.gain.value = 0;
    cs.connect(cf); cf.connect(AU.current.g.crk); AU.current.g.crk.connect(AU.current.master); cs.start();
    const o1 = c.createOscillator(); o1.frequency.value = 110; o1.type = "sine";
    const og = c.createGain(); og.gain.value = 0.008; o1.connect(og); og.connect(AU.current.g.rest); o1.start();
  }, []);

  const sfxTouch = () => {
    if (!AU.current.ctx) return;
    const c = AU.current.ctx, now = c.currentTime;
    const n = c.createBufferSource(); n.buffer = noiseBuffer(c);
    const f = c.createBiquadFilter(); f.type = "lowpass";
    f.frequency.setValueAtTime(2600, now); f.frequency.exponentialRampToValueAtTime(500, now + 0.18);
    const g = c.createGain(); g.gain.setValueAtTime(0.16, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    n.connect(f); f.connect(g); g.connect(AU.current.master); n.start(now); n.stop(now + 0.25);
    const o = c.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(420, now + 0.02); o.frequency.exponentialRampToValueAtTime(140, now + 0.16);
    const og = c.createGain(); og.gain.setValueAtTime(0.0001, now); og.gain.exponentialRampToValueAtTime(0.22, now + 0.03); og.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    o.connect(og); og.connect(AU.current.master); o.start(now); o.stop(now + 0.22);
    const d = c.createOscillator(); d.type = "sine";
    d.frequency.setValueAtTime(900, now + 0.14); d.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
    const dg = c.createGain(); dg.gain.setValueAtTime(0.0001, now + 0.13); dg.gain.exponentialRampToValueAtTime(0.06, now + 0.15); dg.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    d.connect(dg); dg.connect(AU.current.master); d.start(now + 0.12); d.stop(now + 0.3);
  };

  const sfxGulp = () => {
    if (!AU.current.ctx) return;
    const c = AU.current.ctx, now = c.currentTime;
    const th = c.createOscillator(); th.type = "sine";
    th.frequency.setValueAtTime(150, now); th.frequency.exponentialRampToValueAtTime(55, now + 0.22);
    const tg = c.createGain(); tg.gain.setValueAtTime(0.5, now); tg.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    th.connect(tg); tg.connect(AU.current.master); th.start(now); th.stop(now + 0.32);
    const nb = c.createBufferSource(); nb.buffer = noiseBuffer(c);
    const bf = c.createBiquadFilter(); bf.type = "lowpass"; bf.frequency.value = 320;
    const bg = c.createGain(); bg.gain.setValueAtTime(0.25, now); bg.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    nb.connect(bf); bf.connect(bg); bg.connect(AU.current.master); nb.start(now); nb.stop(now + 0.4);
    for (let i = 0; i < 5; i++) {
      const t0 = now + 0.05 + i * 0.05;
      const bo = c.createOscillator(); bo.type = "sine";
      bo.frequency.setValueAtTime(200 + i * 90, t0); bo.frequency.exponentialRampToValueAtTime(500 + i * 120, t0 + 0.07);
      const bog = c.createGain(); bog.gain.setValueAtTime(0.05, t0); bog.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
      bo.connect(bog); bog.connect(AU.current.master); bo.start(t0); bo.stop(t0 + 0.1);
    }
    const z = c.createBufferSource(); z.buffer = noiseBuffer(c);
    const zf = c.createBiquadFilter(); zf.type = "bandpass"; zf.Q.value = 6;
    zf.frequency.setValueAtTime(1800, now); zf.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
    const zg = c.createGain(); zg.gain.setValueAtTime(0.0001, now); zg.gain.exponentialRampToValueAtTime(0.08, now + 0.02); zg.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    z.connect(zf); zf.connect(zg); zg.connect(AU.current.master); z.start(now); z.stop(now + 0.2);
  };

  const sfxSplash = () => {
    if (!AU.current.ctx) return;
    const c = AU.current.ctx, now = c.currentTime;
    const n = c.createBufferSource(); n.buffer = noiseBuffer(c);
    const f = c.createBiquadFilter(); f.type = "lowpass";
    f.frequency.setValueAtTime(4200, now); f.frequency.exponentialRampToValueAtTime(600, now + 0.5);
    const g = c.createGain(); g.gain.setValueAtTime(0.5, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    n.connect(f); f.connect(g); g.connect(AU.current.master); n.start(now); n.stop(now + 0.65);
    const w = c.createBufferSource(); w.buffer = noiseBuffer(c);
    const wf = c.createBiquadFilter(); wf.type = "bandpass"; wf.Q.value = 1.2;
    wf.frequency.setValueAtTime(300, now); wf.frequency.exponentialRampToValueAtTime(1400, now + 0.3);
    const wg = c.createGain(); wg.gain.setValueAtTime(0.0001, now); wg.gain.exponentialRampToValueAtTime(0.18, now + 0.08); wg.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    w.connect(wf); wf.connect(wg); wg.connect(AU.current.master); w.start(now); w.stop(now + 0.5);
    for (let i = 0; i < 8; i++) {
      const t0 = now + 0.1 + Math.random() * 0.35;
      const d = c.createOscillator(); d.type = "sine";
      d.frequency.setValueAtTime(700 + Math.random() * 900, t0); d.frequency.exponentialRampToValueAtTime(1600, t0 + 0.05);
      const dg = c.createGain(); dg.gain.setValueAtTime(0.05, t0); dg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);
      d.connect(dg); dg.connect(AU.current.master); d.start(t0); d.stop(t0 + 0.09);
    }
    const o = c.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(120, now); o.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    const og = c.createGain(); og.gain.setValueAtTime(0.3, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    o.connect(og); og.connect(AU.current.master); o.start(now); o.stop(now + 0.4);
  };

  const playBlip = () => {
    if (!AU.current.ctx) return;
    const c = AU.current.ctx, o = c.createOscillator(), g = c.createGain();
    const now = c.currentTime;
    o.type = "sine";
    o.frequency.setValueAtTime(360 + Math.random() * 160, now);
    o.frequency.exponentialRampToValueAtTime(80, now + 0.18);
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    o.connect(g); g.connect(AU.current.master); o.start(now); o.stop(now + 0.22);
  };

  const updateAudio = useCallback((p, t) => {
    if (!AU.current.on || !AU.current.ctx) return;
    const ct = AU.current.ctx.currentTime, st = 0.3;
    AU.current.g.ocean.gain.setTargetAtTime(0.5 * (smooth(0, 0.02, p) * (1 - smooth(0.19, 0.25, p)) + smooth(0.555, 0.6, p) * (1 - smooth(0.65, 0.7, p))), ct, st);
    AU.current.g.under.gain.setTargetAtTime(0.55 * smooth(0.2, 0.25, p) * (1 - smooth(0.565, 0.61, p)), ct, st);
    const fi = 0.4 * smooth(0.665, 0.705, p) * (1 - smooth(0.84, 0.9, p));
    AU.current.g.fire.gain.setTargetAtTime(fi, ct, st);
    AU.current.g.fireLow.gain.setTargetAtTime(fi * 0.6, ct, st);
    AU.current.g.rest.gain.setTargetAtTime(0.3 * smooth(0.86, 0.92, p), ct, st);
    if (fi > 0.03 && t > AU.current.nextCrk) {
      AU.current.g.crk.gain.setTargetAtTime(0.1 + Math.random() * 0.3 * fi * 3, ct, 0.012);
      AU.current.g.crk.gain.setTargetAtTime(0, ct + 0.04, 0.06);
      AU.current.nextCrk = t + 0.06 + Math.random() * 0.3 / (fi + 0.1);
    }
    if (0.55 * smooth(0.2, 0.25, p) * (1 - smooth(0.565, 0.61, p)) > 0.1 && Math.random() < 0.006) playBlip();
    const SND_MARKS = [{ p: 0.152, fn: sfxTouch }, { p: 0.465, fn: sfxGulp }, { p: 0.588, fn: sfxSplash }];
    for (let i = 0; i < SND_MARKS.length; i++) {
      const m = SND_MARKS[i];
      if (AU.current.prevP < m.p && p >= m.p) m.fn();
    }
    AU.current.prevP = p;
  }, []);

  const toggleSound = () => {
    AU.current.on = !AU.current.on;
    setIsAudioOn(AU.current.on);
    if (AU.current.on) {
      initAudio();
      if (AU.current.ctx) AU.current.ctx.resume();
    } else {
      if (AU.current.ctx) {
        const ct = AU.current.ctx.currentTime;
        for (let key in AU.current.g) AU.current.g[key].gain.setTargetAtTime(0, ct, 0.15);
      }
    }
  };

  return { isAudioOn, toggleSound, updateAudio };
}