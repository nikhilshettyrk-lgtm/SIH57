import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  ScanSearch, 
  MapPin, 
  FileText, 
  Settings,
  ShieldCheck,
  Compass
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  candidateCount, 
  isVerified,
  hasResults
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'upload',
      label: 'Upload Sonar Image',
      icon: UploadCloud,
      badge: null
    },
    {
      id: 'detection',
      label: 'AI Detection',
      icon: ScanSearch,
      badge: hasResults && candidateCount > 0 ? `${candidateCount}` : null
    },
    {
      id: 'expert-review',
      label: 'Expert Review',
      icon: ShieldCheck,
      badge: hasResults && candidateCount > 0 ? 'Review' : null
    },
    {
      id: 'map',
      label: 'Detection Map',
      icon: Compass,
      badge: isVerified ? 'WGS84' : null
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      badge: null
    },
    {
      id: 'settings',
      label: 'Roles & Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-4rem)] relative z-20">
      {/* Navigation List */}
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          Main Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Platform & Telemetry Footer Card */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
        <div className="flex items-center justify-between font-semibold text-slate-800">
          <span>Survey System</span>
          <span className="text-[10px] font-mono text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded border border-blue-100">
            SIH 2026
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Automated Side-Scan Sonar Anomaly & Marine Debris Classification Engine.
        </p>
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Datum: WGS84</span>
          <span className="text-emerald-600 font-bold">● Active</span>
        </div>
      </div>
    </aside>
  );
}
