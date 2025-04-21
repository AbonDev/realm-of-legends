// Sound effect system for UI interactions
import { useAudio } from './stores/useAudio';

// Sound effect types
type SoundType = 'click' | 'select' | 'navigate' | 'success' | 'error' | 'hover';

// Volume levels for different effect types
const volumeLevels: Record<SoundType, number> = {
  click: 0.2,
  select: 0.3,
  navigate: 0.4,
  success: 0.5,
  error: 0.4,
  hover: 0.1
};

// Play a given sound effect if audio is not muted
export function playSoundEffect(type: SoundType): void {
  const { isMuted, hitSound, successSound, playHit, playSuccess } = useAudio.getState();
  
  // If muted, do nothing
  if (isMuted) return;
  
  // Reuse existing sounds for efficiency
  switch (type) {
    case 'success':
      playSuccess();
      break;
      
    case 'click':
    case 'select':
    case 'navigate':
    case 'error':
    case 'hover':
      // Use hitSound with different volumes for these effects
      if (hitSound) {
        // Clone the sound to allow overlapping playback
        const soundClone = hitSound.cloneNode() as HTMLAudioElement;
        soundClone.volume = volumeLevels[type];
        
        // For error sound, adjust pitch down
        if (type === 'error') {
          soundClone.playbackRate = 0.7;
        }
        
        // For hover, use very low volume
        if (type === 'hover') {
          soundClone.playbackRate = 1.5;
        }
        
        // For navigation sounds, use higher pitch
        if (type === 'navigate') {
          soundClone.playbackRate = 1.2;
        }
        
        soundClone.play().catch(error => {
          console.log(`${type} sound play prevented:`, error);
        });
      }
      break;
      
    default:
      console.warn(`Unknown sound effect type: ${type}`);
  }
}

// Short version for use in event handlers
export const playClick = () => playSoundEffect('click');
export const playSelect = () => playSoundEffect('select');
export const playSuccess = () => playSoundEffect('success');
export const playError = () => playSoundEffect('error');
export const playHover = () => playSoundEffect('hover');
