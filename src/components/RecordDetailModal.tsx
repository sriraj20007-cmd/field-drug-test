/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TestRecord } from '../types';
import { TamperVerificationModal } from './TamperVerificationModal';
import { exportSingleRecordPdf } from '../services/pdfExport';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Hash,
  MapPin,
  Clock,
  User,
  Layers,
  FileCheck,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface RecordDetailModalProps {
  record: TestRecord;
  onClose: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
}) => {
  const [showTamperModal, setShowTamperModal] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const downloadJsonRecord = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${record.id}-FORENSIC-RECORD.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportSinglePdf = async () => {
    setExportingPdf(true);
    try {
      await exportSingleRecordPdf(record);
    } catch (err) {
      console.error('Failed to export record PDF:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  const badgeConfig = {
    POSITIVE: {
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
    },
    NEGATIVE: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
    INCONCLUSIVE: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <HelpCircle className="w-4 h-4 text-amber-600" />,
    },
  }[record.result];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Modal Top Bar */}
        <div className="bg-[#0B1528] border-b border-[#1E2E4A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-cyan-400">
              {record.id}
            </span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded flex items-center gap-1.5 ${
                record.result === 'POSITIVE'
                  ? 'bg-rose-600 text-white'
                  : record.result === 'NEGATIVE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {record.result} ({record.confidenceScore}%)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Captured Image and SHA-256 Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 space-y-2">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-black">
                <img
                  src={record.capturedImageDataUrl}
                  alt={record.id}
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                onClick={() => setShowTamperModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-bold rounded-lg border border-slate-800 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Verify SHA-256 Integrity</span>
              </button>
            </div>

            {/* Test Details and Context */}
            <div className="md:col-span-7 space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  Validated Chemical Kit
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{record.testKitName}</h3>
                <p className="text-xs text-slate-600">
                  Target Analyte Class: <strong>{record.targetAnalyteClass}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-mono block">OPERATOR</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {record.operatorId}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-mono block">TIMESTAMP</span>
                  <span className="font-mono text-slate-800 block text-[11px]">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-0.5">
                <span className="text-[10px] text-slate-500 font-mono block">GPS LOCATION</span>
                <span className="font-mono text-slate-800 block">
                  {record.location.latitude.toFixed(5)}°, {record.location.longitude.toFixed(5)}°
                </span>
                <span className="text-slate-600 text-[11px] block truncate">
                  {record.location.formattedAddress}
                </span>
              </div>

              {record.caseReference && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    CASE / EVIDENCE REF
                  </span>
                  <span className="font-bold text-slate-800">{record.caseReference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Colorimetric Telemetry Inspection */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-600" />
              <span>Extracted Colorimetric Feature Vector</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">RAW COLOR</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-slate-300"
                    style={{ backgroundColor: record.colorFeatures.rawHex }}
                  />
                  <span className="font-mono font-bold">{record.colorFeatures.rawHex}</span>
                </div>
              </div>

              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">
                  REF-COMPENSATED
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-cyan-400"
                    style={{ backgroundColor: record.colorFeatures.compensatedHex }}
                  />
                  <span className="font-mono font-bold text-cyan-800">
                    {record.colorFeatures.compensatedHex}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">RGB & HSV</span>
                <span className="font-mono text-[11px] block">
                  ({record.colorFeatures.compensatedRgb.join(',')})
                </span>
                <span className="font-mono text-[10px] text-slate-500 block">
                  H:{record.colorFeatures.compensatedHsv[0]}° S:
                  {record.colorFeatures.compensatedHsv[1]}%
                </span>
              </div>

              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">
                  COLOR DISTANCE
                </span>
                <span className="font-mono font-bold text-[11px] block">
                  ΔE(Pos): {record.colorFeatures.deltaEToPositive}
                </span>
                <span className="font-mono text-[10px] text-slate-500 block">
                  ΔE(Neg): {record.colorFeatures.deltaEToNegative}
                </span>
              </div>
            </div>

            {/* Classification Reasoning */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block mb-0.5">
                Classification Assessment:
              </span>
              <p>{record.classificationNotes}</p>
            </div>
          </div>

          {/* Cryptographic SHA-256 Digest Monospace Box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-white space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-cyan-400" />
                TAMPER-EVIDENT EVIDENCE SIGNATURE (SHA-256)
              </span>
              <span className="text-emerald-400 font-semibold">SEALED AT CAPTURE</span>
            </div>
            <div className="break-all select-all text-cyan-300 text-[11px]">
              {record.sha256Hash}
            </div>
          </div>

          {/* Mandatory Regulatory Warning */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <strong>Presumptive Field Result Notice:</strong> This digital record documents the colorimetric screening produced by a validated chemical kit. Definitive identification requires confirmatory GC-MS/LC-MS testing in an accredited laboratory.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSinglePdf}
              disabled={exportingPdf}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{exportingPdf ? 'Exporting PDF...' : 'Export Case PDF'}</span>
            </button>

            <button
              onClick={downloadJsonRecord}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Forensic JSON</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
          >
            Close Viewer
          </button>
        </div>
      </div>

      {showTamperModal && (
        <TamperVerificationModal
          record={record}
          onClose={() => setShowTamperModal(false)}
        />
      )}
    </div>
  );
};
