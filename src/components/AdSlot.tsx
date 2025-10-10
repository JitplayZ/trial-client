import { useEffect, useState } from 'react';

interface AdSlotProps {
  slot: 'leaderboard' | 'sidebar' | 'native-mobile' | 'dashboard-rail';
  className?: string;
}

export const AdSlot = ({ slot, className = '' }: AdSlotProps) => {
  const [showAds, setShowAds] = useState(false);

  useEffect(() => {
    // Check feature flag from localStorage or env
    const ffShowAds = localStorage.getItem('FF_SHOW_ADS') === 'true';
    setShowAds(ffShowAds);
  }, []);

  if (!showAds) return null;

  const slotConfig = {
    leaderboard: {
      width: '100%',
      height: '90px',
      maxWidth: '970px',
      label: 'Advertisement'
    },
    sidebar: {
      width: '300px',
      height: '250px',
      maxWidth: '300px',
      label: 'Sponsored'
    },
    'native-mobile': {
      width: '100%',
      height: '100px',
      maxWidth: '300px',
      label: 'Sponsored'
    },
    'dashboard-rail': {
      width: '300px',
      height: '250px',
      maxWidth: '300px',
      label: 'Sponsored'
    }
  };

  const config = slotConfig[slot];

  return (
    <div 
      className={`ad-slot ad-${slot} flex items-center justify-center bg-muted/20 border border-border rounded-lg ${className}`}
      style={{ 
        width: config.width, 
        height: config.height,
        maxWidth: config.maxWidth
      }}
      aria-label={config.label}
      role="complementary"
    >
      <div className="text-center text-xs text-muted-foreground">
        <p className="mb-1 font-medium">{config.label}</p>
        <p className="text-[10px]">Ad placeholder - Configure in production</p>
      </div>
    </div>
  );
};
