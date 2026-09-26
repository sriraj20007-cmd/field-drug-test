/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TestRecord } from '../types';
import { verifyImageHash, tamperDataUrl, formatHashDisplay } from '../utils/crypto';
import {
  ShieldCheck,
  ShieldAlert,
  Hash,
  RefreshCw,
  X,
  AlertTriangle,
  Check,
  Flame,
  FileCheck,
} from 'lucide-react';

interface TamperVerificationModalProps {
  record: TestRecord;
  onClose: () => void;
}

export const TamperVerificationModal: React.FC<TamperVerificationModalProps> = ({
  record,
  onClose,
}) => {
  const [testingTamper, setTestingTamper] = useState(false);
  const [currentImagePayload, setCurrentImagePayload] = useState<string>(
    record.capturedImageDataUrl
  );
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    computedHash: string;
    expectedHash: string;
  } | null>(null);

  const runVerification = async (imagePayload: string) => {
    setVerifying(true);
    // Add brief delay for tangible verification execution
    setTimeout(async () => {
      const res = await verifyImageHash(imagePayload, record.sha256Hash);
      setVerificationResult(res);
      setVerifying(false);
    }, 400);
  };

  const handleSimulateTampering = () => {
    const tampered = tamperDataUrl(currentImagePayload);
    setCurrentImagePayload(tampered);
    setTestingTamper(true);
    runVerification(tampered);
  };

  const handleResetToOriginal = () => {
    setCurrentImagePayload(record.capturedImageDataUrl);
    setTestingTamper(false);
    runVerification(record.capturedImageDataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0B1528] border border-[#1E2E4A] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-white space-y-5 p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Cryptographic Tamper-Evidence Verification
              </h2>
              <span className="text-[11px] font-mono text-slate-300">
                Audit Record: {record.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status Card */}
        {verificationResult ? (
          <div
            className={`border-2 rounded-xl p-4.5 space-y-3 ${
              verificationResult.isValid
                ? 'bg-emerald-950/60 border-emerald-500/60'
                : 'bg-rose-950/60 border-rose-500/60'
            }`}
          >
            <div className="flex items-center gap-3">
              {verificationResult.isValid ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0 animate-bounce" />
              )}
              <div>
                <h3 className="text-base font-bold text-white">
                  {verificationResult.isValid
                    ? 'VERIFIED: AUTHENTIC & UNTAMPERED'
                    : 'TAMPER DETECTED: CRYPTOGRAPHIC HASH MISMATCH'}
                </h3>
                <p className="text-xs text-slate-300">
                  {verificationResult.isValid
                    ? 'The image bytes strictly match the SHA-256 digest sealed at time of capture. Chain of custody is intact.'
                    : 'The recomputed image digest differs from the stored ledger hash. One or more bytes have been modified or corrupted.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2 text-[11px] font-mono">
              <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">STORED SEALED HASH:</span>
                <span className="text-slate-200 break-all select-all">
                  {verificationResult.expectedHash}
                </span>
              </div>

              <div
                className={`p-2.5 rounded border space-y-1 ${
                  verificationResult.isValid
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-rose-950/90 border-rose-500/60'
                }`}
              >
                <span className="text-slate-400 text-[10px] block">
                  RECALCULATED IMAGE HASH (ON-THE-FLY):
                </span>
                <span
                  className={`break-all select-all font-bold ${
                    verificationResult.isValid ? 'text-emerald-400' : 'text-rose-300'
                  }`}
                >
                  {verificationResult.computedHash}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center space-y-3">
            <Hash className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">
                Stored Reference SHA-256 Hash
              </h3>
              <p className="font-mono text-xs text-cyan-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                {record.sha256Hash}
              </p>
            </div>
            <button
              onClick={() => runVerification(currentImagePayload)}
              disabled={verifying}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              {verifying ? 'Recalculating Digest...' : 'Verify Cryptographic Integrity Now'}
            </button>
          </div>
        )}

        {/* Live Forensic Testing Buttons (For SIH Demonstration) */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>SIH Hackathon Demonstration Tool</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Live byte alteration test
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Test how the SHA-256 verification responds when digital evidence is tampered with. Clicking below flips a single byte in the image payload:
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleSimulateTampering}
              className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-medium transition-colors"
            >
              Simulate Image Alteration (Corrupt 1 Byte)
            </button>

            {testingTamper && (
              <button
                onClick={handleResetToOriginal}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Restore Authentic Evidence & Re-Verify
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
