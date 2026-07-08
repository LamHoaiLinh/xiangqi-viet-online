export default function GameClock({ label, ms, active, enabled }: { label: string; ms: number; active: boolean; enabled: boolean }) {
  if (!enabled) return <div className="clock off"><span>{label}</span><b>Không tính giờ</b></div>;
  const total = Math.max(0, Math.floor(ms / 1000)); const m = Math.floor(total / 60); const s = total % 60;
  return <div className={`clock ${active ? 'active' : ''} ${total <= 10 ? 'danger' : ''}`}><span>{label}</span><b>{m}:{s.toString().padStart(2,'0')}</b></div>;
}
