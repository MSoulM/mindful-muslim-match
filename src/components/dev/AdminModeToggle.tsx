import { useState, useEffect } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { enableDemoAdminMode, disableDemoAdminMode } from '@/hooks/useAdminCheck';

/**
 * Development tool for toggling demo admin mode
 * FOR TESTING ONLY - Remove before production
 */
export const AdminModeToggle = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    setIsAdminMode(sessionStorage.getItem('demo_admin_mode') === 'true');
  }, []);

  const handleToggle = () => {
    if (isAdminMode) {
      disableDemoAdminMode();
    } else {
      enableDemoAdminMode();
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={handleToggle}
        variant={isAdminMode ? "default" : "outline"}
        size="lg"
        className="shadow-lg gap-2"
      >
        {isAdminMode ? (
          <>
            <Shield className="h-5 w-5" />
            Admin Mode ON
          </>
        ) : (
          <>
            <ShieldOff className="h-5 w-5" />
            Enable Admin Mode
          </>
        )}
      </Button>
    </div>
  );
};
