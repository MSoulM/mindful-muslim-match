import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Button } from '@/components/ui/CustomButton';
import { MobileTextInput } from '@/components/ui/Input/MobileTextInput';
import { MobileTextArea } from '@/components/ui/Input/MobileTextArea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MessageCircle, Mail, Phone, Send, 
  Paperclip, CheckCircle, Clock 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const supportFormSchema = z.object({
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(100),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().trim().min(20, 'Message must be at least 20 characters').max(1000),
});

export default function ContactSupportScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supportOptions = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Online now',
      detail: '~2 min wait',
      variant: 'primary' as const,
      action: () => {/* Open live chat */},
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Response within 24h',
      detail: 'Detailed inquiries',
      variant: 'secondary' as const,
      action: () => {/* Scroll to form */},
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Support',
      description: '9 AM - 6 PM GMT',
      detail: 'Premium members',
      variant: 'secondary' as const,
      badge: 'Premium',
      action: () => {/* Show phone number */},
    },
  ];

  const commonIssues = [
    'Account',
    'Payment',
    'Matching',
    'Technical',
    'Other',
  ];

  const recentTickets = [
    {
      id: 'T12345',
      subject: 'Cannot verify profile',
      status: 'open',
      updated: '2 hours ago',
    },
    {
      id: 'T12344',
      subject: 'Payment issue',
      status: 'resolved',
      updated: '1 day ago',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      supportFormSchema.parse(formData);
      
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Support ticket created',
        description: 'Our team will respond within 24 hours.',
      });
      
      // Reset form
      setFormData({ subject: '', category: '', message: '' });
      setSelectedIssue('');
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Contact Support"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20 px-5 pt-6">
        {/* Support Options */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">How can we help?</h2>
          <div className="space-y-3">
            {supportOptions.map((option, index) => (
              <BaseCard
                key={index}
                padding="md"
                interactive
                onClick={option.action}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    option.variant === 'primary' 
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-foreground'
                  )}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{option.title}</h3>
                      {option.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {option.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                    <p className="text-xs text-muted-foreground">{option.detail}</p>
                  </div>
                </div>
              </BaseCard>
            ))}
          </div>
        </div>

        {/* Common Issues */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Quick Select</h3>
          <div className="flex flex-wrap gap-2">
            {commonIssues.map((issue) => (
              <button
                key={issue}
                onClick={() => {
                  setSelectedIssue(issue);
                  setFormData(prev => ({ ...prev, category: issue.toLowerCase() }));
                }}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedIssue === issue
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {issue}
              </button>
            ))}
          </div>
        </div>

        {/* Message Form */}
        <BaseCard padding="md" className="mb-6">
          <h3 className="font-semibold mb-4">Send us a message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <MobileTextInput
              label="Subject"
              value={formData.subject}
              onChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
              placeholder="Brief description of your issue"
              maxLength={100}
              required
              autoFocus
              floatingLabel={false}
            />

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <MobileTextArea
              label="Message"
              value={formData.message}
              onChange={(value) => setFormData(prev => ({ ...prev, message: value }))}
              placeholder="Describe your issue in detail..."
              minRows={6}
              maxRows={10}
              maxLength={1000}
              required
              floatingLabel={false}
            />

            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start"
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Attach file (optional)
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </BaseCard>

        {/* Recent Tickets */}
        {recentTickets.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Your Recent Tickets</h3>
            <div className="space-y-2">
              {recentTickets.map((ticket) => (
                <BaseCard
                  key={ticket.id}
                  padding="md"
                  interactive
                  onClick={() => navigate(`/help/ticket/${ticket.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {ticket.id}
                    </span>
                    <Badge
                      variant={ticket.status === 'resolved' ? 'default' : 'secondary'}
                      className={cn(
                        ticket.status === 'resolved' 
                          ? 'bg-semantic-success/10 text-semantic-success'
                          : 'bg-primary/10 text-primary'
                      )}
                    >
                      {ticket.status === 'resolved' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {ticket.status}
                    </Badge>
                  </div>
                  <h4 className="font-medium mb-1">{ticket.subject}</h4>
                  <p className="text-xs text-muted-foreground">
                    Updated {ticket.updated}
                  </p>
                </BaseCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
