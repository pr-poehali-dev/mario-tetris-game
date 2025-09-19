import { useCallback, useRef, useState } from 'react';

interface AudioOptions {
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
}

export const useAudio = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Web Audio Context on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported');
      }
    }
  }, []);

  // Create 8-bit style sound using Web Audio API
  const createBeepSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'square') => {
    if (!isEnabled) return;
    
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [isEnabled, initAudioContext]);

  // Play background music using data URLs (simple melodies)
  const playBackgroundMusic = useCallback((melody: string, options: AudioOptions = {}) => {
    if (!isEnabled) return null;

    try {
      // Stop current background music
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }

      // Create audio element with data URL
      const audio = new Audio(melody);
      audio.volume = options.volume || 0.3;
      audio.loop = options.loop !== false;
      
      if (options.autoplay !== false) {
        audio.play().catch(() => {
          // Handle autoplay restrictions
          console.log('Background music blocked by browser policy');
        });
      }

      activeAudioRef.current = audio;
      return audio;
    } catch (error) {
      console.warn('Error playing background music:', error);
      return null;
    }
  }, [isEnabled]);

  const stopBackgroundMusic = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
  }, []);

  // Game sound effects using Web Audio API
  const playSound = useCallback((soundType: string) => {
    if (!isEnabled) return;
    
    initAudioContext();
    
    switch (soundType) {
      case 'jump':
        // Mario jump sound - ascending notes
        createBeepSound(330, 0.1);
        setTimeout(() => createBeepSound(440, 0.1), 50);
        setTimeout(() => createBeepSound(550, 0.15), 100);
        break;
        
      case 'coin':
        // Coin collect sound - bright ascending
        createBeepSound(880, 0.1);
        setTimeout(() => createBeepSound(1320, 0.15), 50);
        break;
        
      case 'enemy':
        // Enemy hit sound - descending harsh
        createBeepSound(220, 0.2, 'sawtooth');
        setTimeout(() => createBeepSound(110, 0.3, 'sawtooth'), 100);
        break;
        
      case 'line-clear':
        // Line clear sound - ascending triumph
        [440, 554, 659, 880].forEach((freq, i) => {
          setTimeout(() => createBeepSound(freq, 0.2), i * 50);
        });
        break;
        
      case 'game-over':
        // Game over sound - descending sad
        [330, 277, 220, 175].forEach((freq, i) => {
          setTimeout(() => createBeepSound(freq, 0.4, 'triangle'), i * 200);
        });
        break;
        
      case 'menu-select':
        // Menu selection sound
        createBeepSound(660, 0.1);
        break;
        
      case 'pause':
        // Pause sound
        createBeepSound(440, 0.2);
        setTimeout(() => createBeepSound(220, 0.2), 100);
        break;
        
      default:
        createBeepSound(440, 0.1);
    }
  }, [isEnabled, initAudioContext, createBeepSound]);

  const toggleAudio = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (!isEnabled) {
      stopBackgroundMusic();
    }
  }, [isEnabled, stopBackgroundMusic]);

  return {
    isEnabled,
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    toggleAudio,
    initAudioContext
  };
};