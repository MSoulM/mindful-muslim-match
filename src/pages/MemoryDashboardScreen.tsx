import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { MemoryDashboard } from '@/components/memory';

export default function MemoryDashboardScreen() {
  const navigate = useNavigate();

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="MMAgent Memory"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20 px-5 pt-6">
        <MemoryDashboard />
      </div>
    </ScreenContainer>
  );
}
