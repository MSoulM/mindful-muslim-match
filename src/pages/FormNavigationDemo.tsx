import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { MobileTextInput } from '@/components/ui/Input/MobileTextInput';
import { MobileTextArea } from '@/components/ui/Input/MobileTextArea';
import { PhoneInput } from '@/components/ui/Input/PhoneInput';
import { Button } from '@/components/ui/button';
import { useFieldNavigation } from '@/hooks/useFocusManagement';
import { toast } from 'sonner';
import { User, Mail, Phone, MessageSquare, MapPin } from 'lucide-react';

export default function FormNavigationDemo() {
  const navigate = useNavigate();
  const { registerField, focusNextField, getReturnKeyType } = useFieldNavigation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Form submitted!', {
      description: 'Field navigation worked perfectly.',
    });
  };

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="Field Navigation Demo"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Instructions */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2">Try It Out!</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Tap any field to start</li>
              <li>• Press "Next" on keyboard to move to next field</li>
              <li>• Press "Done" on last field to submit</li>
              <li>• No need to dismiss keyboard between fields</li>
              <li>• Shift+Enter in bio for new lines</li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <MobileTextInput
              fieldId="name"
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              icon={<User className="w-5 h-5" />}
              required
              autoFocus
              floatingLabel={false}
              ref={(el) => registerField('name', el)}
              returnKeyType={getReturnKeyType('name')}
              onNext={() => focusNextField('name')}
            />

            {/* Email Field */}
            <MobileTextInput
              fieldId="email"
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              icon={<Mail className="w-5 h-5" />}
              required
              floatingLabel={false}
              ref={(el) => registerField('email', el)}
              returnKeyType={getReturnKeyType('email')}
              onNext={() => focusNextField('email')}
            />

            {/* Phone Field */}
            <PhoneInput
              label="Phone Number"
              placeholder="(123) 456-7890"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              required
              floatingLabel={false}
            />

            {/* Location Field */}
            <MobileTextInput
              fieldId="location"
              label="Location"
              placeholder="London, UK"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              icon={<MapPin className="w-5 h-5" />}
              floatingLabel={false}
              ref={(el) => registerField('location', el)}
              returnKeyType={getReturnKeyType('location')}
              onNext={() => focusNextField('location')}
            />

            {/* Bio Field */}
            <MobileTextArea
              fieldId="bio"
              label="Bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(value) => setFormData({ ...formData, bio: value })}
              minRows={4}
              maxRows={8}
              maxLength={500}
              floatingLabel={false}
              allowEnterKey={true}
              helperText="Press Shift+Enter for new lines, or just Enter on last line to submit"
              ref={(el) => registerField('bio', el)}
              returnKeyType={getReturnKeyType('bio')}
              onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
            >
              Submit Form
            </Button>

            {/* Form Data Display */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-sm">Form Data:</h4>
              <pre className="text-xs text-muted-foreground overflow-x-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </form>
        </div>
      </div>
    </ScreenContainer>
  );
}
