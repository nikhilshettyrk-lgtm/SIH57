import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Compass, 
  MapPin, 
  Crosshair, 
  ShieldCheck, 
  AlertTriangle, 
  Info,
  Check,
  X
} from 'lucide-react';
import { 
  getGeolocationState, 
  getCandidateDisplayName, 
  getConfidenceLevel,
  AI_CANDIDATE_STATUS
} from '../services/api';

export default function HydrographicMap({ 
  detectionResults, 
  isLoading, 
  selectedDetectionId, 
  onSelectDetection,
  expertReviews = {},
  onUpdateReview
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const markersMapRef = useRef({});
  const polylineRef = useRef(null);

  const rawDetections = Array.isArray(detectionResults?.detections) ? detectionResults.detections : [];
  const isRealGeoreferenced = String(detectionResults?.geolocation_status || '').trim().toUpperCase() === 'REAL_GEOREFERENCED';
  
  // Extract detections with valid real geographic coordinates strictly from latitude and longitude
  const validDetections = rawDetections.map((d, idx) => {
    const lat = d.latitude;
    const lon = d.longitude;
    if (lat != null && lon != null && !isNaN(Number(lat)) && !isNaN(Number(lon))) {
      return {
        ...d,
        id: d.id ?? (idx + 1),
        latitude: Number(lat),
        longitude: Number(lon),
        location: { latitude: Number(lat), longitude: Number(lon) }
      };
    }
    return null;
  }).filter(Boolean);

  const hasCoordinates = isRealGeoreferenced && validDetections.length > 0;
  const coordinateSystem = detectionResults?.coordinate_system || 'WGS84';
  const source = isRealGeoreferenced 
    ? (detectionResults?.source || 'GeoTIFF metadata') 
    : 'User-uploaded sonar image';

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultLat = hasCoordinates ? validDetections[0].latitude : 20.0;
      const defaultLng = hasCoordinates ? validDetections[0].longitude : 0.0;
      const defaultZoom = hasCoordinates ? 14 : 2;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: true
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove previous markers & survey lines
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    markersMapRef.current = {};

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Only plot real coordinates returned by FastAPI backend
    if (hasCoordinates) {
      const boundsCoords = [];

      validDetections.forEach((det, idx) => {
        const lat = Number(det.latitude);
        const lng = Number(det.longitude);
        boundsCoords.push([lat, lng]);

        const confNum = Number(det.confidence) || 0;
        const confPct = (confNum * 100).toFixed(1);
        const markerId = det.id ?? (idx + 1);
        const candidateTitle = getCandidateDisplayName(det);
        const confLevel = getConfidenceLevel(det);
        const currentReview = expertReviews[markerId] || 'pending';

        // Different visual marker states based on confidence
        let themeColor = '#10b981'; // emerald
        let themeBorder = '#059669';
        let pinColorClass = 'bg-emerald-500';

        if (confNum >= 0.70) {
          themeColor = '#10b981';
          themeBorder = '#059669';
          pinColorClass = 'bg-emerald-600';
        } else if (confNum >= 0.40) {
          themeColor = '#0284c7';
          themeBorder = '#0369a1';
          pinColorClass = 'bg-sky-600';
        } else {
          themeColor = '#d97706';
          themeBorder = '#b45309';
          pinColorClass = 'bg-amber-600';
        }

        const customIcon = L.divIcon({
          className: `sonar-map-marker marker-det-${markerId}`,
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${themeColor}33; border: 1.5px solid ${themeColor}; animation: pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: #ffffff; border: 2.5px solid ${themeBorder}; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.25); font-family: monospace; font-size: 11px; font-weight: bold; color: ${themeBorder};">
                ${markerId}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        // Popup HTML satisfying Requirement 5
        const popupContainer = document.createElement('div');
        popupContainer.className = 'font-sans text-xs text-slate-800 p-1 min-w-[260px]';
        popupContainer.innerHTML = `
          <div style="font-size: 10px; font-weight: bold; color: #0284c7; text-transform: uppercase; margin-bottom: 4px; font-family: monospace;">
            Estimated target position from georeferenced sonar
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 6px;">
            ${candidateTitle}
          </div>
          <div style="font-size: 11px; line-height: 1.65; color: #475569; font-family: monospace; margin-bottom: 8px;">
            <div><strong>Candidate Name:</strong> <span style="color: #0f172a; font-weight: bold;">${candidateTitle}</span></div>
            <div><strong>Confidence:</strong> <span style="color: #0f172a; font-weight: bold;">${confPct}%</span></div>
            <div><strong>Confidence Level:</strong> <span style="color: #0f172a; font-weight: bold;">${confLevel}</span></div>
            <div><strong>Latitude:</strong> <span style="color: #0f172a; font-weight: bold;">${lat.toFixed(6)}°</span></div>
            <div><strong>Longitude:</strong> <span style="color: #0f172a; font-weight: bold;">${lng.toFixed(6)}°</span></div>
            <div style="margin-top: 4px; padding: 2px 6px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; color: #1d4ed8; font-weight: bold; text-align: center;">
              AI-Predicted Candidate
            </div>
            <div style="margin-top: 4px; padding: 2px 6px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 4px; color: #b45309; font-weight: bold; text-align: center;">
              Expert Review Required
            </div>
          </div>
          <div style="display: flex; gap: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <button id="popup-reject-${markerId}" style="flex: 1; padding: 5px 8px; font-size: 11px; font-weight: bold; border-radius: 6px; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; cursor: pointer;">
              Reject
            </button>
            <button id="popup-confirm-${markerId}" style="flex: 1; padding: 5px 8px; font-size: 11px; font-weight: bold; border-radius: 6px; background: #2563eb; color: #ffffff; border: 1px solid #1d4ed8; cursor: pointer;">
              Confirm
            </button>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContainer, {
          className: 'ocean-leaflet-popup',
          closeButton: true
        });

        marker.on('popupopen', () => {
          const btnReject = document.getElementById(`popup-reject-${markerId}`);
          const btnConfirm = document.getElementById(`popup-confirm-${markerId}`);
          if (btnReject) {
            btnReject.onclick = () => onUpdateReview?.(markerId, 'rejected');
          }
          if (btnConfirm) {
            btnConfirm.onclick = () => onUpdateReview?.(markerId, 'confirmed');
          }
        });

        marker.on('click', () => {
          if (onSelectDetection) onSelectDetection(markerId);
        });

        markersRef.current.push(marker);
        markersMapRef.current[markerId] = marker;
      });

      // Survey track line if provided
      const surveyTrackPoints = detectionResults?.survey_track || detectionResults?.track_line || detectionResults?.survey_line;
      if (Array.isArray(surveyTrackPoints) && surveyTrackPoints.length > 1) {
        polylineRef.current = L.polyline(surveyTrackPoints, {
          color: '#2563eb',
          weight: 2,
          dashArray: '4, 6'
        }).addTo(map);
      }

      // Automatically fit map to returned detection markers (Requirement 3 & 4)
      if (boundsCoords.length === 1) {
        map.setView(boundsCoords[0], 15, { animate: true });
      } else if (boundsCoords.length > 1) {
        map.fitBounds(L.latLngBounds(boundsCoords), { padding: [50, 50], maxZoom: 16 });
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [hasCoordinates, validDetections, source, coordinateSystem, isRealGeoreferenced]);

  // Synchronize: Open corresponding marker when selectedDetectionId changes
  useEffect(() => {
    if (selectedDetectionId != null && markersMapRef.current[selectedDetectionId]) {
      const targetMarker = markersMapRef.current[selectedDetectionId];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(targetMarker.getLatLng(), 16, { animate: true });
      }
      targetMarker.openPopup();
    }
  }, [selectedDetectionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div id="hydrographic-survey-map" className="saas-card p-5 sm:p-6 mb-6">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Detection Map
              </h3>
              {hasCoordinates && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  {validDetections.length} Active {validDetections.length === 1 ? 'Target' : 'Targets'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasCoordinates 
                ? "Detection positions calculated from georeferenced sonar imagery."
                : "Geospatial positions available only when analyzing georeferenced sonar files."}
            </p>
          </div>
        </div>

        {/* Real Georeferenced Status Badges (Requirement 1 & 4) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {hasCoordinates ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200 font-semibold">
                <strong className="text-slate-500 font-normal">Coordinate System:</strong> {coordinateSystem}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>REAL GEOREFERENCED DATA</span>
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
              <span>Geospatial Data Not Available</span>
            </span>
          )}
        </div>
      </div>

      {/* Small Status Panel (Requirement 4) */}
      <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-700">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {hasCoordinates 
              ? "Detection positions calculated from georeferenced sonar imagery." 
              : "Geospatial Data Not Available"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Coordinate System: <strong className="text-slate-900">{hasCoordinates ? coordinateSystem : 'Not available'}</strong></span>
          <span className="text-slate-300">•</span>
          <span className={hasCoordinates ? "text-emerald-700 font-bold uppercase tracking-wider" : "text-slate-500"}>
            {hasCoordinates ? "REAL GEOREFERENCED DATA" : "Awaiting Georeferenced Survey Swath"}
          </span>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-100 min-h-[360px] sm:min-h-[440px] shadow-xs">
        <div
          ref={mapContainerRef}
          className="w-full h-[360px] sm:h-[440px] z-10"
        />

        {/* Ambient overlay when no coordinates are available (Requirement 7) */}
        {!hasCoordinates && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3 shadow-lg">
              <MapPin className="w-7 h-7 text-slate-300" />
            </div>
            <h4 className="text-base font-bold font-sans text-white mb-1">
              Geospatial Data Not Available
            </h4>
            <p className="text-xs text-slate-300 max-w-sm font-sans leading-relaxed">
              Upload a georeferenced GeoTIFF to display real detection positions.
            </p>
          </div>
        )}

        {/* Real Coordinates HUD Overlay when coordinates exist */}
        {hasCoordinates && (
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-200 shadow-md text-xs font-mono text-slate-800 pointer-events-none space-y-0.5">
            <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-blue-600" />
              <span>Fix: {validDetections[0].latitude.toFixed(6)}°, {validDetections[0].longitude.toFixed(6)}°</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Coordinate System: {coordinateSystem} • REAL GEOREFERENCED DATA
            </div>
          </div>
        )}
      </div>

      {/* Map Footer & Legend (Requirement 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 text-xs font-mono border-t border-slate-100 text-slate-500">
        {/* Confidence Levels Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Confidence Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-slate-700 font-medium text-[11px]">Higher Confidence (≥ 70%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span className="text-slate-700 font-medium text-[11px]">Moderate Confidence (40%–69.9%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span className="text-slate-700 font-medium text-[11px]">Low Confidence (&lt; 40%)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Source: <strong className="text-slate-700">{source}</strong> | Coordinate System: <strong className="text-slate-700">{coordinateSystem}</strong>
        </div>
      </div>
    </div>
  );
}
