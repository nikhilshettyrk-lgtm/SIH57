import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WorkflowStepper from './components/WorkflowStepper';
import DetectionSummaryCards from './components/DetectionSummaryCards';
import SonarUploader from './components/SonarUploader';
import DetectionResults from './components/DetectionResults';
import ExpertReviewSection from './components/ExpertReviewSection';
import HydrographicMap from './components/HydrographicMap';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import OceanSonarBackground from './components/OceanSonarBackground';
import { Waves, CheckCircle2 } from 'lucide-react';
import { 
  analyzeSonarImage, 
  downloadAnalysisReport, 
  exportAnalysisCSV,
  getGeolocationState 
} from './services/api';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);

  // Active navigation & workflow state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDetectionId, setSelectedDetectionId] = useState(null);
  const [expertReviews, setExpertReviews] = useState({});

  const detections = detectionResults?.detections || [];
  const candidateCount = detectionResults ? (detectionResults.final_detection_count ?? detectionResults.count ?? detections.length) : 0;
  const geoState = getGeolocationState(detectionResults, fileMeta?.name);
  const isVerified = geoState.isVerified;
  const isHomeWorkflow = activeTab === 'dashboard';

  const handleImageSelected = (file, previewUrl, meta) => {
    setSelectedFile(file);
    setImagePreview(previewUrl);
    setFileMeta(meta);
    setDetectionResults(null);
    setApiError(null);
    setExpertReviews({});
    setSelectedDetectionId(null);
    setCurrentStep(1);
  };

  const handleImageRemoved = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFileMeta(null);
    setDetectionResults(null);
    setApiError(null);
    setExpertReviews({});
    setSelectedDetectionId(null);
    setCurrentStep(1);
  };

  // Real Analyze Sonar Flow connected to FastAPI YOLO Backend
  const handleAnalyzeClick = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const data = await analyzeSonarImage(selectedFile);
      setDetectionResults(data);
      setCurrentStep(2); // Advance to AI Detection step
    } catch (err) {
      setApiError(err.message || 'Sonar analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update human review state: 'confirmed' or 'rejected'
  const handleUpdateReview = (markerId, status) => {
    setExpertReviews(prev => ({
      ...prev,
      [markerId]: prev[markerId] === status ? 'pending' : status
    }));
    setCurrentStep(3); // Advance to Expert Review step
  };

  // Step selection handler from WorkflowStepper
  const handleSelectStep = (tabId, stepNum) => {
    setActiveTab(tabId === 'upload' ? 'dashboard' : tabId);
    setCurrentStep(stepNum);

    if (tabId === 'upload') {
      document.getElementById('sonar-uploader-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Real Report Download Flows (CSV & PDF)
  const handleExportCsvClick = () => {
    if (!detectionResults) return;
    try {
      exportAnalysisCSV(detectionResults.filename || fileMeta?.name, detectionResults);
      setCurrentStep(4);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadPdfClick = () => {
    if (!detectionResults) return;
    try {
      downloadAnalysisReport(detectionResults.filename || fileMeta?.name, detectionResults);
      setCurrentStep(4);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans text-slate-900 transition-colors duration-500 ${isHomeWorkflow ? 'bg-[#000814]' : 'bg-slate-50'}`}>
      {/* Top SaaS Header */}
      <Navbar 
        isOnline={Boolean(detectionResults)}
        hasResults={Boolean(detectionResults)}
        onDownloadReportClick={handleDownloadPdfClick}
        onNavigateTab={setActiveTab}
      />

      <div className={`flex-1 flex flex-col md:flex-row w-full relative transition-colors duration-500 ${isHomeWorkflow ? 'bg-[#000814]' : 'bg-slate-50'}`}>
        {/* Underwater/Ocean Sonar Background (Home/Workflow view only) */}
        {isHomeWorkflow && <OceanSonarBackground />}

        {/* Left Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          candidateCount={candidateCount}
          isVerified={isVerified}
          hasResults={Boolean(detectionResults)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          {/* 4-Step Interactive Workflow Banner (Requirement 1) */}
          <WorkflowStepper 
            currentStep={currentStep}
            onSelectStep={handleSelectStep}
            hasImage={Boolean(imagePreview)}
            hasResults={Boolean(detectionResults)}
            hasReviews={Object.keys(expertReviews).length > 0}
          />

          {/* Section: Dashboard Summary Metrics Cards (Requirement 8) */}
          <DetectionSummaryCards 
            detectionResults={detectionResults}
            isLoading={isLoading}
          />

          {/* Conditional Views based on Sidebar Tabs */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 1. Upload Sonar Image (Requirement 2) */}
              <SonarUploader
                selectedImage={selectedFile}
                imagePreview={imagePreview}
                fileMeta={fileMeta}
                isLoading={isLoading}
                apiError={apiError}
                detectionResults={detectionResults}
                onImageSelected={handleImageSelected}
                onImageRemoved={handleImageRemoved}
                onAnalyzeClick={handleAnalyzeClick}
              />

              {/* 2. AI Detection / Preprocessing (Requirement 3) */}
              <DetectionResults 
                imagePreview={imagePreview}
                fileMeta={fileMeta}
                isLoading={isLoading}
                apiError={apiError}
                detectionResults={detectionResults}
                selectedDetectionId={selectedDetectionId}
                onSelectDetection={setSelectedDetectionId}
                expertReviews={expertReviews}
                onUpdateReview={handleUpdateReview}
              />

              {/* 3. Expert Review (Requirement 4) */}
              <ExpertReviewSection 
                detectionResults={detectionResults}
                expertReviews={expertReviews}
                onUpdateReview={handleUpdateReview}
                selectedDetectionId={selectedDetectionId}
                onSelectDetection={setSelectedDetectionId}
              />

              {/* 4. Detection Map (Requirement 5 & 6) */}
              <HydrographicMap 
                detectionResults={detectionResults}
                isLoading={isLoading}
                selectedDetectionId={selectedDetectionId}
                onSelectDetection={setSelectedDetectionId}
                expertReviews={expertReviews}
                onUpdateReview={handleUpdateReview}
              />

              {/* 5. Reports (Requirement 7) */}
              <ReportsView 
                detectionResults={detectionResults}
                fileMeta={fileMeta}
                expertReviews={expertReviews}
                onDownloadPdfClick={handleDownloadPdfClick}
                onExportCsvClick={handleExportCsvClick}
              />
            </div>
          )}

          {activeTab === 'upload' && (
            <SonarUploader
              selectedImage={selectedFile}
              imagePreview={imagePreview}
              fileMeta={fileMeta}
              isLoading={isLoading}
              apiError={apiError}
              detectionResults={detectionResults}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              onAnalyzeClick={handleAnalyzeClick}
            />
          )}

          {activeTab === 'detection' && (
            <DetectionResults 
              imagePreview={imagePreview}
              fileMeta={fileMeta}
              isLoading={isLoading}
              apiError={apiError}
              detectionResults={detectionResults}
              selectedDetectionId={selectedDetectionId}
              onSelectDetection={setSelectedDetectionId}
              expertReviews={expertReviews}
              onUpdateReview={handleUpdateReview}
            />
          )}

          {activeTab === 'expert-review' && (
            <ExpertReviewSection 
              detectionResults={detectionResults}
              expertReviews={expertReviews}
              onUpdateReview={handleUpdateReview}
              selectedDetectionId={selectedDetectionId}
              onSelectDetection={setSelectedDetectionId}
            />
          )}

          {activeTab === 'map' && (
            <HydrographicMap 
              detectionResults={detectionResults}
              isLoading={isLoading}
              selectedDetectionId={selectedDetectionId}
              onSelectDetection={setSelectedDetectionId}
              expertReviews={expertReviews}
              onUpdateReview={handleUpdateReview}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView 
              detectionResults={detectionResults}
              fileMeta={fileMeta}
              expertReviews={expertReviews}
              onDownloadPdfClick={handleDownloadPdfClick}
              onExportCsvClick={handleExportCsvClick}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Clean Light SaaS Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500 font-sans relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800">MarineVision AI</span>
            <span>•</span>
            <span>SIH 2026 Hydrographic Analytics Platform</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
            <span>FastAPI Backend Connected</span>
            <span>•</span>
            <span>YOLO Tiled SSS Inference</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
