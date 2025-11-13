import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { PremiumCard } from '@/components/ui/animated/PremiumCard';
import { Shield, Eye, Lock, Database, UserCheck, Trash2 } from 'lucide-react';

export default function PrivacyPolicyScreen() {
  const navigate = useNavigate();

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Privacy Policy"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Introduction */}
        <div className="px-5 pt-6 pb-6">
          <PremiumCard variant="gradient" className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">Your Privacy Matters</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Last updated: November 2024
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  At Muslim Soulmate AI, we take your privacy seriously. This policy explains how we collect, 
                  use, and protect your personal information.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Information We Collect */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Information We Collect</h3>
          <PremiumCard variant="glass" className="p-5 space-y-4">
            <div className="flex items-start space-x-3">
              <UserCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-2">Profile Information</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Name, age, location, photos, religious preferences, and Soul DNA responses you provide 
                  during registration and profile completion.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Database className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-2">Usage Data</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  How you interact with our app, including matches viewed, messages sent, and features used. 
                  This helps us improve your experience.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-2">Technical Information</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Device type, operating system, IP address, and app version for security and optimization purposes.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* How We Use Your Information */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">How We Use Your Information</h3>
          <PremiumCard variant="glass" className="p-5">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To match you with compatible users based on Soul DNA compatibility</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To facilitate communication between matched users</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To improve our matching algorithm and app features</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To send you notifications about matches, messages, and app updates</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To maintain security and prevent fraudulent activity</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To comply with legal obligations</span>
              </li>
            </ul>
          </PremiumCard>
        </div>

        {/* Data Sharing */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Data Sharing</h3>
          <PremiumCard variant="glass" className="p-5">
            <div className="flex items-start space-x-3 mb-4">
              <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-2">With Other Users</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your profile information is visible to other users according to your privacy settings. 
                  Only matched users can see your full profile and contact you.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-2">With Service Providers</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We work with trusted third-party providers for hosting, analytics, and payment processing. 
                  They only access data necessary to perform their services.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Your Rights */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Your Rights</h3>
          <PremiumCard variant="glass" className="p-5">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Access and download your personal data</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Correct inaccurate information</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Delete your account and associated data</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Opt out of marketing communications</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Control your privacy settings</span>
              </li>
            </ul>
          </PremiumCard>
        </div>

        {/* Security */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Data Security</h3>
          <PremiumCard variant="glass" className="p-5">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use industry-standard encryption and security measures to protect your data. However, 
                  no method of transmission over the internet is 100% secure. We continuously monitor and 
                  improve our security practices.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Data Retention */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Data Retention</h3>
          <PremiumCard variant="glass" className="p-5">
            <div className="flex items-start space-x-3">
              <Trash2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We retain your data as long as your account is active. When you delete your account, 
                  we delete your personal information within 30 days, except where we're required by law 
                  to retain certain data.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Contact */}
        <div className="px-5 pb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Contact Us</h3>
          <PremiumCard variant="glass" className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:privacy@muslimsoulmateai.com" className="text-primary hover:underline">
                privacy@muslimsoulmateai.com
              </a>
            </p>
          </PremiumCard>
        </div>
      </div>
    </ScreenContainer>
  );
}
