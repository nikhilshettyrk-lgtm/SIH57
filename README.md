# Marine Debris AI Detector 🌊🤖

> **AI-powered Side-Scan Sonar anomaly detection prototype**

A modern, responsive web application for marine researchers and hydrographic survey operators to detect, classify, and georeference submerged marine debris (e.g., ghost nets, plastic containers, discarded tires, metallic wreckage) from acoustic Side-Scan Sonar (SSS) data.

---

## 🧭 Architecture Roadmap

This project is architected in modular stages for seamless end-to-end integration:

```
[ Frontend Dashboard ]   --->   [ FastAPI Backend ]   --->   [ YOLO Sonar Model ]
  (React + Tailwind)           (Async REST API)           (Acoustic Object Det.)
          |                             |                            |
    Upload Sonar Image            /api/v1/detect              Bounding Boxes
    Telemetry Display            Pre-processing             Confidence Scores
   Interactive Overlay          GeoJSON Generator          Hydrographic Metadata
```

* **Phase 1 (Current)**: Frontend UI Prototype with dark ocean theme, drag-and-drop sonar uploader (JPG, JPEG, PNG), sonar telemetry cards, bounding box overlay placeholders, confidence breakdown matrix, and hydrographic location display.
* **Phase 2 (Upcoming)**: FastAPI backend service integration (`src/services/api.js`).
* **Phase 3 (Upcoming)**: YOLO model deployment for acoustic anomaly inference.
* **Phase 4 (Upcoming)**: Real-time bounding box rendering, hydrographic GPS map sync, and PDF/GeoJSON survey report exports.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Running the Frontend

From the project root:
```bash
# Start development server
npm run dev
```

Or directly inside the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at:
👉 **`http://localhost:3000`**

### 3. Production Build
```bash
npm run build
```

---

## 🎨 UI Features

- **Dark Ocean Aesthetic**: Deep navy/slate palette (`#030914`, `#071326`) with bioluminescent cyan (`#00e5ff`) and acoustic radar green accents.
- **Sonar Waterfall Guides**: Scale markers for Port and Starboard sonar channels, nadir blind-zone indicator, and acoustic depth references.
- **Drag-and-Drop Uploader**:
  - Validates JPG, JPEG, and PNG formats.
  - Generates instant high-contrast previews with file metadata (dimensions, file size, format).
  - Quick Replace and Remove options.
  - "Load Sample Sonar Scan" button to test the UI immediately with synthetic sonar imagery.
- **Detection Results Section**:
  - Initial empty state: *"No sonar analysis performed yet."*
  - Dedicated placeholder area for future AI-detected sonar image with bounding box wireframe preview.
  - Dedicated placeholder area for future confidence scores across common marine debris classes.
  - Hydrographic location and Towfish NMEA spatial metadata placeholder.
  - "Download Report" button for upcoming PDF/GeoJSON survey exports.
- **Safe Pipeline Notice**: The "Analyze Sonar" button communicates the integration roadmap without faking AI inference.

---

## 📁 Project Structure

```
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                 # Header with marine telemetry & pipeline indicators
│   │   │   ├── DetectionSummaryCards.jsx  # Summary metrics (Targets, Confidence, Channel, GPS)
│   │   │   ├── SonarUploader.jsx          # Drag-and-drop upload, preview & replace controls
│   │   │   ├── DetectionResults.jsx       # Results section with empty state & placeholders
│   │   │   └── PipelineNoticeModal.jsx    # Architectural status modal for "Analyze" & "Download"
│   │   ├── services/
│   │   │   └── api.js                     # Modular API client stubs for future FastAPI connection
│   │   ├── App.jsx                        # Main application container & state management
│   │   ├── index.css                      # Custom Tailwind theme, sonar grids & scanline animations
│   │   └── main.jsx                       # React DOM entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json                           # Root convenience runner
└── README.md
```
