import { useEffect, useRef, useState } from 'react';

const MUSIC_SRC = '/assets/sounds/Nhacnen.m4a';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(localStorage.getItem('xiangqi_music_on') === '1');
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(MUSIC_SRC);
      audioRef.current.loop = true;
      audioRef.current.volume = Number(localStorage.getItem('xiangqi_music_volume') || '0.35');
      audioRef.current.addEventListener('error', () => setMissing(true));
    }
    if (on) {
      audioRef.current.play().catch(() => setOn(false));
    } else {
      audioRef.current.pause();
    }
    localStorage.setItem('xiangqi_music_on', on ? '1' : '0');
  }, [on]);

  const toggle = () => {
    setMissing(false);
    setOn(v => !v);
  };

  return <button className={`music-toggle ${on ? 'on' : ''}`} onClick={toggle} title="Nhạc nền">
    <span>{on ? '♪' : '♫'}</span>
    <small>{missing ? 'Chưa có Nhacnen.m4a' : on ? 'Tắt nhạc' : 'Nhạc nền'}</small>
  </button>;
}
