import { useState, useEffect, useCallback } from 'react';
import { Button } from '../UI/Fantasy/Button';
import { playClick, playSuccess } from '../../lib/soundEffects';

interface SpeechRecognitionProps {
  onSpeechResult: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

// TypeScript definitions for SpeechRecognition
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

// Check if browser supports speech recognition
const browserSpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const hasSpeechRecognition = !!browserSpeechRecognition;

export default function SpeechRecognition({ onSpeechResult, isListening, setIsListening }: SpeechRecognitionProps) {
  const [transcript, setTranscript] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Setup speech recognition instance
  useEffect(() => {
    if (!hasSpeechRecognition) {
      setError('Speech recognition is not supported by your browser.');
      return;
    }
    
    try {
      const recognition = new browserSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Can be made configurable
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript;
        setTranscript(transcriptText);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        // Submit the final transcript when recognition ends
        if (transcript.trim()) {
          onSpeechResult(transcript);
          playSuccess();
        }
      };
      
      setRecognitionInstance(recognition);
      
      // Request microphone permission
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setHasPermission(true);
          setError(null);
        })
        .catch((err) => {
          console.error('Microphone permission error:', err);
          setHasPermission(false);
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
        });
        
      return () => {
        if (recognition) {
          try {
            recognition.stop();
          } catch (e) {
            // Recognition wasn't started
          }
        }
      };
    } catch (err) {
      console.error('Speech recognition setup error:', err);
      setError('Failed to initialize speech recognition.');
    }
  }, [onSpeechResult]);
  
  const startListening = useCallback(() => {
    if (!recognitionInstance || !hasPermission) return;
    
    try {
      recognitionInstance.start();
      playClick();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition.');
    }
  }, [recognitionInstance, hasPermission]);
  
  const stopListening = useCallback(() => {
    if (!recognitionInstance || !isListening) return;
    
    try {
      recognitionInstance.stop();
    } catch (err) {
      console.error('Failed to stop speech recognition:', err);
    }
  }, [recognitionInstance, isListening]);
  
  if (!hasSpeechRecognition) {
    return (
      <div className="speech-recognition-error">
        <p className="text-red-500">
          Speech recognition is not supported by your browser.
          Please use Chrome, Edge, or Safari for the best experience.
        </p>
      </div>
    );
  }
  
  if (error && !hasPermission) {
    return (
      <div className="speech-recognition-error">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="speech-recognition-container">
      <div className="transcript-display mb-2 min-h-12">
        {isListening && (
          <div className="bg-gray-800 text-white p-2 rounded-md">
            {transcript || 'Listening...'}
          </div>
        )}
      </div>
      
      <Button
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        className={`speech-button ${isListening ? 'bg-red-600 hover:bg-red-700' : ''}`}
        size="lg"
      >
        {isListening ? 'Release to Send' : 'Hold to Speak'}
      </Button>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}