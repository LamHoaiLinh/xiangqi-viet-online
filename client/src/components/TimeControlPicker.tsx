import { useState } from 'react';
import { timePresets } from '../utils/constants';

export default function TimeControlPicker({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [preset, setPreset] = useState('15 phút + 5 giây');
  const [minutes, setMinutes] = useState(15);
  const [inc, setInc] = useState(5);
  function choose(label: string) {
    setPreset(label);
    const p = timePresets.find(x => x.label === label)!;
    if (p.mode === 'custom') onChange({ mode: inc > 0 ? 'increment' : 'fixed', initialMs: minutes * 60000, incrementMs: inc * 1000 });
    else onChange({ mode: p.mode, initialMs: p.initialMs, incrementMs: p.incrementMs });
  }
  function applyCustom(m = minutes, i = inc) { onChange({ mode: i > 0 ? 'increment' : 'fixed', initialMs: Math.max(1, m) * 60000, incrementMs: Math.max(0, i) * 1000 }); }
  return <div className="time-picker">
    <label>Thời gian ván đấu</label>
    <select value={preset} onChange={e => choose(e.target.value)}>{timePresets.map(p => <option key={p.label}>{p.label}</option>)}</select>
    {preset === 'Tùy chỉnh' && <div className="grid-2"><input type="number" min={1} value={minutes} onChange={e => { const v = Number(e.target.value); setMinutes(v); applyCustom(v, inc); }} placeholder="Phút mỗi bên"/><input type="number" min={0} value={inc} onChange={e => { const v = Number(e.target.value); setInc(v); applyCustom(minutes, v); }} placeholder="Giây cộng thêm"/></div>}
    <p className="hint">Ví dụ 15 phút + 5 giây: mỗi bên có 15 phút ban đầu, đi xong một nước hợp lệ được cộng 5 giây. Nếu cộng thêm 0 giây thì không có tích lũy.</p>
  </div>;
}
