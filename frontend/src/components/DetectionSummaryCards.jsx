import React from 'react';
import { 
  ScanSearch, 
  Sliders, 
  Compass, 
  FileSpreadsheet, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { getGeolocationState } from '../services/api';

/**
 * DetectionSummaryCards
 * 
 * Directly represents the 4 Core SIH Requirements:
 * 1. Object Detection (Automated YOLO inference & acoustic anomaly discovery)
 * 2. Confidence & Noise Filtering (Threshold gating & acoustic speckle discrimination)
 * 3. Hydrographic Geotagging (WGS84 coordinate calculation from georeferenced GeoTIFF)
 * 4. Anomaly Reporting (Analyst verification audit trail, CSV & PDF report generation)
 */
export default function DetectionSummaryCards({ 
  detectionResults, 
  isLoading, 
  expertReviews = {} 
}) {
  const detections = Array.isArray(detectionResults?.detections) ? detectionResults.detections : [];
  const hasData = Boolean(detectionResults);
  const geoState = getGeolocationState(detectionResults);

  // Requirement 1: Object Detection counts
  const totalCandidates = hasData 
    ? (detectionResults.final_detection_count ?? detectionResults.count ?? detections.length) 
    : 0;

  // Requirement 2: Confidence & Noise Filtering breakdown
  const higherConfCount = hasData
    ? detections.filter(d => (Number(d.confidence) || 0) >= 0.70).length
    : 0;

  const moderateConfCount = hasData
    ? detections.filter(d => {
        const c = Number(d.confidence) || 0;
        return c >= 0.40 && c < 0.70;
      }).length
    : 0;

  const lowConfCount = hasData
    ? detections.filter(d => (Number(d.confidence) || 0) < 0.40).length
    : 0;

  // Requirement 3: Geotagging status
  const isGeoreferenced = geoState.isVerified;
  const coordSystem = geoState.coordinateSystem || 'WGS84';
  const coordsSummary = isGeoreferenced && geoState.primaryLatitude != null
    ? `${geoState.primaryLatitude.toFixed(4)}°, ${geoState.primaryLongitude.toFixed(4)}°`
    : 'No GPS Metadata';

  // Requirement 4: Anomaly Reporting review counts
  const confirmedCount = Object.values(expertReviews).filter(s => s === 'confirmed').length;
  const rejectedCount = Object.values(expertReviews).filter(s => s === 'rejected').length;

  const cards = [
    {
      pillarNum: 'Pillar 1',
      sihReq: 'SIH Requirement 1',
      label: 'Object Detection',
      value: isLoading ? '...' : hasData ? totalCandidates : '--',
      unit: hasData ? (totalCandidates === 1 ? 'Candidate' : 'Candidates') : '',
      subtext: hasData ? 'YOLO Tiled SSS Inference' : 'Awaiting sonar ingestion',
      icon: ScanSearch,
      iconBg: 'bg-blue-50 text-blue-600',
      badge: hasData ? 'Real AI Count' : 'Standby',
      badgeColor: hasData ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'
    },
    {
      pillarNum: 'Pillar 2',
      sihReq: 'SIH Requirement 2',
      label: 'Confidence & Noise Filter',
      value: isLoading ? '...' : hasData ? higherConfCount : '--',
      unit: hasData ? 'High Confidence (≥70%)' : '',
      subtext: hasData 
        ? `${moderateConfCount} Mod (40–69%) • ${lowConfCount} Low/Noise` 
        : 'Speckle noise discrimination',
      icon: Sliders,
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: hasData ? `${higherConfCount}/${totalCandidates} ≥ 70%` : 'Active Filter',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      pillarNum: 'Pillar 3',
      sihReq: 'SIH Requirement 3',
      label: 'Hydrographic Geotagging',
      value: isLoading ? '...' : hasData ? (isGeoreferenced ? coordSystem : 'Unreferenced') : '--',
      unit: isGeoreferenced ? 'Real WGS84 GeoTIFF' : (hasData ? 'Image Scan' : ''),
      subtext: isGeoreferenced ? `Fix: ${coordsSummary}` : 'Upload GeoTIFF for real GPS coordinates',
      icon: Compass,
      iconBg: isGeoreferenced ? 'bg-cyan-50 text-cyan-600' : 'bg-amber-50 text-amber-600',
      badge: isGeoreferenced ? 'WGS84 Available' : 'No Geodata',
      badgeColor: isGeoreferenced 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : 'bg-slate-100 text-slate-600 border-slate-200'
    },
    {
      pillarNum: 'Pillar 4',
      sihReq: 'SIH Requirement 4',
      label: 'Anomaly Reporting',
      value: isLoading ? '...' : hasData ? (confirmedCount > 0 ? `${confirmedCount} Confirmed` : 'Ready') : '--',
      unit: hasData ? `${detections.length} Staged Targets` : '',
      subtext: hasData 
        ? (confirmedCount > 0 ? `${confirmedCount} confirmed, ${rejectedCount} rejected` : 'CSV & PDF export ready') 
        : 'Survey audit report generator',
      icon: FileSpreadsheet,
      iconBg: 'bg-purple-50 text-purple-600',
      badge: hasData ? 'Audit Telemetry' : 'Standby',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  return (
    <div className="mb-6">
      {/* 4 SIH Requirements Header Bar */}
      <div className="flex items-center justify-between gap-2 px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase font-mono tracking-wider text-slate-500">
            SIH Problem Statement Core Requirements Matrix
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          Object Detection • Noise Filtering • Geotagging • Anomaly Reporting
        </span>
      </div>

      {/* 4 SIH Pillar Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="saas-card saas-card-hover p-4 sm:p-5 flex flex-col justify-between"
            >
              <div>
                {/* SIH Pillar Badge & Icon */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                    {card.sihReq}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-600">
                  {card.label}
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-xs text-slate-500 font-medium truncate">
                      {card.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 truncate text-[11px] max-w-[170px]" title={card.subtext}>
                  {card.subtext}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold shrink-0 ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
