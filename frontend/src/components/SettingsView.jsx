import React from 'react';
import { Settings, Shield, Cpu, Database, Compass, Server, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function SettingsView() {
  return (
    <div id="settings-section" className="saas-card p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Roles & Survey System Configuration
          </h3>
          <p className="text-xs text-slate-500">
            System parameters, operator privileges, and geodetic reference settings for SIH 2026.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Role Privileges Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Active Operator Role</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Hydrographic Survey Analyst</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                SIH 2026 Lead
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Authorized to execute acoustic model inference, review AI-predicted candidates, and export verified hydrographic survey reports.
            </p>
          </div>
          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Inference & Tiling Control</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Expert Review & Candidate Confirmation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>GeoTIFF Coordinate System Validation</span>
            </div>
          </div>
        </div>

        {/* Inference & Backend Engine */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>AI Inference Engine</span>
          </div>
          <div className="space-y-2 font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Model:</span>
              <span className="font-bold text-slate-900">YOLOv8 Acoustic Detector</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Inference Mode:</span>
              <span className="font-bold text-slate-900">1000×1000 Tiled Swath Inference</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">FastAPI Host:</span>
              <span className="font-bold text-blue-700 truncate max-w-[180px]">{API_BASE_URL}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Geodetic Datum:</span>
              <span className="font-bold text-emerald-700">WGS84 (EPSG:4326)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
