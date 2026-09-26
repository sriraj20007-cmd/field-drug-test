/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ExtractedColorFeatures,
  ValidatedKit,
  TestResultCategory,
} from '../types';
import {
  runForensicAnalysisPipeline,
  AnalysisPipelineResult,
} from '../services/imageAnalysis';
import {
  Sliders,
  CheckCircle,
  Sun,
  Shield,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ImageProcessingViewProps {
  imageDataUrl: string;
  kit: ValidatedKit;
  onAnalysisComplete: (result: AnalysisPipelineResult) => void;
  onRetake: () => void;
}

export const ImageProcessingView: React.FC<ImageProcessingViewProps> = ({
  imageDataUrl,
  kit,
  onAnalysisComplete,
  onRetake,
}) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisPipelineResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'reference-swatches'>('overview');

  useEffect(() => {
    let isMounted = true;
    const process = async () => {
      setAnalyzing(true);
      try {
        // Run full forensic pipeline
        const res = await runForensicAnalysisPipeline(imageDataUrl, kit);
        if (isMounted) {
          setAnalysisResult(res);
          setAnalyzing(false);
        }
      } catch (err) {
        console.error('Optical analysis pipeline failed:', err);
        setAnalyzing(false);
      }
    };

    // Slight delay to allow visual perception of the optical processing phase
    const timer = setTimeout(process, 600);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imageDataUrl, kit]);

  const handleProceedToClassification = () => {
    if (analysisResult) {
      onAnalysisComplete(analysisResult);
    }
  };

  if (analyzing || !analysisResult) {
    return (
      <div className="bg-[#0B1528] border border-[#1E2E4A] rounded-2xl p-12 text-center text-white space-y-6 shadow-xl">
        <div className="relative w-16 h-16 mx-auto">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Cpu className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            Executing Optical Processing Pipeline
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            1. Segmenting test-result region & physical reference card <br />
            2. Extracting raw RGB/HSV chromophore values <br />
            3. Calculating reference-card white balance compensation vector...
          </p>
        </div>
      </div>
    );
  }

  const { features, sha256Hash } = analysisResult;

  return (
    <div className="space-y-6">
      {/* Top Processing Status Banner */}
      <div className="bg-[#0B1528] border border-[#1E2E4A] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Optical Extraction & Reference Compensation Complete
            </h2>
            <span className="text-xs text-slate-300 font-mono">
              Validated Test Kit: {kit.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRetake}
            className="px-3 py-1.5 bg-[#15233E] hover:bg-[#1C2F54] text-slate-200 text-xs font-medium rounded-lg border border-[#273E6B] transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Image</span>
          </button>
          <button
            onClick={handleProceedToClassification}
            className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>View ML Classification</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Analysis Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image with Overlaid Sampling ROIs */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-lg aspect-[4/3] flex items-center justify-center">
            <img
              src={imageDataUrl}
              alt="Processed test image"
              className="w-full h-full object-contain"
            />

            {/* Visual ROI overlays on the image */}
            <div className="absolute inset-0 pointer-events-none">
              {/* ROI 1: Test Region Box */}
              <div
                className="absolute border-2 border-cyan-400 bg-cyan-400/15 rounded shadow-sm flex items-start justify-end p-1"
                style={{ left: '18%', top: '35%', width: '16%', height: '22%' }}
              >
                <span className="bg-cyan-900/90 text-cyan-200 font-mono text-[9px] px-1 rounded border border-cyan-400">
                  ROI 1: TEST
                </span>
              </div>

              {/* ROI 2: Reference White Patch Box */}
              <div
                className="absolute border-2 border-amber-400 bg-amber-400/15 rounded shadow-sm flex items-start justify-end p-1"
                style={{ left: '55%', top: '26%', width: '16%', height: '14%' }}
              >
                <span className="bg-amber-900/90 text-amber-200 font-mono text-[9px] px-1 rounded border border-amber-400">
                  ROI 2: REF-W
                </span>
              </div>
            </div>

            {/* Bottom Monospace Hash Strip */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between truncate">
              <span className="text-slate-500">SHA-256:</span>
              <span className="text-cyan-400 truncate ml-2">
                {sha256Hash}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>ROI 1: Reaction Strip Well</span>
            <span>ROI 2: ISO Calibrated Reference White</span>
          </div>
        </div>

        {/* Right Column: Extracted Color Telemetry & Compensation */}
        <div className="lg:col-span-6 space-y-4">
          {/* Chromophore Visual Comparison Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600" />
              <span>Colorimetric Chromophore Comparison</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {/* Swatch 1: Raw Uncompensated */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col items-center text-center space-y-2">
                <span className="text-[10px] uppercase font-mono font-semibold text-slate-500">
                  1. Raw Captured
                </span>
                <div
                  className="w-14 h-14 rounded-xl border border-slate-300 shadow-inner"
                  style={{ backgroundColor: features.rawHex }}
                />
                <span className="font-mono text-xs font-bold text-slate-900">
                  {features.rawHex}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Ambient Lum
                </span>
              </div>

              {/* Swatch 2: Lighting Compensated */}
              <div className="border-2 border-cyan-500/60 rounded-xl p-3 bg-cyan-50/40 flex flex-col items-center text-center space-y-2 relative shadow-sm">
                <span className="text-[10px] uppercase font-mono font-bold text-cyan-800">
                  2. Compensated
                </span>
                <div
                  className="w-14 h-14 rounded-xl border border-cyan-400 shadow-inner"
                  style={{ backgroundColor: features.compensatedHex }}
                />
                <span className="font-mono text-xs font-bold text-cyan-900">
                  {features.compensatedHex}
                </span>
                <span className="text-[10px] font-mono font-semibold text-cyan-700">
                  Ref-Normalized
                </span>
              </div>

              {/* Swatch 3: Calibrated Positive Baseline */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col items-center text-center space-y-2">
                <span className="text-[10px] uppercase font-mono font-semibold text-slate-500">
                  3. Kit Target
                </span>
                <div
                  className="w-14 h-14 rounded-xl border border-slate-300 shadow-inner"
                  style={{ backgroundColor: kit.expectedColors.positive.hex }}
                />
                <span className="font-mono text-xs font-bold text-slate-900">
                  {kit.expectedColors.positive.hex}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {kit.expectedColors.positive.name.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Lighting Compensation Math Telemetry */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ambient Lighting Compensation Matrix:</span>
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    features.illuminationQuality === 'OPTIMAL'
                      ? 'bg-emerald-100 text-emerald-800'
                      : features.illuminationQuality === 'ACCEPTABLE'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {features.illuminationQuality} ILLUMINATION
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px] pt-1">
                <div className="bg-white border border-slate-200 rounded p-1.5">
                  <span className="text-slate-400 block text-[9px]">k_R (Red Gain)</span>
                  <span className="font-bold text-slate-800">
                    {features.referenceWhite.correctionGains[0]}x
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded p-1.5">
                  <span className="text-slate-400 block text-[9px]">k_G (Green Gain)</span>
                  <span className="font-bold text-slate-800">
                    {features.referenceWhite.correctionGains[1]}x
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded p-1.5">
                  <span className="text-slate-400 block text-[9px]">k_B (Blue Gain)</span>
                  <span className="font-bold text-slate-800">
                    {features.referenceWhite.correctionGains[2]}x
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Color Space Values Readout (RGB & HSV) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Extracted Optical Coordinates</span>
              <span className="text-[11px] font-mono font-normal text-slate-500">
                CIELAB & HSV Space
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* RGB breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                  Normalized sRGB
                </span>
                <div className="font-mono text-sm font-bold text-slate-900">
                  R: {features.compensatedRgb[0]} · G: {features.compensatedRgb[1]} · B: {features.compensatedRgb[2]}
                </div>
                <div className="text-[10px] text-slate-500">
                  Raw uncalibrated: ({features.rawRgb.join(', ')})
                </div>
              </div>

              {/* HSV breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                  Cylindrical HSV
                </span>
                <div className="font-mono text-sm font-bold text-slate-900">
                  H: {features.compensatedHsv[0]}° · S: {features.compensatedHsv[1]}% · V: {features.compensatedHsv[2]}%
                </div>
                <div className="text-[10px] text-slate-500">
                  Hue chromophore sector
                </div>
              </div>
            </div>

            {/* Delta-E Distance to Baselines */}
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-600 block">Distance to Positive Baseline:</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  ΔE = {features.deltaEToPositive}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">
                  (Tolerance threshold ≤ 26.0)
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-600 block">Distance to Negative Baseline:</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  ΔE = {features.deltaEToNegative}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
