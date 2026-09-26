/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Upload,
  AlertCircle,
  Sparkles,
  Check,
  FlipHorizontal,
  Info,
} from 'lucide-react';
import { ValidatedKit, DemoSamplePreset } from '../types';
import { DEMO_SAMPLE_PRESETS, getPresetSyntheticImage } from '../data/validatedKits';

interface CameraCaptureProps {
  kit: ValidatedKit;
  onImageCaptured: (imageDataUrl: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  kit,
  onImageCaptured,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Initialize camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Unable to access camera video stream. Please ensure camera permissions are enabled, or select a sample image / upload a photo.'
      );
      setCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Flip camera (rear/front)
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from active camera
  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setPreviewImage(dataUrl);

    // Stop camera stream while reviewing
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setPreviewImage(dataUrl);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setCameraActive(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Load sample preset directly
  const handleLoadPreset = (preset: DemoSamplePreset) => {
    const imgDataUrl = getPresetSyntheticImage(preset);
    setPreviewImage(imgDataUrl);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (previewImage) {
      onImageCaptured(previewImage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Requirement 3 Mandatory Instruction Banner */}
      <div className="bg-cyan-950/80 border border-cyan-500/40 rounded-xl p-4 text-cyan-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs uppercase font-mono tracking-wider font-bold text-cyan-300 block mb-0.5">
            Capture Protocol
          </span>
          <p className="text-sm font-semibold text-white">
            “Place the reacted test and reference colour card inside the camera frame.”
          </p>
          <p className="text-xs text-cyan-300/80 mt-1">
            Ensure both the chemical reaction well and the physical color swatches are evenly illuminated without direct specular glare or harsh shadows.
          </p>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] max-h-[500px] flex items-center justify-center border border-slate-800 shadow-2xl">
        {previewImage ? (
          // Captured Preview
          <div className="relative w-full h-full">
            <img
              src={previewImage}
              alt="Captured Frame Preview"
              className="w-full h-full object-contain bg-slate-950"
            />
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>FRAME FROZEN FOR OPTICAL PROCESSING</span>
            </div>
          </div>
        ) : cameraActive ? (
          // Active Camera Stream
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {/* Forensic Alignment Reticles Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
              {/* Top status bar */}
              <div className="flex items-center justify-between">
                <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-cyan-400 border border-cyan-500/30">
                  LIVE OPTICAL FEED · {kit.name.split(' ')[0]}
                </span>
                <span className="bg-rose-500/90 text-white px-2 py-0.5 rounded text-[10px] font-mono animate-pulse">
                  ● REC
                </span>
              </div>

              {/* Dual Inspection Alignment Frames */}
              <div className="grid grid-cols-2 gap-4 my-auto h-3/4">
                {/* Left Frame: Reaction Strip / Well */}
                <div className="border-2 border-dashed border-cyan-400/80 rounded-xl bg-cyan-500/5 flex flex-col items-center justify-center p-3 relative">
                  <div className="absolute -top-3 left-4 bg-cyan-900 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 font-semibold border border-cyan-500">
                    1. REACTED TEST REGION
                  </div>
                  <div className="w-16 h-28 border border-cyan-400/50 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] font-mono text-cyan-300 text-center px-1">
                      Align Reagent Strip / Well
                    </span>
                  </div>
                </div>

                {/* Right Frame: Reference Color Card */}
                <div className="border-2 border-dashed border-amber-400/80 rounded-xl bg-amber-500/5 flex flex-col items-center justify-center p-3 relative">
                  <div className="absolute -top-3 left-4 bg-amber-900 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-semibold border border-amber-500">
                    2. REFERENCE COLOUR CARD
                  </div>
                  <div className="w-28 h-28 border border-amber-400/50 rounded-lg grid grid-cols-2 gap-1 p-1">
                    <div className="bg-white/40 rounded"></div>
                    <div className="bg-white/20 rounded"></div>
                    <div className="bg-cyan-500/40 rounded"></div>
                    <div className="bg-purple-500/40 rounded"></div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 mt-2">
                    Include White/Color Swatches
                  </span>
                </div>
              </div>

              {/* Alignment Tip */}
              <div className="text-center">
                <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-slate-300 border border-slate-700">
                  Hold device perpendicular at 15–20 cm distance
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Camera Inactive / Permission Fallback
          <div className="text-center p-6 space-y-4 max-w-md">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Camera Standby / Emulation</h3>
              <p className="text-xs text-slate-400 mt-1">
                {cameraError || 'Use live camera stream or choose a validated test preset below for immediate demonstration.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => startCamera(facingMode)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg border border-slate-700"
              >
                Retry Camera Access
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Camera Controls & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {cameraActive && (
            <button
              onClick={toggleFacingMode}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="Flip camera lens"
            >
              <FlipHorizontal className="w-5 h-5" />
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Test Photo</span>
          </button>
        </div>

        {/* Shutter / Confirmation Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {previewImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Process & Analyze Image</span>
              </button>
            </>
          ) : (
            cameraActive && (
              <button
                onClick={captureFrame}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5 stroke-[2.5]" />
                <span>Capture Image</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* SIH Fast Presets for Evaluators */}
      <div className="border-t border-slate-800 pt-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Or load standard test sample with reference calibration card:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DEMO_SAMPLE_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              className="text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition-colors flex items-center gap-2.5"
            >
              <div
                className="w-5 h-5 rounded-md border border-slate-700 shrink-0"
                style={{ backgroundColor: preset.stripColor }}
              />
              <div className="truncate">
                <span className="block text-[11px] font-semibold text-slate-200 truncate">
                  {preset.expectedResult}: {preset.title.split('·')[0]}
                </span>
                <span className="block text-[10px] text-slate-500 truncate">
                  {preset.cardLightingCondition}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
