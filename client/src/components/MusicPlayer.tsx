import { useEffect, useRef, useState } from 'react';

const MUSIC_SRC = '/assets/sounds/Nhacnen.m4a';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(() => {
    const saved = localStorage.getItem('xiangqi_music_on');
    return saved === null ? true : saved === '1';
  });
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(MUSIC_SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = Number(localStorage.getItem('xiangqi_music_volume') || '0.35');
      audio.addEventListener('error', () => setMissing(true));
      audioRef.current = audio;
    }

    const tryPlay = () => {
      if (!audioRef.current || !on) return;
      audioRef.current.play().catch(() => {
        // Browser may block autoplay before first interaction.
        // Keep state on and retry on the next interaction.
      });
    };

    if (on) {
      tryPlay();
    } else {
      audioRef.current.pause();
    }

    const resumeOnGesture = () => {
      if (on) tryPlay();
    };

    window.addEventListener('pointerdown', resumeOnGesture, { passive: true });
    window.addEventListener('keydown', resumeOnGesture);
    window.addEventListener('touchstart', resumeOnGesture, { passive: true });
    localStorage.setItem('xiangqi_music_on', on ? '1' : '0');

    return () => {
      window.removeEventListener('pointerdown', resumeOnGesture);
      window.removeEventListener('keydown', resumeOnGesture);
      window.removeEventListener('touchstart', resumeOnGesture);
    };
  }, [on]);

  const toggle = () => {
    setMissing(false);
    setOn(v => !v);
  };

  return <button className={`music-toggle ${on ? 'on' : ''}`} onClick={toggle} title="Nhạc nền">
    <span>{on ? '♪' : '♫'}</span>
    <small>{missing ? 'Thiếu file Nhacnen.m4a' : on ? 'Đang phát nhạc' : 'Nhạc nền tắt'}</small>
  </button>;
}
