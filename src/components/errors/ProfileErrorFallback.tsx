import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProfileErrorFallback() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-8 text-center">
        <AlertTriangle className="mx-auto text-orange-600 dark:text-orange-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-foreground mb-2">
          Unable to Load Profile
        </h2>
        <p className="text-muted-foreground mb-6">
          There was an issue loading your profile. Please refresh the page or try again later.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-orange-500 hover:bg-orange-600"
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
}

export function CategoryCardError() {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
      <p className="text-red-800 dark:text-red-400 text-sm">
        Unable to load this category. Please refresh the page.
      </p>
    </div>
  );
}
