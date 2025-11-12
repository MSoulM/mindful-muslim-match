import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Key, Mail, Phone, Eye, EyeOff, Check, X, Lock as LockIcon } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';
import { cn } from '@/lib/utils';

interface ResetPasswordScreenProps {
  token?: string;
  onReset?: (password: string) => void;
}

type ResetStep = 'request' | 'new-password' | 'success';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  required: boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8, required: true },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p), required: true },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p), required: true },
  { label: 'One number', test: (p) => /\d/.test(p), required: true },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), required: false },
];

export const ResetPasswordScreen = ({ token, onReset }: ResetPasswordScreenProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasToken = token || searchParams.get('token');
  
  const [step, setStep] = useState<ResetStep>(hasToken ? 'new-password' : 'request');
  const [inputType, setInputType] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    contact: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    contact: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const detectInputType = (value: string): 'email' | 'phone' => {
    return value.includes('@') ? 'email' : 'phone';
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    const metRequirements = passwordRequirements.filter(req => req.test(password)).length;
    
    if (metRequirements <= 2) return { score: 33, label: 'Weak', color: 'bg-red-500' };
    if (metRequirements <= 4) return { score: 66, label: 'Medium', color: 'bg-yellow-500' };
    return { score: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const validateContact = (value: string) => {
    if (!value) return 'Email or phone number required';
    const type = detectInputType(value);
    
    if (type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      return 'Invalid email address';
    }
    if (type === 'phone' && value.length < 10) {
      return 'Invalid phone number';
    }
    return '';
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ contact: '', password: '', confirmPassword: '', general: '' });
    
    const contactError = validateContact(formData.contact);
    if (contactError) {
      setErrors(prev => ({ ...prev, contact: contactError }));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Move to OTP verification (in real app)
      navigate('/auth/otp', { 
        state: { 
          contact: formData.contact,
          action: 'reset-password' 
        } 
      });
    } catch (err) {
      setErrors(prev => ({ 
        ...prev, 
        general: 'Failed to send reset instructions. Please try again.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ contact: '', password: '', confirmPassword: '', general: '' });
    
    // Validate password
    const requiredMet = passwordRequirements
      .filter(req => req.required)
      .every(req => req.test(formData.password));
    
    if (!requiredMet) {
      setErrors(prev => ({ 
        ...prev, 
        password: 'Please meet all password requirements' 
      }));
      return;
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: "Passwords don't match" 
      }));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onReset) {
        onReset(formData.password);
      }
      
      setStep('success');
    } catch (err) {
      setErrors(prev => ({ 
        ...prev, 
        general: 'Failed to reset password. Please try again.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(formData.password);
  const allRequiredMet = passwordRequirements
    .filter(req => req.required)
    .every(req => req.test(formData.password));
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  // Success State
  if (step === 'success') {
    return (
      <AuthLayout showLogo={false}>
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Password Updated!
            </h1>
            <p className="text-sm text-neutral-600">
              Your password has been successfully reset
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/auth/login')}
            className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90"
          >
            Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Request Reset Step
  if (step === 'request') {
    return (
      <AuthLayout showLogo={false} showBack onBack={() => navigate('/auth/login')}>
        <div className="space-y-8">
          {/* Illustration */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[#D4A574] flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
              <Key className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-foreground">
              Forgot your password?
            </h1>
            <p className="text-sm text-neutral-600">
              Enter your email or phone number and we'll send you instructions
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive text-center">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleRequestReset} className="space-y-6">
            {/* Contact Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Email or Phone Number
              </label>
              <div className="relative">
                {inputType === 'email' ? (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                )}
                <Input
                  type="text"
                  placeholder="your.email@example.com or +44 7XXX"
                  value={formData.contact}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, contact: value }));
                    setInputType(detectInputType(value));
                    setErrors(prev => ({ ...prev, contact: '' }));
                  }}
                  className="h-12 pl-11 rounded-xl border-neutral-300 focus:border-primary"
                  disabled={isLoading}
                />
              </div>
              {errors.contact && (
                <p className="text-xs text-destructive mt-1">{errors.contact}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center">
            <button
              onClick={() => navigate('/auth/login')}
              className="text-sm text-primary font-medium hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // New Password Step
  return (
    <AuthLayout showLogo={false} showBack onBack={() => navigate('/auth/login')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-foreground">
            Create New Password
          </h1>
          <p className="text-sm text-neutral-600">
            Your new password must be different from previously used passwords
          </p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive text-center">{errors.general}</p>
          </div>
        )}

        {/* Password Requirements Card */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Password Requirements:</p>
          <div className="space-y-2">
            {passwordRequirements.map((req, index) => {
              const isMet = req.test(formData.password);
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                    isMet ? "bg-green-500" : "bg-neutral-300"
                  )}>
                    {isMet ? (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    ) : (
                      <X className="w-3 h-3 text-neutral-500" strokeWidth={2} />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm",
                    isMet ? "text-green-700 font-medium" : "text-neutral-600"
                  )}>
                    {req.label}
                    {!req.required && <span className="text-neutral-400"> (optional)</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* New Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              New Password
            </label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={formData.password}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, password: e.target.value }));
                  setErrors(prev => ({ ...prev, password: '' }));
                }}
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
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">Password strength:</span>
                  <span className={cn(
                    "font-semibold",
                    strength.score === 100 ? "text-green-600" : 
                    strength.score === 66 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-300", strength.color)}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                ref={confirmRef}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                  setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
                className="h-12 pl-11 pr-11 rounded-xl border-neutral-300 focus:border-primary"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && (
              passwordsMatch ? (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              ) : (
                <p className="text-xs text-destructive">Passwords don't match</p>
              )
            )}
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Reset Button */}
          <Button
            type="submit"
            disabled={!allRequiredMet || !passwordsMatch || isLoading}
            className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};
