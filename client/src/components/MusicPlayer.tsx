import { useEffect, useRef, useState } from 'react';

const MUSIC_SRC = '/assets/sounds/Nhacnen.m4a';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(() => {
    const saved = localStorage.getItem('xiangqi_music_on');
    return saved === null ? true : saved === '1';
  });
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('xiangqi_music_volume') || '0.35'));
  const [expanded, setExpanded] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(MUSIC_SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.addEventListener('error', () => setMissing(true));
      audioRef.current = audio;
    }
    audioRef.current.volume = Math.min(1, Math.max(0, volume));
    localStorage.setItem('xiangqi_music_volume', String(volume));
  }, [volume]);

  useEffect(() => {
    const tryPlay = () => {
      if (!audioRef.current || !on) return;
      audioRef.current.play().catch(() => {});
    };
    if (on) tryPlay(); else audioRef.current?.pause();
    const resumeOnGesture = () => { if (on) tryPlay(); };
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

  return <div className={`music-panel ${expanded ? 'open' : ''}`}>
    <button className={`music-toggle ${on ? 'on' : ''}`} onClick={() => { setMissing(false); setOn(v => !v); }} title="Nhạc nền">
      <span>{on ? '♪' : '♫'}</span>
      <small>{missing ? 'Thiếu Nhacnen.m4a' : on ? 'Đang phát nhạc' : 'Nhạc nền tắt'}</small>
    </button>
    <button className="music-more secondary" onClick={() => setExpanded(v => !v)}>{expanded ? 'Ẩn' : 'Âm lượng'}</button>
    {expanded && <label className="music-volume">Âm lượng <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))}/><b>{Math.round(volume * 100)}%</b></label>}
  </div>;
}
