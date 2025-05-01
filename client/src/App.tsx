import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useAudio } from "./lib/stores/useAudio";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "@fontsource/inter";
import "./assets/fonts.css";

// Import all pages
import LoginPage from "./pages/LoginPage";
import MainMenuPage from "./pages/MainMenuPage";
import CharacterCreationPage from "./pages/CharacterCreationPage";
import GamePage from "./pages/GamePage";
import NotFound from "./pages/not-found";
import PaginaDoAugusto from "./pages/PaginaDoAugusto";

// Main App component
function App() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  const { setBackgroundMusic: storeSetBackgroundMusic } = useAudio();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(userLoggedIn);
    
    // Initialize the background music but don't play yet
    const music = new Audio("/sounds/background.mp3");
    music.loop = true;
    music.volume = 0.1;
    setBackgroundMusic(music);
    storeSetBackgroundMusic(music);

    // Set up hit sound and success sound
    const hitSound = new Audio("/sounds/hit.mp3");
    hitSound.volume = 0.1;
    const successSound = new Audio("/sounds/success.mp3");
    successSound.volume = 0.1;
    
    const { setHitSound, setSuccessSound } = useAudio.getState();
    setHitSound(hitSound);
    setSuccessSound(successSound);

    return () => {
      music.pause();
      music.currentTime = 0;
    };
  }, []);

  // Start background music after user interaction
  const handleFirstInteraction = () => {
    if (!hasInteracted && backgroundMusic) {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
      setHasInteracted(true);
    }
  };

  // Protected route component
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    // if (!isLoggedIn) {
    //   return <Navigate to="/" replace />;
    // }
    return children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div 
        className="app-container" 
        onClick={handleFirstInteraction}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--background-dark)'
        }}
      >
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/main-menu" 
              element={
                <ProtectedRoute>
                  <MainMenuPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/character-creation" 
              element={
                <ProtectedRoute>
                  <CharacterCreationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game" 
              element={
                <ProtectedRoute>
                  <GamePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rota-do-augusto" 
              element={
                <ProtectedRoute>
                  <PaginaDoAugusto />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game/:id" 
              element={
                <ProtectedRoute>
                  <GamePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
