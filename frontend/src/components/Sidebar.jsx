import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  ScanSearch, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Settings,
  Compass,
  CheckCircle2
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
      label: 'Dashboard Overview',
      subtitle: '4 SIH Pillars Matrix',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'upload',
      label: '1. Upload Sonar',
      subtitle: 'Sonar & GeoTIFF Ingestion',
      icon: UploadCloud,
      badge: null
    },
    {
      id: 'detection',
      label: '2. AI Detection',
      subtitle: 'SIH Pillar 1: Object Det.',
      icon: ScanSearch,
      badge: hasResults && candidateCount > 0 ? `${candidateCount}` : null
    },
    {
      id: 'validation',
      label: '3. Anomaly Validation',
      subtitle: 'SIH Pillar 2: Noise Filter',
      icon: ShieldCheck,
      badge: hasResults && candidateCount > 0 ? 'Review' : null
    },
    {
      id: 'geotagging',
      label: '4. Geotagging',
      subtitle: 'SIH Pillar 3: WGS84 GIS',
      icon: Compass,
      badge: isVerified ? 'WGS84' : null
    },
    {
      id: 'reporting',
      label: '5. Reporting',
      subtitle: 'SIH Pillar 4: Anomaly Audit',
      icon: FileText,
      badge: null
    },
    {
      id: 'settings',
      label: 'Roles & Settings',
      subtitle: 'System Configuration',
      icon: Settings,
      badge: null
    }
  ];

  // Helper to normalize active tab matching
  const isItemActive = (itemId) => {
    if (activeTab === itemId) return true;
    if (itemId === 'validation' && activeTab === 'expert-review') return true;
    if (itemId === 'geotagging' && activeTab === 'map') return true;
    if (itemId === 'reporting' && activeTab === 'reports') return true;
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-4rem)] relative z-20">
      {/* Navigation List */}
      <div className="space-y-1">
        <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          <span>SIH Workflow Pipeline</span>
          <span className="text-blue-600">5 Stages</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold leading-tight truncate">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1 ${
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
          <span className="font-mono text-[11px]">SIH 2026 Platform</span>
          <span className="text-[10px] font-mono text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded border border-blue-100 font-bold">
            PS: Marine Debris
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Automated Side-Scan Sonar Object Detection, Noise Filter, Geotagging & Reporting.
        </p>
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Datum: WGS84</span>
          <span className="text-emerald-600 font-bold">● Active Engine</span>
        </div>
      </div>
    </aside>
  );
}
