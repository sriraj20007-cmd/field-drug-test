/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Camera,
  History,
  Info,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Play,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { TestRecord, DemoSamplePreset } from '../types';
import { DEMO_SAMPLE_PRESETS } from '../data/validatedKits';

interface HomeScreenProps {
  onStartNewTest: () => void;
  onOpenHistory: () => void;
  onOpenAbout: () => void;
  onSelectRecord: (record: TestRecord) => void;
  onRunDemoPreset: (preset: DemoSamplePreset) => void;
  recentRecords: TestRecord[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartNewTest,
  onOpenHistory,
  onOpenAbout,
  onSelectRecord,
  onRunDemoPreset,
  recentRecords,
}) => {
  return (
    <div className="space-y-8 pb-16">
      {/* 1. Forensic Hero & Safety Advisory Header */}
      <div className="relative overflow-hidden bg-[#0B1528] border border-[#1E2E4A] rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Operational Field Guide & Analysis Engine
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Digital Companion for Field Drug Testing
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Standardized optical capture, reference-compensated colorimetric analysis, and
            tamper-evident SHA-256 digital records for validated chemical field-test kits.
          </p>

          {/* Mandatory Safety / Operational Boundary Box */}
          <div className="bg-[#070E1B]/90 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-300 block">
                Operational Scope & Safety Boundary
              </span>
              <p className="text-slate-300 leading-normal">
                This application works strictly alongside validated colorimetric test kits. It does{' '}
                <strong className="text-white">NOT</strong> replace chemical reagents and does{' '}
                <strong className="text-white">NOT</strong> independently identify raw unknown
                substances. All field outcomes represent presumptive screenings. Confirmatory
                laboratory analysis may be required.
              </p>
            </div>
          </div>

          {/* 3 Main Action Buttons from user specification */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartNewTest}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/25 active:scale-98"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Start New Test</span>
            </button>

            <button
              onClick={onOpenHistory}
              className="flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#15233E] hover:bg-[#1C2F54] text-white font-semibold text-sm rounded-xl border border-[#273E6B] transition-all active:scale-98 shadow-sm"
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span>Test History ({recentRecords.length})</span>
            </button>

            <button
              onClick={onOpenAbout}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-transparent hover:bg-white/10 text-slate-200 hover:text-white font-medium text-sm rounded-xl border border-[#273E6B] transition-all"
            >
              <Info className="w-4 h-4" />
              <span>About & SOP</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* 2. Demonstration Scenarios */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <h2 className="text-base font-semibold text-slate-900">
                1-Click Calibration & Demonstration Scenarios
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly simulate real camera captures with physical reference cards without chemical reagents.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Validated Reagent Profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_SAMPLE_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => onRunDemoPreset(preset)}
              className="group text-left p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-cyan-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      preset.expectedResult === 'POSITIVE'
                        ? 'bg-rose-100 text-rose-800'
                        : preset.expectedResult === 'NEGATIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {preset.expectedResult}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-inner"
                    style={{ backgroundColor: preset.stripColor }}
                    title={`Nominal test color: ${preset.stripColor}`}
                  />
                </div>

                <h3 className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-cyan-700">
                  {preset.title.split('·')[0]}
                </h3>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-medium text-cyan-700 group-hover:text-cyan-800">
                <span>Run Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Three Core Pillars of the Digital Companion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            Reference Card Compensation
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ambient sunlight, incandescent bulbs, and streetlights alter perceived color. The companion extracts the reference card's neutral white and grey swatches to compute true colorimetry.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            Trained ML Classification
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Compares compensated RGB/HSV and CIELAB Delta-E vectors against validated chemical profiles to generate definitive POSITIVE, NEGATIVE, or INCONCLUSIVE outcomes.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            SHA-256 Tamper-Evidence
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every captured image receives an immediate cryptographic SHA-256 hash. Any post-capture pixel alteration or tampering is immediately detectable during judicial review.
          </p>
        </div>
      </div>

      {/* 4. Recent Test Records Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Field Records</h2>
            <p className="text-xs text-slate-500">
              Validated digital audit records with cryptographic verification
            </p>
          </div>
          <button
            onClick={onOpenHistory}
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <span>View All Records</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentRecords.slice(0, 4).map(rec => (
            <div
              key={rec.id}
              onClick={() => onSelectRecord(rec)}
              className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center"
                >
                  <img
                    src={rec.capturedImageDataUrl}
                    alt={rec.id}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      {rec.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rec.result === 'POSITIVE'
                          ? 'bg-rose-100 text-rose-800'
                          : rec.result === 'NEGATIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.result}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {rec.testKitName} · {rec.targetAnalyteClass}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-500">
                <div className="text-left sm:text-right">
                  <div className="text-[11px] font-mono text-slate-600">
                    {new Date(rec.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {new Date(rec.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                    HASH: {rec.sha256Hash.substring(0, 14)}...
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
