import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import track1 from '../assets/audio/leberch-deep-meditation-375362.mp3';
import track2 from '../assets/audio/leberch-meditation-510292.mp3';
import track3 from '../assets/audio/leberch-meditation-meditation-music-523576.mp3';
import track4 from '../assets/audio/sigmamusicart-meditation-meditation-music-514539.mp3';

const tracks = [track1, track2, track3, track4];

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const trackIdxRef = useRef(0);

  useEffect(() => {
    const audio = new Audio(tracks[0]);
    audioRef.current = audio;
    
    // Attempt autoplay when app loads
    audio.play().catch(() => {
      // Browsers block autoplay, wait for interaction
      const playOnInteract = () => {
        if (audio.paused) {
          audio.play().catch(console.error);
        }
        document.removeEventListener('click', playOnInteract);
        document.removeEventListener('keydown', playOnInteract);
      };
      document.addEventListener('click', playOnInteract);
      document.addEventListener('keydown', playOnInteract);
    });

    const playNext = () => {
      trackIdxRef.current = (trackIdxRef.current + 1) % tracks.length;
      audio.src = tracks[trackIdxRef.current];
      audio.play().catch(console.error);
    };

    audio.addEventListener('ended', playNext);
    return () => {
      audio.removeEventListener('ended', playNext);
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    // If we're unmuting and audio isn't playing, try to play
    if (isMuted && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
    }
  }, [isMuted]);

  const forcePlay = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
    }
  }, []);

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, forcePlay }}>
      {children}
    </AudioContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
