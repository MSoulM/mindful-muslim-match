import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { PremiumCard } from '@/components/ui/animated/PremiumCard';
import { MSMLogo } from '@/components/brand/MSMLogo';
import { Mail, Globe, Heart, Users, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/CustomButton';

export default function AboutScreen() {
  const navigate = useNavigate();

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="About"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* App Info */}
        <div className="px-5 pt-6 pb-8 text-center">
          <div className="flex justify-center mb-4">
            <MSMLogo variant="icon" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Muslim Soulmate AI
          </h1>
          <p className="text-muted-foreground mb-1">Version 2.1.0</p>
          <p className="text-sm text-muted-foreground">Build 2024.11</p>
        </div>

        {/* Mission Statement */}
        <div className="px-5 pb-6">
          <PremiumCard variant="gradient" className="p-6">
            <div className="flex items-start space-x-3 mb-3">
              <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Our Mission</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Helping Muslims find meaningful connections through the power of AI and Soul DNA matching. 
                  We believe in bringing together individuals based on deep compatibility, shared values, and genuine connection.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Features */}
        <div className="px-5 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">What We Offer</h2>
          <div className="space-y-3">
            <PremiumCard variant="glass" className="p-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Soul DNA Matching</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced compatibility algorithm based on values, personality, and lifestyle
                  </p>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard variant="glass" className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Safe & Verified</h4>
                  <p className="text-sm text-muted-foreground">
                    Verified profiles and comprehensive safety features for peace of mind
                  </p>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard variant="glass" className="p-4">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Growing Community</h4>
                  <p className="text-sm text-muted-foreground">
                    Join thousands of Muslims seeking meaningful relationships
                  </p>
                </div>
              </div>
            </PremiumCard>
          </div>
        </div>

        {/* Contact & Links */}
        <div className="px-5 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Get in Touch</h2>
          <div className="space-y-2">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => navigate('/settings/feedback')}
            >
              <Mail className="w-5 h-5 mr-3" />
              Send Feedback
            </Button>
            
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => window.open('https://muslimsoulmateai.com', '_blank')}
            >
              <Globe className="w-5 h-5 mr-3" />
              Visit Website
            </Button>
          </div>
        </div>

        {/* Legal */}
        <div className="px-5 pb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Legal</h2>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => navigate('/settings/terms')}
            >
              Terms of Service
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => navigate('/settings/privacy-policy')}
            >
              Privacy Policy
            </Button>
          </div>
        </div>

        {/* Credits */}
        <div className="px-5 pb-8 text-center">
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for the Muslim community
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2024 Muslim Soulmate AI. All rights reserved.
          </p>
        </div>
      </div>
    </ScreenContainer>
  );
}
