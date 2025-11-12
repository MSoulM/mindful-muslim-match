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
import ValuesDetailScreen from "./pages/dna/ValuesDetailScreen";
import InterestsDetailScreen from "./pages/dna/InterestsDetailScreen";
import PersonalityDetailScreen from "./pages/dna/PersonalityDetailScreen";
import LifestyleDetailScreen from "./pages/dna/LifestyleDetailScreen";
import GoalsDetailScreen from "./pages/dna/GoalsDetailScreen";
import { NotificationCenterScreen } from "./pages/notifications/NotificationCenterScreen";
import { NotificationPreferencesScreen } from "./pages/settings/NotificationPreferencesScreen";
import { ChatDetailScreen } from "./pages/chat/ChatDetailScreen";
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
