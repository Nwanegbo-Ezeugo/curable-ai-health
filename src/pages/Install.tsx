import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Smartphone, Check } from 'lucide-react';

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center">
          <Smartphone className="w-12 h-12 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Install Curable</h1>
          <p className="text-muted-foreground">
            Get the full app experience on your home screen
          </p>
        </div>

        {isInstalled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Check className="w-6 h-6" />
              <span className="font-semibold">App Installed!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You can now use Curable from your home screen
            </p>
          </div>
        ) : isInstallable ? (
          <Button onClick={handleInstall} size="lg" className="w-full">
            <Download className="w-5 h-5 mr-2" />
            Install App
          </Button>
        ) : (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="font-semibold">How to install:</p>
            <div className="text-left space-y-2">
              <p><strong>iPhone:</strong> Tap the Share button, then "Add to Home Screen"</p>
              <p><strong>Android:</strong> Tap the menu button, then "Install app" or "Add to Home Screen"</p>
            </div>
          </div>
        )}

        <div className="pt-4 space-y-3 text-sm text-muted-foreground border-t">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span>Works offline</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span>Fast loading</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span>Full-screen experience</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
