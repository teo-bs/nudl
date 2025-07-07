
import { Button } from '@/components/ui/button';
import { useStickyBar } from '@/hooks/useScrollAnimation';
import { X } from 'lucide-react';
import { useState } from 'react';

export const StickyInstallBar = () => {
  const { isVisible } = useStickyBar();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className={`sticky-install-bar ${isVisible ? 'show' : ''}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl">🧠</div>
          <div>
            <p className="font-semibold text-white">Ready to save smarter?</p>
            <p className="text-sm text-gray-300">Install Croi and never lose a LinkedIn post again.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="spotify" size="lg">
            Install Extension
          </Button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
