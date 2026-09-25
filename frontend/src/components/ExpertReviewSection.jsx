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
  Clock,
  UserCheck
} from 'lucide-react';
import { 
  getCandidateDisplayName, 
  getConfidenceLevel, 
  AI_CANDIDATE_STATUS, 
  EXPERT_REVIEW_RECOMMENDATION 
} from '../services/api';

/**
 * ExpertReviewSection / Anomaly Validation
 * 
 * Represents SIH Workflow Stage 3 (Anomaly Validation)
 * and feeds SIH Pillar 2 (Noise Filtering) & Pillar 4 (Anomaly Reporting)
 */
export default function ExpertReviewSection({
  detectionResults,
  expertReviews = {},
  onUpdateReview,
  selectedDetectionId,
  onSelectDetection
}) {
  const detections = Array.isArray(detectionResults?.detections) ? detectionResults.detections : [];
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
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Stage 3: Anomaly Validation & Human Verification
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                SIH Pillar 2 & 4
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Human-in-the-loop hydrographic analyst validation of AI-predicted acoustic candidates.
            </p>
          </div>
        </div>

        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 font-sans">
            No active candidates staged for validation
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload a side-scan sonar image and run AI detection to populate acoustic anomalies for human verification.
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
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Stage 3: Anomaly Validation & Verification
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {detections.length} {detections.length === 1 ? 'Candidate' : 'Candidates'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                SIH Pillar 2: Validation
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Human-in-the-loop review before final identification. Clicking an anomaly centers its hydrographic marker.
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
          <strong className="font-semibold text-amber-950">Scientific Protocol & Validation Clarification: </strong>
          "Confirm" signifies: <span className="font-semibold underline">Human hydrographic analyst confirms this candidate anomaly</span>. It does NOT mean the AI independently verified the physical target. AI detections remain candidates until expert validation.
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
                {/* Card Top: Target ID, Candidate Name, Status Badge */}
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

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    confNum >= 0.70
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : confNum >= 0.40
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {confPct}
                  </span>
                </div>

                {/* Candidate Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono py-3 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Confidence Tier:</span>
                    <span className="text-slate-800 font-semibold">{confLevel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">WGS84 Coordinates:</span>
                    <span className={hasCoord ? "text-slate-800 font-semibold" : "text-slate-400"}>
                      {hasCoord ? `${latDisplay}, ${lonDisplay}` : 'Not available'}
                    </span>
                  </div>
                </div>

                {/* Analyst Review Note */}
                <div className="pt-2 text-[11px] text-slate-600 leading-snug">
                  <strong className="text-slate-800">Review Note: </strong>
                  {EXPERT_REVIEW_RECOMMENDATION}
                </div>
              </div>

              {/* Action Buttons: Reject / Confirm */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] font-mono font-medium">
                  {currentStatus === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmed by Analyst</span>
                    </span>
                  ) : currentStatus === 'rejected' ? (
                    <span className="inline-flex items-center gap-1 text-red-700 font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejected by Analyst</span>
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold">
                      ● Verification Pending
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateReview?.(markerId, 'rejected')}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      currentStatus === 'rejected'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateReview?.(markerId, 'confirmed')}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      currentStatus === 'confirmed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-xs'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
