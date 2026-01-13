import { AnalysisResult } from '@/types/medical';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Gauge,
  MapPin,
  Stethoscope,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AnalysisPanelProps {
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
}

function ConfidenceBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          "font-medium",
          value >= 70 ? "text-success" : value >= 40 ? "text-warning" : "text-destructive"
        )}>
          {value}%
        </span>
      </div>
      <div className="confidence-bar">
        <div 
          className={cn(
            "confidence-fill",
            value >= 70 ? "bg-success" : value >= 40 ? "bg-warning" : "bg-destructive"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function AnalysisPanel({ analysis, isAnalyzing }: AnalysisPanelProps) {
  if (isAnalyzing) {
    return (
      <div className="medical-card animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Analyzing Scan</h3>
            <p className="text-xs text-muted-foreground">Processing image...</p>
          </div>
        </div>

        <div className="space-y-4">
          {['Detecting scan type', 'Analyzing regions', 'Identifying patterns', 'Generating report'].map((step, i) => (
            <div key={step} className="flex items-center gap-3 animate-slide-in" style={{ animationDelay: `${i * 0.2}s` }}>
              <div className="pulse-dot" />
              <span className="text-sm text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="medical-card animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-foreground font-medium mb-2">No Analysis Yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Upload a medical scan image to begin AI-powered analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Status Card */}
      <div className="medical-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Analysis Summary
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {analysis.analysisTimestamp.toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-secondary border border-border">
            <p className="text-xs text-muted-foreground mb-1">Scan Type</p>
            <p className="text-sm font-medium text-foreground">{analysis.scanType}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary border border-border">
            <p className="text-xs text-muted-foreground mb-1">Image Quality</p>
            <p className={cn(
              "text-sm font-medium",
              analysis.imageQuality === 'Good' && "text-success",
              analysis.imageQuality === 'Moderate' && "text-warning",
              analysis.imageQuality === 'Poor' && "text-destructive",
            )}>{analysis.imageQuality}</p>
          </div>
        </div>

        <div className={cn(
          "p-4 rounded-lg border flex items-center gap-3",
          analysis.status === 'Normal' ? "status-normal" : "status-abnormal"
        )}>
          {analysis.status === 'Normal' ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
          <div>
            <p className="font-medium">{analysis.status}</p>
            <p className="text-xs opacity-80">
              {analysis.status === 'Normal' 
                ? 'No significant abnormalities detected'
                : 'Abnormalities detected - review recommended'}
            </p>
          </div>
        </div>
      </div>

      {/* Conditions */}
      {analysis.suspectedConditions.length > 0 && (
        <div className="medical-card">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Suspected Conditions
          </h3>
          <div className="space-y-4">
            {analysis.suspectedConditions.map((condition, i) => (
              <div key={i} className="p-3 rounded-lg bg-secondary border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{condition.name}</p>
                  <Badge variant={condition.confidence >= 70 ? "destructive" : "secondary"}>
                    {condition.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{condition.description}</p>
                <ConfidenceBar value={condition.confidence} label="Confidence Level" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regions */}
      {analysis.highlightedRegions.length > 0 && (
        <div className="medical-card">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Highlighted Regions
          </h3>
          <div className="space-y-2">
            {analysis.highlightedRegions.map((region) => (
              <div 
                key={region.id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  region.severity === 'high' && "bg-destructive",
                  region.severity === 'medium' && "bg-warning",
                  region.severity === 'low' && "bg-primary",
                )} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{region.location}</p>
                  <p className="text-xs text-muted-foreground">{region.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence & Recommendation */}
      <div className="medical-card">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          Overall Assessment
        </h3>
        
        <ConfidenceBar value={analysis.overallConfidence} label="Overall Confidence" />
        
        <div className={cn(
          "mt-4 p-4 rounded-lg border",
          analysis.urgencyLevel === 'high' && "status-abnormal",
          analysis.urgencyLevel === 'medium' && "status-warning",
          analysis.urgencyLevel === 'low' && "status-normal",
        )}>
          <p className="text-sm font-medium mb-1">Recommendation</p>
          <p className="text-xs opacity-80">{analysis.recommendation}</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-muted border border-border">
        <p className="text-xs text-muted-foreground text-center">
          ⚕️ This AI output is for clinical assistance only and must be reviewed by a certified medical professional. 
          This tool does not provide final diagnosis.
        </p>
      </div>
    </div>
  );
}
