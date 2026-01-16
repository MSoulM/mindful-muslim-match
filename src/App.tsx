import { lazy, Suspense, useEffect } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransition, pageTransitionConfig } from "@/utils/animations";
import { AppProvider } from "@/context/AppContext";
import { UserProvider } from "@/context/UserContext";
import { MatchesProvider } from "@/context/MatchesContext";
import { DNAProvider } from "@/context/DNAContext";
import { LoadingSpinner } from "@/components/utils/LoadingSpinner";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";
import { StreakManager } from "@/components/streaks/StreakManager";
// import { MicroMomentTracker } from "@/services/MicroMomentTracker";
// import { useSessionTracker } from "@/hooks/useSessionTracker";
// import { useNetworkStatus } from "@/hooks/useNetworkStatus";

// Eager load critical pages
import DNAScreen from "./pages/DNAScreen";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const LayoutDemo = lazy(() => import("./pages/LayoutDemo"));
const ComponentsDemo = lazy(() => import("./pages/ComponentsDemo"));
const DiscoverScreen = lazy(() => import("./pages/DiscoverScreen"));
const MyAgentScreen = lazy(() => import("./pages/MyAgentScreen"));
const InsightsScreen = lazy(() => import("./pages/InsightsScreen"));
const ConfirmedInsightsScreen = lazy(() => import("./pages/ConfirmedInsightsScreen"));
const AgentChatScreen = lazy(() => import("./pages/AgentChatScreen"));
const StatsScreen = lazy(() => import("./pages/StatsScreen"));
const ChaiChatListScreen = lazy(() => import("./pages/ChaiChatListScreen"));
const ChaiChatDetailScreen = lazy(() => import("./pages/ChaiChatDetailScreen"));
const ChaiChatHubScreen = lazy(() => import("./pages/ChaiChatHubScreen"));
const MessagesScreen = lazy(() => import("./pages/MessagesScreen"));
const ProfileScreen = lazy(() => import("./pages/ProfileScreen"));
const EditProfileScreen = lazy(() => import("./pages/EditProfileScreen"));
const CreatePostScreen = lazy(() => import("./pages/CreatePostScreen"));

// Lazy load onboarding screens
const PreferencesScreen = lazy(() => import("./pages/onboarding/PreferencesScreen").then(m => ({ default: m.PreferencesScreen })));
const WelcomeScreen = lazy(() => import("./pages/onboarding/WelcomeScreen").then(m => ({ default: m.WelcomeScreen })));
const BasicInfoScreen = lazy(() => import("./pages/onboarding/BasicInfoScreen").then(m => ({ default: m.BasicInfoScreen })));
const ReligiousPreferencesScreen = lazy(() => import("./pages/onboarding/ReligiousPreferencesScreen").then(m => ({ default: m.ReligiousPreferencesScreen })));
const PhotoUploadScreen = lazy(() => import("./pages/onboarding/PhotoUploadScreen").then(m => ({ default: m.PhotoUploadScreen })));
const DNAQuestionnaireScreen = lazy(() => import("./pages/onboarding/DNAQuestionnaireScreen").then(m => ({ default: m.DNAQuestionnaireScreen })));
const NotificationsScreen = lazy(() => import("./pages/onboarding/NotificationsScreen"));
const CommunicationPrefsScreen = lazy(() => import("./pages/onboarding/CommunicationPrefsScreen"));
const ProfileCompleteScreen = lazy(() => import("./pages/onboarding/ProfileCompleteScreen"));
const VoiceOnboardingDemo = lazy(() => import("./pages/onboarding/VoiceOnboardingDemo"));
const PersonalityAssessmentDemo = lazy(() => import("./pages/onboarding/PersonalityAssessmentDemo"));
const CulturalProfileDemo = lazy(() => import("./pages/onboarding/CulturalProfileDemo"));

// Lazy load settings screens
const PersonalityChangeDemo = lazy(() => import("./pages/settings/PersonalityChangeDemo"));
const CulturalVariantDemo = lazy(() => import("./pages/settings/CulturalVariantDemo"));

// Lazy load auth screens
const SignInScreen = lazy(() => import("./pages/auth/SignInScreen").then(m => ({ default: m.SignInScreen })));
const SignUpScreen = lazy(() => import("./pages/auth/SignUpScreen").then(m => ({ default: m.SignUpScreen})));
const OTPScreen = lazy(() => import("./pages/auth/OTPScreen").then(m => ({ default: m.OTPScreen })));
const ResetPasswordScreen = lazy(() => import("./pages/auth/ResetPasswordScreen").then(m => ({ default: m.ResetPasswordScreen })));

// Lazy load DNA detail screens
const ValuesDetailScreen = lazy(() => import("./pages/dna/ValuesDetailScreen"));
const InterestsDetailScreen = lazy(() => import("./pages/dna/InterestsDetailScreen"));
const PersonalityDetailScreen = lazy(() => import("./pages/dna/PersonalityDetailScreen"));
const LifestyleDetailScreen = lazy(() => import("./pages/dna/LifestyleDetailScreen"));
const GoalsDetailScreen = lazy(() => import("./pages/dna/GoalsDetailScreen"));

// Lazy load remaining pages
const NotificationCenterScreen = lazy(() => import("./pages/notifications/NotificationCenterScreen").then(m => ({ default: m.NotificationCenterScreen })));
const NotificationPreferencesScreen = lazy(() => import("./pages/settings/NotificationPreferencesScreen").then(m => ({ default: m.NotificationPreferencesScreen })));
const ChatDetailScreen = lazy(() => import("./pages/chat/ChatDetailScreen").then(m => ({ default: m.ChatDetailScreen })));
const ReportUserScreen = lazy(() => import("./pages/safety/ReportUserScreen").then(m => ({ default: m.ReportUserScreen })));
const SafetyCenterScreen = lazy(() => import("./pages/safety/SafetyCenterScreen").then(m => ({ default: m.SafetyCenterScreen })));
const MeetingPlannerScreen = lazy(() => import("./pages/safety/MeetingPlannerScreen").then(m => ({ default: m.MeetingPlannerScreen })));
const PremiumScreen = lazy(() => import("./pages/PremiumScreen"));
const SubscriptionSuccessScreen = lazy(() => import("./pages/SubscriptionSuccessScreen"));
const ManageSubscriptionScreen = lazy(() => import("./pages/ManageSubscriptionScreen"));
const SettingsScreen = lazy(() => import("./pages/SettingsScreen"));
const PrivacyScreen = lazy(() => import("./pages/settings/PrivacyScreen"));
const DeleteAccountScreen = lazy(() => import("./pages/settings/DeleteAccountScreen"));
const AboutScreen = lazy(() => import("./pages/settings/AboutScreen"));
const PrivacyPolicyScreen = lazy(() => import("./pages/settings/PrivacyPolicyScreen"));
const TermsOfServiceScreen = lazy(() => import("./pages/settings/TermsOfServiceScreen"));
const FeedbackScreen = lazy(() => import("./pages/settings/FeedbackScreen"));
const HelpCenterScreen = lazy(() => import("./pages/HelpCenterScreen"));
const FAQScreen = lazy(() => import("./pages/FAQScreen"));
const ContactSupportScreen = lazy(() => import("./pages/ContactSupportScreen"));
const TutorialScreen = lazy(() => import("./pages/TutorialScreen"));
const HowMySoulDNAWorksScreen = lazy(() => import("./pages/HowMySoulDNAWorksScreen"));
const JourneyDashboardScreen = lazy(() => import("./pages/JourneyDashboardScreen"));
const EditPostScreen = lazy(() => import("./pages/EditPostScreen"));
const PostSuccessScreen = lazy(() => import("./pages/PostSuccessScreen"));
const ShareReceiverScreen = lazy(() => import("./pages/ShareReceiverScreen"));
const AnalyticsScreen = lazy(() => import("./pages/AnalyticsScreen").then(m => ({ default: m.AnalyticsScreen })));
const DNAAnalyticsScreen = lazy(() => import("./pages/DNAAnalyticsScreen").then(m => ({ default: m.DNAAnalyticsScreen })));
const EngagementAnalyticsScreen = lazy(() => import("./pages/EngagementAnalyticsScreen").then(m => ({ default: m.EngagementAnalyticsScreen })));
const ExportAnalyticsScreen = lazy(() => import("./pages/ExportAnalyticsScreen").then(m => ({ default: m.ExportAnalyticsScreen })));
const AdminAnalyticsScreen = lazy(() => import("./pages/admin/AdminAnalyticsScreen"));
const AdminGovernanceScreen = lazy(() => import("./pages/admin/AdminGovernanceScreen").then(m => ({ default: m.AdminGovernanceScreen })));
const AdminPersonalityScreen = lazy(() => import("./pages/admin/AdminPersonalityScreen").then(m => ({ default: m.AdminPersonalityScreen })));
const AdminCityClusterScreen = lazy(() => import("./pages/admin/AdminCityClusterScreen").then(m => ({ default: m.AdminCityClusterScreen })));

// Lazy load dev/demo screens
const TestingChecklist = lazy(() => import("@/components/dev/TestingChecklist"));
const DevicePreview = lazy(() => import("@/components/dev/DevicePreview"));
const AdminModeToggle = lazy(() => import("@/components/dev").then(m => ({ default: m.AdminModeToggle })));
const AnimationShowcase = lazy(() => import("./pages/AnimationShowcase"));
const AnimationDemoScreen = lazy(() => import("./pages/AnimationDemoScreen"));
const EmptyStateShowcase = lazy(() => import("./pages/EmptyStateShowcase"));
const FormOptimizationDemo = lazy(() => import("./pages/FormOptimizationDemo"));
const FormNavigationDemo = lazy(() => import("./pages/FormNavigationDemo"));
const ResponsiveDemo = lazy(() => import("./pages/ResponsiveDemo"));
const AccessibilityDemo = lazy(() => import("./pages/AccessibilityDemo"));
const PremiumPolishDemo = lazy(() => import("./pages/PremiumPolishDemo"));
const DepthSystemDemo = lazy(() => import("./pages/DepthSystemDemo"));
const BehavioralInsightsDemo = lazy(() => import("./pages/BehavioralInsightsDemo"));
const BehavioralTrackingTestScreen = lazy(() => import("./pages/BehavioralTrackingTestScreen"));
const TestingHubScreen = lazy(() => import("./pages/TestingHubScreen"));
const MemoryDashboardScreen = lazy(() => import("./pages/MemoryDashboardScreen"));
const EvolutionStageDemo = lazy(() => import("./pages/EvolutionStageDemo"));
const MemoryReferenceDemo = lazy(() => import("./pages/MemoryReferenceDemo"));
const PersonalityFeedbackDemo = lazy(() => import("./pages/PersonalityFeedbackDemo"));
const MemoryPrivacyDemo = lazy(() => import("./pages/MemoryPrivacyDemo"));
const MemoryImportanceDemo = lazy(() => import("./pages/MemoryImportanceDemo"));
const ConversationSummaryDemo = lazy(() => import("./pages/ConversationSummaryDemo"));
const ThreadListTest = lazy(() => import("./pages/ThreadListTest"));
const ChatViewTest = lazy(() => import("./pages/ChatViewTest"));
const PersonalityQuizTest = lazy(() => import("./pages/PersonalityQuizTest"));
const TierSelectorDemo = lazy(() => import("./pages/TierSelectorDemo"));
const PersonalityCardTest = lazy(() => import("./pages/PersonalityCardTest"));
const ToneAdjustmentTest = lazy(() => import("./pages/ToneAdjustmentTest"));
const UserStateIndicatorTest = lazy(() => import("./pages/UserStateIndicatorTest"));
const SupportModeTest = lazy(() => import("./pages/SupportModeTest"));
const ProfileCompletionTest = lazy(() => import("./pages/ProfileCompletionTest"));
const ChaiChatShowcaseScreen = lazy(() => import("./pages/ChaiChatShowcaseScreen"));

const queryClient = new QueryClient();

// // Initialize tracking system on app load
// const TrackingInitializer = ({ children }: { children: React.ReactNode }) => {
//   // Monitor network status
//   useNetworkStatus();
  
//   useEffect(() => {
//     // Initialize tracker with config
//     MicroMomentTracker.initialize({
//       batchSize: 50,
//       batchInterval: 30000, // 30 seconds
//       apiEndpoint: '/api/tracking/micro-moments',
//       enableLogging: import.meta.env.DEV, // Only log in development
//     });

//     // Store user signup time if not already stored (for tracking metrics)
//     if (!localStorage.getItem('user_signup_time')) {
//       localStorage.setItem('user_signup_time', Date.now().toString());
//     }

//     // Store session start time
//     sessionStorage.setItem('session_start_time', Date.now().toString());

//     return () => {
//       MicroMomentTracker.destroy();
//     };
//   }, []);

//   // Use session tracker hook
//   useSessionTracker();

//   return <>{children}</>;
// };

// Suspense Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-muted">
    <LoadingSpinner size="lg" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Protected routes: rendered only when the user is signed in. */}
          <Route element={<RequireAuth />}>
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
            <Route path="/chaichat/hub" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <ChaiChatHubScreen />
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
            
            {/* Admin Routes */}
            <Route path="/admin/analytics" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <AdminAnalyticsScreen />
              </motion.div>
            } />
            <Route path="/admin/governance" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <AdminGovernanceScreen />
              </motion.div>
            } />
            <Route path="/admin/personality" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <AdminPersonalityScreen />
              </motion.div>
            } />
            <Route path="/admin/city-clusters" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <AdminCityClusterScreen />
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
            <Route path="/settings/personality-change" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <PersonalityChangeDemo />
              </motion.div>
            } />
            <Route path="/settings/cultural-variant" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <CulturalVariantDemo />
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
            <Route path="/testing-hub" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <TestingHubScreen />
              </motion.div>
            } />
            <Route path="/memory" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <MemoryDashboardScreen />
              </motion.div>
            } />
            <Route path="/evolution-stage-demo" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <EvolutionStageDemo />
              </motion.div>
            } />
            <Route path="/memory-reference-demo" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <MemoryReferenceDemo />
              </motion.div>
            } />
            <Route path="/personality-feedback-demo" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <PersonalityFeedbackDemo />
              </motion.div>
            } />
            <Route path="/memory-privacy-demo" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <MemoryPrivacyDemo />
              </motion.div>
            } />
            <Route path="/memory-importance-demo" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <MemoryImportanceDemo />
              </motion.div>
            } />
            <Route path="/conversation-summary-demo" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <ConversationSummaryDemo />
              </motion.div>
            } />
            <Route path="/behavioral-insights-demo" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <BehavioralInsightsDemo />
              </motion.div>
            } />
            <Route path="/behavioral-tracking-test" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <BehavioralTrackingTestScreen />
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
            <Route path="/onboarding/voice-demo" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <VoiceOnboardingDemo />
              </motion.div>
            } />
            <Route path="/onboarding/personality-assessment" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <PersonalityAssessmentDemo />
              </motion.div>
            } />
            <Route path="/onboarding/cultural-profile" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <CulturalProfileDemo />
              </motion.div>
            } />
            <Route path="/onboarding/complete" element={
              <motion.div {...pageTransition} transition={pageTransitionConfig}>
                <ProfileCompleteScreen 
                  onViewProfile={() => navigate('/profile')}
                  onStartMatching={() => navigate('/discover')}
                />
              </motion.div>
            } />
          </Route>

          {/* If not signed in, `RequireAuth` will redirect to sign-in. */}

          {/* Auth Routes */}
          <Route path="/auth/sign-in" element={
            <motion.div {...pageTransition} transition={pageTransitionConfig}>
              <SignInScreen />
            </motion.div>
          } />
          <Route path="/auth/sign-up" element={
            <motion.div {...pageTransition} transition={pageTransitionConfig}>
              <SignUpScreen />
            </motion.div>
          } />
          <Route path="/auth/reset-password" element={
            <motion.div {...pageTransition} transition={pageTransitionConfig}>
              <ResetPasswordScreen />
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
              <Route path="/dev/user-state-test" element={
                <motion.div {...pageTransition} transition={pageTransitionConfig}>
                  <UserStateIndicatorTest />
                </motion.div>
              } />
              <Route path="/dev/support-mode-test" element={
                <motion.div {...pageTransition} transition={pageTransitionConfig}>
                  <SupportModeTest />
                </motion.div>
              } />
              <Route path="/dev/tier-selector" element={
                <motion.div {...pageTransition} transition={pageTransitionConfig}>
                  <TierSelectorDemo />
                </motion.div>
              } />
              <Route path="/dev/chaichat-showcase" element={
                <motion.div {...pageTransition} transition={pageTransitionConfig}>
                  <ChaiChatShowcaseScreen />
                </motion.div>
              } />
              <Route path="/dev/profile-completion-test" element={
                <motion.div {...pageTransition} transition={pageTransitionConfig}>
                  <ProfileCompletionTest />
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
      </Suspense>
    </AnimatePresence>
  );
};

// Wrapper route to require authentication for nested routes.
const RequireAuth = () => (
  <>
    <SignedIn>
      <Outlet />
    </SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppProvider>
          <UserProvider>
            <MatchesProvider>
              <DNAProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                    {/* <TrackingInitializer> */}
                      <StreakManager />
                      <AnimatedRoutes />
                    {/* </TrackingInitializer> */}
                 <AdminModeToggle />
               </BrowserRouter>
            </TooltipProvider>
          </DNAProvider>
        </MatchesProvider>
      </UserProvider>
    </AppProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
