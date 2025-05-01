import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  
  // State flags
  isMuted: boolean;
  isMusicPlaying: boolean;
  areSoundEffectsEnabled: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  toggleMusic: () => void;
  toggleSoundEffects: () => void;
  playHit: () => void;
  playSuccess: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: true, // Start muted by default
  isMusicPlaying: false,
  areSoundEffectsEnabled: false,
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  toggleMusic: () => {
    const { isMusicPlaying, backgroundMusic } = get();
    const newState = !isMusicPlaying;
    
    // Update state
    set({ isMusicPlaying: newState });
    
    // Control actual audio playback
    if (backgroundMusic) {
      if (newState) {
        backgroundMusic.play().catch(error => {
          console.log("Music play prevented:", error);
        });
      } else {
        backgroundMusic.pause();
      }
    }
    
    // Log the change
    console.log(`Music ${newState ? 'started' : 'stopped'}`);
  },
  
  toggleSoundEffects: () => {
    const { areSoundEffectsEnabled } = get();
    const newState = !areSoundEffectsEnabled;
    
    // Update state
    set({ areSoundEffectsEnabled: newState });
    
    // Log the change
    console.log(`Sound effects ${newState ? 'enabled' : 'disabled'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  }
}));
