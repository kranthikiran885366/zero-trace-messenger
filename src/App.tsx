import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Features from "./pages/Features";
import JoinRoom from "./pages/JoinRoom";
import CreateRoom from "./pages/CreateRoom";
import FAQ from "./pages/FAQ";
import AppModes from "./pages/AppModes";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Chat from "./pages/Chat";
import VideoCall from "./pages/VideoCall";
import FileShare from "./pages/FileShare";
import RoomManager from "./pages/RoomManager";
import UserAuth from "./pages/UserAuth";
import DarkWebHub from "./pages/DarkWebHub";
import NotFound from "./pages/NotFound";
import { AuthProvider } from './components/UserAuth';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/features" element={<Features />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/app-modes" element={<AppModes />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/chat/:roomId?" element={<Chat />} />
          <Route path="/video/:roomId?" element={<VideoCall />} />
          <Route path="/files" element={<FileShare />} />
          <Route path="/manage" element={<RoomManager />} />
          <Route path="/auth" element={<UserAuth />} />
          <Route path="/underground" element={<DarkWebHub />} />
          <Route path="/room/:roomId" element={<Chat />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
