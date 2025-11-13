import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import AgentChatScreen from "./pages/AgentChatScreen";
import StatsScreen from "./pages/StatsScreen";
import ChaiChatListScreen from "./pages/ChaiChatListScreen";
import ChaiChatDetailScreen from "./pages/ChaiChatDetailScreen";
import MessagesScreen from "./pages/MessagesScreen";
import ProfileScreen from "./pages/ProfileScreen";
import EditProfileScreen from "./pages/EditProfileScreen";
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
import HelpCenterScreen from "./pages/HelpCenterScreen";
import FAQScreen from "./pages/FAQScreen";
import ContactSupportScreen from "./pages/ContactSupportScreen";
import TutorialScreen from "./pages/TutorialScreen";
import CreatePostScreen from "./pages/CreatePostScreen";
import EditPostScreen from "./pages/EditPostScreen";
import PostSuccessScreen from "./pages/PostSuccessScreen";
import { AnalyticsScreen } from "./pages/AnalyticsScreen";
import { DNAAnalyticsScreen } from "./pages/DNAAnalyticsScreen";
import { EngagementAnalyticsScreen } from "./pages/EngagementAnalyticsScreen";
import { ExportAnalyticsScreen } from "./pages/ExportAnalyticsScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
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
                <AnimatedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </DNAProvider>
        </MatchesProvider>
      </UserProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
