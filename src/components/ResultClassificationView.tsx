/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  Save,
  Printer,
  Copy,
  Check,
  MapPin,
  Clock,
  User,
  Hash,
  Download,
} from 'lucide-react';
import {
  TestRecord,
  TestResultCategory,
  ValidatedKit,
  GeoLocationData,
} from '../types';
import { AnalysisPipelineResult } from '../services/imageAnalysis';
import { formatHashDisplay } from '../utils/crypto';

interface ResultClassificationViewProps {
  testId: string;
  kit: ValidatedKit;
  operatorId: string;
  timestamp: string;
  location: GeoLocationData;
  imageDataUrl: string;
  analysisResult: AnalysisPipelineResult;
  onSaveRecord: (record: TestRecord) => void;
  onRetest: () => void;
}

export const ResultClassificationView: React.FC<ResultClassificationViewProps> = ({
  testId,
  kit,
  operatorId,
  timestamp,
  location,
  imageDataUrl,
  analysisResult,
  onSaveRecord,
  onRetest,
}) => {
  const [caseReference, setCaseReference] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [saved, setSaved] = useState(false);

  const { classification, features, sha256Hash } = analysisResult;
  const resultCategory: TestResultCategory = classification.result;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleSave = () => {
    const newRecord: TestRecord = {
      id: testId,
      testKitId: kit.id,
      testKitName: kit.name,
      targetAnalyteClass: kit.targetAnalyteClass,
      operatorId,
      timestamp,
      location,
      result: resultCategory,
      confidenceScore: classification.confidenceScore,
      classificationNotes: classification.reasoning,
      capturedImageDataUrl: imageDataUrl,
      sha256Hash,
      colorFeatures: features,
      caseReference: caseReference.trim() || undefined,
    };

    onSaveRecord(newRecord);
    setSaved(true);
  };

  // Determine styling based on category
  const badgeConfig = {
    POSITIVE: {
      bg: 'bg-rose-950/60 border-rose-500/50',
      badge: 'bg-rose-600 text-white',
      accent: 'text-rose-400',
      icon: <AlertCircle className="w-8 h-8 text-rose-400 stroke-[2.5]" />,
      title: 'POSITIVE PRESUMPTIVE RESULT',
      summary: `Chromophore reaction indicates presumptive presence of ${kit.targetAnalyteClass}.`,
    },
    NEGATIVE: {
      bg: 'bg-emerald-950/60 border-emerald-500/50',
      badge: 'bg-emerald-600 text-white',
      accent: 'text-emerald-400',
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-[2.5]" />,
      title: 'NEGATIVE PRESUMPTIVE RESULT',
      summary: `No characteristic chromophore shift observed for ${kit.targetAnalyteClass}. Reaction remains at baseline.`,
    },
    INCONCLUSIVE: {
      bg: 'bg-amber-950/60 border-amber-500/50',
      badge: 'bg-amber-600 text-white',
      accent: 'text-amber-400',
      icon: <HelpCircle className="w-8 h-8 text-amber-400 stroke-[2.5]" />,
      title: 'INCONCLUSIVE TEST OUTCOME',
      summary:
        'Optical chromophore reading cannot be classified within validated confidence boundaries. Retesting with fresh reagent is advised.',
    },
  }[resultCategory];

  return (
    <div className="space-y-6">
      {/* 1. Primary Classification Banner */}
      <div
        className={`border-2 rounded-2xl p-6 sm:p-8 text-white shadow-xl ${badgeConfig.bg}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-md">
              {badgeConfig.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-md tracking-wider ${badgeConfig.badge}`}
                >
                  {resultCategory}
                </span>
                <span className="text-xs font-mono text-slate-300">
                  ML Confidence: {classification.confidenceScore}%
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {badgeConfig.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {badgeConfig.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Regulatory Warning (Requirement 5) */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-start gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-cyan-300 block">
              Forensic Evidentiary Disclaimer:
            </span>
            <p className="text-slate-300 font-medium">
              “This is a field screening result. Confirmatory laboratory analysis may be required.”
            </p>
            <p className="text-slate-400 text-[11px]">
              Presumptive field testing provides operational guidance for law enforcement and customs. Definitive identification requires GC-MS, LC-MS, or FTIR analysis in an accredited forensic laboratory.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Digital Record Metadata & Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Captured Evidence & SHA-256 Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Captured Optical Evidence</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                CANVAS REF-CALIBRATED
              </span>
            </h3>

            <div className="relative rounded-xl overflow-hidden border border-slate-300 aspect-[4/3] bg-black">
              <img
                src={imageDataUrl}
                alt="Captured test reaction strip"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-slate-700">
                {testId}
              </div>
            </div>

            {/* SHA-256 Tamper-Evident Hash Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 text-white">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-400 flex items-center gap-1.5 font-mono">
                  <Hash className="w-3.5 h-3.5" />
                  <span>SHA-256 Cryptographic Hash:</span>
                </span>
                <button
                  onClick={handleCopyHash}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {copiedHash ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="font-mono text-[11px] text-slate-300 break-all bg-slate-950 p-2.5 rounded border border-slate-800/80 select-all">
                {sha256Hash}
              </div>

              <span className="text-[10px] text-slate-400 block">
                Tamper-evident digest computed across full uncompressed image payload.
              </span>
            </div>
          </div>
        </div>

        {/* Right: Record Properties & Case Chain of Custody */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Digital Chain of Custody Record
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  Test Record ID
                </span>
                <span className="font-mono font-bold text-sm text-slate-900 block">
                  {testId}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  Field Officer / Operator ID
                </span>
                <span className="font-semibold text-slate-900 block truncate">
                  {operatorId}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Date & Local Timestamp
                </span>
                <span className="font-mono text-slate-800 block">
                  {new Date(timestamp).toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  GPS Coordinates / Fix
                </span>
                <span className="font-mono text-slate-800 block truncate" title={location.formattedAddress}>
                  {location.latitude.toFixed(5)}°, {location.longitude.toFixed(5)}°
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {location.formattedAddress}
                </span>
              </div>
            </div>

            {/* Test Kit Details */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                Validated Field Chemical Kit
              </span>
              <div className="font-bold text-slate-900">{kit.name}</div>
              <div className="text-slate-600 text-[11px]">
                Target: {kit.targetAnalyteClass} · Reagent: {kit.chemicalReagent}
              </div>
            </div>

            {/* Extracted Color Telemetry Brief */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  Extracted Color Features
                </span>
                <span className="font-mono text-[10px] font-bold text-cyan-700">
                  Compensated {features.compensatedHex}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 text-[9px] block">RGB</span>
                  <span>({features.compensatedRgb.join(', ')})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">HSV</span>
                  <span>
                    {features.compensatedHsv[0]}°, {features.compensatedHsv[1]}%,{' '}
                    {features.compensatedHsv[2]}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">ΔE to Pos Target</span>
                  <span className="font-bold">{features.deltaEToPositive}</span>
                </div>
              </div>
            </div>

            {/* Case Reference or Evidence Bag Number */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Evidence Bag / Case Number (Optional)
              </label>
              <input
                type="text"
                value={caseReference}
                onChange={e => setCaseReference(e.target.value)}
                placeholder="e.g. CR-2026-HQ-7714 or Seizure Bag #12"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 ${
                saved
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved to Digital Log</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Record to Test History</span>
                </>
              )}
            </button>

            <button
              onClick={onRetest}
              className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors"
            >
              Perform Another Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
