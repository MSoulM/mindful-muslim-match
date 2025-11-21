import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { InfoCard } from '@/components/ui/Cards/InfoCard';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Button } from '@/components/ui/CustomButton';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, PauseCircle, Trash2, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

type DeletionReason = 'found-someone' | 'taking-break' | 'privacy' | 'no-matches' | 'other';

export default function DeleteAccountScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'reason' | 'confirm' | 'success'>('reason');
  const [reason, setReason] = useState<DeletionReason>('taking-break');
  const [otherReason, setOtherReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePauseInstead = () => {
    navigate('/settings/pause-account');
  };

  const handleContinueToDeletion = () => {
    setStep('confirm');
  };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsDeleting(false);
    setStep('success');
  };

  const handleReturnToLogin = () => {
    navigate('/login');
  };

  if (step === 'success') {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Account Deleted</h1>
            <p className="text-muted-foreground mb-8">
              We're sorry to see you go. Your account and all associated data have been permanently deleted.
            </p>
            <Button
              className="w-full"
              onClick={handleReturnToLogin}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  if (step === 'confirm') {
    return (
      <ScreenContainer>
        <TopBar 
          variant="back"
          title="Confirm Deletion"
          onBackClick={() => setStep('reason')}
        />

        <div className="flex-1 overflow-y-auto pb-20 px-5 pt-6">
          <InfoCard
            variant="error"
            icon={<AlertTriangle />}
            title="This action cannot be undone"
            description="Once you delete your account, there is no going back. All your data will be permanently removed."
          />

          <BaseCard padding="md" className="mt-6">
            <h3 className="font-semibold mb-4">What will be deleted:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-semantic-error mt-0.5">•</span>
                <span>Your profile and all personal information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-semantic-error mt-0.5">•</span>
                <span>All matches and conversations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-semantic-error mt-0.5">•</span>
                <span>Your MySoul DNA profile and progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-semantic-error mt-0.5">•</span>
                <span>ChaiChat conversations and insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-semantic-error mt-0.5">•</span>
                <span>Premium subscription (if active)</span>
              </li>
            </ul>
          </BaseCard>

          <BaseCard padding="md" className="mt-6">
            <Label htmlFor="confirm-input" className="text-sm font-medium mb-2 block">
              Type <span className="font-bold text-semantic-error">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </BaseCard>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-5 space-y-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setStep('reason')}
          >
            Go Back
          </Button>
          <Button
            className="w-full bg-semantic-error hover:bg-semantic-error/90"
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || isDeleting}
          >
            {isDeleting ? (
              'Deleting Account...'
            ) : (
              <>
                <Trash2 className="w-5 h-5 mr-2" />
                Delete My Account
              </>
            )}
          </Button>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Delete Account"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-40 px-5 pt-6">
        <InfoCard
          variant="warning"
          icon={<AlertTriangle />}
          title="We're sorry to see you go"
          description="Before you delete your account, please let us know why you're leaving. Your feedback helps us improve."
        />

        <div className="mt-6">
          <h3 className="font-semibold mb-4">Why are you leaving?</h3>
          <RadioGroup value={reason} onValueChange={(value) => setReason(value as DeletionReason)}>
            <BaseCard padding="sm" className="mb-2">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="found-someone" id="found-someone" />
                <Label htmlFor="found-someone" className="flex-1 cursor-pointer py-2">
                  Found someone
                </Label>
              </div>
            </BaseCard>

            <BaseCard padding="sm" className="mb-2">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="taking-break" id="taking-break" />
                <Label htmlFor="taking-break" className="flex-1 cursor-pointer py-2">
                  Taking a break
                </Label>
              </div>
            </BaseCard>

            <BaseCard padding="sm" className="mb-2">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="privacy" id="privacy" />
                <Label htmlFor="privacy" className="flex-1 cursor-pointer py-2">
                  Privacy concerns
                </Label>
              </div>
            </BaseCard>

            <BaseCard padding="sm" className="mb-2">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no-matches" id="no-matches" />
                <Label htmlFor="no-matches" className="flex-1 cursor-pointer py-2">
                  Not finding matches
                </Label>
              </div>
            </BaseCard>

            <BaseCard padding="sm" className="mb-2">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="flex-1 cursor-pointer py-2">
                  Other
                </Label>
              </div>
            </BaseCard>
          </RadioGroup>

          {reason === 'other' && (
            <div className="mt-4">
              <Label htmlFor="other-reason" className="text-sm font-medium mb-2 block">
                Please tell us more (optional)
              </Label>
              <Textarea
                id="other-reason"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Your feedback helps us improve..."
                rows={3}
              />
            </div>
          )}
        </div>

        {(reason === 'taking-break' || reason === 'no-matches') && (
          <BaseCard padding="md" className="mt-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-2">Consider pausing instead?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can pause your account to take a break without losing your matches and progress. Your profile will be hidden and you can come back anytime.
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handlePauseInstead}
            >
              <PauseCircle className="w-5 h-5 mr-2" />
              Pause Account Instead
            </Button>
          </BaseCard>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-5">
        <Button
          variant="ghost"
          className="w-full text-semantic-error hover:bg-semantic-error/10 mb-3"
          onClick={handleContinueToDeletion}
        >
          Continue with Deletion
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>
    </ScreenContainer>
  );
}
