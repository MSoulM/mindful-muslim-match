import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LayoutDemo from "./pages/LayoutDemo";
import ComponentsDemo from "./pages/ComponentsDemo";
import DiscoverScreen from "./pages/DiscoverScreen";
import DNAScreen from "./pages/DNAScreen";
import MyAgentScreen from "./pages/MyAgentScreen";
import InsightsScreen from "./pages/InsightsScreen";
import AgentChatScreen from "./pages/AgentChatScreen";
import StatsScreen from "./pages/StatsScreen";
import ValuesDetailScreen from "./pages/dna/ValuesDetailScreen";
import InterestsDetailScreen from "./pages/dna/InterestsDetailScreen";
import PersonalityDetailScreen from "./pages/dna/PersonalityDetailScreen";
import LifestyleDetailScreen from "./pages/dna/LifestyleDetailScreen";
import GoalsDetailScreen from "./pages/dna/GoalsDetailScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<LayoutDemo />} />
          <Route path="/components" element={<ComponentsDemo />} />
          <Route path="/discover" element={<DiscoverScreen />} />
          <Route path="/dna" element={<DNAScreen />} />
          <Route path="/myagent" element={<MyAgentScreen />} />
          <Route path="/insights" element={<InsightsScreen />} />
          <Route path="/agent-chat" element={<AgentChatScreen />} />
          <Route path="/stats" element={<StatsScreen />} />
          <Route path="/dna/values" element={<ValuesDetailScreen />} />
          <Route path="/dna/interests" element={<InterestsDetailScreen />} />
          <Route path="/dna/personality" element={<PersonalityDetailScreen />} />
          <Route path="/dna/lifestyle" element={<LifestyleDetailScreen />} />
          <Route path="/dna/goals" element={<GoalsDetailScreen />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
