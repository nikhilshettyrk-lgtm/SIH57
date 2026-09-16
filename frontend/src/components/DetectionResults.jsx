import React, { useState } from 'react';
import { 
  ScanSearch, 
  Layers, 
  Sliders, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Compass, 
  Crosshair,
  Maximize2
} from 'lucide-react';
import { 
  getCandidateDisplayName, 
  getConfidenceLevel,
  AI_CANDIDATE_STATUS,
  EXPERT_REVIEW_RECOMMENDATION,
  CONFIDENCE_SCORE_EXPLANATION,
  AI_DETECTION_EXPLANATION
} from '../services/api';

export default function DetectionResults({
  imagePreview,
  fileMeta,
  isLoading,
  apiError,
  detectionResults,
  selectedDetectionId,
  onSelectDetection,
  expertReviews = {},
  onUpdateReview
}) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(20); // 20% default threshold
  const [imgNaturalDims, setImgNaturalDims] = useState(null);

  const rawDetections = detectionResults?.detections || [];
  const hasResults = Boolean(detectionResults);

  // Dynamic threshold filtering (Requirement 3)
  const filteredDetections = rawDetections.filter(d => {
    const conf = (Number(d.confidence) || 0) * 100;
    return conf >= confidenceThreshold;
  });

  const handleSelectCandidate = (markerId) => {
    if (onSelectDetection) {
      onSelectDetection(markerId);
    }
    const mapEl = document.getElementById('hydrographic-survey-map');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Render bounding boxes over the image if results exist
  const renderBoundingBoxes = () => {
    if (!hasResults || filteredDetections.length === 0) return null;

    const natW = imgNaturalDims?.width || fileMeta?.naturalWidth || 800;
    const natH = imgNaturalDims?.height || fileMeta?.naturalHeight || 450;

    return filteredDetections.map((det, idx) => {
      const [x1, y1, x2, y2] = det.bbox || [0, 0, 0, 0];
      const isNormalized = (x2 <= 1.05 && y2 <= 1.05 && (x2 > 0 || y2 > 0));

      let leftPct = isNormalized ? x1 * 100 : (x1 / natW) * 100;
      let topPct = isNormalized ? y1 * 100 : (y1 / natH) * 100;
      let widthPct = isNormalized ? (x2 - x1) * 100 : ((x2 - x1) / natW) * 100;
      let heightPct = isNormalized ? (y2 - y1) * 100 : ((y2 - y1) / natH) * 100;

      leftPct = Math.max(0, Math.min(95, leftPct));
      topPct = Math.max(0, Math.min(95, topPct));
      widthPct = Math.max(2, Math.min(100 - leftPct, widthPct));
      heightPct = Math.max(2, Math.min(100 - topPct, heightPct));

      const confNum = Number(det.confidence) || 0;
      const confPct = (confNum * 100).toFixed(1);
      const candidateTitle = getCandidateDisplayName(det);
      const confLevel = getConfidenceLevel(det);
      const markerId = det.id ?? (idx + 1);
      const isSelected = selectedDetectionId === markerId;

      // Color coding according to 3 confidence levels
      let boxColor = 'border-sky-400 bg-sky-400/15 text-sky-300';
      if (confNum >= 0.70) {
        boxColor = 'border-emerald-400 bg-emerald-400/15 text-emerald-300';
      } else if (confNum < 0.40) {
        boxColor = 'border-amber-400 bg-amber-400/15 text-amber-300';
      }

      return (
        <div
          key={markerId}
          onClick={() => handleSelectCandidate(markerId)}
          className={`absolute border-2 rounded transition-all pointer-events-auto cursor-pointer ${boxColor} ${
            isSelected
              ? 'ring-2 ring-white border-white shadow-[0_0_20px_rgba(56,189,248,0.9)] z-30'
              : 'hover:border-white shadow-[0_0_12px_rgba(0,0,0,0.5)]'
          }`}
          style={{
            left: `${leftPct}%`,
            top: `${topPct}%`,
            width: `${widthPct}%`,
            height: `${heightPct}%`,
          }}
          title={`#${markerId} ${candidateTitle} (${confPct}%) • ${confLevel}`}
        >
          {/* Tag Label */}
          <div className="absolute -top-7 left-0 px-2 py-0.5 bg-slate-950/95 border border-slate-700 rounded text-[10px] font-mono font-bold shadow-md whitespace-nowrap flex items-center gap-1.5 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>#{markerId} {candidateTitle}</span>
            <span className="text-emerald-400">({confPct}%)</span>
          </div>

          {/* Corner marks */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-white" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-white" />
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-white" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-white" />
        </div>
      );
    });
  };

  return (
    <div id="ai-detection-section" className="saas-card p-5 sm:p-6 mb-6">
      {/* Top Breadcrumb (Requirement 3) */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 pb-4 border-b border-slate-100 mb-5 overflow-x-auto">
        <span className={imagePreview ? "text-slate-900 font-semibold" : "text-blue-600 font-bold"}>
          Image Input
        </span>
        <span className="text-slate-400">→</span>
        <span className={isLoading ? "text-blue-600 font-bold" : "text-slate-900 font-semibold"}>
          Preprocessing
        </span>
        <span className="text-slate-400">→</span>
        <span className={hasResults ? "text-blue-600 font-bold" : "text-slate-500"}>
          AI Detection
        </span>
        <span className="text-slate-400">→</span>
        <span className="text-slate-500">
          Expert Review
        </span>
      </div>

      {/* Main Section Layout: Left viewer (8 cols) + Right panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Large Sonar Image Viewer */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ScanSearch className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">
                Acoustic Sonar Viewer & Bounding Boxes
              </h3>
            </div>
            {hasResults && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                Showing {filteredDetections.length} of {rawDetections.length} Candidates
              </span>
            )}
          </div>

          {/* Dark Contrast Canvas Viewer */}
          <div className="relative min-h-[380px] rounded-xl border border-slate-300 bg-slate-950 flex flex-col items-center justify-center p-3 sonar-canvas-dark overflow-hidden">
            {hasResults && imagePreview ? (
              <div className="relative inline-block max-w-full overflow-hidden rounded-lg">
                <img
                  src={imagePreview}
                  alt="Analyzed Sonar Swath"
                  onLoad={(e) => setImgNaturalDims({ width: e.target.naturalWidth, height: e.target.naturalHeight })}
                  className="max-h-[460px] w-auto object-contain block mx-auto rounded border border-slate-800"
                />

                {/* Overlaid Real YOLO Bounding Boxes */}
                <div className="absolute inset-0 pointer-events-none">
                  {renderBoundingBoxes()}
                </div>

                {filteredDetections.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs max-w-xs text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                      <p className="font-semibold text-white">No candidates exceed {confidenceThreshold}% threshold</p>
                      <p className="text-[11px] text-slate-400 mt-1">Adjust the AI Detection Threshold slider to reveal lower-confidence anomalies.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 max-w-md">
                <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300 font-sans">
                  Awaiting Sonar Image Analysis
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a side-scan sonar image and click "Analyze Sonar" above to render bounding boxes directly onto acoustic anomaly targets.
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Palette: High-Contrast Marine Gray / Acoustic Sonar</span>
            <span>Method: {detectionResults?.inference_method || 'Tiled YOLO Object Detection'}</span>
          </div>
        </div>

        {/* RIGHT PANEL: AI Object Detection & Threshold Slider */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>AI Object Detection</span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Live YOLO
              </span>
            </div>

            {/* AI Detection Threshold Slider (Requirement 3) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <label htmlFor="detection-threshold-slider" className="flex items-center gap-1.5">
                  <span>AI Detection Threshold:</span>
                </label>
                <span className="font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                  {confidenceThreshold}%
                </span>
              </div>
              <input
                id="detection-threshold-slider"
                type="range"
                min="0"
                max="90"
                step="5"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0% (All Candidates)</span>
                <span>50%</span>
                <span>90% (Strict)</span>
              </div>
            </div>

            {/* Scientific Explanation Callout (Requirement 3) */}
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-1.5 mb-4">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px]">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>AI Detection Protocol:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {AI_DETECTION_EXPLANATION}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-100 text-[10px] font-mono font-bold">
                <span className="px-2 py-0.5 rounded bg-white text-blue-700 border border-blue-200">
                  AI-Predicted Candidate
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Expert Review Required
                </span>
              </div>
            </div>

            {/* Filtered Detections List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredDetections.length > 0 ? (
                filteredDetections.map((det, idx) => {
                  const markerId = det.id ?? (idx + 1);
                  const candidateTitle = getCandidateDisplayName(det);
                  const confNum = Number(det.confidence) || 0;
                  const confPct = `${(confNum * 100).toFixed(1)}%`;
                  const confLevel = getConfidenceLevel(det);
                  const currentStatus = expertReviews[markerId] || 'pending';
                  const isSelected = selectedDetectionId === markerId;

                  return (
                    <div
                      key={markerId}
                      onClick={() => handleSelectCandidate(markerId)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/50'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-[10px] border border-slate-200 shrink-0">
                            #{markerId}
                          </span>
                          <span className="font-bold text-slate-900 leading-tight">
                            {candidateTitle}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                          {confPct}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-100">
                        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${
                          confNum >= 0.70
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : confNum >= 0.40
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {confLevel}
                        </span>
                        <span className="text-slate-600 font-medium">
                          {currentStatus === 'confirmed' ? (
                            <strong className="text-emerald-600">Confirmed</strong>
                          ) : currentStatus === 'rejected' ? (
                            <strong className="text-red-600">Rejected</strong>
                          ) : (
                            <span className="text-amber-600">Review Required</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs font-mono text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  {hasResults 
                    ? `No candidates match current ${confidenceThreshold}% threshold`
                    : 'Awaiting model inference'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
