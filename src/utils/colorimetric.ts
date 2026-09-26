/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Convert RGB [0-255] to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (c: number) => clamp(c).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Convert Hex to RGB
export function hexToRgb(hex: string): [number, number, number] {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map(c => c + c)
      .join('');
  }
  const intVal = parseInt(cleaned, 16);
  return [(intVal >> 16) & 255, (intVal >> 8) & 255, intVal & 255];
}

// Convert RGB [0-255] to HSV [H: 0-360, S: 0-100, V: 0-100]
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;

  let h = 0;
  if (diff === 0) {
    h = 0;
  } else if (max === rNorm) {
    h = ((gNorm - bNorm) / diff) % 6;
  } else if (max === gNorm) {
    h = (bNorm - rNorm) / diff + 2;
  } else {
    h = (rNorm - gNorm) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : Math.round((diff / max) * 100);
  const v = Math.round(max * 100);

  return [h, s, v];
}

// Convert RGB [0-255] to CIELAB [L*, a*, b*]
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // 1. Convert sRGB to linear RGB
  let rLin = r / 255;
  let gLin = g / 255;
  let bLin = b / 255;

  rLin = rLin > 0.04045 ? Math.pow((rLin + 0.055) / 1.055, 2.4) : rLin / 12.92;
  gLin = gLin > 0.04045 ? Math.pow((gLin + 0.055) / 1.055, 2.4) : gLin / 12.92;
  bLin = bLin > 0.04045 ? Math.pow((bLin + 0.055) / 1.055, 2.4) : bLin / 12.92;

  // 2. Convert to XYZ using D65 illuminant
  const x = (rLin * 0.4124 + gLin * 0.3576 + bLin * 0.1805) * 100;
  const y = (rLin * 0.2126 + gLin * 0.7152 + bLin * 0.0722) * 100;
  const z = (rLin * 0.0193 + gLin * 0.1192 + bLin * 0.9505) * 100;

  // Standard D65 reference white points
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  let xN = x / refX;
  let yN = y / refY;
  let zN = z / refZ;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

  xN = f(xN);
  yN = f(yN);
  zN = f(zN);

  const L = 116 * yN - 16;
  const a = 500 * (xN - yN);
  const bVal = 200 * (yN - zN);

  return [L, a, bVal];
}

// Calculate CIE76 / CIE94 Delta-E color difference
export function calculateDeltaE(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const [L1, a1, b1] = rgbToLab(rgb1[0], rgb1[1], rgb1[2]);
  const [L2, a2, b2] = rgbToLab(rgb2[0], rgb2[1], rgb2[2]);

  const dL = L1 - L2;
  const da = a1 - a2;
  const db = b1 - b2;

  return Math.sqrt(dL * dL + da * da + db * db);
}

// Compensate for ambient lighting using a physical reference white card
export function compensateLighting(
  rawRgb: [number, number, number],
  referenceWhiteRgb: [number, number, number]
): {
  compensatedRgb: [number, number, number];
  gainFactors: [number, number, number];
  quality: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED_LIGHTING';
} {
  // Nominal laboratory white swatch is expected near ~240 in sRGB space
  const nominalWhite = 240;

  const rGain = nominalWhite / Math.max(15, referenceWhiteRgb[0]);
  const gGain = nominalWhite / Math.max(15, referenceWhiteRgb[1]);
  const bGain = nominalWhite / Math.max(15, referenceWhiteRgb[2]);

  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));

  const compR = clamp(rawRgb[0] * rGain);
  const compG = clamp(rawRgb[1] * gGain);
  const compB = clamp(rawRgb[2] * bGain);

  // Assess lighting quality based on white patch luminance and color cast spread
  const avgRef = (referenceWhiteRgb[0] + referenceWhiteRgb[1] + referenceWhiteRgb[2]) / 3;
  const maxGainDiff = Math.max(Math.abs(rGain - gGain), Math.abs(gGain - bGain), Math.abs(rGain - bGain));

  let quality: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED_LIGHTING' = 'OPTIMAL';
  if (avgRef < 90 || avgRef > 252 || maxGainDiff > 0.8) {
    quality = 'DEGRADED_LIGHTING';
  } else if (avgRef < 140 || maxGainDiff > 0.45) {
    quality = 'ACCEPTABLE';
  }

  return {
    compensatedRgb: [compR, compG, compB],
    gainFactors: [Number(rGain.toFixed(3)), Number(gGain.toFixed(3)), Number(bGain.toFixed(3))],
    quality,
  };
}

/**
 * Procedurally draws a high-resolution forensic field test scene with
 * reacted test well/strip + validated 6-swatch reference card.
 * Generates clean Base64 data URL for fast demo/evaluation without camera hardware.
 */
export function generateSyntheticTestScene(options: {
  kitName: string;
  reactionColorHex: string;
  lightingCast?: 'daylight' | 'warm' | 'cool_shadow';
  reactionStyle?: 'strip' | 'vial';
  labelOverlay?: string;
}): string {
  const width = 800;
  const height = 600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Tactical / field testing bench background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (options.lightingCast === 'warm') {
    bgGrad.addColorStop(0, '#36342E');
    bgGrad.addColorStop(1, '#1F1D19');
  } else if (options.lightingCast === 'cool_shadow') {
    bgGrad.addColorStop(0, '#1E2530');
    bgGrad.addColorStop(1, '#0F131A');
  } else {
    bgGrad.addColorStop(0, '#26292E');
    bgGrad.addColorStop(1, '#16181C');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Field grid lines (laboratory mat)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 40; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 40; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. Physical Reference Card (Right Side)
  const cardX = 420;
  const cardY = 90;
  const cardW = 340;
  const cardH = 420;

  // Card shadow & body
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#FAFAFA';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 12);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Card border
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Reference card header
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('COLOR CALIBRATION CARD', cardX + 24, cardY + 36);

  ctx.fillStyle = '#64748B';
  ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
  ctx.fillText('REF: STD-FIELD-CAL-V3 · ISO/IEC 17025', cardX + 24, cardY + 54);

  // Scale marker on card
  ctx.fillStyle = '#94A3B8';
  for (let i = 0; i <= 20; i++) {
    const lx = cardX + 24 + i * 14.5;
    const lH = i % 5 === 0 ? 10 : 5;
    ctx.fillRect(lx, cardY + 68, 1, lH);
  }
  ctx.font = '9px monospace';
  ctx.fillText('0 cm', cardX + 24, cardY + 90);
  ctx.fillText('5 cm', cardX + 24 + 145, cardY + 90);
  ctx.fillText('10 cm', cardX + 24 + 290, cardY + 90);

  // 6 Calibrated Reference Swatches
  const swatches = [
    { name: 'WHITE (REF-W)', color: '#F4F5F7' },
    { name: 'NEUTRAL 18%', color: '#85898F' },
    { name: 'BLACK (REF-K)', color: '#1B1C20' },
    { name: 'COBALT BLUE', color: '#1E40AF' },
    { name: 'DEEP VIOLET', color: '#6B21A8' },
    { name: 'AMBER YELLOW', color: '#D97706' },
  ];

  const swatchW = 135;
  const swatchH = 80;
  const startSwatchY = cardY + 110;

  swatches.forEach((sw, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const sx = cardX + 24 + col * (swatchW + 18);
    const sy = startSwatchY + row * (swatchH + 16);

    // Swatch box
    ctx.fillStyle = sw.color;
    ctx.fillRect(sx, sy, swatchW, swatchH - 20);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, swatchW, swatchH - 20);

    // Swatch label
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(sw.name, sx + 2, sy + swatchH - 6);
  });

  // 3. Reacted Test Unit (Left Side)
  const testZoneX = 50;
  const testZoneY = 120;
  const testZoneW = 320;
  const testZoneH = 360;

  // Background plate for test
  ctx.fillStyle = '#1E232B';
  ctx.beginPath();
  ctx.roundRect(testZoneX, testZoneY, testZoneW, testZoneH, 16);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Test kit label
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('VALIDATED REAGENT WELL / TEST STRIP', testZoneX + 20, testZoneY + 36);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(options.kitName, testZoneX + 20, testZoneY + 62);

  // Test device body
  const stripW = 100;
  const stripH = 220;
  const stripX = testZoneX + (testZoneW - stripW) / 2;
  const stripY = testZoneY + 90;

  // Plastic cassette body
  ctx.fillStyle = '#E5E7EB';
  ctx.beginPath();
  ctx.roundRect(stripX, stripY, stripW, stripH, 10);
  ctx.fill();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Reaction well / test chamber
  const wellX = stripX + 18;
  const wellY = stripY + 50;
  const wellW = stripW - 36;
  const wellH = 90;

  // Well bevel/shadow
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.roundRect(wellX, wellY, wellW, wellH, 8);
  ctx.fill();

  // Inner chemical reaction color
  ctx.fillStyle = options.reactionColorHex;
  ctx.beginPath();
  ctx.roundRect(wellX + 4, wellY + 4, wellW - 8, wellH - 8, 6);
  ctx.fill();

  // Subtle fluid meniscus gloss
  const fluidGrad = ctx.createLinearGradient(wellX, wellY, wellX, wellY + wellH);
  fluidGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  fluidGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
  fluidGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = fluidGrad;
  ctx.beginPath();
  ctx.roundRect(wellX + 4, wellY + 4, wellW - 8, wellH - 8, 6);
  ctx.fill();

  // Alignment reticle over reaction well
  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(wellX - 6, wellY - 6, wellW + 12, wellH + 12);
  ctx.setLineDash([]);

  // Labels on cassette
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('SAMPLE', stripX + 26, stripY + 32);
  ctx.fillText('REACTION', stripX + 20, stripY + wellH + 72);

  // Crosshair center pip
  ctx.fillStyle = '#06B6D4';
  ctx.beginPath();
  ctx.arc(wellX + wellW / 2, wellY + wellH / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // 4. Subtle lighting filter if specified
  if (options.lightingCast === 'warm') {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
    ctx.fillRect(0, 0, width, height);
  } else if (options.lightingCast === 'cool_shadow') {
    ctx.fillStyle = 'rgba(30, 58, 138, 0.09)';
    ctx.fillRect(0, 0, width, height);
  }

  // Stamp footer
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px monospace';
  ctx.fillText('FIELD OPTICAL CAPTURE · STANDARDIZED DUAL-ZONE ROIs', 30, height - 20);

  return canvas.toDataURL('image/jpeg', 0.92);
}
