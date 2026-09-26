/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestRecord } from '../types';
import { generateSyntheticTestScene } from '../utils/colorimetric';

export const INITIAL_TEST_RECORDS: TestRecord[] = [
  {
    id: 'TST-2026-0925-1048',
    testKitId: 'kit-marquis',
    testKitName: 'Marquis Reagent Field Kit (ODV-902)',
    targetAnalyteClass: 'Opioids (Morphine, Heroin, Codeine)',
    operatorId: 'OFFICER-4892 (D. Vance)',
    timestamp: '2026-09-25T14:32:10Z',
    location: {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracyMeters: 4.8,
      formattedAddress: 'Sector 4 Intermodal Checkpoint, New Delhi, India',
    },
    result: 'POSITIVE',
    confidenceScore: 94,
    classificationNotes:
      'Strong dark violet-purple chromatic shift formed within 20s. Well-aligned with calibrated Marquis opioid reference spectrum (ΔE = 4.2).',
    capturedImageDataUrl: generateSyntheticTestScene({
      kitName: 'Marquis Reagent Field Kit (ODV-902)',
      reactionColorHex: '#581C6E',
      lightingCast: 'daylight',
    }),
    sha256Hash: 'a718b56f29e1c0d5a498b3c1b092f69e4a8138769352e89d612e4f0ba1b9d4e2',
    colorFeatures: {
      rawRgb: [88, 28, 110],
      rawHsv: [286, 75, 43],
      rawHex: '#581C6E',
      referenceWhite: {
        detectedRgb: [238, 240, 244],
        correctionGains: [1.008, 1.0, 0.984],
      },
      compensatedRgb: [89, 28, 108],
      compensatedHsv: [286, 74, 42],
      compensatedHex: '#591C6C',
      deltaEToPositive: 4.2,
      deltaEToNegative: 48.7,
      confidenceScore: 94,
      illuminationQuality: 'OPTIMAL',
      detectedReferenceMatches: [
        {
          swatchId: 'ref-pos',
          swatchName: 'Standard Marquis Positive (Purple)',
          detectedHex: '#581C6B',
          deltaE: 3.8,
        },
      ],
    },
    caseReference: 'CR-2026-NCT-0941',
  },
  {
    id: 'TST-2026-0925-0814',
    testKitId: 'kit-scott',
    testKitName: 'Scott Reagent Test Kit (Modified NIK-G)',
    targetAnalyteClass: 'Cocaine Base & Cocaine Hydrochloride',
    operatorId: 'OFFICER-3107 (M. Sharma)',
    timestamp: '2026-09-25T11:15:45Z',
    location: {
      latitude: 19.0760,
      longitude: 72.8777,
      accuracyMeters: 6.2,
      formattedAddress: 'Port Terminal Gate 3, Mumbai, Maharashtra, India',
    },
    result: 'POSITIVE',
    confidenceScore: 92,
    classificationNotes:
      'Cobalt blue chromophore partitioned distinctly in lower layer. Conforms to validated Scott reagent cocaine threshold (ΔE = 6.1).',
    capturedImageDataUrl: generateSyntheticTestScene({
      kitName: 'Scott Reagent Test Kit (Modified NIK-G)',
      reactionColorHex: '#1D4ED8',
      lightingCast: 'daylight',
    }),
    sha256Hash: '7c89f02e3b1c4a56d9876e543210fabc890123456789abcdef0123456789abcd',
    colorFeatures: {
      rawRgb: [29, 78, 216],
      rawHsv: [224, 87, 85],
      rawHex: '#1D4ED8',
      referenceWhite: {
        detectedRgb: [242, 241, 239],
        correctionGains: [0.992, 0.996, 1.004],
      },
      compensatedRgb: [29, 78, 217],
      compensatedHsv: [224, 87, 85],
      compensatedHex: '#1D4ED9',
      deltaEToPositive: 6.1,
      deltaEToNegative: 54.3,
      confidenceScore: 92,
      illuminationQuality: 'OPTIMAL',
      detectedReferenceMatches: [
        {
          swatchId: 'ref-pos',
          swatchName: 'Standard Scott Positive (Cobalt)',
          detectedHex: '#1E40AF',
          deltaE: 5.9,
        },
      ],
    },
    caseReference: 'CR-2026-MUM-4428',
  },
  {
    id: 'TST-2026-0924-1620',
    testKitId: 'kit-marquis',
    testKitName: 'Marquis Reagent Field Kit (ODV-902)',
    targetAnalyteClass: 'Opioids (Morphine, Heroin, Codeine)',
    operatorId: 'OFFICER-4892 (D. Vance)',
    timestamp: '2026-09-24T16:20:00Z',
    location: {
      latitude: 28.5355,
      longitude: 77.3910,
      accuracyMeters: 5.1,
      formattedAddress: 'Transit Hub Depot, Noida, UP, India',
    },
    result: 'NEGATIVE',
    confidenceScore: 89,
    classificationNotes:
      'Reagent remained clear / pale straw yellow baseline. No opioid or amphetamine chromophore developed after 45s.',
    capturedImageDataUrl: generateSyntheticTestScene({
      kitName: 'Marquis Reagent Field Kit (ODV-902)',
      reactionColorHex: '#D1CDAF',
      lightingCast: 'daylight',
    }),
    sha256Hash: '341e8c9b456f0123456789abcdef0123456789abcdef0123456789abcdef0123',
    colorFeatures: {
      rawRgb: [209, 205, 175],
      rawHsv: [53, 16, 82],
      rawHex: '#D1CDAF',
      referenceWhite: {
        detectedRgb: [240, 240, 240],
        correctionGains: [1.0, 1.0, 1.0],
      },
      compensatedRgb: [209, 205, 175],
      compensatedHsv: [53, 16, 82],
      compensatedHex: '#D1CDAF',
      deltaEToPositive: 56.4,
      deltaEToNegative: 3.5,
      confidenceScore: 89,
      illuminationQuality: 'OPTIMAL',
      detectedReferenceMatches: [],
    },
    caseReference: 'CR-2026-NOI-0199',
  },
  {
    id: 'TST-2026-0924-0945',
    testKitId: 'kit-duquenois',
    testKitName: 'Duquenois-Levine Field Reagent (NIK-E)',
    targetAnalyteClass: 'Cannabinoids (THC / Hashish / Plant Resins)',
    operatorId: 'OFFICER-1904 (K. Patel)',
    timestamp: '2026-09-24T09:45:12Z',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      accuracyMeters: 8.5,
      formattedAddress: 'Logistics Facility Central, Bengaluru, Karnataka, India',
    },
    result: 'INCONCLUSIVE',
    confidenceScore: 52,
    classificationNotes:
      'Severe sodium vapor ambient illumination; reference card compensation shifted out of calibrated threshold. Retest advised under calibrated white illumination.',
    capturedImageDataUrl: generateSyntheticTestScene({
      kitName: 'Duquenois-Levine Field Reagent (NIK-E)',
      reactionColorHex: '#64748B',
      lightingCast: 'warm',
    }),
    sha256Hash: '9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    colorFeatures: {
      rawRgb: [100, 116, 139],
      rawHsv: [215, 28, 55],
      rawHex: '#64748B',
      referenceWhite: {
        detectedRgb: [240, 195, 140],
        correctionGains: [1.0, 1.23, 1.71],
      },
      compensatedRgb: [100, 143, 238],
      compensatedHsv: [221, 58, 93],
      compensatedHex: '#648FEE',
      deltaEToPositive: 32.8,
      deltaEToNegative: 31.4,
      confidenceScore: 52,
      illuminationQuality: 'DEGRADED_LIGHTING',
      detectedReferenceMatches: [],
    },
    caseReference: 'CR-2026-BLR-8902',
  },
];
