import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileTextInput } from '@/components/ui/Input/MobileTextInput';
import { MobileTextArea } from '@/components/ui/Input/MobileTextArea';
import { PhoneInput } from '@/components/ui/Input/PhoneInput';
import { useFormValidation, commonValidations } from '@/hooks/useFormValidation';
import { Mail, Lock, User, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function FormOptimizationDemo() {
  const navigate = useNavigate();

  // Profile Form
  const profileForm = useFormValidation({
    name: commonValidations.name,
    email: commonValidations.email,
    phone: commonValidations.phone,
    bio: {
      maxLength: { value: 500, message: 'Bio must not exceed 500 characters' },
    },
  });

  // Message Form
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
  });

  // Login Form
  const loginForm = useFormValidation({
    email: commonValidations.email,
    password: commonValidations.password,
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.validateForm()) {
      toast.success('Profile updated successfully!');
      profileForm.resetForm();
    } else {
      toast.error('Please fix the errors in the form');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.validateForm()) {
      toast.success('Login successful!');
      loginForm.resetForm();
    } else {
      toast.error('Please fix the errors in the form');
    }
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageForm.subject && messageForm.message) {
      toast.success('Message sent successfully!');
      setMessageForm({ subject: '', message: '' });
    } else {
      toast.error('Please fill in all fields');
    }
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Mobile Form Optimization"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20 px-5 pt-6">
        <div className="space-y-6 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Mobile-Optimized Forms</CardTitle>
              <CardDescription>
                All inputs have 16px font size (prevents iOS zoom), proper keyboard types,
                floating labels, clear buttons, validation, and mobile-first interactions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="message">Message</TabsTrigger>
            </TabsList>

            {/* Profile Form */}
            <TabsContent value="profile" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Floating labels, real-time validation with debouncing, success indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <MobileTextInput
                      label="Full Name"
                      placeholder="Enter your name"
                      icon={<User className="w-5 h-5" />}
                      floatingLabel={true}
                      showSuccessIndicator={true}
                      autoFocus
                      {...profileForm.getFieldProps('name')}
                    />

                    <MobileTextInput
                      label="Email Address"
                      type="email"
                      placeholder="your@email.com"
                      icon={<Mail className="w-5 h-5" />}
                      floatingLabel={true}
                      showSuccessIndicator={true}
                      {...profileForm.getFieldProps('email')}
                    />

                    <PhoneInput
                      label="Phone Number"
                      floatingLabel={true}
                      showSuccessIndicator={true}
                      countryCode="+44"
                      {...profileForm.getFieldProps('phone')}
                    />

                    <MobileTextArea
                      label="Bio"
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                      minRows={4}
                      showSuccessIndicator={true}
                      {...profileForm.getFieldProps('bio')}
                    />

                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={profileForm.hasErrors || !profileForm.isDirty}
                      >
                        Save Profile
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={profileForm.resetForm}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Login Form */}
            <TabsContent value="login" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Password visibility toggle, proper keyboard types, validation on blur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <MobileTextInput
                      label="Email"
                      type="email"
                      placeholder="your@email.com"
                      icon={<Mail className="w-5 h-5" />}
                      floatingLabel={true}
                      showSuccessIndicator={true}
                      autoFocus
                      {...loginForm.getFieldProps('email')}
                    />

                    <MobileTextInput
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      icon={<Lock className="w-5 h-5" />}
                      floatingLabel={true}
                      helperText="Must be at least 8 characters"
                      {...loginForm.getFieldProps('password')}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginForm.hasErrors}
                    >
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Message Form */}
            <TabsContent value="message" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Send Message</CardTitle>
                  <CardDescription>
                    Auto-resize textarea, character counter, clear buttons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleMessageSubmit} className="space-y-6">
                    <MobileTextInput
                      label="Subject"
                      placeholder="What's this about?"
                      value={messageForm.subject}
                      onChange={(value) => setMessageForm({ ...messageForm, subject: value })}
                      maxLength={100}
                      floatingLabel={false}
                      icon={<MessageSquare className="w-5 h-5" />}
                      autoFocus
                    />

                    <MobileTextArea
                      label="Message"
                      placeholder="Type your message here..."
                      value={messageForm.message}
                      onChange={(value) => setMessageForm({ ...messageForm, message: value })}
                      maxLength={1000}
                      minRows={5}
                      maxRows={10}
                      floatingLabel={false}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!messageForm.subject || !messageForm.message}
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Feature List */}
          <Card>
            <CardHeader>
              <CardTitle>Mobile Optimization Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ 16px minimum font size (prevents iOS auto-zoom)</li>
                <li>✅ Proper input types (email, tel, number, url)</li>
                <li>✅ Floating labels for better UX</li>
                <li>✅ Clear buttons (X icon) for quick reset</li>
                <li>✅ Password visibility toggles</li>
                <li>✅ Real-time validation with 300ms debouncing</li>
                <li>✅ Success checkmarks for valid inputs</li>
                <li>✅ Character counters with warning states</li>
                <li>✅ Phone number formatting (auto-mask)</li>
                <li>✅ Correct keyboard types (email, tel, numeric, url)</li>
                <li>✅ Auto-resize textarea based on content</li>
                <li>✅ Auto-focus first field on screen entry</li>
                <li>✅ Validation on blur for better performance</li>
                <li>✅ Inline error messages below fields</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
}
