/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TestResultCategory = 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';

export interface ReferenceSwatch {
  id: string;
  name: string;
  nominalHex: string;
  nominalRgb: [number, number, number];
  nominalHsv: [number, number, number];
}

export interface ValidatedKit {
  id: string;
  name: string;
  manufacturer: string;
  chemicalReagent: string;
  targetAnalyteClass: string;
  description: string;
  reactionTimeSeconds: number;
  expectedColors: {
    positive: {
      name: string;
      hex: string;
      rgb: [number, number, number];
      hsv: [number, number, number];
    };
    negative: {
      name: string;
      hex: string;
      rgb: [number, number, number];
      hsv: [number, number, number];
    };
  };
  referenceCardSwatches: ReferenceSwatch[];
  safetyNotes: string;
}

export interface ExtractedColorFeatures {
  rawRgb: [number, number, number];
  rawHsv: [number, number, number];
  rawHex: string;
  referenceWhite: {
    detectedRgb: [number, number, number];
    correctionGains: [number, number, number]; // [rGain, gGain, bGain]
  };
  compensatedRgb: [number, number, number];
  compensatedHsv: [number, number, number];
  compensatedHex: string;
  deltaEToPositive: number;
  deltaEToNegative: number;
  confidenceScore: number; // 0 - 100%
  illuminationQuality: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED_LIGHTING';
  detectedReferenceMatches: {
    swatchId: string;
    swatchName: string;
    detectedHex: string;
    deltaE: number;
  }[];
}

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  formattedAddress: string;
}

export interface TestRecord {
  id: string;
  testKitId: string;
  testKitName: string;
  targetAnalyteClass: string;
  operatorId: string;
  timestamp: string;
  location: GeoLocationData;
  result: TestResultCategory;
  confidenceScore: number;
  classificationNotes: string;
  capturedImageDataUrl: string;
  sha256Hash: string;
  colorFeatures: ExtractedColorFeatures;
  caseReference?: string;
  verifiedAt?: string;
}

export interface DemoSamplePreset {
  id: string;
  title: string;
  kitId: string;
  expectedResult: TestResultCategory;
  description: string;
  stripColor: string;
  cardLightingCondition: 'Neutral Daylight (D65)' | 'Warm Incandescent' | 'Shadow / Low Kelvin';
}
