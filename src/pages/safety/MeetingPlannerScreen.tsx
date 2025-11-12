import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Bell, 
  Share2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MeetingPlan {
  matchName: string;
  date: string;
  time: string;
  locationName: string;
  locationAddress: string;
  trustedContacts: string[];
  checkInTimes: string[];
  autoAlert: boolean;
  notes: string;
}

export const MeetingPlannerScreen = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<MeetingPlan>({
    matchName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '18:00',
    locationName: '',
    locationAddress: '',
    trustedContacts: [''],
    checkInTimes: ['19:00'],
    autoAlert: true,
    notes: ''
  });

  const addTrustedContact = () => {
    setPlan(prev => ({
      ...prev,
      trustedContacts: [...prev.trustedContacts, '']
    }));
  };

  const updateTrustedContact = (index: number, value: string) => {
    setPlan(prev => ({
      ...prev,
      trustedContacts: prev.trustedContacts.map((c, i) => i === index ? value : c)
    }));
  };

  const removeTrustedContact = (index: number) => {
    setPlan(prev => ({
      ...prev,
      trustedContacts: prev.trustedContacts.filter((_, i) => i !== index)
    }));
  };

  const addCheckInTime = () => {
    setPlan(prev => ({
      ...prev,
      checkInTimes: [...prev.checkInTimes, '20:00']
    }));
  };

  const handleShare = () => {
    const message = `
Meeting Safety Plan

Who: Meeting ${plan.matchName}
When: ${format(new Date(plan.date), 'EEEE, MMMM d, yyyy')} at ${plan.time}
Where: ${plan.locationName}
${plan.locationAddress}

Check-in times: ${plan.checkInTimes.join(', ')}

${plan.notes ? `Notes: ${plan.notes}` : ''}

Shared via MuslimSoulmate.ai Safety Center
    `.trim();

    if (navigator.share) {
      navigator.share({
        title: 'Meeting Safety Plan',
        text: message
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(message);
        toast.success('Meeting plan copied to clipboard');
      });
    } else {
      navigator.clipboard.writeText(message);
      toast.success('Meeting plan copied to clipboard');
    }
  };

  const handleSave = () => {
    // Validate
    if (!plan.matchName || !plan.locationName || !plan.locationAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    const validContacts = plan.trustedContacts.filter(c => c.trim());
    if (validContacts.length === 0) {
      toast.error('Please add at least one trusted contact');
      return;
    }

    // Save to localStorage
    const plans = JSON.parse(localStorage.getItem('matchme_meeting_plans') || '[]');
    plans.push({
      ...plan,
      trustedContacts: validContacts,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('matchme_meeting_plans', JSON.stringify(plans));

    toast.success('Meeting plan saved');
    navigate('/safety');
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Meeting Planner"
        onBackClick={() => navigate(-1)}
      />

      <div className="p-4 space-y-6">
        {/* Safety Banner */}
        <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
              Meeting Safety Tips
            </p>
            <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
              <li>• Always meet in public places</li>
              <li>• Let someone know where you'll be</li>
              <li>• Trust your instincts</li>
            </ul>
          </div>
        </div>

        {/* Basic Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Meeting Details</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="matchName">Meeting with *</Label>
            <Input
              id="matchName"
              placeholder="Name of the person"
              value={plan.matchName}
              onChange={(e) => setPlan(prev => ({ ...prev, matchName: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="pl-9"
                  value={plan.date}
                  onChange={(e) => setPlan(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  className="pl-9"
                  value={plan.time}
                  onChange={(e) => setPlan(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Location</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationName">Place Name *</Label>
            <Input
              id="locationName"
              placeholder="e.g., Starbucks Downtown"
              value={plan.locationName}
              onChange={(e) => setPlan(prev => ({ ...prev, locationName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationAddress">Address *</Label>
            <Textarea
              id="locationAddress"
              placeholder="Full address with cross streets"
              value={plan.locationAddress}
              onChange={(e) => setPlan(prev => ({ ...prev, locationAddress: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
        </section>

        {/* Trusted Contacts */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Trusted Contacts</h2>
            </div>
            <Button variant="outline" size="sm" onClick={addTrustedContact}>
              Add Contact
            </Button>
          </div>

          <div className="space-y-3">
            {plan.trustedContacts.map((contact, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Name or phone number"
                  value={contact}
                  onChange={(e) => updateTrustedContact(index, e.target.value)}
                />
                {plan.trustedContacts.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeTrustedContact(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Check-in Times */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Check-in Reminders</h2>
            </div>
            <Button variant="outline" size="sm" onClick={addCheckInTime}>
              Add Time
            </Button>
          </div>

          <div className="space-y-3">
            {plan.checkInTimes.map((time, index) => (
              <Input
                key={index}
                type="time"
                value={time}
                onChange={(e) => setPlan(prev => ({
                  ...prev,
                  checkInTimes: prev.checkInTimes.map((t, i) => i === index ? e.target.value : t)
                }))}
              />
            ))}
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-foreground">Auto-alert if no check-in</p>
              <p className="text-sm text-muted-foreground">
                Notify contacts if you don't check in
              </p>
            </div>
            <Switch
              checked={plan.autoAlert}
              onCheckedChange={(checked) => setPlan(prev => ({ ...prev, autoAlert: checked }))}
            />
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-4">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any other information you want to share..."
            value={plan.notes}
            onChange={(e) => setPlan(prev => ({ ...prev, notes: e.target.value }))}
            className="min-h-[100px]"
          />
        </section>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-4 bg-background pt-2 pb-safe">
          <Button variant="outline" onClick={handleShare} className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share Plan
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Plan
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
};