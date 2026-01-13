import { useState } from 'react';
import { ZoomIn, ZoomOut, Move, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HighlightedRegion } from '@/types/medical';
import { cn } from '@/lib/utils';

interface ScanViewerProps {
  imageUrl: string;
  regions: HighlightedRegion[];
  showHighlights: boolean;
}

export function ScanViewer({ imageUrl, regions, showHighlights }: ScanViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="medical-card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Scan Viewer</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRotate}>
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="scan-viewer scan-grid overflow-hidden">
        <div 
          className="relative transition-transform duration-300"
          style={{ 
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center'
          }}
        >
          <img 
            src={imageUrl} 
            alt="Medical scan" 
            className="w-full aspect-[4/3] object-contain"
          />
          
          {showHighlights && regions.map((region) => (
            <div
              key={region.id}
              className={cn(
                "region-highlight cursor-pointer transition-all",
                region.severity === 'high' && "border-destructive",
                region.severity === 'medium' && "border-warning",
                region.severity === 'low' && "border-primary",
                selectedRegion === region.id && "ring-2 ring-offset-2 ring-offset-black"
              )}
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.width}%`,
                height: `${region.height}%`,
              }}
              onClick={() => setSelectedRegion(
                selectedRegion === region.id ? null : region.id
              )}
            >
              <div className={cn(
                "absolute -top-6 left-0 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
                region.severity === 'high' && "bg-destructive text-destructive-foreground",
                region.severity === 'medium' && "bg-warning text-warning-foreground",
                region.severity === 'low' && "bg-primary text-primary-foreground",
              )}>
                {region.location}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRegion && (
        <div className="mt-4 p-3 rounded-lg bg-secondary border border-border animate-fade-in">
          <p className="text-sm text-foreground font-medium mb-1">
            {regions.find(r => r.id === selectedRegion)?.location}
          </p>
          <p className="text-xs text-muted-foreground">
            {regions.find(r => r.id === selectedRegion)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
