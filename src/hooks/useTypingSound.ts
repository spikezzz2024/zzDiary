import { useCallback, useEffect, useRef, useState } from 'react';

type ProfileKey = 'mechanical' | 'mech1' | 'mech2' | 'old-mech' | 'laptop';

interface SoundProfile {
  label: string;
  files: string[];
  poolSize: number;
}

const SOUND_PROFILES: Record<ProfileKey, SoundProfile> = {
  mechanical: {
    label: '机械键盘',
    files: [
      '/sounds/key-sounds/mechanical-0.mp3',
      '/sounds/key-sounds/mechanical-1.mp3',
      '/sounds/key-sounds/mechanical-2.mp3',
      '/sounds/key-sounds/mechanical-3.mp3',
    ],
    poolSize: 3,
  },
  mech1: {
    label: '机械键盘1',
    files: ['/sounds/key-sounds/mech1.mp3'],
    poolSize: 4,
  },
  mech2: {
    label: '机械键盘2',
    files: ['/sounds/key-sounds/mech2.mp3'],
    poolSize: 4,
  },
  'old-mech': {
    label: '老式机械键盘',
    files: ['/sounds/key-sounds/old-mech.mp3'],
    poolSize: 4,
  },
  laptop: {
    label: '笔记本键盘',
    files: ['/sounds/key-sounds/laptop.mp3'],
    poolSize: 4,
  },
};

export const SOUND_PROFILE_KEYS = Object.keys(SOUND_PROFILES) as ProfileKey[];

function loadSetting<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveSetting<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

const LS_PROFILE = 'typing-sound-profile';
const LS_VOLUME = 'typing-sound-volume';
const LS_ENABLED = 'typing-sound-enabled';

export function useTypingSound() {
  const [profile, setProfileState] = useState<ProfileKey>(() =>
    loadSetting<ProfileKey>(LS_PROFILE, 'mechanical'));
  const [enabled, setEnabledState] = useState<boolean>(() =>
    loadSetting<boolean>(LS_ENABLED, true));
  const [volume, setVolumeState] = useState<number>(() =>
    loadSetting<number>(LS_VOLUME, 50));

  const poolRef = useRef<HTMLAudioElement[]>([]);
  const indexRef = useRef(0);

  const buildPool = useCallback((p: ProfileKey, vol: number) => {
    poolRef.current.forEach(a => { a.pause(); a.src = ''; });
    poolRef.current = [];
    const cfg = SOUND_PROFILES[p];
    cfg.files.forEach(src => {
      for (let i = 0; i < cfg.poolSize; i++) {
        const audio = new Audio(src);
        audio.volume = vol / 100;
        poolRef.current.push(audio);
      }
    });
    indexRef.current = 0;
  }, []);

  useEffect(() => {
    buildPool(profile, volume);
  }, [profile, buildPool]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    poolRef.current.forEach(a => { a.volume = volume / 100; });
  }, [volume]);

  const setProfile = useCallback((p: ProfileKey) => {
    setProfileState(p);
    saveSetting(LS_PROFILE, p);
    buildPool(p, volume);
  }, [volume, buildPool]);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    saveSetting(LS_ENABLED, v);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    saveSetting(LS_VOLUME, v);
  }, []);

  const play = useCallback(() => {
    if (!enabled || poolRef.current.length === 0) return;
    const audio = poolRef.current[indexRef.current % poolRef.current.length];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
    indexRef.current++;
  }, [enabled]);

  return { play, profile, setProfile, enabled, setEnabled, volume, setVolume };
}
