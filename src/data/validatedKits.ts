/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ValidatedKit, DemoSamplePreset } from '../types';
import { generateSyntheticTestScene } from '../utils/colorimetric';

export const VALIDATED_TEST_KITS: ValidatedKit[] = [
  {
    id: 'kit-marquis',
    name: 'Marquis Reagent Field Kit (ODV-902)',
    manufacturer: 'Forensic Armor Labs / ODV Series',
    chemicalReagent: 'Concentrated Sulfuric Acid (95%) + Formaldehyde (40%)',
    targetAnalyteClass: 'Opioids (Morphine, Heroin, Codeine) & Amphetamines',
    description:
      'Validated presumptive spot reagent test. Reaction with morphine/heroin undergoes polycondensation to yield characteristic deep violet-purple quinoid salts.',
    reactionTimeSeconds: 30,
    expectedColors: {
      positive: {
        name: 'Deep Violet-Purple',
        hex: '#5B1E6D',
        rgb: [91, 30, 109],
        hsv: [286, 72, 43],
      },
      negative: {
        name: 'Clear / Pale Straw Yellow',
        hex: '#D1CDAF',
        rgb: [209, 205, 175],
        hsv: [53, 16, 82],
      },
    },
    referenceCardSwatches: [
      { id: 'ref-w', name: 'Ref White (D65)', nominalHex: '#F8FAFC', nominalRgb: [248, 250, 252], nominalHsv: [210, 2, 99] },
      { id: 'ref-g', name: 'Ref 18% Neutral Gray', nominalHex: '#848B96', nominalRgb: [132, 139, 150], nominalHsv: [217, 12, 59] },
      { id: 'ref-k', name: 'Ref Deep Black', nominalHex: '#1E232B', nominalRgb: [30, 35, 43], nominalHsv: [217, 30, 17] },
      { id: 'ref-pos', name: 'Standard Marquis Positive (Purple)', nominalHex: '#581C6B', nominalRgb: [88, 28, 107], nominalHsv: [286, 74, 42] },
    ],
    safetyNotes: 'Corrosive acid. Wear nitrile gloves and eye protection. Do not inhale reagent fumes.',
  },
  {
    id: 'kit-scott',
    name: 'Scott Reagent Test Kit (Modified NIK-G)',
    manufacturer: 'NIK Public Safety / ODV Forensics',
    chemicalReagent: 'Cobalt(II) Thiocyanate in Glycerin & Water + Concentrated Hydrochloric Acid + Chloroform',
    targetAnalyteClass: 'Cocaine Base & Cocaine Hydrochloride',
    description:
      '3-part ampoule presumptive screening test. Reaction produces cobalt-complex precipitate with distinct cobalt blue chromophore partition.',
    reactionTimeSeconds: 45,
    expectedColors: {
      positive: {
        name: 'Distinct Cobalt Blue',
        hex: '#1D4ED8',
        rgb: [29, 78, 216],
        hsv: [224, 87, 85],
      },
      negative: {
        name: 'Pinkish-Red / Unreacted Amber',
        hex: '#C25D74',
        rgb: [194, 93, 116],
        hsv: [346, 52, 76],
      },
    },
    referenceCardSwatches: [
      { id: 'ref-w', name: 'Ref White (D65)', nominalHex: '#F8FAFC', nominalRgb: [248, 250, 252], nominalHsv: [210, 2, 99] },
      { id: 'ref-g', name: 'Ref 18% Neutral Gray', nominalHex: '#848B96', nominalRgb: [132, 139, 150], nominalHsv: [217, 12, 59] },
      { id: 'ref-pos', name: 'Standard Scott Positive (Cobalt)', nominalHex: '#1E40AF', nominalRgb: [30, 64, 175], nominalHsv: [226, 83, 69] },
    ],
    safetyNotes: 'Contains chloroform and hydrochloric acid. Break ampoules inside protective pouch only.',
  },
  {
    id: 'kit-duquenois',
    name: 'Duquenois-Levine Field Reagent (NIK-E)',
    manufacturer: 'Sirchie Finger Print Laboratories',
    chemicalReagent: 'Acetaldehyde + Vanillin in Ethanol + Hydrochloric Acid + Chloroform',
    targetAnalyteClass: 'Cannabinoids (THC / Hashish / Plant Resins)',
    description:
      'Validated presumptive color test for cannabinoids. Forms a condensation product yielding deep indigo/violet in the extracted lower chloroform layer.',
    reactionTimeSeconds: 60,
    expectedColors: {
      positive: {
        name: 'Deep Violet / Indigo Layer',
        hex: '#4C1D95',
        rgb: [76, 29, 149],
        hsv: [264, 81, 58],
      },
      negative: {
        name: 'Clear or Straw Yellow',
        hex: '#C9BE97',
        rgb: [201, 190, 151],
        hsv: [47, 25, 79],
      },
    },
    referenceCardSwatches: [
      { id: 'ref-w', name: 'Ref White (D65)', nominalHex: '#F8FAFC', nominalRgb: [248, 250, 252], nominalHsv: [210, 2, 99] },
      { id: 'ref-pos', name: 'Standard DL Violet', nominalHex: '#4C1D95', nominalRgb: [76, 29, 149], nominalHsv: [264, 81, 58] },
    ],
    safetyNotes: 'Strong acid fumes. Ensure proper disposal in designated hazardous chemical container.',
  },
  {
    id: 'kit-fentanyl-strip',
    name: 'Rapid Lateral-Flow Fentanyl Strip (BTNX-FT)',
    manufacturer: 'BTNX Rapid Forensic Testing',
    chemicalReagent: 'Colloidal Gold Immunoassay Test Conjugate',
    targetAnalyteClass: 'Synthetic Fentanyl & Fentanyl Analogues',
    description:
      'High-sensitivity lateral-flow competitive immunoassay. In competitive assays: Single line (Control only) indicates POSITIVE presence of target analyte; Two lines indicate NEGATIVE.',
    reactionTimeSeconds: 120,
    expectedColors: {
      positive: {
        name: 'Single Pink Control Band (Analyte Present)',
        hex: '#BE185D',
        rgb: [190, 24, 93],
        hsv: [335, 87, 75],
      },
      negative: {
        name: 'Double Pink Bands (Control + Test Line Present)',
        hex: '#9D174D',
        rgb: [157, 23, 77],
        hsv: [336, 85, 62],
      },
    },
    referenceCardSwatches: [
      { id: 'ref-w', name: 'Ref White (D65)', nominalHex: '#F8FAFC', nominalRgb: [248, 250, 252], nominalHsv: [210, 2, 99] },
      { id: 'ref-gold', name: 'Colloidal Gold Red-Pink Ref', nominalHex: '#BE185D', nominalRgb: [190, 24, 93], nominalHsv: [335, 87, 75] },
    ],
    safetyNotes: 'High-potency narcotic hazard. Always wear P100 respirator and double nitrile gloves when sampling.',
  },
];

export const DEMO_SAMPLE_PRESETS: DemoSamplePreset[] = [
  {
    id: 'demo-marquis-pos',
    title: 'Marquis Reagent · Heroin / Morphine Reaction (Positive)',
    kitId: 'kit-marquis',
    expectedResult: 'POSITIVE',
    description:
      'Strong dark violet-purple chromatic shift formed within 20s. Well-aligned with calibrated Marquis opioid reference spectrum.',
    stripColor: '#581C6E',
    cardLightingCondition: 'Neutral Daylight (D65)',
  },
  {
    id: 'demo-scott-pos',
    title: 'Scott Reagent · Cocaine Base Reaction (Positive)',
    kitId: 'kit-scott',
    expectedResult: 'POSITIVE',
    description:
      'Immediate cobalt blue precipitate and chromatic partition observed in reaction ampoule chamber.',
    stripColor: '#1D4ED8',
    cardLightingCondition: 'Neutral Daylight (D65)',
  },
  {
    id: 'demo-marquis-neg',
    title: 'Marquis Reagent · Excipient / Lactose Baseline (Negative)',
    kitId: 'kit-marquis',
    expectedResult: 'NEGATIVE',
    description:
      'No violet or reddish chromophore development. Reaction remains in the baseline pale-straw negative spectrum.',
    stripColor: '#D3CFB2',
    cardLightingCondition: 'Neutral Daylight (D65)',
  },
  {
    id: 'demo-scott-inconclusive',
    title: 'Scott Reagent · Weak Reaction under Heavy Yellow Ambient (Inconclusive)',
    kitId: 'kit-scott',
    expectedResult: 'INCONCLUSIVE',
    description:
      'Marginal chromatic reading under severe tungsten color cast; Delta-E exceeds positive/negative confidence bounds.',
    stripColor: '#6B7280',
    cardLightingCondition: 'Warm Incandescent',
  },
];

/**
 * Returns a high-definition synthetic capture for a given sample preset
 */
export function getPresetSyntheticImage(preset: DemoSamplePreset): string {
  const kit = VALIDATED_TEST_KITS.find(k => k.id === preset.kitId) || VALIDATED_TEST_KITS[0];
  const lightingCast =
    preset.cardLightingCondition === 'Warm Incandescent'
      ? 'warm'
      : preset.cardLightingCondition === 'Shadow / Low Kelvin'
      ? 'cool_shadow'
      : 'daylight';

  return generateSyntheticTestScene({
    kitName: kit.name,
    reactionColorHex: preset.stripColor,
    lightingCast,
  });
}
