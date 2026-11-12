// Generates the app icon, splash mark, film posters and film stills.
// Run with: npm run assets
// Everything is drawn procedurally so the repo carries no third-party artwork.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = join(ROOT, 'node_modules/@expo-google-fonts/inter');
GlobalFonts.registerFromPath(join(FONT_DIR, '800ExtraBold/Inter_800ExtraBold.ttf'), 'InterXB');
GlobalFonts.registerFromPath(join(FONT_DIR, '600SemiBold/Inter_600SemiBold.ttf'), 'InterSB');

const BRAND = { bg: '#0B0A0E', mint: '#7CF2B4', cream: '#F4EFE6' };

// Film art is noisy (grain), which PNG compresses badly, so it ships as JPEG
function save(canvas, rel) {
  const out = join(ROOT, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, rel.endsWith('.jpg') ? canvas.toBuffer('image/jpeg', 86) : canvas.toBuffer('image/png'));
  console.log('wrote', rel);
}

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function vgrad(g, y0, y1, stops) {
  const lg = g.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([o, c]) => lg.addColorStop(o, c));
  return lg;
}

// Fill everything under a curve y = fn(x)
function fillUnder(g, W, H, fn, fill) {
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 3) g.lineTo(x, fn(x));
  g.lineTo(W, H); g.closePath();
  g.fillStyle = fill; g.fill();
}

const ridge = (W, H, base, parts) => (x) =>
  H * base + parts.reduce((a, [f, amp, p]) => a + Math.sin((x / W) * f + p) * amp * H, 0);

function grainAndVignette(g, W, H, seed, strength = 0.28) {
  const img = g.getImageData(0, 0, W, H), d = img.data, nr = mulberry(seed);
  for (let i = 0; i < d.length; i += 4) {
    const n = (nr() - 0.5) * 10;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${strength})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

/* ------------------------------------------------------------------ */
/* Film scenes. Coordinates are relative to W and H so the same scene  */
/* works as a wide still and as a portrait poster.                     */
/* ------------------------------------------------------------------ */

const scenes = {
  desert(g, W, H) {
    const s = Math.min(W, H) / 857;
    g.fillStyle = vgrad(g, 0, H * 0.64, [[0, '#c4b4a2'], [0.55, '#dac9b4'], [1, '#e7d7c2']]);
    g.fillRect(0, 0, W, H);
    const sun = g.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, Math.max(W, H) * 0.5);
    sun.addColorStop(0, 'rgba(255,244,226,.6)'); sun.addColorStop(1, 'rgba(255,244,226,0)');
    g.fillStyle = sun; g.fillRect(0, 0, W, H);

    fillUnder(g, W, H, ridge(W, H, 0.585, [[4.3, 0.011, 1.2], [12.9, 0.005, 0.3], [1.8, 0.008, 2.1]]),
      vgrad(g, H * 0.55, H, [[0, '#d9c6aa'], [1, '#cdb391']]));
    const mid = ridge(W, H, 0.625, [[3.3, 0.019, 0.4], [9.6, 0.007, 1.9], [1.4, 0.014, 0.8]]);
    fillUnder(g, W, H, mid, vgrad(g, H * 0.6, H, [[0, '#d4b48f'], [1, '#c29a6f']]));

    // lone traveller on the ridge
    const fx = W * 0.47, fy = mid(fx);
    g.fillStyle = '#2c1f18';
    g.fillRect(fx - 3 * s, fy - 24 * s, 6 * s, 22 * s);
    g.beginPath(); g.arc(fx, fy - 28 * s, 4.5 * s, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(fx - 3 * s, fy - 20 * s); g.lineTo(fx - 9 * s, fy - 2 * s); g.lineTo(fx - 3 * s, fy - 2 * s); g.fill();

    const P0 = [-60, H * 0.74], C1 = [W * 0.24, H * 0.58], P1 = [W * 0.46, H * 0.6], C2 = [W * 0.74, H * 0.62], P2 = [W * 1.06, H * 0.98];
    g.beginPath(); g.moveTo(...P0); g.quadraticCurveTo(...C1, ...P1); g.quadraticCurveTo(...C2, ...P2);
    g.lineTo(W, H); g.lineTo(0, H); g.closePath();
    g.fillStyle = vgrad(g, H * 0.58, H, [[0, '#e2b383'], [1, '#c48a57']]); g.fill();

    g.beginPath(); g.moveTo(...P1); g.quadraticCurveTo(...C2, ...P2); g.lineTo(W, H); g.lineTo(W * 0.66, H);
    g.bezierCurveTo(W * 0.6, H * 0.86, W * 0.52, H * 0.7, P1[0], P1[1]); g.closePath();
    const sh = g.createLinearGradient(W * 0.46, H * 0.6, W * 0.8, H);
    sh.addColorStop(0, '#a26e47'); sh.addColorStop(1, '#7d5236');
    g.fillStyle = sh; g.fill();

    g.beginPath(); g.moveTo(...P0); g.quadraticCurveTo(...C1, ...P1);
    g.strokeStyle = 'rgba(255,230,195,.55)'; g.lineWidth = 3 * s; g.stroke();

    g.fillStyle = vgrad(g, H * 0.5, H * 0.7, [[0, 'rgba(235,222,204,0)'], [0.5, 'rgba(235,222,204,.22)'], [1, 'rgba(235,222,204,0)']]);
    g.fillRect(0, 0, W, H);
  },

  neon(g, W, H, rnd) {
    const hz = H * 0.66, s = Math.min(W, H) / 857;
    g.fillStyle = vgrad(g, 0, hz, [[0, '#07051a'], [0.6, '#22103f'], [1, '#5c1d55']]);
    g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(W * 0.5, hz, 0, W * 0.5, hz, W * 0.6);
    glow.addColorStop(0, 'rgba(255,80,160,.35)'); glow.addColorStop(1, 'rgba(255,80,160,0)');
    g.fillStyle = glow; g.fillRect(0, 0, W, H);

    const neonCols = ['#ff4fa3', '#38e1ff', '#ffd166', '#b46bff'];
    const layer = (col, minH, maxH, winP, seed) => {
      const r = mulberry(seed);
      let x = -10;
      while (x < W) {
        const bw = (30 + r() * 90) * s, bh = H * (minH + r() * (maxH - minH));
        g.fillStyle = col; g.fillRect(x, hz - bh, bw, bh);
        for (let wy = hz - bh + 10 * s; wy < hz - 8 * s; wy += 12 * s)
          for (let wx = x + 6 * s; wx < x + bw - 8 * s; wx += 10 * s)
            if (r() < winP) {
              g.fillStyle = r() < 0.75 ? 'rgba(255,196,120,.85)' : 'rgba(120,230,255,.8)';
              g.fillRect(wx, wy, 4 * s, 6 * s);
            }
        if (r() < 0.35) {
          const c = neonCols[(r() * neonCols.length) | 0];
          g.save(); g.shadowColor = c; g.shadowBlur = 18 * s; g.fillStyle = c;
          g.fillRect(x + bw * 0.2, hz - bh + 14 * s + r() * 30 * s, bw * 0.6, 5 * s); g.restore();
        }
        x += bw + r() * 6 * s;
      }
    };
    layer('#1a0f2e', 0.18, 0.4, 0.12, 11);
    layer('#0b0714', 0.12, 0.48, 0.2, 23);

    // wet street with neon reflections
    g.fillStyle = vgrad(g, hz, H, [[0, '#120a1c'], [1, '#040308']]);
    g.fillRect(0, hz, W, H - hz);
    for (let i = 0; i < 40; i++) {
      const x = rnd() * W, c = neonCols[(rnd() * neonCols.length) | 0];
      g.fillStyle = c; g.globalAlpha = 0.08 + rnd() * 0.15;
      g.fillRect(x, hz + 2, (2 + rnd() * 8) * s, (H - hz) * (0.3 + rnd() * 0.6));
    }
    g.globalAlpha = 1;
    // figure under an umbrella
    const fx = W * 0.56, fy = H * 0.86;
    g.fillStyle = '#020104';
    g.fillRect(fx - 7 * s, fy - 58 * s, 14 * s, 58 * s);
    g.beginPath(); g.arc(fx, fy - 64 * s, 26 * s, Math.PI, 0); g.fill();
    // rain
    g.strokeStyle = 'rgba(200,210,255,.18)'; g.lineWidth = 1.2 * s;
    for (let i = 0; i < 260; i++) {
      const x = rnd() * W, y = rnd() * H;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6 * s, y + 22 * s); g.stroke();
    }
  },

  ocean(g, W, H, rnd) {
    const hz = H * 0.56, s = Math.min(W, H) / 857;
    g.fillStyle = vgrad(g, 0, hz, [[0, '#0c2f57'], [0.55, '#2f7aa0'], [1, '#a8dcdc']]);
    g.fillRect(0, 0, W, H);
    const sun = g.createRadialGradient(W * 0.3, hz - H * 0.08, 0, W * 0.3, hz - H * 0.08, W * 0.35);
    sun.addColorStop(0, 'rgba(255,250,230,.95)'); sun.addColorStop(0.08, 'rgba(255,240,200,.6)'); sun.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = sun; g.fillRect(0, 0, W, H);

    g.fillStyle = vgrad(g, hz, H, [[0, '#1f6f8b'], [0.4, '#0d4a66'], [1, '#03202f']]);
    g.fillRect(0, hz, W, H - hz);
    // sun glitter
    for (let i = 0; i < 300; i++) {
      const y = hz + Math.pow(rnd(), 2) * (H - hz);
      const spread = (y - hz) * 0.7 + 10;
      const x = W * 0.3 + (rnd() - 0.5) * spread;
      g.fillStyle = `rgba(255,248,225,${0.15 + rnd() * 0.5})`;
      g.fillRect(x, y, (4 + rnd() * 14) * s, 1.5 * s);
    }
    // wave crests, larger toward the viewer
    for (let k = 0; k < 14; k++) {
      const v = k / 13, y0 = hz + (H - hz) * Math.pow(v, 1.6);
      g.strokeStyle = `rgba(210,240,245,${0.12 + v * 0.25})`; g.lineWidth = (1 + v * 4) * s;
      g.beginPath();
      for (let x = 0; x <= W; x += 4) g.lineTo(x, y0 + Math.sin((x / W) * (30 - v * 18) + k * 1.7) * (2 + v * 12) * s);
      g.stroke();
    }
    // sailboat on the horizon
    const bx = W * 0.66, by = hz + 6 * s;
    g.fillStyle = '#0a1f2b';
    g.beginPath(); g.moveTo(bx - 26 * s, by); g.lineTo(bx + 26 * s, by); g.lineTo(bx + 18 * s, by + 8 * s); g.lineTo(bx - 18 * s, by + 8 * s); g.fill();
    g.beginPath(); g.moveTo(bx, by - 2 * s); g.lineTo(bx, by - 52 * s); g.lineTo(bx + 24 * s, by - 4 * s); g.fill();
    g.beginPath(); g.moveTo(bx - 3 * s, by - 6 * s); g.lineTo(bx - 3 * s, by - 40 * s); g.lineTo(bx - 20 * s, by - 6 * s); g.fill();
  },

  fog(g, W, H, rnd) {
    const s = Math.min(W, H) / 857;
    g.fillStyle = vgrad(g, 0, H, [[0, '#59625f'], [0.5, '#9aa49f'], [1, '#c4cbc5']]);
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(240,240,225,.55)';
    g.beginPath(); g.arc(W * 0.72, H * 0.2, Math.min(W, H) * 0.07, 0, Math.PI * 2); g.fill();

    const pines = (baseY, scale, col, seed) => {
      const r = mulberry(seed);
      g.fillStyle = col;
      for (let x = -40; x < W + 40; x += (16 + r() * 26) * scale * s) {
        const h = (90 + r() * 120) * scale * s, w = h * 0.36, y = baseY + r() * 10 * s;
        for (let t = 0; t < 4; t++) {
          const ty = y - h + (t * h) / 4.2, tw = w * (0.45 + t * 0.2);
          g.beginPath(); g.moveTo(x, ty); g.lineTo(x - tw / 2, ty + h / 2.6); g.lineTo(x + tw / 2, ty + h / 2.6); g.fill();
        }
        g.fillRect(x - 2 * scale * s, y - h * 0.2, 4 * scale * s, h * 0.25);
      }
      g.fillRect(0, baseY, W, H - baseY);
    };
    const fogBand = (y, a) => {
      g.fillStyle = vgrad(g, y - H * 0.1, y + H * 0.1, [[0, 'rgba(210,216,210,0)'], [0.5, `rgba(210,216,210,${a})`], [1, 'rgba(210,216,210,0)']]);
      g.fillRect(0, y - H * 0.1, W, H * 0.2);
    };
    pines(H * 0.55, 0.7, '#7c8782', 5); fogBand(H * 0.56, 0.6);
    pines(H * 0.66, 1.0, '#4b5551', 9);

    // the house, one window lit
    const hx = W * 0.54, hy = H * 0.66, u = 40 * s;
    g.fillStyle = '#262b29';
    g.fillRect(hx - u, hy - u * 1.1, u * 2, u * 1.1);
    g.beginPath(); g.moveTo(hx - u * 1.2, hy - u * 1.1); g.lineTo(hx, hy - u * 2); g.lineTo(hx + u * 1.2, hy - u * 1.1); g.fill();
    g.save(); g.shadowColor = '#ffb35c'; g.shadowBlur = 30 * s; g.fillStyle = '#ffc070';
    g.fillRect(hx + u * 0.3, hy - u * 0.8, u * 0.4, u * 0.4); g.restore();
    fogBand(H * 0.7, 0.55);
    pines(H * 0.84, 1.6, '#1f2523', 17);
    fogBand(H * 0.9, 0.35);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = `rgba(230,232,225,${0.05 + rnd() * 0.06})`;
      g.beginPath(); g.ellipse(rnd() * W, H * (0.4 + rnd() * 0.5), W * 0.3, H * 0.04, 0, 0, Math.PI * 2); g.fill();
    }
  },

  space(g, W, H, rnd) {
    const s = Math.min(W, H) / 857;
    g.fillStyle = vgrad(g, 0, H, [[0, '#03040a'], [1, '#0b0f24']]);
    g.fillRect(0, 0, W, H);
    for (const [x, y, r, c] of [[0.25, 0.35, 0.5, 'rgba(120,70,200,.22)'], [0.7, 0.2, 0.4, 'rgba(40,180,200,.14)']]) {
      const n = g.createRadialGradient(W * x, H * y, 0, W * x, H * y, Math.max(W, H) * r);
      n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = n; g.fillRect(0, 0, W, H);
    }
    for (let i = 0; i < 700; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.8})`;
      const r = rnd() < 0.96 ? 0.8 : 1.8;
      g.beginPath(); g.arc(rnd() * W, rnd() * H, r * s, 0, Math.PI * 2); g.fill();
    }
    // planet with ring
    const px = W * 0.74, py = H * 0.78, pr = Math.min(W, H) * 0.42;
    g.save(); g.translate(px, py); g.rotate(-0.35);
    g.strokeStyle = 'rgba(230,200,160,.35)'; g.lineWidth = 10 * s;
    g.beginPath(); g.ellipse(0, 0, pr * 1.6, pr * 0.34, 0, Math.PI, Math.PI * 2); g.stroke();
    g.restore();
    const pg = g.createRadialGradient(px - pr * 0.4, py - pr * 0.5, pr * 0.1, px, py, pr);
    pg.addColorStop(0, '#f0b27a'); pg.addColorStop(0.5, '#a5543b'); pg.addColorStop(1, '#2a0f14');
    g.fillStyle = pg; g.beginPath(); g.arc(px, py, pr, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(px, py, pr, 0, Math.PI * 2); g.clip();
    for (let i = 0; i < 9; i++) {
      g.fillStyle = `rgba(60,20,20,${0.08 + rnd() * 0.1})`;
      g.fillRect(px - pr, py - pr + (i / 9) * pr * 2 + rnd() * 10, pr * 2, pr * 0.06);
    }
    g.restore();
    g.save(); g.translate(px, py); g.rotate(-0.35);
    g.strokeStyle = 'rgba(240,215,175,.55)'; g.lineWidth = 10 * s;
    g.beginPath(); g.ellipse(0, 0, pr * 1.6, pr * 0.34, 0, 0, Math.PI); g.stroke();
    g.restore();
    // ship with engine trail
    const sx = W * 0.3, sy = H * 0.3;
    const tr = g.createLinearGradient(sx - W * 0.2, sy + H * 0.08, sx, sy);
    tr.addColorStop(0, 'rgba(124,242,180,0)'); tr.addColorStop(1, 'rgba(124,242,180,.8)');
    g.strokeStyle = tr; g.lineWidth = 3 * s;
    g.beginPath(); g.moveTo(sx - W * 0.2, sy + H * 0.08); g.lineTo(sx, sy); g.stroke();
    g.save(); g.shadowColor = '#7CF2B4'; g.shadowBlur = 20 * s; g.fillStyle = '#eafff4';
    g.beginPath(); g.arc(sx, sy, 4 * s, 0, Math.PI * 2); g.fill(); g.restore();
  },

  sunset(g, W, H, rnd) {
    const hz = H * 0.68, s = Math.min(W, H) / 857;
    g.fillStyle = vgrad(g, 0, hz, [[0, '#2b1a3f'], [0.4, '#a83f6b'], [0.75, '#f08a5d'], [1, '#ffd29a']]);
    g.fillRect(0, 0, W, H);
    const sun = g.createRadialGradient(W * 0.42, hz - H * 0.04, 0, W * 0.42, hz - H * 0.04, Math.min(W, H) * 0.12);
    sun.addColorStop(0, '#fff2cf'); sun.addColorStop(0.6, '#ffd08a'); sun.addColorStop(1, 'rgba(255,200,130,0)');
    g.fillStyle = sun; g.fillRect(0, 0, W, H);

    const r = mulberry(31);
    g.fillStyle = '#2a1426';
    let x = -10;
    while (x < W) {
      const bw = (60 + r() * 80) * s, bh = (60 + r() * 110) * s;
      g.fillRect(x, hz - bh, bw, bh + H);
      const kind = r();
      if (kind < 0.45) { // pitched roof
        g.beginPath(); g.moveTo(x - 6 * s, hz - bh); g.lineTo(x + bw / 2, hz - bh - bw * 0.35); g.lineTo(x + bw + 6 * s, hz - bh); g.fill();
      } else if (kind < 0.6) { // gable with ornament
        g.beginPath(); g.moveTo(x + bw * 0.15, hz - bh); g.quadraticCurveTo(x + bw / 2, hz - bh - bw * 0.6, x + bw * 0.85, hz - bh); g.fill();
      }
      for (let wy = hz - bh + 18 * s; wy < hz - 20 * s; wy += 30 * s)
        for (let wx = x + 12 * s; wx < x + bw - 16 * s; wx += 22 * s)
          if (r() < 0.25) { g.fillStyle = 'rgba(255,190,110,.75)'; g.fillRect(wx, wy, 7 * s, 12 * s); g.fillStyle = '#2a1426'; }
      x += bw;
    }
    // clock tower
    const tx = W * 0.72, tw = 50 * s, th = H * 0.36;
    g.fillRect(tx - tw / 2, hz - th, tw, th);
    g.beginPath(); g.moveTo(tx - tw * 0.7, hz - th); g.lineTo(tx, hz - th - tw * 1.3); g.lineTo(tx + tw * 0.7, hz - th); g.fill();
    g.fillStyle = 'rgba(255,220,160,.8)';
    g.beginPath(); g.arc(tx, hz - th + tw * 0.6, tw * 0.28, 0, Math.PI * 2); g.fill();
    // street
    g.fillStyle = vgrad(g, hz, H, [[0, '#3a1c33'], [1, '#12070f']]);
    g.fillRect(0, hz, W, H - hz);
    // tram wires and birds
    g.strokeStyle = 'rgba(30,10,25,.8)'; g.lineWidth = 1.5 * s;
    for (const k of [0.12, 0.16]) {
      g.beginPath(); g.moveTo(0, H * k); g.quadraticCurveTo(W / 2, H * (k + 0.06), W, H * k); g.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const bx = W * (0.2 + rnd() * 0.5), by = H * (0.22 + rnd() * 0.18), bs = (6 + rnd() * 6) * s;
      g.beginPath(); g.moveTo(bx - bs, by - bs * 0.4); g.quadraticCurveTo(bx - bs * 0.4, by - bs * 0.5, bx, by);
      g.quadraticCurveTo(bx + bs * 0.4, by - bs * 0.5, bx + bs, by - bs * 0.4); g.stroke();
    }
  },
};

const FILMS = [
  { id: 'lautan-pasir', scene: 'desert', title: 'Lautan Pasir', tagline: 'Seribu kilometer. Satu jejak.' },
  { id: 'gema-malam', scene: 'neon', title: 'Gema Malam', tagline: 'Kota ini tidak pernah tidur. Dia juga.' },
  { id: 'arus-biru', scene: 'ocean', title: 'Arus Biru', tagline: 'Laut selalu menagih janji.' },
  { id: 'rumah-kabut', scene: 'fog', title: 'Rumah di Ujung Kabut', tagline: 'Jangan matikan lampunya.' },
  { id: 'orbit-terakhir', scene: 'space', title: 'Orbit Terakhir', tagline: 'Pulang adalah misi paling jauh.' },
  { id: 'senja-kota-tua', scene: 'sunset', title: 'Senja di Kota Tua', tagline: 'Beberapa pertemuan hanya terjadi sekali.' },
];

// Single line if it fits, otherwise the two-line split with the most even widths
function wrap(g, text, maxW) {
  if (g.measureText(text).width <= maxW) return [text];
  const words = text.split(' ');
  let best = null, bestW = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const w = Math.max(g.measureText(a).width, g.measureText(b).width);
    if (w < bestW) { bestW = w; best = [a, b]; }
  }
  return best;
}

function renderFilm(f) {
  // still: 2.39:1, used on the 3D cinema screen and for banners
  {
    const W = 1600, H = 670, c = createCanvas(W, H), g = c.getContext('2d');
    scenes[f.scene](g, W, H, mulberry(f.id.length * 97));
    grainAndVignette(g, W, H, 7);
    save(c, `src/common/assets/films/${f.id}-still.jpg`);
  }
  // poster: 2:3 with the title set in the art
  {
    const W = 600, H = 900, c = createCanvas(W, H), g = c.getContext('2d');
    scenes[f.scene](g, W, H, mulberry(f.id.length * 131));
    grainAndVignette(g, W, H, 9, 0.35);
    g.fillStyle = vgrad(g, H * 0.55, H, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.85)']]);
    g.fillRect(0, H * 0.55, W, H * 0.45);
    g.textAlign = 'center'; g.fillStyle = '#f6f1e8';
    g.font = '64px InterXB';
    const lines = wrap(g, f.title.toUpperCase(), W - 80);
    let y = H - 70 - (lines.length - 1) * 66;
    for (const l of lines) { g.fillText(l, W / 2, y); y += 66; }
    g.font = '20px InterSB'; g.fillStyle = 'rgba(246,241,232,.75)';
    g.fillText(f.tagline, W / 2, H - 70 - (lines.length - 1) * 66 - 72);
    save(c, `src/common/assets/films/${f.id}-poster.jpg`);
  }
}

/* ------------------------------------------------------------------ */
/* Brand mark: a projector beam hitting a curved screen, over two rows */
/* of seats with the chosen one lit.                                   */
/* ------------------------------------------------------------------ */

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

function drawMark(g, cx, cy, S, mono = false) {
  const cream = mono ? '#ffffff' : BRAND.cream, mint = mono ? '#ffffff' : BRAND.mint;
  const L = [cx - 0.4 * S, cy - 0.26 * S], R = [cx + 0.4 * S, cy - 0.26 * S], C = [cx, cy - 0.46 * S];
  const apex = [cx, cy + 0.42 * S];

  // beam
  g.beginPath(); g.moveTo(...apex); g.lineTo(L[0] + 0.03 * S, L[1] + 0.02 * S);
  g.quadraticCurveTo(C[0], C[1] + 0.03 * S, R[0] - 0.03 * S, R[1] + 0.02 * S); g.closePath();
  const bg = g.createLinearGradient(0, apex[1], 0, C[1]);
  bg.addColorStop(0, mono ? 'rgba(255,255,255,.15)' : 'rgba(124,242,180,.10)');
  bg.addColorStop(0.55, mono ? 'rgba(255,255,255,.3)' : 'rgba(200,240,215,.10)');
  bg.addColorStop(1, mono ? 'rgba(255,255,255,.55)' : 'rgba(244,239,230,.30)');
  g.fillStyle = bg; g.fill();

  // screen
  g.save();
  if (!mono) { g.shadowColor = 'rgba(244,239,230,.8)'; g.shadowBlur = 0.06 * S; }
  g.beginPath(); g.moveTo(...L); g.quadraticCurveTo(...C, ...R);
  g.strokeStyle = cream; g.lineWidth = 0.055 * S; g.lineCap = 'round'; g.stroke();
  g.restore();

  // seats
  const seat = (x, y, w, lit) => {
    rr(g, x - w / 2, y, w, w * 0.78, w * 0.22);
    g.fillStyle = lit ? mint : mono ? 'rgba(255,255,255,.45)' : '#3a3644';
    g.fill();
  };
  const w1 = 0.16 * S, w2 = 0.19 * S;
  [-1, 0, 1].forEach((i) => seat(cx + i * w1 * 1.3, cy + 0.0 * S, w1, false));
  [-1, 0, 1].forEach((i) => seat(cx + i * w2 * 1.28, cy + 0.17 * S, w2, i === 0));

  // projector point
  g.save();
  if (!mono) { g.shadowColor = BRAND.mint; g.shadowBlur = 0.05 * S; }
  g.fillStyle = mint; g.beginPath(); g.arc(apex[0], apex[1], 0.035 * S, 0, Math.PI * 2); g.fill();
  g.restore();
}

function brandBackground(g, W, H) {
  g.fillStyle = BRAND.bg; g.fillRect(0, 0, W, H);
  const r = g.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, W * 0.75);
  r.addColorStop(0, '#1d1a26'); r.addColorStop(1, BRAND.bg);
  g.fillStyle = r; g.fillRect(0, 0, W, H);
}

function renderBrand() {
  { // iOS / store icon: full bleed, no transparency
    const c = createCanvas(1024, 1024), g = c.getContext('2d');
    brandBackground(g, 1024, 1024); drawMark(g, 512, 540, 760);
    save(c, 'assets/icon.png');
  }
  { // splash mark on transparent background (splash bg colour comes from app.json)
    const c = createCanvas(1024, 1024), g = c.getContext('2d');
    drawMark(g, 512, 540, 900);
    save(c, 'assets/splash-icon.png');
  }
  { // android adaptive icon layers: keep the mark inside the 66% safe zone
    const c = createCanvas(1024, 1024), g = c.getContext('2d');
    drawMark(g, 512, 530, 560);
    save(c, 'assets/android-icon-foreground.png');
    const b = createCanvas(1024, 1024); brandBackground(b.getContext('2d'), 1024, 1024);
    save(b, 'assets/android-icon-background.png');
    const m = createCanvas(1024, 1024); drawMark(m.getContext('2d'), 512, 530, 560, true);
    save(m, 'assets/android-icon-monochrome.png');
  }
  {
    const c = createCanvas(64, 64), g = c.getContext('2d');
    brandBackground(g, 64, 64); drawMark(g, 32, 34, 52);
    save(c, 'assets/favicon.png');
  }
}

renderBrand();
FILMS.forEach(renderFilm);
