import React from 'react';
import { Target, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function DetectionSummaryCards({ detectionResults, isLoading }) {
  const detections = detectionResults?.detections || [];
  const hasData = Boolean(detectionResults);

  // Real values calculated directly from API detections
  const totalCandidates = hasData 
    ? (detectionResults.final_detection_count ?? detectionResults.count ?? detections.length) 
    : 0;

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

  const cards = [
    {
      label: 'Total Candidates',
      value: isLoading ? '...' : hasData ? totalCandidates : '--',
      subtext: hasData ? (totalCandidates === 1 ? '1 acoustic target' : `${totalCandidates} acoustic targets`) : 'Awaiting image analysis',
      icon: Target,
      iconBg: 'bg-blue-50 text-blue-600',
      badge: hasData ? 'Real API Count' : 'Standby',
      badgeColor: hasData ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'
    },
    {
      label: 'Higher Confidence',
      value: isLoading ? '...' : hasData ? higherConfCount : '--',
      subtext: 'Score ≥ 70% detection threshold',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: '≥ 70%',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      label: 'Moderate Confidence',
      value: isLoading ? '...' : hasData ? moderateConfCount : '--',
      subtext: 'Score between 40% and 69.9%',
      icon: AlertTriangle,
      iconBg: 'bg-sky-50 text-sky-600',
      badge: '40%–69.9%',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      label: 'Needs Expert Review',
      value: isLoading ? '...' : hasData ? (lowConfCount > 0 ? lowConfCount : totalCandidates) : '--',
      subtext: 'Human verification recommended',
      icon: ShieldAlert,
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'Expert Review Required',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className="saas-card saas-card-hover p-4 sm:p-5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-mono tracking-tight">
                  {card.value}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 truncate text-[11px]">
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
  );
}
