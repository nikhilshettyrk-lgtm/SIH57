import { jsPDF } from 'jspdf';

/**
 * Marine Debris AI Detector - API Client Service
 * 
 * Connected to live FastAPI YOLO backend (/analyze)
 * Base URL configurable via VITE_API_URL or VITE_API_BASE_URL
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 
                            import.meta.env.VITE_API_BASE_URL || 
                            'https://quail-fried-wafer.ngrok-free.dev';

/**
 * Upload sonar image/GeoTIFF for real YOLO inference
 * Dispatches multipart/form-data with field name "file" to POST /analyze
 * 
 * @param {File|Blob} imageFile - Uploaded sonar recording or GeoTIFF
 * @returns {Promise<Object>} Live JSON response from FastAPI
 */
export async function analyzeSonarImage(imageFile) {
  if (!imageFile) {
    throw new Error('No sonar image file provided for analysis.');
  }

  const formData = new FormData();
  const fileName = imageFile.name || 'sonar_scan.png';
  formData.append('file', imageFile, fileName);

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      let errorDetail = 'Sonar analysis failed. Please try again.';
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        const text = await response.text();
        if (text) errorDetail = `Sonar analysis failed: ${text.slice(0, 120)}`;
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();

    console.log("Geolocation status:", data.geolocation_status);
    console.log("Coordinate system:", data.coordinate_system);
    console.log("Detections:", data.detections);
    console.log("Detection coordinates:",
      Array.isArray(data.detections) ? data.detections.map(d => ({
        latitude: d.latitude,
        longitude: d.longitude
      })) : []
    );

    return data;
  } catch (error) {
    if (
      error.name === 'TypeError' && 
      (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))
    ) {
      throw new Error('Unable to connect to AI inference server.');
    }
    throw new Error(error.message || 'Sonar analysis failed. Please try again.');
  }
}

/**
 * Download sonar analysis report as a formatted PDF
 * @param {string} filename - Source image name
 * @param {Object} results - Real FastAPI /analyze response
 */
/**
 * Export analysis results directly as a structured CSV file
 * @param {string} filename - Source image name
 * @param {Object} results - Real FastAPI /analyze response
 */
export function exportAnalysisCSV(filename, results) {
  if (!results) {
    throw new Error("No analysis results available to export CSV.");
  }

  const geoState = getGeolocationState(results);
  const detections = results.detections || [];
  const sourceName = results.filename || filename || "sonar_scan.png";
  const geolocationStatus = geoState.statusLabel || "Geospatial Data Not Available";

  const headers = [
    "Source filename",
    "Candidate name",
    "Original model class",
    "Confidence percentage",
    "Confidence level",
    "Latitude",
    "Longitude",
    "Geolocation status",
    "Expert review status",
    "Bounding box coordinates"
  ];

  const escapeCSV = (val) => {
    if (val == null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = [];

  if (detections.length === 0) {
    rows.push([
      sourceName,
      "None",
      "none",
      "0.0%",
      "N/A",
      "Not available",
      "Not available",
      geolocationStatus,
      "AI-Predicted Candidate",
      "[]"
    ].map(escapeCSV).join(','));
  } else {
    detections.forEach((det, idx) => {
      const candidateTitle = getCandidateDisplayName(det);
      const rawClass = det.class || 'unknown';
      const confNum = Number(det.confidence) || 0;
      const confPct = `${(confNum * 100).toFixed(1)}%`;
      const confLevel = getConfidenceLevel(det);

      const latVal = det.latitude;
      const lonVal = det.longitude;
      const hasCoord = geoState.isVerified && latVal != null && lonVal != null;
      const latStr = hasCoord ? Number(latVal).toFixed(6) : "Not available";
      const lonStr = hasCoord ? Number(lonVal).toFixed(6) : "Not available";

      const expertReviewStatus = "AI-Predicted Candidate";
      const bboxStr = Array.isArray(det.bbox)
        ? `[${det.bbox.map(n => (typeof n === 'number' ? n.toFixed(2) : n)).join(', ')}]`
        : "Not available";

      rows.push([
        sourceName,
        candidateTitle,
        rawClass,
        confPct,
        confLevel,
        latStr,
        lonStr,
        geolocationStatus,
        expertReviewStatus,
        bboxStr
      ].map(escapeCSV).join(','));
    });
  }

  const csvContent = "\uFEFF" + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const cleanBase = sourceName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `marine_sonar_detections_${cleanBase}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Download sonar analysis report as a formatted PDF for SIH Demonstration
 * @param {string} filename - Source image name
 * @param {Object} results - Real FastAPI /analyze response
 */
export async function downloadAnalysisReport(filename, results) {
  if (!results) {
    throw new Error("No analysis results available to generate a report.");
  }

  const geoState = getGeolocationState(results);
  const detections = results.detections || [];
  const sourceName = results.filename || filename || "sonar_scan.png";
  const inferenceMethod = results.inference_method || "Tiled 1000×1000 YOLO Inference";
  const rawCount = results.raw_detection_count;
  const finalCount = results.final_detection_count ?? results.count ?? detections.length;
  const geolocationStatus = geoState.statusLabel || "Geospatial Data Not Available";
  const geolocationSource = geoState.source || "User-uploaded sonar image";
  const coordinateSystem = geoState.coordinateSystem || "Not available";

  // Summary counts by confidence tier
  let higherCount = 0;
  let moderateCount = 0;
  let lowCount = 0;
  detections.forEach(d => {
    const c = Number(d.confidence) || 0;
    if (c >= 0.70) higherCount++;
    else if (c >= 0.40) moderateCount++;
    else lowCount++;
  });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const leftMargin = 16;
  const rightMargin = 16;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  let currentY = 16;

  // Header Banner
  doc.setFillColor(7, 19, 38); // Deep ocean navy #071326
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line under header
  doc.setFillColor(0, 229, 255); // Sonar cyan #00E5FF
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Header Title - Marine Sonar AI Detection Report
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Marine Sonar AI Detection Report', leftMargin, 13);

  // Header Subtitle
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Side-Scan Sonar Telemetry & Candidate Anomaly Report • SIH Demonstration', leftMargin, 20);

  // Generated timestamp (top right)
  const now = new Date();
  const timeStr = `${now.toISOString().replace('T', ' ').substring(0, 19)} UTC`;
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFontSize(8);
  doc.text(`Generated: ${timeStr}`, pageWidth - rightMargin, 14, { align: 'right' });
  doc.text('Assessment: AI Detection Candidate', pageWidth - rightMargin, 20, { align: 'right' });

  currentY = 36;

  // Section 1: Survey & Inference Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('1. SURVEY & INFERENCE METADATA', leftMargin, currentY);
  currentY += 4;

  // Metadata Card Box
  const metaBoxHeight = 48;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, currentY, contentWidth, metaBoxHeight, 2, 2, 'FD');

  const metaStartY = currentY + 7;
  const col1X = leftMargin + 6;
  const col2X = leftMargin + 96;

  doc.setFontSize(9);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Source Filename:', col1X, metaStartY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const truncatedFilename = sourceName.length > 36 ? sourceName.substring(0, 34) + '...' : sourceName;
  doc.text(truncatedFilename, col1X + 32, metaStartY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Analysis Method:', col2X, metaStartY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(inferenceMethod, col2X + 32, metaStartY);

  // Row 2
  const row2Y = metaStartY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Candidates:', col1X, row2Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const countText = rawCount != null && rawCount !== finalCount
    ? `${finalCount} AI-predicted candidates (${rawCount} raw detections)`
    : `${finalCount} AI-predicted candidate${finalCount === 1 ? '' : 's'}`;
  doc.text(countText, col1X + 32, row2Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Geolocation Status:', col2X, row2Y);
  if (geoState.isVerified) {
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.setFont('helvetica', 'bold');
  } else {
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.setFont('helvetica', 'bold');
  }
  doc.text(geolocationStatus, col2X + 32, row2Y);

  // Row 3
  const row3Y = metaStartY + 16;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Geolocation Source:', col1X, row3Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(geolocationSource, col1X + 32, row3Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Coordinate System:', col2X, row3Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(coordinateSystem, col2X + 32, row3Y);

  // Row 4
  const row4Y = metaStartY + 24;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Primary Coordinates:', col1X, row4Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const fixText = geoState.isVerified && geoState.primaryLatitude != null && geoState.primaryLongitude != null
    ? `${geoState.primaryLatitude.toFixed(6)}°, ${geoState.primaryLongitude.toFixed(6)}°`
    : 'Latitude: Not available, Longitude: Not available';
  doc.text(fixText, col1X + 35, row4Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Detection Summary:', col2X, row4Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${higherCount} Higher • ${moderateCount} Moderate • ${lowCount} Review`, col2X + 32, row4Y);

  // Row 5
  const row5Y = metaStartY + 32;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Sensor Swath:', col1X, row5Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('Side-Scan Sonar (Dual 455/900 kHz)', col1X + 32, row5Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Review Status:', col2X, row5Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(146, 64, 14);
  doc.text('AI-Predicted Candidate', col2X + 32, row5Y);

  currentY += metaBoxHeight + 7;

  // Section 2: Scientific Disclaimer & Governance Box (REQUIRED)
  doc.setFillColor(254, 252, 232); // Amber 50
  doc.setDrawColor(251, 191, 36); // Amber 400
  doc.setLineWidth(0.6);
  doc.roundedRect(leftMargin, currentY, contentWidth, 26, 2, 2, 'FD');

  // Left accent bar
  doc.setFillColor(217, 119, 6); // Amber 600
  doc.rect(leftMargin, currentY, 3, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text('SCIENTIFIC ADVISORY & EXPERT REVIEW DISCLAIMER', leftMargin + 6, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 53, 15); // Amber 900
  doc.text('AI identifies candidate regions based on learned sonar-image patterns. The result is a candidate detection and requires expert review.', leftMargin + 6, currentY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text('Confidence indicates the model\'s detection score. It does not represent confirmed object identity.', leftMargin + 6, currentY + 17);
  doc.text('Expert review status: AI-Predicted Candidate — Human verification recommended before final identification.', leftMargin + 6, currentY + 22);

  currentY += 32;

  // Section 3: Detailed Detection Log
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`2. DETECTION SUMMARY & CANDIDATE LOG (${finalCount})`, leftMargin, currentY);
  currentY += 5;

  if (detections.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(leftMargin, currentY, contentWidth, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No candidate anomalies detected in this sonar swath exceeding threshold cutoff.', leftMargin + 6, currentY + 10);
    currentY += 24;
  } else {
    // Render each detection item
    detections.forEach((det, idx) => {
      const markerId = det.id ?? (idx + 1);
      const candidateName = getCandidateDisplayName(det);
      const confNum = Number(det.confidence) || 0;
      const confPct = `${(confNum * 100).toFixed(1)}%`;
      const confLevel = getConfidenceLevel(det);
      
      const latVal = det.latitude;
      const lonVal = det.longitude;
      const hasCoord = geoState.isVerified && latVal != null && lonVal != null;
      const latDisplay = hasCoord ? `${Number(latVal).toFixed(6)}°` : 'Latitude: Not available';
      const lonDisplay = hasCoord ? `${Number(lonVal).toFixed(6)}°` : 'Longitude: Not available';
      const geoStatusDisplay = hasCoord ? 'Geospatial Data Available' : 'Geospatial Data Not Available';
      
      const bboxStr = Array.isArray(det.bbox)
        ? `[${det.bbox.map(n => (typeof n === 'number' ? n.toFixed(2) : n)).join(', ')}]`
        : 'Not available';

      const cardHeight = 34;

      // Check if this card will overflow the page (A4 height is 297mm)
      if (currentY + cardHeight > 275) {
        doc.addPage();
        currentY = 20;

        // Mini page header on subsequent pages
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Marine Sonar AI Detection Report — ${truncatedFilename}`, leftMargin, currentY - 6);
        doc.setDrawColor(226, 232, 240);
        doc.line(leftMargin, currentY - 4, pageWidth - rightMargin, currentY - 4);
      }

      // Detection Item Card
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.setLineWidth(0.3);
      doc.roundedRect(leftMargin, currentY, contentWidth, cardHeight, 1.5, 1.5, 'FD');

      // Left ID Badge
      doc.setFillColor(7, 19, 38);
      doc.roundedRect(leftMargin + 3, currentY + 3, 12, 7, 1, 1, 'F');
      doc.setTextColor(0, 229, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(`#${markerId}`, leftMargin + 9, currentY + 7.8, { align: 'center' });

      // Candidate Title
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(candidateName, leftMargin + 18, currentY + 8);

      // Status Badge
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const titleWidth = doc.getTextWidth(candidateName);
      doc.text(`[AI-Predicted Candidate]`, leftMargin + 18 + titleWidth + 4, currentY + 8);

      // Right: Confidence & Level
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(5, 150, 105); // Emerald 600
      doc.text(confPct, pageWidth - rightMargin - 4, currentY + 8, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(14, 116, 144); // Cyan 700
      const confWidth = doc.getTextWidth(confPct);
      doc.text(confLevel, pageWidth - rightMargin - 4 - confWidth - 3, currentY + 8, { align: 'right' });

      // Line 2: Geospatial Coordinates & Bounding Box
      const line2Y = currentY + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Position:', leftMargin + 5, line2Y);
      doc.setFont('helvetica', 'normal');
      if (hasCoord) {
        doc.setTextColor(15, 23, 42);
        doc.text(`Lat: ${latDisplay}, Lon: ${lonDisplay}`, leftMargin + 20, line2Y);
      } else {
        doc.setTextColor(180, 83, 9); // Amber for Not available
        doc.text(`${latDisplay}, ${lonDisplay}`, leftMargin + 20, line2Y);
      }

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Bounding Box:', leftMargin + 104, line2Y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(bboxStr, leftMargin + 126, line2Y);

      // Line 3: Geolocation Status & Geolocation Source
      const line3Y = currentY + 22;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Geolocation Status:', leftMargin + 5, line3Y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(hasCoord ? 5 : 180, hasCoord ? 150 : 83, hasCoord ? 105 : 9);
      doc.text(geoStatusDisplay, leftMargin + 32, line3Y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Geolocation Source:', leftMargin + 104, line3Y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(geolocationSource, leftMargin + 133, line3Y);

      // Line 4: Expert Review Status & Note
      const line4Y = currentY + 29;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(180, 83, 9);
      doc.text('Expert Review Status:', leftMargin + 5, line4Y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 53, 15);
      doc.text('AI-Predicted Candidate — Human verification recommended before final identification.', leftMargin + 34, line4Y);

      currentY += cardHeight + 3;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, 286, pageWidth - rightMargin, 286);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Marine Sonar AI Detection Report • Side-Scan Sonar Telemetry Interface', leftMargin, 291);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - rightMargin, 291, { align: 'right' });
  }

  // Save the generated PDF
  const cleanBase = sourceName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`marine_sonar_ai_report_${cleanBase}_${Date.now()}.pdf`);
}

/**
 * Health check endpoint for FastAPI backend
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const CANDIDATE_NAME_MAP = {
  shipwreck: 'Potential Shipwreck Anomaly',
  submarine_pipeline: 'Potential Pipeline Anomaly',
  mine_cylinder: 'Potential Mine Cylinder Anomaly',
  ghost_net: 'Potential Ghost Net Anomaly',
  crab_pot: 'Potential Crab Pot Anomaly',
};

export const AI_CANDIDATE_STATUS = 'AI-Predicted Candidate';
export const EXPERT_REVIEW_RECOMMENDATION = 'Human verification recommended before final identification.';
export const CONFIDENCE_SCORE_EXPLANATION = "Confidence indicates the model's detection score. It does not represent confirmed object identity.";
export const AI_DETECTION_EXPLANATION = "AI identifies candidate regions based on learned sonar-image patterns. The result is a candidate detection and requires expert review.";

/**
 * Formats display name for an AI candidate anomaly.
 * NEVER describes an AI prediction as Confirmed, Definite, or Verified.
 * Maps:
 *   shipwreck → Potential Shipwreck Anomaly
 *   submarine_pipeline → Potential Pipeline Anomaly
 *   mine_cylinder → Potential Mine Cylinder Anomaly
 *   ghost_net → Potential Ghost Net Anomaly
 *   crab_pot → Potential Crab Pot Anomaly
 * Keeps the original model class internally unchanged.
 */
export function getCandidateDisplayName(detection) {
  if (!detection) return 'AI-Predicted Candidate';

  const rawClass = String(detection.class || '').toLowerCase().trim();
  if (CANDIDATE_NAME_MAP[rawClass]) {
    return CANDIDATE_NAME_MAP[rawClass];
  }

  // Check if candidate_name maps to any known category
  if (detection.candidate_name) {
    const candidateLower = detection.candidate_name.toLowerCase();
    for (const [key, val] of Object.entries(CANDIDATE_NAME_MAP)) {
      if (rawClass === key || candidateLower.includes(key.replace(/_/g, ' ')) || candidateLower.includes(key)) {
        return val;
      }
    }
    // Sanitize any potential "Confirmed/Definite/Verified" words
    return detection.candidate_name
      .replace(/\b(Confirmed|Definite|Verified)\b/gi, 'Potential')
      .replace(/\b(Shipwreck)\b/gi, 'Shipwreck Anomaly');
  }

  if (rawClass) {
    const cleanClass = rawClass
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    return `Potential ${cleanClass} Anomaly`;
  }

  return 'AI-Predicted Candidate';
}

/**
 * Derives the confidence level strictly according to threshold rules:
 * - 70% or higher: "Higher Confidence Candidate"
 * - 40%–69.9%: "Moderate Confidence Candidate"
 * - Below 40%: "Low Confidence — Expert Review Required"
 */
export function getConfidenceLevel(detection) {
  if (!detection) return 'AI-Predicted Candidate';

  const conf = Number(detection.confidence) || 0;
  if (conf >= 0.70) {
    return 'Higher Confidence Candidate';
  }
  if (conf >= 0.40) {
    return 'Moderate Confidence Candidate';
  }
  return 'Low Confidence — Expert Review Required';
}

/**
 * Evaluates whether an analysis result has scientifically verified georeferencing.
 * 
 * Case 1: geolocation_status === "REAL_GEOREFERENCED"
 *   Displays "Geospatial Data Available", real coordinates, and API source.
 * 
 * Case 2: geolocation_status === "GEOSPATIAL_DATA_NOT_AVAILABLE" (or unverified)
 *   Displays "GEOSPATIAL DATA NOT AVAILABLE", Coordinates: "Not available",
 *   Source: "User-uploaded sonar image". Zero invented coordinates.
 */
export function getGeolocationState(detectionResults, uploadedFileName) {
  if (!detectionResults) {
    return {
      isVerified: false,
      hasResults: false,
      statusLabel: 'STANDBY',
      badgeLabel: 'STANDBY',
      badgeColor: 'text-slate-400 bg-slate-800/80 border-slate-700',
      source: '--',
      coordinateSystem: '--',
      coordinatesText: 'Not available',
      primaryLatitude: null,
      primaryLongitude: null,
      locatedDetections: [],
      mapMessage: 'Awaiting survey telemetry.'
    };
  }

  const statusStr = String(detectionResults.geolocation_status || '').trim().toUpperCase();
  const isExplicitlyReported = statusStr === 'REAL_GEOREFERENCED' || statusStr === 'GEOREFERENCED';

  // Extract detections with valid real geographic coordinates
  const validDetectionsWithCoords = (detectionResults.detections || []).map((d, idx) => {
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

  const isVerified = isExplicitlyReported && validDetectionsWithCoords.length > 0;

  if (isVerified) {
    // CASE 1: Verified georeferenced survey swath
    const primLoc = validDetectionsWithCoords[0];
    return {
      isVerified: true,
      hasResults: true,
      statusLabel: 'Real Georeferenced Data',
      badgeLabel: 'Real Georeferenced Data',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold',
      source: detectionResults.source || 'GeoTIFF metadata',
      coordinateSystem: detectionResults.coordinate_system || 'WGS84',
      coordinatesText: `${primLoc.latitude.toFixed(6)}°, ${primLoc.longitude.toFixed(6)}°`,
      primaryLatitude: primLoc.latitude,
      primaryLongitude: primLoc.longitude,
      locatedDetections: validDetectionsWithCoords,
      mapMessage: null
    };
  }

  // CASE 2: Uploaded image has no verified georeferencing metadata
  return {
    isVerified: false,
    hasResults: true,
    statusLabel: 'Geospatial Data Not Available',
    badgeLabel: 'Geospatial Data Not Available',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200 font-bold',
    source: 'User-uploaded sonar image',
    coordinateSystem: 'Not available',
    coordinatesText: 'Not available',
    primaryLatitude: null,
    primaryLongitude: null,
    locatedDetections: [],
    mapMessage: 'Upload a georeferenced GeoTIFF to display real detection positions.'
  };
}
