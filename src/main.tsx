import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { UserProvider } from './context/UserContext';
import { MatchesProvider } from './context/MatchesContext';
import { DNAProvider } from './context/DNAContext';
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <UserProvider>
            <MatchesProvider>
              <DNAProvider>
                <App />
              </DNAProvider>
            </MatchesProvider>
          </UserProvider>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
