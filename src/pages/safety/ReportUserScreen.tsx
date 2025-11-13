import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { MobileTextArea } from '@/components/ui/Input/MobileTextArea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ReportCategory {
  icon: string;
  title: string;
  options: string[];
}

interface ReportUserState {
  userId: string;
  userName: string;
  fromContext: 'profile' | 'chat' | 'discover';
}

const reportCategories: ReportCategory[] = [
  {
    icon: '🚫',
    title: 'Inappropriate Behavior',
    options: [
      'Harassment or bullying',
      'Inappropriate messages',
      'Requesting money',
      'Threats or violence'
    ]
  },
  {
    icon: '🎭',
    title: 'Fake Profile',
    options: [
      "Using someone else's photos",
      'Incorrect information',
      'Scammer or bot',
      'Underage user'
    ]
  },
  {
    icon: '📵',
    title: 'Off-Platform Behavior',
    options: [
      'Asked to continue elsewhere',
      'Sharing contact info too early',
      'Suspicious links'
    ]
  },
  {
    icon: '⚠️',
    title: 'Other Concerns',
    options: [
      'Makes me uncomfortable',
      'Against Islamic values',
      'Other issue'
    ]
  }
];

export const ReportUserScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ReportUserState;
  
  const [step, setStep] = useState<'category' | 'details' | 'action' | 'confirmation'>('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [action, setAction] = useState<'block' | 'report' | 'both'>('report');
  const [referenceNumber, setReferenceNumber] = useState('');

  const requiresDetails = [
    'Harassment or bullying',
    'Threats or violence',
    'Scammer or bot',
    'Other issue'
  ].includes(selectedReason);

  const handleCategorySelect = (category: string, reason: string) => {
    setSelectedCategory(category);
    setSelectedReason(reason);
    setStep('details');
  };

  const handleSubmitDetails = () => {
    if (requiresDetails && details.length < 20) {
      toast.error('Please provide more details (minimum 20 characters)');
      return;
    }
    setStep('action');
  };

  const handleSubmitReport = () => {
    const refNumber = `REF-${Date.now().toString().slice(-8)}`;
    setReferenceNumber(refNumber);
    
    // Store report in localStorage
    const reports = JSON.parse(localStorage.getItem('matchme_reports') || '[]');
    reports.push({
      referenceNumber: refNumber,
      userId: state.userId,
      userName: state.userName,
      category: selectedCategory,
      reason: selectedReason,
      details,
      action,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('matchme_reports', JSON.stringify(reports));
    
    // Handle block action
    if (action === 'block' || action === 'both') {
      const blocked = JSON.parse(localStorage.getItem('matchme_blocked_users') || '[]');
      if (!blocked.some((u: any) => u.userId === state.userId)) {
        blocked.push({
          userId: state.userId,
          userName: state.userName,
          blockedAt: new Date().toISOString()
        });
        localStorage.setItem('matchme_blocked_users', JSON.stringify(blocked));
      }
    }
    
    setStep('confirmation');
  };

  const handleFinish = () => {
    toast.success('Thank you for helping keep our community safe');
    navigate(-1);
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title={step === 'confirmation' ? 'Report Submitted' : `Report ${state?.userName || 'User'}`}
        onBackClick={() => navigate(-1)}
      />

      <div className="p-4 space-y-6">
        {/* Category Selection */}
        {step === 'category' && (
          <>
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 mx-auto mb-3 text-primary" />
              <p className="text-muted-foreground">
                Help us keep MuslimSoulmate.ai safe
              </p>
            </div>

            <div className="space-y-4">
              {reportCategories.map((category) => (
                <div key={category.title} className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="font-semibold text-foreground">{category.title}</h3>
                  </div>
                  <div className="space-y-2 ml-10">
                    {category.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleCategorySelect(category.title, option)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                      >
                        <span className="text-sm text-foreground">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Details Step */}
        {step === 'details' && (
          <>
            <div className="bg-accent p-4 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-1">Selected Issue</p>
              <p className="text-sm text-muted-foreground">{selectedReason}</p>
            </div>

            <MobileTextArea
              label={`Additional Details ${requiresDetails ? '*' : ''}`}
              value={details}
              onChange={(value) => setDetails(value)}
              placeholder="Provide more context to help us understand the situation..."
              minRows={6}
              maxRows={10}
              required={requiresDetails}
              maxLength={500}
              helperText={requiresDetails ? `Minimum 20 characters required (${details.length}/20)` : undefined}
              floatingLabel={false}
              autoFocus
            />

            <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Your report is confidential. The user won't know you reported them.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('category')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmitDetails}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {/* Action Selection */}
        {step === 'action' && (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">What would you like us to do?</h3>
                <p className="text-sm text-muted-foreground">Select the action that best fits your situation</p>
              </div>

              <RadioGroup value={action} onValueChange={(value) => setAction(value as any)}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="block" id="block" />
                    <Label htmlFor="block" className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium text-foreground">Block this user</p>
                        <p className="text-sm text-muted-foreground">They won't be able to contact you</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="report" id="report" />
                    <Label htmlFor="report" className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium text-foreground">Report to MuslimSoulmate.ai team</p>
                        <p className="text-sm text-muted-foreground">We'll review within 24 hours</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium text-foreground">Block and report</p>
                        <p className="text-sm text-muted-foreground">Recommended for serious issues</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('details')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmitReport}
                className="flex-1"
              >
                Submit Report
              </Button>
            </div>
          </>
        )}

        {/* Confirmation */}
        {step === 'confirmation' && (
          <>
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Report Submitted</h3>
              <p className="text-muted-foreground mb-6">
                Thank you for helping us maintain a safe community
              </p>
            </div>

            <div className="bg-accent p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Reference Number</p>
                <p className="text-lg font-mono text-primary">{referenceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Expected Timeline</p>
                <p className="text-sm text-muted-foreground">We'll review your report within 24 hours</p>
              </div>
              {(action === 'block' || action === 'both') && (
                <div>
                  <p className="text-sm font-medium text-foreground">User Blocked</p>
                  <p className="text-sm text-muted-foreground">
                    {state.userName} can no longer contact you
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                  Need immediate help?
                </p>
                <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Contact Emergency Services
                </button>
              </div>
            </div>

            <Button onClick={handleFinish} className="w-full">
              Done
            </Button>
          </>
        )}
      </div>
    </ScreenContainer>
  );
};