/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ExtractedColorFeatures,
  TestResultCategory,
  ValidatedKit,
} from '../types';
import {
  calculateDeltaE,
  compensateLighting,
  rgbToHex,
  rgbToHsv,
} from '../utils/colorimetric';
import { calculateSha256 } from '../utils/crypto';

export interface ImageAnalysisROI {
  testRegion: { x: number; y: number; width: number; height: number };
  referenceWhite: { x: number; y: number; width: number; height: number };
}

export interface AnalysisPipelineResult {
  features: ExtractedColorFeatures;
  classification: {
    result: TestResultCategory;
    confidenceScore: number;
    reasoning: string;
  };
  sha256Hash: string;
}

/**
 * Loads an image from a Data URL or Image URL into an HTMLImageElement
 */
export function loadImageAsync(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
    img.src = src;
  });
}

/**
 * Samples average RGB from a specified region in an image canvas
 */
function sampleRegionAverageRgb(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number
): [number, number, number] {
  // Normalize bounds
  const x = Math.max(0, Math.min(canvasWidth - 1, Math.round(rect.x)));
  const y = Math.max(0, Math.min(canvasHeight - 1, Math.round(rect.y)));
  const w = Math.max(2, Math.min(canvasWidth - x, Math.round(rect.width)));
  const h = Math.max(2, Math.min(canvasHeight - y, Math.round(rect.height)));

  const imgData = ctx.getImageData(x, y, w, h);
  const data = imgData.data;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let sampleCount = 0;

  // Sample with step to be fast and avoid border artifacts
  for (let i = 0; i < data.length; i += 16) {
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
    sampleCount++;
  }

  if (sampleCount === 0) return [128, 128, 128];

  return [
    Math.round(totalR / sampleCount),
    Math.round(totalG / sampleCount),
    Math.round(totalB / sampleCount),
  ];
}

/**
 * Full Forensic Colorimetric & ML Classification Pipeline
 */
export async function runForensicAnalysisPipeline(
  imageDataUrl: string,
  kit: ValidatedKit,
  customRoi?: ImageAnalysisROI
): Promise<AnalysisPipelineResult> {
  // 1. Calculate SHA-256 hash immediately for evidence integrity
  const sha256Hash = await calculateSha256(imageDataUrl);

  // 2. Load into offscreen canvas
  const img = await loadImageAsync(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width || 800;
  canvas.height = img.naturalHeight || img.height || 600;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Unable to initialize canvas 2D rendering context for optical processing.');
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // 3. Define Standard Dual-Zone ROIs if not customized
  // Left zone: Reaction well / Strip (approx ~20-30% x, 35-55% y)
  // Right zone: Reference Card White Swatch (approx ~55-70% x, 25-40% y)
  const defaultRoi: ImageAnalysisROI = {
    testRegion: {
      x: canvas.width * 0.18,
      y: canvas.height * 0.35,
      width: canvas.width * 0.14,
      height: canvas.height * 0.18,
    },
    referenceWhite: {
      x: canvas.width * 0.58,
      y: canvas.height * 0.28,
      width: canvas.width * 0.12,
      height: canvas.height * 0.10,
    },
  };

  const roi = customRoi || defaultRoi;

  // 4. Extract Raw Optical Color from Test Region
  const rawRgb = sampleRegionAverageRgb(ctx, roi.testRegion, canvas.width, canvas.height);
  const rawHsv = rgbToHsv(rawRgb[0], rawRgb[1], rawRgb[2]);
  const rawHex = rgbToHex(rawRgb[0], rawRgb[1], rawRgb[2]);

  // 5. Extract Reference White Patch for Lighting Compensation
  const refWhiteRgb = sampleRegionAverageRgb(
    ctx,
    roi.referenceWhite,
    canvas.width,
    canvas.height
  );

  // 6. Perform Lighting & Chromaticity Compensation
  const compensation = compensateLighting(rawRgb, refWhiteRgb);
  const compRgb = compensation.compensatedRgb;
  const compHsv = rgbToHsv(compRgb[0], compRgb[1], compRgb[2]);
  const compHex = rgbToHex(compRgb[0], compRgb[1], compRgb[2]);

  // 7. Measure Colorimetric Distance to Validated Kit Baselines (CIE94 / CIELAB Delta-E)
  const deltaEToPositive = calculateDeltaE(compRgb, kit.expectedColors.positive.rgb);
  const deltaEToNegative = calculateDeltaE(compRgb, kit.expectedColors.negative.rgb);

  // 8. Detected Reference Card Swatches matching
  const detectedMatches = kit.referenceCardSwatches.map(sw => {
    const dE = calculateDeltaE(compRgb, sw.nominalRgb);
    return {
      swatchId: sw.id,
      swatchName: sw.name,
      detectedHex: sw.nominalHex,
      deltaE: Number(dE.toFixed(1)),
    };
  });

  // 9. Machine-Learning / Calibrated Classification Logic
  let result: TestResultCategory = 'INCONCLUSIVE';
  let confidenceScore = 50;
  let reasoning = '';

  const POSITIVE_THRESHOLD = 26.0;
  const NEGATIVE_THRESHOLD = 24.0;

  // Evaluate classifier boundaries
  if (compensation.quality === 'DEGRADED_LIGHTING') {
    result = 'INCONCLUSIVE';
    confidenceScore = 48;
    reasoning =
      'Ambient lighting or glare out of calibrated tolerance (white patch compensation gain shifted >0.8). Optical confidence below acceptable threshold.';
  } else if (deltaEToPositive < POSITIVE_THRESHOLD && deltaEToPositive < deltaEToNegative) {
    result = 'POSITIVE';
    // Calculate confidence score scaled by delta-E closeness
    const closeness = Math.max(0, 1 - deltaEToPositive / POSITIVE_THRESHOLD);
    confidenceScore = Math.min(99, Math.round(78 + closeness * 20));
    reasoning = `Extracted color (${compHex}) matches validated positive profile for ${kit.targetAnalyteClass} with high colorimetric proximity (ΔE = ${deltaEToPositive.toFixed(1)}).`;
  } else if (deltaEToNegative < NEGATIVE_THRESHOLD && deltaEToNegative < deltaEToPositive) {
    result = 'NEGATIVE';
    const closeness = Math.max(0, 1 - deltaEToNegative / NEGATIVE_THRESHOLD);
    confidenceScore = Math.min(99, Math.round(75 + closeness * 22));
    reasoning = `No characteristic chromatic change observed. Color profile (${compHex}) conforms to unreacted/negative baseline (ΔE = ${deltaEToNegative.toFixed(1)}).`;
  } else {
    result = 'INCONCLUSIVE';
    const minDelta = Math.min(deltaEToPositive, deltaEToNegative);
    confidenceScore = Math.max(40, Math.round(65 - minDelta * 0.5));
    reasoning = `Intermediate or ambiguous chromophore reading. Color distance to both positive (ΔE=${deltaEToPositive.toFixed(1)}) and negative (ΔE=${deltaEToNegative.toFixed(1)}) exceeds definitive screening criteria.`;
  }

  const features: ExtractedColorFeatures = {
    rawRgb,
    rawHsv,
    rawHex,
    referenceWhite: {
      detectedRgb: refWhiteRgb,
      correctionGains: compensation.gainFactors,
    },
    compensatedRgb: compRgb,
    compensatedHsv: compHsv,
    compensatedHex: compHex,
    deltaEToPositive: Number(deltaEToPositive.toFixed(1)),
    deltaEToNegative: Number(deltaEToNegative.toFixed(1)),
    confidenceScore,
    illuminationQuality: compensation.quality,
    detectedReferenceMatches: detectedMatches,
  };

  return {
    features,
    classification: {
      result,
      confidenceScore,
      reasoning,
    },
    sha256Hash,
  };
}
