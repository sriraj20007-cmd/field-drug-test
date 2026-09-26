/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Plus, Clock, Info, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  currentTab: 'home' | 'start-test' | 'history' | 'about';
  onNavigate: (tab: 'home' | 'start-test' | 'history' | 'about') => void;
  operatorId: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  operatorId,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B1528] border-b border-[#1E2E4A] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-sm group-hover:bg-cyan-500 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-white block">
                Digital Companion
              </span>
              <span className="text-[11px] text-cyan-400 font-mono tracking-wider block">
                FIELD DRUG TESTING
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'home'
                  ? 'bg-white/10 text-cyan-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('start-test')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'start-test'
                  ? 'bg-white/10 text-cyan-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Start New Test
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'history'
                  ? 'bg-white/10 text-cyan-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Test History
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'about'
                  ? 'bg-white/10 text-cyan-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              About & SOP
            </button>
          </nav>

          {/* Zone 3: Primary action & Operator identifier */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-[#070E1B] px-3 py-1.5 rounded-lg border border-[#1E2E4A]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-slate-200">{operatorId}</span>
            </div>

            {currentTab !== 'start-test' && (
              <button
                onClick={() => onNavigate('start-test')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Test</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
