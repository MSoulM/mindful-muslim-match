import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock as LockIcon, Check } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';
import { cn } from '@/lib/utils';

interface OTPScreenProps {
  phoneNumber?: string;
  email?: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
}

export const OTPScreen = ({ 
  phoneNumber = '+44 7XXX XXX234',
  email,
  onVerify,
  onResend 
}: OTPScreenProps) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (value: string, index: number) => {
    // Only accept single digits
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');
      
      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Auto-submit when complete
      if (index === 5 && value && newOtp.every(digit => digit !== '')) {
        handleVerify(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp);
      
      // Focus last filled input or first empty
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      if (pastedData.length === 6) {
        handleVerify(pastedData);
      }
    }
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation
      if (code === '123456') {
        if (onVerify) {
          onVerify(code);
        }
        navigate('/');
      } else {
        setError('The code you entered is incorrect');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Connection error. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onResend) {
        onResend();
      }
      
      // Reset timer
      setTimeLeft(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNumber = () => {
    navigate('/auth/login');
  };

  const isComplete = otp.every(digit => digit !== '');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AuthLayout showLogo={false} showBack onBack={() => navigate('/auth/login')}>
      <div className="space-y-8">
        {/* Illustration */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[#D4A574] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
            <LockIcon className="w-10 h-10 text-white" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center border-4 border-white">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold text-foreground">
            Enter Verification Code
          </h1>
          <div className="space-y-1">
            <p className="text-sm text-neutral-600">
              We've sent a 6-digit code to
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-semibold text-primary">
                {email || phoneNumber}
              </span>
              <button
                onClick={handleEditNumber}
                className="text-sm text-primary hover:underline font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        {/* OTP Input Fields */}
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isLoading}
              className={cn(
                "w-12 h-14 text-2xl font-semibold text-center rounded-xl border-2 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                digit ? "border-primary bg-primary/5" : "border-neutral-300 bg-white",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Timer & Resend */}
        <div className="text-center space-y-4">
          {!canResend ? (
            <p className="text-sm text-neutral-600">
              Resend code in <span className="font-semibold text-foreground">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="text-sm text-primary font-semibold hover:underline disabled:opacity-50"
            >
              Resend Code
            </button>
          )}
        </div>

        {/* Verify Button */}
        <Button
          onClick={() => handleVerify(otp.join(''))}
          disabled={!isComplete || isLoading}
          className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            'Verify'
          )}
        </Button>

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-neutral-600">
            Didn't receive the code?
          </p>
          <div className="flex items-center justify-center gap-3 text-sm">
            <button
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className="text-primary font-medium hover:underline disabled:opacity-50"
            >
              Resend
            </button>
            <span className="text-neutral-400">|</span>
            <button
              onClick={handleEditNumber}
              className="text-primary font-medium hover:underline"
            >
              Try another method
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
