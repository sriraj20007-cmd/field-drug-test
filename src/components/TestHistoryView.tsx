/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TestRecord, TestResultCategory } from '../types';
import { RecordDetailModal } from './RecordDetailModal';
import { TamperVerificationModal } from './TamperVerificationModal';
import { exportTestHistoryPdf } from '../services/pdfExport';
import {
  Search,
  Filter,
  ShieldCheck,
  Eye,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Clock,
  User,
  Hash,
  FileText,
  Calendar,
} from 'lucide-react';

interface TestHistoryViewProps {
  records: TestRecord[];
  onStartNewTest: () => void;
}

export const TestHistoryView: React.FC<TestHistoryViewProps> = ({
  records,
  onStartNewTest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [selectedRecord, setSelectedRecord] = useState<TestRecord | null>(null);
  const [recordForTamperVerify, setRecordForTamperVerify] = useState<TestRecord | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Quick Date Range Handler
  const handleDatePresetChange = (preset: 'all' | 'today' | '7days' | '30days' | 'custom') => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const todayStr = now.toISOString().slice(0, 10);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      setStartDate(sevenDaysAgo.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      setStartDate(thirtyDaysAgo.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterResult('ALL');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
  };

  // Filter records based on search term, category, and date range
  const filteredRecords = records.filter(rec => {
    // 1. Category match
    const matchesCategory =
      filterResult === 'ALL' || rec.result === filterResult;

    // 2. Search match
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      rec.id.toLowerCase().includes(term) ||
      rec.testKitName.toLowerCase().includes(term) ||
      rec.targetAnalyteClass.toLowerCase().includes(term) ||
      rec.operatorId.toLowerCase().includes(term) ||
      rec.location.formattedAddress.toLowerCase().includes(term) ||
      rec.sha256Hash.toLowerCase().includes(term) ||
      (rec.caseReference && rec.caseReference.toLowerCase().includes(term));

    // 3. Date range match
    let matchesDate = true;
    const recordDate = new Date(rec.timestamp);

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (recordDate < start) matchesDate = false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (recordDate > end) matchesDate = false;
    }

    return matchesCategory && matchesSearch && matchesDate;
  });

  // Calculate counts for badges
  const resultCounts = {
    ALL: records.length,
    POSITIVE: records.filter(r => r.result === 'POSITIVE').length,
    NEGATIVE: records.filter(r => r.result === 'NEGATIVE').length,
    INCONCLUSIVE: records.filter(r => r.result === 'INCONCLUSIVE').length,
  };

  const handleExportPdf = async () => {
    if (filteredRecords.length === 0) return;
    setExportingPdf(true);

    let dateLabel = '';
    if (startDate && endDate) {
      dateLabel = startDate === endDate ? startDate : `${startDate} to ${endDate}`;
    } else if (startDate) {
      dateLabel = `From ${startDate}`;
    } else if (endDate) {
      dateLabel = `Up to ${endDate}`;
    }

    try {
      await exportTestHistoryPdf(filteredRecords, {
        filterResult,
        searchTerm: searchTerm.trim() || undefined,
        dateRangeLabel: dateLabel || undefined,
      });
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  const isFilteringActive =
    searchTerm !== '' ||
    filterResult !== 'ALL' ||
    datePreset !== 'all' ||
    startDate !== '' ||
    endDate !== '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner and Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Presumptive Field Test History & Audit Log
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable chain-of-custody ledger with SHA-256 tamper-evident verification
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* PDF Report Export Button */}
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf || filteredRecords.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Generate printable PDF report of current test log"
            >
              <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{exportingPdf ? 'Generating PDF...' : 'Export to PDF'}</span>
            </button>

            <button
              onClick={onStartNewTest}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <span>+ New Test</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Matrix */}
        <div className="pt-2 border-t border-slate-100 space-y-4">
          {/* Row 1: Search & Result Type Tabs */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search Test ID, Kit, Analyte, Operator, Location, or SHA-256..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Result Category Filter Tabs with Indicators */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setFilterResult('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  filterResult === 'ALL'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>All Results</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700">
                  {resultCounts.ALL}
                </span>
              </button>

              <button
                onClick={() => setFilterResult('POSITIVE')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  filterResult === 'POSITIVE'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
                <span>Positive</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    filterResult === 'POSITIVE' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {resultCounts.POSITIVE}
                </span>
              </button>

              <button
                onClick={() => setFilterResult('NEGATIVE')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  filterResult === 'NEGATIVE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Negative</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    filterResult === 'NEGATIVE' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {resultCounts.NEGATIVE}
                </span>
              </button>

              <button
                onClick={() => setFilterResult('INCONCLUSIVE')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  filterResult === 'INCONCLUSIVE'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <span>Inconclusive</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    filterResult === 'INCONCLUSIVE' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {resultCounts.INCONCLUSIVE}
                </span>
              </button>
            </div>
          </div>

          {/* Row 2: Date Range Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            {/* Date range pickers */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Date Range:</span>
              </span>

              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  title="From date"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => {
                    setEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  title="To date"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 ml-1">
                {(
                  [
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: '7days', label: 'Past 7 Days' },
                    { id: '30days', label: 'Past 30 Days' },
                  ] as const
                ).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleDatePresetChange(p.id)}
                    className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                      datePreset === p.id
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-white hover:bg-slate-200/80 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters Indicator */}
            {isFilteringActive && (
              <div className="flex items-center justify-between md:justify-end gap-2 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Showing <strong>{filteredRecords.length}</strong> of {records.length} records
                </span>
                <button
                  onClick={handleClearFilters}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Records Table / List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No test records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching records found for the applied search, date range, or result criteria.
            </p>
            {isFilteringActive && (
              <button
                onClick={handleClearFilters}
                className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map(rec => (
              <div
                key={rec.id}
                className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left zone: Image thumbnail + Identification */}
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    onClick={() => setSelectedRecord(rec)}
                    className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden border border-slate-200 shrink-0 cursor-pointer shadow-sm relative group"
                  >
                    <img
                      src={rec.capturedImageDataUrl}
                      alt={rec.id}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {rec.id}
                      </span>

                      {/* Result Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          rec.result === 'POSITIVE'
                            ? 'bg-rose-100 text-rose-800'
                            : rec.result === 'NEGATIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.result === 'POSITIVE' && (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        )}
                        {rec.result === 'NEGATIVE' && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        )}
                        {rec.result === 'INCONCLUSIVE' && (
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{rec.result}</span>
                      </span>

                      <span className="text-[11px] font-mono text-slate-500">
                        Conf: {rec.confidenceScore}%
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800">
                      {rec.testKitName}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{rec.operatorId}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(rec.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          · {new Date(rec.timestamp).toLocaleDateString()}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-md">{rec.location.formattedAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Right zone: SHA-256 Hash snippet + Verification Trigger */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Cryptographic Evidence Hash
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 truncate block max-w-[200px]">
                      {rec.sha256Hash.substring(0, 16)}...
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRecordForTamperVerify(rec)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
                      title="Verify SHA-256 image integrity"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Verify Hash</span>
                    </button>

                    <button
                      onClick={() => setSelectedRecord(rec)}
                      className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {/* Tamper Verification Modal */}
      {recordForTamperVerify && (
        <TamperVerificationModal
          record={recordForTamperVerify}
          onClose={() => setRecordForTamperVerify(null)}
        />
      )}
    </div>
  );
};
