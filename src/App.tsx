/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { StartTestFlow } from './components/StartTestFlow';
import { TestHistoryView } from './components/TestHistoryView';
import { AboutScreen } from './components/AboutScreen';
import { RecordDetailModal } from './components/RecordDetailModal';
import { TestRecord, DemoSamplePreset } from './types';
import { INITIAL_TEST_RECORDS } from './data/mockRecords';
import {
  Home,
  Camera,
  History,
  Info,
  ShieldCheck,
} from 'lucide-react';

const STORAGE_KEY = 'FIELD_DRUG_TEST_RECORDS_V1';
const OPERATOR_KEY = 'FIELD_DRUG_TEST_OPERATOR_V1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'start-test' | 'history' | 'about'>('home');
  const [operatorId, setOperatorId] = useState<string>(() => {
    return localStorage.getItem(OPERATOR_KEY) || 'OFFICER-4892 (D. Vance)';
  });
  const [records, setRecords] = useState<TestRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved records from storage:', e);
    }
    return INITIAL_TEST_RECORDS;
  });

  const [activePreset, setActivePreset] = useState<DemoSamplePreset | null>(null);
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<TestRecord | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to save records to storage:', e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(OPERATOR_KEY, operatorId);
    } catch (e) {
      console.warn('Failed to save operator ID to storage:', e);
    }
  }, [operatorId]);

  const handleSaveNewRecord = (newRecord: TestRecord) => {
    setRecords(prev => [newRecord, ...prev]);
  };

  const handleStartNewTest = () => {
    setActivePreset(null);
    setCurrentTab('start-test');
  };

  const handleRunDemoPreset = (preset: DemoSamplePreset) => {
    setActivePreset(preset);
    setCurrentTab('start-test');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-white">
      {/* Top 3-Zone Navigation Header in authoritative Dark Blue */}
      <Header
        currentTab={currentTab}
        onNavigate={tab => {
          setActivePreset(null);
          setCurrentTab(tab);
        }}
        operatorId={operatorId}
      />

      {/* Main Content Area in Crisp White Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {currentTab === 'home' && (
          <HomeScreen
            onStartNewTest={handleStartNewTest}
            onOpenHistory={() => setCurrentTab('history')}
            onOpenAbout={() => setCurrentTab('about')}
            onSelectRecord={rec => setSelectedRecordForModal(rec)}
            onRunDemoPreset={handleRunDemoPreset}
            recentRecords={records}
          />
        )}

        {currentTab === 'start-test' && (
          <StartTestFlow
            operatorId={operatorId}
            onOperatorIdChange={setOperatorId}
            onSaveRecord={handleSaveNewRecord}
            onCancel={() => {
              setActivePreset(null);
              setCurrentTab('home');
            }}
            initialPreset={activePreset}
          />
        )}

        {currentTab === 'history' && (
          <TestHistoryView
            records={records}
            onStartNewTest={handleStartNewTest}
          />
        )}

        {currentTab === 'about' && <AboutScreen />}
      </main>

      {/* Mobile Bottom Navigation Bar in Dark Blue */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1528]/95 backdrop-blur-md border-t border-[#1E2E4A] grid grid-cols-4 items-center h-16 pb-safe">
        <button
          onClick={() => {
            setActivePreset(null);
            setCurrentTab('home');
          }}
          className={`flex flex-col items-center justify-center h-full ${
            currentTab === 'home' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Home</span>
        </button>

        <button
          onClick={handleStartNewTest}
          className={`flex flex-col items-center justify-center h-full ${
            currentTab === 'start-test' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">New Test</span>
        </button>

        <button
          onClick={() => {
            setActivePreset(null);
            setCurrentTab('history');
          }}
          className={`flex flex-col items-center justify-center h-full ${
            currentTab === 'history' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">History</span>
        </button>

        <button
          onClick={() => {
            setActivePreset(null);
            setCurrentTab('about');
          }}
          className={`flex flex-col items-center justify-center h-full ${
            currentTab === 'about' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">About</span>
        </button>
      </nav>

      {/* Global Record Detail Modal */}
      {selectedRecordForModal && (
        <RecordDetailModal
          record={selectedRecordForModal}
          onClose={() => setSelectedRecordForModal(null)}
        />
      )}
    </div>
  );
}
