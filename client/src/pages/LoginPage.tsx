import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI/Fantasy/Button';
import { Panel } from '../components/UI/Fantasy/Panel';
import { playClick, playSuccess, playError } from '../lib/soundEffects';
import '../assets/fonts.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Here you would add the actual authentication logic
      // For now we'll just simulate a successful login
      playClick();
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check credentials (replace with actual auth logic later)
      if (username && password) {
        // Success!
        playSuccess();
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        navigate('/main-menu');
      } else {
        // Failed login
        playError();
        setError('Invalid username or password');
      }
    } catch (err) {
      playError();
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-page" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: "url('/src/assets/backgrounds/intro-bg.svg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Panel className="login-panel" style={{
        width: '400px',
        maxWidth: '90%',
        padding: '30px',
        backdropFilter: 'blur(10px)',
      }}>
        <h1 className="text-gold text-shadow font-title text-center text-3xl mb-6">
          Realm of Legends
        </h1>
        
        <p className="text-center mb-8 font-body text-gray-300">
          Enter your credentials to begin your adventure
        </p>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label 
              htmlFor="username" 
              className="block font-title text-gold mb-2 text-sm"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light"
              placeholder="Enter your username"
            />
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block font-title text-gold mb-2 text-sm"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light"
              placeholder="Enter your password"
            />
          </div>
          
          {error && (
            <div className="error-message mb-4 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full mb-4"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Enter the Realm'}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-primary-light hover:text-primary-dark text-sm transition-colors"
            >
              Create a New Account
            </button>
          </div>
        </form>
      </Panel>
      
      <div className="mt-8 text-white text-opacity-70 text-sm">
        <p>© 2025 Realm of Legends - An AI-Powered RPG Experience</p>
      </div>
    </div>
  );
}