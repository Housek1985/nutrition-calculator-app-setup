import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // Import Login page
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./components/theme-provider";
import { SessionProvider, useSession } from "./contexts/SessionContext"; // Import SessionProvider and useSession
import { Loader2 } from 'lucide-react'; // Import a loader icon

const queryClient = new QueryClient();

// A wrapper component to handle loading and authentication checks
const AuthWrapper = () => {
  const { isLoading, session, isGuest } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not loading and no session, and not a guest, redirect to login (handled by SessionProvider)
  // Otherwise, render the main app routes
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {(session || isGuest) ? (
        <Route path="/" element={<Index />} />
      ) : (
        // Fallback to login if somehow not authenticated and not guest, and not on login page
        <Route path="/" element={<Login />} />
      )}
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" enableSystem attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <BrowserRouter>
            <SessionProvider> {/* Wrap the entire app with SessionProvider */}
              <AuthWrapper />
            </SessionProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;