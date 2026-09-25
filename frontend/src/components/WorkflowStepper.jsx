import React from 'react';
import { 
  UploadCloud, 
  ScanSearch, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';

/**
 * WorkflowStepper
 * 
 * 5-Stage SIH Hydrographic Pipeline:
 * Upload Sonar → AI Detection → Anomaly Validation → Geotagging → Reporting
 */
export default function WorkflowStepper({ 
  currentStep = 1, 
  onSelectStep, 
  hasImage = false, 
  hasResults = false,
  hasReviews = false,
  isVerified = false
}) {
  const steps = [
    {
      step: 1,
      id: 'upload',
      title: '1. Upload Sonar',
      badge: 'Input',
      description: 'Ingest raw side-scan sonar image or GeoTIFF.',
      icon: UploadCloud,
      isCompleted: Boolean(hasImage),
    },
    {
      step: 2,
      id: 'detection',
      title: '2. AI Detection',
      badge: 'SIH Pillar 1',
      description: 'Automated YOLO object & anomaly detection.',
      icon: ScanSearch,
      isCompleted: Boolean(hasResults),
    },
    {
      step: 3,
      id: 'validation',
      title: '3. Anomaly Validation',
      badge: 'SIH Pillar 2',
      description: 'Analyst review & acoustic noise filtering.',
      icon: ShieldCheck,
      isCompleted: Boolean(hasReviews),
    },
    {
      step: 4,
      id: 'geotagging',
      title: '4. Geotagging',
      badge: 'SIH Pillar 3',
      description: 'WGS84 geospatial GIS hydrographic mapping.',
      icon: MapPin,
      isCompleted: Boolean(isVerified && hasResults),
    },
    {
      step: 5,
      id: 'reporting',
      title: '5. Reporting',
      badge: 'SIH Pillar 4',
      description: 'Structured CSV & formatted PDF audit reports.',
      icon: FileText,
      isCompleted: false,
    },
  ];

  return (
    <div className="saas-card p-5 sm:p-6 mb-6">
      {/* Header & SIH Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-blue-100 text-blue-800 border border-blue-200">
              SIH Problem Statement
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Automated Underwater Marine Debris & Sonar Anomaly Detection
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            5-Stage Sonar Telemetry Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Upload Sonar → AI Detection → Anomaly Validation → Geotagging → Reporting
          </p>
        </div>

        {/* Workflow Stage Indicator */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Workflow Stage {currentStep} of 5</span>
          </div>
        </div>
      </div>

      {/* 5-Step Interactive Workflow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
        {steps.map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => onSelectStep?.(item.id, item.step)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-500/30'
                  : item.isCompleted
                  ? 'bg-white border-slate-200 hover:border-blue-300'
                  : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : item.isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <h3 className={`text-xs font-bold leading-tight ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                    {item.title}
                  </h3>
                  {item.isCompleted && !isActive && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                <span className={isActive ? 'text-blue-700 font-bold' : item.isCompleted ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  {isActive ? '● IN PROGRESS' : item.isCompleted ? '✓ COMPLETED' : '○ PENDING'}
                </span>
                <ChevronRight className={`w-3 h-3 ${isActive ? 'text-blue-600' : 'text-slate-300'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
