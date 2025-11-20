import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransition, pageTransitionConfig } from "@/utils/animations";
import { AppProvider } from "@/context/AppContext";
import { UserProvider } from "@/context/UserContext";
import { MatchesProvider } from "@/context/MatchesContext";
import { DNAProvider } from "@/context/DNAContext";
import TestingChecklist from "@/components/dev/TestingChecklist";
import DevicePreview from "@/components/dev/DevicePreview";
import Index from "./pages/Index";
import LayoutDemo from "./pages/LayoutDemo";
import ComponentsDemo from "./pages/ComponentsDemo";
import DiscoverScreen from "./pages/DiscoverScreen";
import DNAScreen from "./pages/DNAScreen";
import MyAgentScreen from "./pages/MyAgentScreen";
import InsightsScreen from "./pages/InsightsScreen";
import ConfirmedInsightsScreen from "./pages/ConfirmedInsightsScreen";
import AgentChatScreen from "./pages/AgentChatScreen";
import StatsScreen from "./pages/StatsScreen";
import ChaiChatListScreen from "./pages/ChaiChatListScreen";
import ChaiChatDetailScreen from "./pages/ChaiChatDetailScreen";
import MessagesScreen from "./pages/MessagesScreen";
import ProfileScreen from "./pages/ProfileScreen";
import EditProfileScreen from "./pages/EditProfileScreen";
import { PreferencesScreen } from "./pages/onboarding/PreferencesScreen";
import { WelcomeScreen } from "./pages/onboarding/WelcomeScreen";
import { BasicInfoScreen } from "./pages/onboarding/BasicInfoScreen";
import { ReligiousPreferencesScreen } from "./pages/onboarding/ReligiousPreferencesScreen";
import { PhotoUploadScreen } from "./pages/onboarding/PhotoUploadScreen";
import { DNAQuestionnaireScreen } from "./pages/onboarding/DNAQuestionnaireScreen";
import NotificationsScreen from "./pages/onboarding/NotificationsScreen";
import CommunicationPrefsScreen from "./pages/onboarding/CommunicationPrefsScreen";
import ProfileCompleteScreen from "./pages/onboarding/ProfileCompleteScreen";
import { LoginScreen } from "./pages/auth/LoginScreen";
import { OTPScreen } from "./pages/auth/OTPScreen";
import { ResetPasswordScreen } from "./pages/auth/ResetPasswordScreen";
import ValuesDetailScreen from "./pages/dna/ValuesDetailScreen";
import InterestsDetailScreen from "./pages/dna/InterestsDetailScreen";
import PersonalityDetailScreen from "./pages/dna/PersonalityDetailScreen";
import LifestyleDetailScreen from "./pages/dna/LifestyleDetailScreen";
import GoalsDetailScreen from "./pages/dna/GoalsDetailScreen";
import { NotificationCenterScreen } from "./pages/notifications/NotificationCenterScreen";
import { NotificationPreferencesScreen } from "./pages/settings/NotificationPreferencesScreen";
import { ChatDetailScreen } from "./pages/chat/ChatDetailScreen";
import { ReportUserScreen } from "./pages/safety/ReportUserScreen";
import { SafetyCenterScreen } from "./pages/safety/SafetyCenterScreen";
import { MeetingPlannerScreen } from "./pages/safety/MeetingPlannerScreen";
import PremiumScreen from "./pages/PremiumScreen";
import SubscriptionSuccessScreen from "./pages/SubscriptionSuccessScreen";
import ManageSubscriptionScreen from "./pages/ManageSubscriptionScreen";
import SettingsScreen from "./pages/SettingsScreen";
import PrivacyScreen from "./pages/settings/PrivacyScreen";
import DeleteAccountScreen from "./pages/settings/DeleteAccountScreen";
import AboutScreen from "./pages/settings/AboutScreen";
import PrivacyPolicyScreen from "./pages/settings/PrivacyPolicyScreen";
import TermsOfServiceScreen from "./pages/settings/TermsOfServiceScreen";
import FeedbackScreen from "./pages/settings/FeedbackScreen";
import HelpCenterScreen from "./pages/HelpCenterScreen";
import FAQScreen from "./pages/FAQScreen";
import ContactSupportScreen from "./pages/ContactSupportScreen";
import TutorialScreen from "./pages/TutorialScreen";
import HowMySoulDNAWorksScreen from "./pages/HowMySoulDNAWorksScreen";
import JourneyDashboardScreen from "./pages/JourneyDashboardScreen";
import CreatePostScreen from "./pages/CreatePostScreen";
import EditPostScreen from "./pages/EditPostScreen";
import PostSuccessScreen from "./pages/PostSuccessScreen";
import ShareReceiverScreen from "./pages/ShareReceiverScreen";
import { AnalyticsScreen } from "./pages/AnalyticsScreen";
import { DNAAnalyticsScreen } from "./pages/DNAAnalyticsScreen";
import { EngagementAnalyticsScreen } from "./pages/EngagementAnalyticsScreen";
import { ExportAnalyticsScreen } from "./pages/ExportAnalyticsScreen";
import AnimationShowcase from "./pages/AnimationShowcase";
import AnimationDemoScreen from "./pages/AnimationDemoScreen";
import EmptyStateShowcase from "./pages/EmptyStateShowcase";
import FormOptimizationDemo from "./pages/FormOptimizationDemo";
import FormNavigationDemo from "./pages/FormNavigationDemo";
import ResponsiveDemo from "./pages/ResponsiveDemo";
import AccessibilityDemo from "./pages/AccessibilityDemo";
import PremiumPolishDemo from "./pages/PremiumPolishDemo";
import DepthSystemDemo from "./pages/DepthSystemDemo";
import ThreadListTest from "./pages/ThreadListTest";
import ChatViewTest from "./pages/ChatViewTest";
import PersonalityQuizTest from "./pages/PersonalityQuizTest";
import PersonalityCardTest from "./pages/PersonalityCardTest";
import ToneAdjustmentTest from "./pages/ToneAdjustmentTest";
import NotFound from "./pages/NotFound";
import { MicroMomentTracker } from "@/services/MicroMomentTracker";
import { useSessionTracker } from "@/hooks/useSessionTracker";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Initialize tracking system on app load
const TrackingInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Initialize tracker with config
    MicroMomentTracker.initialize({
      batchSize: 50,
      batchInterval: 30000, // 30 seconds
      apiEndpoint: '/api/tracking/micro-moments',
      enableLogging: import.meta.env.DEV, // Only log in development
    });

    // Store user signup time if not already stored (for tracking metrics)
    if (!localStorage.getItem('user_signup_time')) {
      localStorage.setItem('user_signup_time', Date.now().toString());
    }

    // Store session start time
    sessionStorage.setItem('session_start_time', Date.now().toString());

    return () => {
      MicroMomentTracker.destroy();
    };
  }, []);

  // Use session tracker hook
  useSessionTracker();

  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <DNAScreen />
          </motion.div>
        } />
        <Route path="/home" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <Index />
          </motion.div>
        } />
        <Route path="/demo" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <LayoutDemo />
          </motion.div>
        } />
        <Route path="/components" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ComponentsDemo />
          </motion.div>
        } />
        <Route path="/discover" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <DiscoverScreen />
          </motion.div>
        } />
        <Route path="/dna" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <DNAScreen />
          </motion.div>
        } />
        <Route path="/myagent" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <MyAgentScreen />
          </motion.div>
        } />
        <Route path="/insights" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <InsightsScreen />
          </motion.div>
        } />
        <Route path="/confirmed-insights" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ConfirmedInsightsScreen />
          </motion.div>
        } />
        <Route path="/agent-chat" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <AgentChatScreen />
          </motion.div>
        } />
        <Route path="/stats" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <StatsScreen />
          </motion.div>
        } />
        <Route path="/chaichat" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ChaiChatListScreen />
          </motion.div>
        } />
        <Route path="/chaichat/:id" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ChaiChatDetailScreen />
          </motion.div>
        } />
        <Route path="/messages" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <MessagesScreen />
          </motion.div>
        } />
        <Route path="/chat/:matchId" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ChatDetailScreen />
          </motion.div>
        } />
        <Route path="/notifications" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <NotificationCenterScreen />
          </motion.div>
        } />
        <Route path="/settings/notification-preferences" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <NotificationPreferencesScreen />
          </motion.div>
        } />
        <Route path="/profile" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ProfileScreen />
          </motion.div>
        } />
        <Route path="/edit-profile" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <EditProfileScreen />
          </motion.div>
        } />
        <Route path="/preferences" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <PreferencesScreen />
          </motion.div>
        } />
        <Route path="/dna/values" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ValuesDetailScreen />
          </motion.div>
        } />
        <Route path="/dna/interests" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <InterestsDetailScreen />
          </motion.div>
        } />
        <Route path="/dna/personality" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <PersonalityDetailScreen />
          </motion.div>
        } />
        <Route path="/dna/lifestyle" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <LifestyleDetailScreen />
          </motion.div>
        } />
        <Route path="/dna/goals" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <GoalsDetailScreen />
          </motion.div>
        } />
        <Route path="/safety" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <SafetyCenterScreen />
          </motion.div>
        } />
        <Route path="/safety/report" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ReportUserScreen />
          </motion.div>
        } />
        <Route path="/safety/meeting-planner" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <MeetingPlannerScreen />
          </motion.div>
        } />
        <Route path="/premium" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <PremiumScreen />
          </motion.div>
        } />
        <Route path="/subscription/success" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <SubscriptionSuccessScreen />
          </motion.div>
        } />
        <Route path="/subscription/manage" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ManageSubscriptionScreen />
          </motion.div>
        } />
        
        {/* Analytics Routes */}
        <Route path="/analytics" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <AnalyticsScreen />
          </motion.div>
        } />
        <Route path="/analytics/dna" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <DNAAnalyticsScreen />
          </motion.div>
        } />
        <Route path="/analytics/engagement" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <EngagementAnalyticsScreen />
          </motion.div>
        } />
        <Route path="/analytics/export" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ExportAnalyticsScreen />
          </motion.div>
        } />
        
        {/* Post Routes */}
        <Route path="/share" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ShareReceiverScreen />
          </motion.div>
        } />
        <Route path="/create-post" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <CreatePostScreen />
          </motion.div>
        } />
        <Route path="/edit-post/:postId" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <EditPostScreen />
          </motion.div>
        } />
        <Route path="/post-success" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <PostSuccessScreen />
          </motion.div>
        } />
        
        {/* Animation Demo Routes */}
        <Route path="/animations-demo" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <AnimationDemoScreen />
          </motion.div>
        } />
        <Route path="/animations-showcase" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <AnimationShowcase />
          </motion.div>
        } />
        
        {/* Settings Routes */}
        <Route path="/settings" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <SettingsScreen />
          </motion.div>
        } />
        <Route path="/settings/privacy" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <PrivacyScreen />
          </motion.div>
        } />
        <Route path="/settings/delete-account" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <DeleteAccountScreen />
          </motion.div>
        } />
        <Route path="/settings/about" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <AboutScreen />
          </motion.div>
        } />
        <Route path="/settings/privacy-policy" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <PrivacyPolicyScreen />
          </motion.div>
        } />
        <Route path="/settings/terms" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <TermsOfServiceScreen />
          </motion.div>
        } />
        <Route path="/settings/feedback" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <FeedbackScreen />
          </motion.div>
        } />
        
        {/* Help Center Routes */}
        <Route path="/help" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <HelpCenterScreen />
          </motion.div>
        } />
        <Route path="/help/faq" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <FAQScreen />
          </motion.div>
        } />
        <Route path="/help/contact" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ContactSupportScreen />
          </motion.div>
        } />
        <Route path="/help/tutorial/:id" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <TutorialScreen />
          </motion.div>
        } />
        <Route path="/how-mysouldna-works" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <HowMySoulDNAWorksScreen />
          </motion.div>
        } />
        <Route path="/journey-dashboard" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <JourneyDashboardScreen />
          </motion.div>
        } />
        <Route path="/depth-demo" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <DepthSystemDemo />
          </motion.div>
        } />
        
        {/* Auth Routes */}
        <Route path="/auth/login" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <LoginScreen />
          </motion.div>
        } />
        <Route path="/auth/otp" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <OTPScreen />
          </motion.div>
        } />
        <Route path="/auth/reset-password" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ResetPasswordScreen />
          </motion.div>
        } />
        
        {/* Onboarding Routes */}
        <Route path="/onboarding/welcome" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <WelcomeScreen />
          </motion.div>
        } />
        <Route path="/onboarding/basic-info" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <BasicInfoScreen />
          </motion.div>
        } />
        <Route path="/onboarding/religious-preferences" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ReligiousPreferencesScreen />
          </motion.div>
        } />
        <Route path="/onboarding/photo-upload" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <PhotoUploadScreen />
          </motion.div>
        } />
        <Route path="/onboarding/dna-questionnaire" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <DNAQuestionnaireScreen />
          </motion.div>
        } />
        <Route path="/onboarding/preferences" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <PreferencesScreen />
          </motion.div>
        } />
        <Route path="/onboarding/notifications" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <NotificationsScreen 
              onAllow={() => navigate('/onboarding/communication-prefs')}
              onSkip={() => navigate('/onboarding/communication-prefs')}
            />
          </motion.div>
        } />
        <Route path="/onboarding/communication-prefs" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <CommunicationPrefsScreen 
              onNext={() => navigate('/onboarding/complete')}
              onBack={() => navigate('/onboarding/notifications')}
            />
          </motion.div>
        } />
        <Route path="/onboarding/complete" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <ProfileCompleteScreen 
              profile={{
                name: 'User',
                age: 0,
                location: '',
                dnaScore: 0
              }}
              onViewProfile={() => navigate('/profile')}
              onStartMatching={() => navigate('/discover')}
            />
          </motion.div>
        } />
        
        {/* Development Tools - Only in development */}
        {import.meta.env.DEV && (
          <>
            <Route path="/dev/testing" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <TestingChecklist />
              </motion.div>
            } />
            <Route path="/dev/preview" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <DevicePreview />
              </motion.div>
            } />
            <Route path="/dev/animations" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <AnimationDemoScreen />
              </motion.div>
            } />
            <Route path="/dev/empty-states" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <EmptyStateShowcase />
              </motion.div>
            } />
            <Route path="/dev/forms" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <FormOptimizationDemo />
              </motion.div>
            } />
            <Route path="/dev/form-navigation" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <FormNavigationDemo />
              </motion.div>
            } />
            <Route path="/dev/responsive" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <ResponsiveDemo />
              </motion.div>
            } />
            <Route path="/dev/accessibility" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <AccessibilityDemo />
              </motion.div>
            } />
            <Route path="/dev/premium-polish" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <PremiumPolishDemo />
              </motion.div>
            } />
            <Route path="/dev/thread-list-test" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <ThreadListTest />
              </motion.div>
            } />
            <Route path="/dev/chat-view-test" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <ChatViewTest />
              </motion.div>
            } />
            <Route path="/dev/personality-quiz-test" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <PersonalityQuizTest />
              </motion.div>
            } />
            <Route path="/dev/personality-card-test" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <PersonalityCardTest />
              </motion.div>
            } />
            <Route path="/dev/tone-adjustment-test" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <ToneAdjustmentTest />
              </motion.div>
            } />
          </>
        )}
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={
          <motion.div {...pageTransition} transition={pageTransitionConfig}>
            <NotFound />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <UserProvider>
        <MatchesProvider>
          <DNAProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <TrackingInitializer>
                  <AnimatedRoutes />
                </TrackingInitializer>
              </BrowserRouter>
            </TooltipProvider>
          </DNAProvider>
        </MatchesProvider>
      </UserProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
