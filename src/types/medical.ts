export type ScanType = 'X-ray' | 'MRI' | 'CT' | 'Ultrasound' | 'Unknown';

export type ImageQuality = 'Good' | 'Moderate' | 'Poor';

export type FindingStatus = 'Normal' | 'Abnormal';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface HighlightedRegion {
  id: string;
  location: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  scanType: ScanType;
  imageQuality: ImageQuality;
  status: FindingStatus;
  suspectedConditions: Array<{
    name: string;
    confidence: number;
    description: string;
  }>;
  highlightedRegions: HighlightedRegion[];
  overallConfidence: number;
  urgencyLevel: UrgencyLevel;
  recommendation: string;
  analysisTimestamp: Date;
}

export interface MedicalReport {
  id: string;
  patientId?: string;
  imageUrl: string;
  analysis: AnalysisResult;
  createdAt: Date;
  disclaimer: string;
}
