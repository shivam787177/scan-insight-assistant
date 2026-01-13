import { useState, useCallback, useRef } from 'react';
import { Upload, Camera, Image, X, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  currentImage: string | null;
  onClear: () => void;
}

export function ImageUploader({ onImageSelect, currentImage, onClear }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      onImageSelect(file, preview);
    }
  }, [onImageSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      onImageSelect(file, preview);
    }
  }, [onImageSelect]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            const preview = URL.createObjectURL(blob);
            onImageSelect(file, preview);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <div className="medical-card animate-fade-in">
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full aspect-[4/3] object-cover"
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-primary/50 rounded-lg" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30 animate-scan-line" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={stopCamera}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button className="flex-1" onClick={captureImage}>
            <Camera className="w-4 h-4 mr-2" />
            Capture
          </Button>
        </div>
      </div>
    );
  }

  if (currentImage) {
    return (
      <div className="medical-card animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileImage className="w-4 h-4 text-primary" />
            Uploaded Scan
          </h3>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="scan-viewer">
          <img 
            src={currentImage} 
            alt="Medical scan" 
            className="w-full aspect-[4/3] object-contain bg-black"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="medical-card animate-fade-in">
      <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
        <Upload className="w-4 h-4 text-primary" />
        Upload Medical Scan
      </h3>
      
      <div
        className={cn(
          "upload-zone flex flex-col items-center justify-center cursor-pointer",
          isDragging && "upload-zone-active"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
          <Image className="w-8 h-8 text-primary" />
        </div>
        <p className="text-foreground font-medium mb-1">
          Drop your scan here
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse files
        </p>
        <p className="text-xs text-muted-foreground">
          Supports: JPEG, PNG, DICOM images
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-3 mt-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Browse Files
        </Button>
        <Button 
          variant="medical" 
          className="flex-1"
          onClick={startCamera}
        >
          <Camera className="w-4 h-4 mr-2" />
          Use Camera
        </Button>
      </div>
    </div>
  );
}
