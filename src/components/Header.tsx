import { Activity, Shield, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-effect">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">MedScan AI</h1>
            <p className="text-xs text-muted-foreground">Medical Imaging Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
            {isOnline ? (
              <>
                <WifiOff className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Offline Mode Ready</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary">Running Offline</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-xs text-success">HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </header>
  );
}
