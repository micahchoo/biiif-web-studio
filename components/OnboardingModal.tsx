
import React, { useState } from 'react';
import { Icon } from './Icon';
import { AbstractionLevel } from '../types';

interface OnboardingModalProps {
  onComplete: (level: AbstractionLevel) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [showExpertise, setShowExpertise] = useState(false);

  // Quick start with default settings
  const handleQuickStart = () => {
    onComplete('simple');
  };

  // Choose expertise level
  const handleSelectLevel = (level: AbstractionLevel) => {
    onComplete(level);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200">

        {!showExpertise ? (
          // Welcome Screen - Simple and Quick
          <div className="p-8 animate-in fade-in duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 text-white shadow-lg">
                <Icon name="auto_awesome" className="text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Field Studio</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Turn your files into organized, shareable digital archives.
              </p>
            </div>

            {/* Quick Start Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Icon name="folder" className="text-amber-600 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Drag folders to import</p>
                  <p className="text-xs text-slate-400">Structure is preserved automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Icon name="photo_camera" className="text-green-600 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Metadata extracted</p>
                  <p className="text-xs text-slate-400">GPS, dates, and camera info captured</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Icon name="public" className="text-blue-600 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Export to web</p>
                  <p className="text-xs text-slate-400">One-click shareable websites</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleQuickStart}
                className="w-full bg-iiif-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Get Started
                <Icon name="arrow_forward" />
              </button>
              <button
                onClick={() => setShowExpertise(true)}
                className="w-full text-slate-500 px-6 py-2 rounded-xl text-sm hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                I'm an advanced user - customize my experience
              </button>
            </div>

            {/* Help hint */}
            <p className="text-center text-[10px] text-slate-400 mt-6">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-mono">?</kbd> anytime for help
            </p>
          </div>
        ) : (
          // Expertise Selection
          <div className="p-8 animate-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setShowExpertise(false)}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm mb-4"
            >
              <Icon name="arrow_back" className="text-sm" />
              Back
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Choose your experience</h2>
              <p className="text-sm text-slate-500">You can change this anytime in Settings</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSelectLevel('simple')}
                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Simple</p>
                    <p className="text-xs text-slate-500">Focus on content, hide technical details</p>
                  </div>
                  <Icon name="arrow_forward" className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => handleSelectLevel('standard')}
                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Standard</p>
                    <p className="text-xs text-slate-500">See file names, edit metadata properties</p>
                  </div>
                  <Icon name="arrow_forward" className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => handleSelectLevel('advanced')}
                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Advanced</p>
                    <p className="text-xs text-slate-500">Full IIIF control, JSON editing, custom IDs</p>
                  </div>
                  <Icon name="arrow_forward" className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400">
              This affects which fields and options are visible in the UI
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
