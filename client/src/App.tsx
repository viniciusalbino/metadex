import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useRoute } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import Tournaments from "./pages/Tournaments";
import DeckBuilder from "./pages/DeckBuilder";
import BattleLog from "./pages/BattleLog";
import Metagame from "./pages/Metagame";

function Router() {
  // Don't show navbar on auth pages
  const [isAuthPage] = useRoute("/auth");
  const [isVerifyPage] = useRoute("/verify-email");
  const hideNavbar = isAuthPage || isVerifyPage;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path={"/tournaments"} component={Tournaments} />
        <Route path={"/decks"} component={DeckBuilder} />
        <Route path={"/battle-log"} component={BattleLog} />
        <Route path={"/metagame"} component={Metagame} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

