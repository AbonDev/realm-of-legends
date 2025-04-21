import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI/Fantasy/Button';
import { Panel } from '../components/UI/Fantasy/Panel';
import { playClick, playSuccess } from '../lib/soundEffects';
import '../assets/fonts.css';

export default function MainMenuPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Adventurer');
  const [savedGames, setSavedGames] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    // This would fetch saved games from an API in a real implementation
    // For now, we'll use mock data
    setSavedGames([
      { id: 1, name: 'The Dark Forest', lastPlayed: '2025-04-18', level: 5 },
      { id: 2, name: 'Mountain of Doom', lastPlayed: '2025-04-10', level: 3 }
    ]);
    
    // Might play background music here
  }, []);
  
  const handleNewGame = () => {
    playClick();
    navigate('/character-creation');
  };
  
  const handleLoadGame = (gameId: number) => {
    playClick();
    // This would load the game data
    navigate(`/game/${gameId}`);
  };
  
  const handleSettings = () => {
    playClick();
    setShowSettings(!showSettings);
  };
  
  const handleLogout = () => {
    playSuccess();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    navigate('/');
  };
  
  return (
    <div className="main-menu" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: "url('/src/assets/backgrounds/character-bg.svg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="main-title text-center mb-8">
        <h1 className="text-gold text-shadow font-title text-5xl mb-2">
          Realm of Legends
        </h1>
        <p className="text-gray-300 font-body">
          Welcome back, <span className="text-gold">{username}</span>
        </p>
      </div>
      
      <div className="menu-container flex gap-6">
        {/* Main menu options */}
        <Panel className="menu-options" style={{
          width: '300px',
          padding: '30px',
          backdropFilter: 'blur(10px)',
        }}>
          <h2 className="text-gold text-shadow font-title text-2xl mb-6 text-center">
            Main Menu
          </h2>
          
          <div className="flex flex-col gap-4">
            <Button onClick={handleNewGame} className="w-full">
              New Adventure
            </Button>
            
            <Button 
              onClick={() => navigate('/load-game')} 
              variant="secondary" 
              className="w-full"
              disabled={savedGames.length === 0}
            >
              Load Game {savedGames.length > 0 && `(${savedGames.length})`}
            </Button>
            
            <Button onClick={handleSettings} variant="ghost" className="w-full">
              Settings
            </Button>
            
            <Button onClick={handleLogout} variant="ghost" className="w-full">
              Logout
            </Button>
          </div>
        </Panel>
        
        {/* Recent games or settings panel */}
        <Panel className="secondary-panel" style={{
          width: '400px',
          padding: '30px',
          height: '400px',
          backdropFilter: 'blur(10px)',
          overflowY: 'auto'
        }}>
          {showSettings ? (
            <>
              <h2 className="text-gold text-shadow font-title text-2xl mb-6 text-center">
                Settings
              </h2>
              
              <div className="settings-content">
                <div className="setting-group mb-4">
                  <label className="block font-title text-gold mb-2 text-sm">
                    Music Volume
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="70" 
                    className="w-full" 
                  />
                </div>
                
                <div className="setting-group mb-4">
                  <label className="block font-title text-gold mb-2 text-sm">
                    Sound Effects Volume
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="80" 
                    className="w-full" 
                  />
                </div>
                
                <div className="setting-group mb-4">
                  <label className="block font-title text-gold mb-2 text-sm">
                    Display Mode
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white">
                    <option>Fullscreen</option>
                    <option>Windowed</option>
                  </select>
                </div>
                
                <Button className="w-full mt-6">
                  Save Settings
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-gold text-shadow font-title text-2xl mb-6 text-center">
                Recent Adventures
              </h2>
              
              {savedGames.length === 0 ? (
                <div className="text-center text-gray-400 font-body">
                  <p>No saved games found.</p>
                  <p className="mt-2">Start a new adventure!</p>
                </div>
              ) : (
                <div className="saved-games flex flex-col gap-4">
                  {savedGames.map(game => (
                    <div 
                      key={game.id}
                      className="saved-game bg-gray-900 bg-opacity-60 rounded-md p-4 cursor-pointer hover:bg-opacity-80 transition-all"
                      onClick={() => handleLoadGame(game.id)}
                    >
                      <h3 className="text-gold font-title text-lg">{game.name}</h3>
                      <div className="flex justify-between mt-2 text-sm text-gray-300">
                        <span>Level {game.level}</span>
                        <span>Last played: {game.lastPlayed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Panel>
      </div>
      
      <div className="version-info mt-12 text-white text-opacity-70 text-sm">
        <p>Realm of Legends v0.1.0 • AI Dungeon Master Edition</p>
      </div>
    </div>
  );
}