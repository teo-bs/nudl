
import { Button } from '@/components/ui/button';
import { useStickyBar } from '@/hooks/useScrollAnimation';

export const StickyInstallBar = () => {
  const showBar = useStickyBar();

  return (
    <div className={`sticky-install-bar ${showBar ? 'show' : ''}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <p className="font-semibold text-white">Ready to organize your LinkedIn saves?</p>
          <p className="text-sm text-gray-300">Install Croi and never lose valuable content again.</p>
        </div>
        <Button variant="spotify" size="lg" className="ml-4">
          Install Croi
        </Button>
      </div>
    </div>
  );
};
