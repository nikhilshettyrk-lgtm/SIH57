import React from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Clock, 
  FileCheck,
  ShieldCheck,
  Info
} from 'lucide-react';
import { 
  getGeolocationState, 
  getCandidateDisplayName, 
  getConfidenceLevel,
  AI_CANDIDATE_STATUS
} from '../services/api';

export default function ReportsView({
  detectionResults,
  fileMeta,
  expertReviews = {},
  onDownloadPdfClick,
  onExportCsvClick
}) {
  const hasResults = Boolean(detectionResults);
  const detections = detectionResults?.detections || [];
  const geoState = getGeolocationState(detectionResults, fileMeta?.name);
  const isVerified = geoState.isVerified;
  const filename = detectionResults?.filename || fileMeta?.name || 'sonar_scan.png';

  const finalCount = detectionResults ? (detectionResults.final_detection_count ?? detectionResults.count ?? detections.length) : 0;
  const higherConfCount = detections.filter(d => (Number(d.confidence) || 0) >= 0.70).length;
  const moderateConfCount = detections.filter(d => {
    const c = Number(d.confidence) || 0;
    return c >= 0.40 && c < 0.70;
  }).length;
  const lowConfCount = detections.filter(d => (Number(d.confidence) || 0) < 0.40).length;

  const confirmedCount = Object.values(expertReviews).filter(s => s === 'confirmed').length;
  const rejectedCount = Object.values(expertReviews).filter(s => s === 'rejected').length;
  const pendingCount = detections.length - (confirmedCount + rejectedCount);

  // Group candidate classes
  const classBreakdown = {};
  detections.forEach(d => {
    const name = getCandidateDisplayName(d);
    classBreakdown[name] = (classBreakdown[name] || 0) + 1;
  });

  const currentDateStr = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div id="reports-section" className="saas-card p-5 sm:p-6 mb-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Stage 5: Survey Anomaly Reporting
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                SIH Pillar 4: Anomaly Reporting
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate structured hydrographic survey audit documentation with telemetry, candidate anomaly classifications, and GPS coordinates.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExportCsvClick}
            disabled={!hasResults}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
              hasResults
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs cursor-pointer'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download CSV</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdfClick}
            disabled={!hasResults}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-all ${
              hasResults
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {!hasResults ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700 font-sans">
            No analysis results available for export
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload a sonar swath in the Upload section and run AI detection to compile a formal survey report.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Survey Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Analyzed Filename
              </span>
              <span className="text-xs font-bold text-slate-900 mt-1 block truncate font-mono" title={filename}>
                {filename}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Analysis Date & Time
              </span>
              <span className="text-xs font-semibold text-slate-900 mt-1 block">
                {currentDateStr}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Total AI Candidates
              </span>
              <span className="text-xs font-bold text-blue-700 mt-1 block font-mono">
                {finalCount} {finalCount === 1 ? 'Candidate' : 'Candidates'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Geolocation Status
              </span>
              <span className={`text-xs font-bold mt-1 block ${
                isVerified ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {geoState.statusLabel} ({isVerified ? 'WGS84' : 'Unavailable'})
              </span>
            </div>
          </div>

          {/* Confidence Summary & Expert Review Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Confidence Summary Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3">
                Confidence Summary
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Higher Confidence Candidates (≥ 70%):</span>
                  <span className="font-bold text-emerald-700 font-mono">{higherConfCount}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Moderate Confidence Candidates (40%–69.9%):</span>
                  <span className="font-bold text-sky-700 font-mono">{moderateConfCount}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">Low Confidence Candidates (&lt; 40%):</span>
                  <span className="font-bold text-amber-700 font-mono">{lowConfCount}</span>
                </div>
              </div>
            </div>

            {/* Expert Review Status Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3">
                Expert Review Status
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Expert Confirmed:</span>
                  <span className="font-bold text-emerald-700 font-mono">{confirmedCount}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Expert Rejected:</span>
                  <span className="font-bold text-red-700 font-mono">{rejectedCount}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">Pending Human Verification:</span>
                  <span className="font-bold text-amber-700 font-mono">{pendingCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Classes Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-mono text-xs font-bold text-slate-700">
              Candidate Classes & Acoustic Anomaly Categories
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(classBreakdown).map(([cName, cCount]) => (
                  <span key={cName} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
                    <span>{cName}:</span>
                    <strong className="font-mono">{cCount}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Real WGS84 Coordinates Table when available (Requirement 7) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-mono text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Geospatial Target Positions {isVerified ? '(WGS84 Coordinates)' : '(Location Unavailable)'}</span>
              <span className="text-[11px] text-slate-500 font-normal">Source: {geoState.source}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Candidate Name</th>
                    <th className="px-4 py-2">Confidence</th>
                    <th className="px-4 py-2">Latitude</th>
                    <th className="px-4 py-2">Longitude</th>
                    <th className="px-4 py-2">Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detections.map((d, i) => {
                    const markerId = d.id ?? (i + 1);
                    const lat = d.latitude;
                    const lon = d.longitude;
                    const hasCoord = isVerified && lat != null && lon != null;
                    const review = expertReviews[markerId] || 'pending';

                    return (
                      <tr key={markerId} className="hover:bg-slate-50/70">
                        <td className="px-4 py-2.5 font-bold text-slate-900">#{markerId}</td>
                        <td className="px-4 py-2.5 font-sans font-semibold text-slate-800">{getCandidateDisplayName(d)}</td>
                        <td className="px-4 py-2.5 text-blue-700 font-bold">{((Number(d.confidence) || 0) * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2.5 text-slate-600">{hasCoord ? Number(lat).toFixed(6) : 'Not available'}</td>
                        <td className="px-4 py-2.5 text-slate-600">{hasCoord ? Number(lon).toFixed(6) : 'Not available'}</td>
                        <td className="px-4 py-2.5">
                          {review === 'confirmed' ? (
                            <span className="text-emerald-700 font-semibold font-sans">Confirmed</span>
                          ) : review === 'rejected' ? (
                            <span className="text-red-700 font-semibold font-sans">Rejected</span>
                          ) : (
                            <span className="text-amber-700 font-sans">Pending</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disclaimer (Requirement 9) */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed font-sans">
            <strong className="text-slate-800 font-semibold">Scientific Disclaimer: </strong>
            AI detections are candidate anomalies and require expert validation. Confidence scores represent statistical pattern matching against acoustic sonar features and do not represent verified physical target composition.
          </div>
        </div>
      )}
    </div>
  );
}
