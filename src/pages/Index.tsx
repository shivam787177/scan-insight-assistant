import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ImageUploader } from '@/components/ImageUploader';
import { ScanViewer } from '@/components/ScanViewer';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Play, RotateCcw, Eye, Download, FileText } from 'lucide-react';

const Index = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showHighlights, setShowHighlights] = useState(true);
  
  const { isAnalyzing, result, analyzeImage, clearAnalysis } = useImageAnalysis();

  const handleImageSelect = useCallback((file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
    clearAnalysis();
  }, [clearAnalysis]);

  const handleClear = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    clearAnalysis();
  }, [clearAnalysis]);

  const handleAnalyze = useCallback(async () => {
    if (imagePreview) {
      await analyzeImage(imagePreview);
    }
  }, [imagePreview, analyzeImage]);

  const handleExportReport = useCallback(() => {
    if (!result) return;

    const report = `
MEDICAL IMAGING ANALYSIS REPORT
================================
Generated: ${result.analysisTimestamp.toLocaleString()}

SCAN INFORMATION
----------------
Scan Type: ${result.scanType}
Image Quality: ${result.imageQuality}

AI FINDING SUMMARY
------------------
Status: ${result.status}
Overall Confidence: ${result.overallConfidence}%
Urgency Level: ${result.urgencyLevel.toUpperCase()}

${result.suspectedConditions.length > 0 ? `
SUSPECTED CONDITIONS
--------------------
${result.suspectedConditions.map(c => `• ${c.name} (${c.confidence}% confidence)
  ${c.description}`).join('\n\n')}
` : ''}

${result.highlightedRegions.length > 0 ? `
HIGHLIGHTED REGIONS
-------------------
${result.highlightedRegions.map(r => `• ${r.location} (${r.severity} severity)
  ${r.description}`).join('\n\n')}
` : ''}

RECOMMENDATION
--------------
${result.recommendation}

DISCLAIMER
----------
This AI output is for clinical assistance only and must be reviewed 
by a certified medical professional. This tool does not provide 
final diagnosis.
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medscan-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Medical Scan Analysis
          </h2>
          <p className="text-muted-foreground">
            Upload or capture a medical scan for AI-powered analysis and report generation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Image Input & Viewer */}
          <div className="space-y-6">
            {!imagePreview ? (
              <ImageUploader 
                onImageSelect={handleImageSelect}
                currentImage={imagePreview}
                onClear={handleClear}
              />
            ) : (
              <>
                <ScanViewer 
                  imageUrl={imagePreview}
                  regions={result?.highlightedRegions || []}
                  showHighlights={showHighlights && !!result}
                />

                {/* Controls */}
                <div className="medical-card">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {result && (
                        <div className="flex items-center gap-2">
                          <Switch 
                            id="highlights" 
                            checked={showHighlights}
                            onCheckedChange={setShowHighlights}
                          />
                          <Label htmlFor="highlights" className="text-sm text-muted-foreground flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Show Highlights
                          </Label>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={handleClear}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        New Scan
                      </Button>
                      
                      {!result ? (
                        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                          <Play className="w-4 h-4 mr-2" />
                          {isAnalyzing ? 'Analyzing...' : 'Analyze Scan'}
                        </Button>
                      ) : (
                        <Button variant="medical" onClick={handleExportReport}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export Report
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Analysis Results */}
          <div>
            <AnalysisPanel 
              analysis={result}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center">
            MedScan AI — For clinical assistance only. All data processed locally. 
            Patient privacy protected. v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
