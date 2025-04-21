import { useState, useEffect } from 'react';
import { Button } from '../UI/Fantasy/Button';

interface TextToSpeechProps {
  text: string;
  autoPlay?: boolean;
  voiceURI?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export default function TextToSpeech({
  text,
  autoPlay = false,
  voiceURI = '',
  rate = 1,
  pitch = 1,
  volume = 1
}: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Initialize voices when the component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        // Try to find the requested voice or use a default
        let voice;
        
        if (voiceURI) {
          voice = availableVoices.find(v => v.voiceURI === voiceURI);
        }
        
        // If no specific voice is requested or not found, use a deeper male voice if available
        if (!voice) {
          // Try to find a good voice for the DM (deeper male voice if available)
          voice = availableVoices.find(v => v.name.includes('Male') && v.lang.startsWith('en')) ||
                 availableVoices.find(v => v.lang.startsWith('en')) ||
                 availableVoices[0];
        }
        
        setSelectedVoice(voice);
      }
    };
    
    // Load voices immediately if available
    loadVoices();
    
    // Also set up an event listener because voices might load asynchronously
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      }
    };
  }, [voiceURI]);
  
  // Auto-play text when it changes if autoPlay is enabled
  useEffect(() => {
    if (autoPlay && text && selectedVoice && !isSpeaking) {
      speakText();
    }
    
    return () => {
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      }
    };
  }, [text, selectedVoice, autoPlay]);
  
  const speakText = () => {
    if (!text || !selectedVoice || typeof speechSynthesis === 'undefined') return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    speechSynthesis.speak(utterance);
  };
  
  const pauseSpeech = () => {
    if (typeof speechSynthesis === 'undefined') return;
    
    speechSynthesis.pause();
    setIsPaused(true);
  };
  
  const resumeSpeech = () => {
    if (typeof speechSynthesis === 'undefined') return;
    
    speechSynthesis.resume();
    setIsPaused(false);
  };
  
  const stopSpeech = () => {
    if (typeof speechSynthesis === 'undefined') return;
    
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };
  
  // If speech synthesis is not available
  if (typeof speechSynthesis === 'undefined') {
    return null;
  }
  
  return (
    <div className="text-to-speech-controls flex gap-2">
      {!isSpeaking ? (
        <Button 
          onClick={speakText}
          size="sm"
          variant="ghost"
          className="flex items-center gap-1"
        >
          <i className="fas fa-volume-up"></i>
          <span>Listen</span>
        </Button>
      ) : isPaused ? (
        <Button 
          onClick={resumeSpeech}
          size="sm"
          variant="ghost"
          className="flex items-center gap-1"
        >
          <i className="fas fa-play"></i>
          <span>Resume</span>
        </Button>
      ) : (
        <Button 
          onClick={pauseSpeech}
          size="sm"
          variant="ghost"
          className="flex items-center gap-1"
        >
          <i className="fas fa-pause"></i>
          <span>Pause</span>
        </Button>
      )}
      
      {(isSpeaking || isPaused) && (
        <Button 
          onClick={stopSpeech}
          size="sm"
          variant="ghost"
          className="flex items-center gap-1"
        >
          <i className="fas fa-stop"></i>
          <span>Stop</span>
        </Button>
      )}
    </div>
  );
}