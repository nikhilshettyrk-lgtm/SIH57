import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  MapPin, 
  AlertTriangle, 
  Compass, 
  Info,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { 
  getCandidateDisplayName, 
  getConfidenceLevel,
  AI_CANDIDATE_STATUS,
  EXPERT_REVIEW_RECOMMENDATION
} from '../services/api';

export default function ExpertReviewSection({
  detectionResults,
  expertReviews = {},
  onUpdateReview,
  selectedDetectionId,
  onSelectDetection
}) {
  const detections = detectionResults?.detections || [];
  const hasResults = Boolean(detectionResults);

  const handleSelectCandidate = (markerId) => {
    if (onSelectDetection) {
      onSelectDetection(markerId);
    }
    const mapEl = document.getElementById('hydrographic-survey-map');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  if (!hasResults || detections.length === 0) {
    return (
      <div id="expert-review-section" className="saas-card p-6 mb-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Expert Review & Verification
            </h3>
            <p className="text-xs text-slate-500">
              Human hydrographic analyst review of AI-predicted acoustic candidates.
            </p>
          </div>
        </div>

        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 font-sans">
            No active candidates staged for expert review
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload a side-scan sonar image and run AI analysis to populate candidates for human verification.
          </p>
        </div>
      </div>
    );
  }

  const confirmedCount = Object.values(expertReviews).filter(s => s === 'confirmed').length;
  const rejectedCount = Object.values(expertReviews).filter(s => s === 'rejected').length;
  const pendingCount = detections.length - (confirmedCount + rejectedCount);

  return (
    <div id="expert-review-section" className="saas-card p-5 sm:p-6 mb-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Expert Review
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {detections.length} {detections.length === 1 ? 'Candidate' : 'Candidates'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review AI-predicted candidates before confirmation. Clicking a candidate focuses its map marker.
            </p>
          </div>
        </div>

        {/* Review Status Counters */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            {confirmedCount} Confirmed
          </span>
          <span className="px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200 font-semibold">
            {rejectedCount} Rejected
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
            {pendingCount} Pending
          </span>
        </div>
      </div>

      {/* Scientific Clarification Notice */}
      <div className="mb-5 p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold text-amber-950">Scientific Protocol & Clarification: </strong>
          "Confirm" signifies: <span className="font-semibold underline">Expert confirms this AI candidate</span>. It does NOT imply that the AI system itself has confirmed or definitively identified the target. AI detections are candidate anomalies and require expert validation.
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detections.map((det, idx) => {
          const markerId = det.id ?? (idx + 1);
          const candidateTitle = getCandidateDisplayName(det);
          const confNum = Number(det.confidence) || 0;
          const confPct = `${(confNum * 100).toFixed(1)}%`;
          const confLevel = getConfidenceLevel(det);
          const currentStatus = expertReviews[markerId] || 'pending';
          const isSelected = selectedDetectionId === markerId;

          const latVal = det.latitude;
          const lonVal = det.longitude;
          const hasCoord = latVal != null && lonVal != null && !isNaN(Number(latVal)) && !isNaN(Number(lonVal));
          const latDisplay = hasCoord ? `${Number(latVal).toFixed(6)}°` : 'Not available';
          const lonDisplay = hasCoord ? `${Number(lonVal).toFixed(6)}°` : 'Not available';

          return (
            <div
              key={markerId}
              onClick={() => handleSelectCandidate(markerId)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/40 shadow-sm'
                  : currentStatus === 'confirmed'
                  ? 'bg-emerald-50/20 border-emerald-300'
                  : currentStatus === 'rejected'
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                {/* Card Top: Target ID, Candidate Name, Confidence Badge */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      #{markerId}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {candidateTitle}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Status: <strong className="text-slate-700">AI-Predicted Candidate</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {confPct}
                    </span>
                    <span className={`block text-[10px] font-semibold px-2 py-0.5 rounded border mt-0.5 ${
                      confNum >= 0.70
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : confNum >= 0.40
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {confLevel}
                    </span>
                  </div>
                </div>

                {/* Coordinates & Telemetry */}
                <div className="py-2.5 space-y-1 text-xs font-mono text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Latitude:</span>
                    <span className={hasCoord ? "font-semibold text-slate-900" : "text-slate-400"}>
                      {latDisplay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Longitude:</span>
                    <span className={hasCoord ? "font-semibold text-slate-900" : "text-slate-400"}>
                      {lonDisplay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Review Status:</span>
                    {currentStatus === 'confirmed' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Expert Confirmed</span>
                      </span>
                    ) : currentStatus === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Expert Rejected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Expert Review</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: [ Reject ] [ Confirm ] */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onUpdateReview?.(markerId, 'rejected')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    currentStatus === 'rejected'
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white hover:bg-red-50 text-red-700 border-slate-300 hover:border-red-300'
                  }`}
                  title="Mark as rejected / false positive"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateReview?.(markerId, 'confirmed')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    currentStatus === 'confirmed'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                  }`}
                  title="Expert confirms this AI candidate"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
