import { Button } from '@/components/ui/button';
import { useStickyBar } from '@/hooks/useScrollAnimation';

export const StickyInstallBar = () => {
  const showBar = useStickyBar();

  return (
    <div className={`sticky-install-bar ${showBar ? 'show' : ''}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <p className="font-semibold text-[hsl(var(--text-head))]">Ready to organize your LinkedIn saves?</p>
          <p className="text-sm text-[hsl(var(--text-body))]">Install Nudl and never lose valuable content again.</p>
        </div>
        <Button variant="coral" size="lg" className="ml-4">
          Install Nudl
        </Button>
      </div>
    </div>
  );
};