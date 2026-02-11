import { useState, useCallback } from 'react';
import { AnalysisResult } from '@/types/medical';
import { supabase } from '@/integrations/supabase/client';

function fileToBase64(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No canvas context')); return; }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

export function useImageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeImage = useCallback(async (imageUrl: string): Promise<AnalysisResult> => {
    setIsAnalyzing(true);

    try {
      const imageBase64 = await fileToBase64(imageUrl);

      const { data, error } = await supabase.functions.invoke('analyze-scan', {
        body: { imageBase64 },
      });

      if (error) throw error;

      const analysis: AnalysisResult = {
        scanType: data.scanType || 'Unknown',
        imageQuality: data.imageQuality || 'Moderate',
        status: data.status || 'Uncertain',
        suspectedConditions: data.suspectedConditions || [],
        highlightedRegions: (data.highlightedRegions || []).map((r: any, i: number) => ({
          ...r,
          id: r.id || `region-${i}`,
        })),
        overallConfidence: data.overallConfidence ?? 0,
        urgencyLevel: data.urgencyLevel || 'medium',
        recommendation: data.recommendation || 'Please consult a physician.',
        analysisTimestamp: new Date(),
        isUncertain: data.isUncertain ?? data.status === 'Uncertain',
        isPoorQualityFailure: data.isPoorQualityFailure ?? false,
        differentialDiagnoses: data.differentialDiagnoses || undefined,
      };

      setResult(analysis);
      setIsAnalyzing(false);
      return analysis;
    } catch (err) {
      setIsAnalyzing(false);
      throw err;
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setResult(null);
  }, []);

  return { isAnalyzing, result, analyzeImage, clearAnalysis };
}
