/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ValidatedKit,
  TestRecord,
  GeoLocationData,
  DemoSamplePreset,
} from '../types';
import { VALIDATED_TEST_KITS, getPresetSyntheticImage } from '../data/validatedKits';
import { CameraCapture } from './CameraCapture';
import { ImageProcessingView } from './ImageProcessingView';
import { ResultClassificationView } from './ResultClassificationView';
import { AnalysisPipelineResult } from '../services/imageAnalysis';
import {
  Shield,
  MapPin,
  Clock,
  User,
  Hash,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Camera,
  Layers,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';

interface StartTestFlowProps {
  operatorId: string;
  onOperatorIdChange: (id: string) => void;
  onSaveRecord: (record: TestRecord) => void;
  onCancel: () => void;
  initialPreset?: DemoSamplePreset | null;
}

export const StartTestFlow: React.FC<StartTestFlowProps> = ({
  operatorId,
  onOperatorIdChange,
  onSaveRecord,
  onCancel,
  initialPreset,
}) => {
  // Step tracker: 1 = Setup, 2 = Capture, 3 = Process, 4 = Classification
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedKitId, setSelectedKitId] = useState<string>(
    initialPreset?.kitId || VALIDATED_TEST_KITS[0].id
  );
  const [testId, setTestId] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [location, setLocation] = useState<GeoLocationData>({
    latitude: 28.6139,
    longitude: 77.2090,
    accuracyMeters: 5.0,
    formattedAddress: 'Sector 4 Intermodal Checkpoint, New Delhi, India',
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [capturedImageDataUrl, setCapturedImageDataUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisPipelineResult | null>(null);

  // Generate unique Test ID and current timestamp on mount
  useEffect(() => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    setTestId(`TST-${dateStr}-${randomSuffix}`);
    setTimestamp(new Date().toISOString());

    // If initial preset is passed, pre-load its synthetic image and jump to capture/process
    if (initialPreset) {
      setSelectedKitId(initialPreset.kitId);
      const synthImg = getPresetSyntheticImage(initialPreset);
      setCapturedImageDataUrl(synthImg);
      setCurrentStep(3); // jump directly to optical processing
    }
  }, [initialPreset]);

  const selectedKit =
    VALIDATED_TEST_KITS.find(k => k.id === selectedKitId) || VALIDATED_TEST_KITS[0];

  // Acquire live GPS if available
  const handleAcquireGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          latitude: Number(pos.coords.latitude.toFixed(5)),
          longitude: Number(pos.coords.longitude.toFixed(5)),
          accuracyMeters: Number(pos.coords.accuracy.toFixed(1)),
          formattedAddress: `Field Location (${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E)`,
        });
        setGpsLoading(false);
      },
      err => {
        console.warn('GPS position error:', err);
        setGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleImageCaptured = (dataUrl: string) => {
    setCapturedImageDataUrl(dataUrl);
    setCurrentStep(3); // Proceed to image processing
  };

  const handleAnalysisComplete = (result: AnalysisPipelineResult) => {
    setAnalysisResult(result);
    setCurrentStep(4); // Proceed to classification result
  };

  const handleResetFlow = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    setTestId(`TST-${dateStr}-${randomSuffix}`);
    setTimestamp(new Date().toISOString());
    setCapturedImageDataUrl(null);
    setAnalysisResult(null);
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Step Indicator Header */}
      <div className="bg-[#0B1528] border border-[#1E2E4A] rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2E4A]">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
              Validated Colorimetric Workflow
            </span>
            <h1 className="text-lg font-bold text-white">
              {currentStep === 1 && '1. Test Setup & Kit Selection'}
              {currentStep === 2 && '2. Image Capture & Alignment'}
              {currentStep === 3 && '3. Optical Extraction & Calibration'}
              {currentStep === 4 && '4. ML Result Classification & Digital Record'}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span>STEP {currentStep} OF 4</span>
            <button
              onClick={onCancel}
              className="text-xs text-slate-300 hover:text-white px-2.5 py-1 bg-[#15233E] hover:bg-[#1C2F54] border border-[#273E6B] rounded ml-2 transition-colors"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Step Progress Track */}
        <div className="grid grid-cols-4 gap-2 pt-3">
          {[
            { num: 1, label: 'Kit Setup' },
            { num: 2, label: 'Capture' },
            { num: 3, label: 'Processing' },
            { num: 4, label: 'Classification' },
          ].map(s => (
            <div key={s.num} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  currentStep >= s.num ? 'bg-cyan-400' : 'bg-[#15233E]'
                }`}
              />
              <span
                className={`text-[10px] font-mono block ${
                  currentStep === s.num ? 'text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                {s.num}. {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Test & Operator Setup */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Select Validated Field Test Kit
            </h2>
            <p className="text-xs text-slate-600">
              The companion processes results produced by certified chemical colorimetric kits. Select the exact reagent kit currently being deployed in the field.
            </p>
          </div>

          {/* Test Kit Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VALIDATED_TEST_KITS.map(kit => (
              <button
                key={kit.id}
                type="button"
                onClick={() => setSelectedKitId(kit.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  selectedKitId === kit.id
                    ? 'border-cyan-600 bg-cyan-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                      {kit.manufacturer}
                    </span>
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: kit.expectedColors.positive.hex }}
                    />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{kit.name}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {kit.targetAnalyteClass}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Rx Time: {kit.reactionTimeSeconds}s</span>
                  <span className="font-semibold text-slate-700">
                    Pos: {kit.expectedColors.positive.name.split(' ')[0]}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Field Metadata Form Grid (Test ID, Operator ID, Date/Time, Location) */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <h3 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider">
              Field Operational Metadata (Requirement 2)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Test ID */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span>Test Record ID (Auto-Generated)</span>
                </label>
                <input
                  type="text"
                  value={testId}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-100 font-mono text-xs font-bold text-slate-800 rounded-lg border border-slate-300"
                />
              </div>

              {/* Operator ID */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Operator Badge / ID</span>
                </label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={e => onOperatorIdChange(e.target.value)}
                  placeholder="e.g. OFFICER-4892"
                  className="w-full px-3 py-2 text-xs font-medium text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Timestamp */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Date & Time</span>
                </label>
                <input
                  type="text"
                  value={new Date(timestamp || Date.now()).toLocaleString()}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-100 font-mono text-xs text-slate-700 rounded-lg border border-slate-300"
                />
              </div>

              {/* GPS Coordinates & Acquire */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location / GPS Fix</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAcquireGps}
                    disabled={gpsLoading}
                    className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-700"
                  >
                    {gpsLoading ? 'Acquiring GPS...' : 'Acquire GPS'}
                  </button>
                </div>
                <input
                  type="text"
                  value={`${location.latitude}°, ${location.longitude}° (${location.formattedAddress})`}
                  onChange={e =>
                    setLocation({
                      ...location,
                      formattedAddress: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 font-mono text-xs text-slate-700 rounded-lg border border-slate-300 truncate"
                />
              </div>
            </div>
          </div>

          {/* Action to proceed to camera */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>Proceed to Image Capture</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Camera Capture */}
      {currentStep === 2 && (
        <CameraCapture
          kit={selectedKit}
          onImageCaptured={handleImageCaptured}
          onCancel={() => setCurrentStep(1)}
        />
      )}

      {/* STEP 3: Image Processing & Calibrated Telemetry */}
      {currentStep === 3 && capturedImageDataUrl && (
        <ImageProcessingView
          imageDataUrl={capturedImageDataUrl}
          kit={selectedKit}
          onAnalysisComplete={handleAnalysisComplete}
          onRetake={() => setCurrentStep(2)}
        />
      )}

      {/* STEP 4: Classification & Record Creation */}
      {currentStep === 4 && capturedImageDataUrl && analysisResult && (
        <ResultClassificationView
          testId={testId}
          kit={selectedKit}
          operatorId={operatorId}
          timestamp={timestamp}
          location={location}
          imageDataUrl={capturedImageDataUrl}
          analysisResult={analysisResult}
          onSaveRecord={onSaveRecord}
          onRetest={handleResetFlow}
        />
      )}
    </div>
  );
};
