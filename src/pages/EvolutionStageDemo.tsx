import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { EvolutionStage } from '@/components/mmagent';

export default function EvolutionStageDemo() {
  const navigate = useNavigate();

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="Evolution Stage Demo"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20 px-5 pt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Default Variant
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Full evolution stage card with all details and progress visualization
          </p>
          <EvolutionStage variant="default" showDetails={true} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Compact Variant
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Condensed version for sidebars or smaller spaces
          </p>
          <div className="bg-card rounded-xl border border-border p-4">
            <EvolutionStage variant="compact" />
          </div>
        </div>

        <div className="bg-muted rounded-xl p-4">
          <h3 className="font-medium text-foreground mb-2">Integration Points</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Profile screen: Shows user's current evolution stage</li>
            <li>• Dashboard: Tracks progress towards next stage</li>
            <li>• Settings: Memory management with evolution indicator</li>
            <li>• Notifications: Alerts when transitioning to new stage</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-medium text-amber-900 mb-2">Testing Instructions</h3>
          <p className="text-sm text-amber-800">
            Evolution stage is calculated based on account creation date stored in localStorage.
            Current mock data shows account created 2 weeks ago (Learning stage).
            To test different stages, manually adjust the date in localStorage key 'account_created_date'.
          </p>
        </div>
      </div>
    </ScreenContainer>
  );
}
