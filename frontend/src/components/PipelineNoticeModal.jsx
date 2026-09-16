import React from 'react';
import { X, Cpu, Server, CheckCircle2, ArrowRight, ShieldCheck, Waves } from 'lucide-react';

export default function PipelineNoticeModal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="ocean-card ocean-card-glow max-w-lg w-full rounded-2xl p-6 sm:p-7 border border-sonar-cyan/40 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-ocean-900/80 hover:bg-ocean-800 border border-ocean-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sonar-cyan/10 border border-sonar-cyan/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-sonar-cyan" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono">
              {title || "AI Pipeline Status"}
            </h3>
            <p className="text-xs text-sonar-teal font-mono">
              Architecture Stage: Frontend UI Prototype
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <p className="leading-relaxed text-slate-300">
            {message || "The UI is configured and awaiting backend integration. In accordance with requirements, real AI inference has not been simulated."}
          </p>

          {/* Pipeline flow diagram */}
          <div className="p-4 rounded-xl bg-ocean-950/90 border border-ocean-800 space-y-3 font-mono text-xs">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Integration Roadmap
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Step 1: Frontend UI Dashboard</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">Ready</span>
              </div>

              <div className="flex items-center gap-2.5 text-cyan-300/80">
                <Server className="w-4 h-4 shrink-0 text-sonar-cyan" />
                <span>Step 2: FastAPI Service (`/api/v1/detect`)</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-ocean-900 border border-ocean-700 text-slate-400">Next</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-400">
                <Cpu className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Step 3: YOLO Marine Debris Weights</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-ocean-900 border border-ocean-700 text-slate-500">Upcoming</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-400">
                <Waves className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Step 4: Real-time Sonar Bounding Boxes & Geo-fixes</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-ocean-900 border border-ocean-700 text-slate-500">Upcoming</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            API stubs have been pre-architected in <code className="text-cyan-300">src/services/api.js</code> for seamless plug-in.
          </p>
        </div>

        {/* Footer Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-ocean-800 hover:bg-ocean-750 text-cyan-300 border border-sonar-cyan/30 hover:border-sonar-cyan/60 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
