import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { PremiumCard } from '@/components/ui/animated/PremiumCard';
import { FileText, AlertCircle, Users, Shield, Ban, Scale } from 'lucide-react';

export default function TermsOfServiceScreen() {
  const navigate = useNavigate();

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Terms of Service"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Introduction */}
        <div className="px-5 pt-6 pb-6">
          <PremiumCard variant="gradient" className="p-6">
            <div className="flex items-start space-x-3">
              <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">Terms of Service</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Last updated: November 2024
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  By using Muslim Soulmate AI, you agree to these terms. Please read them carefully.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Acceptance */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Acceptance of Terms</h3>
          <PremiumCard variant="glass" className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              By creating an account and using our services, you agree to be bound by these Terms of Service 
              and our Privacy Policy. If you don't agree, please don't use our app.
            </p>
          </PremiumCard>
        </div>

        {/* Eligibility */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Eligibility</h3>
          <PremiumCard variant="glass" className="p-5">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>You must be at least 18 years old</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>You must be legally able to enter into a binding contract</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>You must not be prohibited from using our services under applicable laws</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>You must be seeking a serious relationship for marriage</span>
                  </li>
                </ul>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* User Responsibilities */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Your Responsibilities</h3>
          <PremiumCard variant="glass" className="p-5 space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-2">Account Security</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You're responsible for maintaining the confidentiality of your account credentials and 
                  for all activities under your account.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-2">Accurate Information</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You must provide accurate, current information and update it as necessary. Misrepresentation 
                  may result in account termination.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Prohibited Activities */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Prohibited Activities</h3>
          <PremiumCard variant="glass" className="p-5">
            <div className="flex items-start space-x-3 mb-3">
              <Ban className="w-5 h-5 text-semantic-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium mb-3">You may not:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Use the service for any unlawful purpose</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Harass, abuse, or harm other users</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Create fake or multiple accounts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Share inappropriate or offensive content</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Attempt to access other users' accounts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Use automated tools or bots</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Sell or promote commercial services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Collect user data without permission</span>
                  </li>
                </ul>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Content Guidelines */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Content Guidelines</h3>
          <PremiumCard variant="glass" className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              All content you share must be respectful and appropriate. We reserve the right to remove 
              content that violates our guidelines, including:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Sexually explicit material</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Hate speech or discriminatory content</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Violence or threats</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Spam or misleading information</span>
              </li>
            </ul>
          </PremiumCard>
        </div>

        {/* Subscription & Payment */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Premium Subscription</h3>
          <PremiumCard variant="glass" className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Premium features require a paid subscription. By subscribing:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>You authorize recurring charges until you cancel</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Refunds are subject to our refund policy</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Prices may change with 30 days notice</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>You can cancel anytime through account settings</span>
              </li>
            </ul>
          </PremiumCard>
        </div>

        {/* Limitation of Liability */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Limitation of Liability</h3>
          <PremiumCard variant="glass" className="p-5">
            <div className="flex items-start space-x-3">
              <Scale className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Muslim Soulmate AI is provided "as is" without warranties. We're not liable for:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Actions or content of other users</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Interactions that occur outside our platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Service interruptions or technical issues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Unsuccessful matches or relationships</span>
                  </li>
                </ul>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Termination */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Account Termination</h3>
          <PremiumCard variant="glass" className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms. You can 
              delete your account anytime through settings. Upon termination, your access to paid features 
              ends immediately.
            </p>
          </PremiumCard>
        </div>

        {/* Changes to Terms */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Changes to Terms</h3>
          <PremiumCard variant="glass" className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update these terms periodically. Significant changes will be communicated through the 
              app. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </PremiumCard>
        </div>

        {/* Contact */}
        <div className="px-5 pb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Contact Us</h3>
          <PremiumCard variant="glass" className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Questions about these terms? Contact us at:{' '}
              <a href="mailto:legal@muslimsoulmateai.com" className="text-primary hover:underline">
                legal@muslimsoulmateai.com
              </a>
            </p>
          </PremiumCard>
        </div>
      </div>
    </ScreenContainer>
  );
}
