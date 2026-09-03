import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { RADIO } from './config';

type NowPlaying = {
  title?: string;
  artist?: string;
  cover?: string;
  listeners?: number;
};

type RadioContextValue = {
  nowPlaying: NowPlaying | null;
  playing: boolean;
  loading: boolean;
  toggle: () => void;
  refresh: () => Promise<void>;
};

const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer(RADIO.streamUrl, { updateInterval: 1000 });
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  const refresh = async () => {
    try {
      const response = await fetch(`${RADIO.apiBase}/api/now-playing.php?t=${Date.now()}`);
      if (!response.ok) return;
      setNowPlaying(await response.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => undefined);

    refresh();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, []);

  const toggle = () => {
    if (playing) {
      player.pause();
      setPlaying(false);
    } else {
      player.play();
      setPlaying(true);
    }
  };

  const value = useMemo(() => ({ nowPlaying, playing, loading, toggle, refresh }), [nowPlaying, playing, loading]);
  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (!context) throw new Error('useRadio doit être utilisé dans RadioProvider');
  return context;
}
