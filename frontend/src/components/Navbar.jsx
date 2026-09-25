import React, { useState } from 'react';
import { 
  Waves, 
  Bell, 
  Download, 
  User, 
  CheckCircle2, 
  ShieldCheck, 
  Activity,
  Layers,
  Compass
} from 'lucide-react';

export default function Navbar({ 
  isOnline, 
  hasResults, 
  onDownloadReportClick, 
  onNavigateTab 
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200/90 shadow-xs sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & SIH Problem Statement Header */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigateTab?.('dashboard')}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow-sm">
              <Waves className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  MarineVision AI
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  SIH 2026
                </span>
                <span className="hidden xl:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Problem Statement: Sonar Debris & Anomaly Detection
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Automated Side-Scan Sonar Telemetry • 4-Pillar Analytical Pipeline
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Real Pipeline Telemetry Status */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span className="font-semibold text-slate-900">Pipeline:</span>
              <span className="text-slate-600">{isOnline ? 'YOLO Inference Online' : 'FastAPI Connected'}</span>
            </div>

            {/* SIH 4-Pillars Quick View Button */}
            <button
              type="button"
              onClick={() => onNavigateTab?.('dashboard')}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 transition-colors"
              title="View 4 Core SIH Requirements"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>4 SIH Pillars</span>
            </button>

            {/* Notification Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="System Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-lg p-3 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-semibold text-slate-800">
                    <span>Notifications & Audit</span>
                    <span className="text-[10px] text-blue-600 font-mono">SIH 2026</span>
                  </div>
                  <div className="py-2 space-y-2">
                    <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-slate-700">
                      <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>FastAPI Model Online</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Tiled YOLO detector connected for automated object detection.
                      </p>
                    </div>
                    {hasResults && (
                      <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-slate-700">
                        <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Analysis Completed</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Candidate anomalies populated for validation and geotagging.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Download Report Button */}
            <button
              type="button"
              onClick={onDownloadReportClick}
              disabled={!hasResults}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                hasResults
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
              title={hasResults ? 'Download PDF Analysis Report' : 'Upload and analyze a sonar scan to generate report'}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Report</span>
            </button>

            {/* User Avatar & Info */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
                HA
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  Hydrographer
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  SIH Analyst
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
