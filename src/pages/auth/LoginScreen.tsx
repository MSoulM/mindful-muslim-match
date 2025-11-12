import { useState, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';
import { cn } from '@/lib/utils';
import type { User } from '@/context/UserContext';

interface LoginScreenProps {
  onSuccess?: (user: User) => void;
}

type LoginMethod = 'phone' | 'email';

export const LoginScreen = ({ onSuccess }: LoginScreenProps) => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    countryCode: '+44',
    phone: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    phone: '',
    email: '',
    password: '',
    general: ''
  });

  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const validatePhone = (phone: string) => {
    if (!phone) return 'Phone number required';
    if (phone.length < 10) return 'Invalid phone number';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email) return 'Email address required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({ phone: '', email: '', password: '', general: '' });
    
    // Validate inputs
    const newErrors = {
      phone: loginMethod === 'phone' ? validatePhone(formData.phone) : '',
      email: loginMethod === 'email' ? validateEmail(formData.email) : '',
      password: validatePassword(formData.password),
      general: ''
    };
    
    if (newErrors.phone || newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login
      const mockUser: User = {
        id: 'user-1',
        name: 'Ahmed Khan',
        age: 32,
        location: 'London, UK',
        bio: 'Seeking a life partner to build a blessed family together.',
        initials: 'AK',
        emoji: '👨‍💻',
        dnaScore: 95,
        matchCount: 12,
        activeDays: 67,
        values: ['Family First', 'Faith', 'Growth', 'Community'],
        preferences: {
          ageRange: [25, 35],
          distance: 50,
          values: ['Family', 'Faith', 'Career', 'Health']
        }
      };
      
      if (onSuccess) {
        onSuccess(mockUser);
      }
      
      navigate('/');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: 'Login failed. Please check your credentials and try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      // Simulate social login
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Logging in with ${provider}`);
      navigate('/');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: `${provider} login failed. Please try again.`
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout showLogo={false}>
      {/* Greeting Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Assalamu Alaikum
        </h1>
        <p className="text-sm text-neutral-600">
          Welcome back to mindful matchmaking
        </p>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive text-center">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Login Method Tabs */}
        <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
          <button
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={cn(
              "flex-1 h-11 rounded-md text-sm font-medium transition-all",
              loginMethod === 'phone'
                ? "bg-white text-primary shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            Phone Number
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={cn(
              "flex-1 h-11 rounded-md text-sm font-medium transition-all",
              loginMethod === 'email'
                ? "bg-white text-primary shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            Email
          </button>
        </div>

        {/* Phone Number Input */}
        {loginMethod === 'phone' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Phone Number
            </label>
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                className="w-20 h-12 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={isLoading}
              >
                <option value="+44">+44</option>
                <option value="+1">+1</option>
                <option value="+91">+91</option>
                <option value="+971">+971</option>
              </select>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  ref={phoneRef}
                  type="tel"
                  placeholder="7XXX XXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-12 pl-11 rounded-xl border-neutral-300 focus:border-primary"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      passwordRef.current?.focus();
                    }
                  }}
                />
              </div>
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive mt-1">{errors.phone}</p>
            )}
          </div>
        )}

        {/* Email Input */}
        {loginMethod === 'email' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                ref={emailRef}
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-12 pl-11 rounded-xl border-neutral-300 focus:border-primary"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    passwordRef.current?.focus();
                  }
                }}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>
        )}

        {/* Password Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="h-12 pl-11 pr-11 rounded-xl border-neutral-300 focus:border-primary"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password}</p>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-primary hover:underline font-medium"
              onClick={() => console.log('Forgot password')}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="w-6 h-6 rounded-md"
            disabled={isLoading}
          />
          <label
            htmlFor="remember"
            className="text-sm text-foreground cursor-pointer select-none"
          >
            Keep me signed in
          </label>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            'Sign In'
          )}
        </Button>

        {/* Social Login Section */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-4 text-neutral-500">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 rounded-xl border-neutral-300"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 rounded-xl bg-black text-white border-black hover:bg-black/90 hover:text-white"
            onClick={() => handleSocialLogin('apple')}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-neutral-600">
            New to MuslimSoulmate.ai?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/signup')}
              className="text-primary font-semibold hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-8 mb-6 flex items-center justify-center gap-2 text-xs text-neutral-500">
        <Shield className="w-4 h-4 text-green-600" />
        <span>Your data is secure and never shared</span>
      </div>
    </AuthLayout>
  );
};
