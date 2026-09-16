import React from 'react';
import { UploadCloud, ScanSearch, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function WorkflowStepper({ 
  currentStep = 1, 
  onSelectStep, 
  hasImage, 
  hasResults,
  hasReviews 
}) {
  const steps = [
    {
      step: 1,
      id: 'upload',
      title: '1. Upload Sonar Image',
      description: 'Upload and analyze georeferenced sonar imagery.',
      icon: UploadCloud,
      isCompleted: Boolean(hasImage),
    },
    {
      step: 2,
      id: 'detection',
      title: '2. AI Detection',
      description: 'Detect potential underwater objects and anomalies.',
      icon: ScanSearch,
      isCompleted: Boolean(hasResults),
    },
    {
      step: 3,
      id: 'expert-review',
      title: '3. Expert Review',
      description: 'Review AI-predicted candidates before confirmation.',
      icon: ShieldCheck,
      isCompleted: Boolean(hasReviews),
    },
    {
      step: 4,
      id: 'reports',
      title: '4. Generate Report',
      description: 'Export detection results and geospatial information.',
      icon: FileText,
      isCompleted: false,
    },
  ];

  return (
    <div className="saas-card p-5 sm:p-6 mb-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Underwater Sonar Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            AI-assisted detection of marine debris and underwater anomalies
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 font-mono">
          <span>Workflow Stage {currentStep} of 4</span>
        </div>
      </div>

      {/* 4-Step Interactive Workflow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {steps.map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => onSelectStep?.(item.id, item.step)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/50'
                  : item.isCompleted
                  ? 'bg-white border-slate-200 hover:border-blue-300'
                  : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : item.isCompleted
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {item.isCompleted && !isActive && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                    Active
                  </span>
                )}
              </div>

              <h3 className={`text-xs font-bold leading-tight ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
