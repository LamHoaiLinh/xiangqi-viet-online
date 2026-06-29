import { useEffect, useRef, useState } from 'react';

const MUSIC_SRC = '/assets/sounds/Nhacnen.m4a';
const DEFAULT_VOLUME = 0.35;

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Mặc định mỗi lần mở game là bật nhạc. Trình duyệt có thể chặn đến khi người dùng chạm/click lần đầu.
  const [on, setOn] = useState(true);
  const [volume, setVolume] = useState(() => {
    const raw = Number(localStorage.getItem('xiangqi_music_volume'));
    return Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : DEFAULT_VOLUME;
  });
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
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const safeVolume = Math.min(1, Math.max(0, volume));
    audio.volume = safeVolume;
    audio.muted = safeVolume <= 0.001;
    localStorage.setItem('xiangqi_music_volume', String(safeVolume));

    if (!on || safeVolume <= 0.001) {
      audio.pause();
      return;
    }
    audio.play().catch(() => {});
  }, [volume, on]);

  useEffect(() => {
    const tryPlay = () => {
      const audio = audioRef.current;
      if (!audio || !on || volume <= 0.001) return;
      audio.muted = false;
      audio.volume = Math.min(1, Math.max(0, volume));
      audio.play().catch(() => {});
    };
    tryPlay();
    window.addEventListener('pointerdown', tryPlay, { passive: true });
    window.addEventListener('keydown', tryPlay);
    window.addEventListener('touchstart', tryPlay, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
      window.removeEventListener('touchstart', tryPlay);
    };
  }, [on, volume]);

  const effectiveOn = on && volume > 0.001;
  const toggleMusic = () => {
    setMissing(false);
    setOn(v => {
      const next = !v;
      if (next && volume <= 0.001) setVolume(DEFAULT_VOLUME);
      return next;
    });
  };

  return <div className={`music-panel ${expanded ? 'open' : ''}`}>
    <button className={`music-toggle ${effectiveOn ? 'on' : ''}`} onClick={toggleMusic} title="Nhạc nền">
      <span>{effectiveOn ? '♪' : '♫'}</span>
      <small>{missing ? 'Thiếu Nhacnen.m4a' : effectiveOn ? 'Đang phát nhạc' : volume <= 0.001 ? 'Nhạc nền 0%' : 'Nhạc nền tắt'}</small>
    </button>
    <button className="music-more secondary" onClick={() => setExpanded(v => !v)}>{expanded ? 'Ẩn' : 'Âm lượng'}</button>
    {expanded && <label className="music-volume">Âm lượng <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(Number(e.target.value))}/><b>{Math.round(volume * 100)}%</b></label>}
  </div>;
}
