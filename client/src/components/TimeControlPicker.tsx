import { useState } from 'react';
import { timePresets } from '../utils/constants';

export default function TimeControlPicker({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [preset, setPreset] = useState('15 phút/ván · 2 phút/nước');
  const [minutes, setMinutes] = useState(15);
  const [perMoveSeconds, setPerMoveSeconds] = useState(120);
  const [useIncrement, setUseIncrement] = useState(false);
  const [inc, setInc] = useState(5);
  function baseFromPreset(label = preset) {
    if (label === 'Tùy chỉnh') return { mode: 'fixed', initialMs: Math.max(1, minutes) * 60000, perMoveMs: Math.max(0, perMoveSeconds) * 1000 };
    const p = timePresets.find(x => x.label === label)!;
    return { mode: p.mode, initialMs: p.initialMs, perMoveMs: p.perMoveMs || 0 };
  }
  function commit(base: any, useInc = useIncrement, incSeconds = inc) {
    if (base.mode === 'none') return onChange({ mode: 'none', initialMs: base.initialMs || 15 * 60000, perMoveMs: 0, incrementMs: 0 });
    const incrementMs = useInc ? Math.max(0, incSeconds) * 1000 : 0;
    onChange({ ...base, mode: incrementMs > 0 ? 'increment' : 'fixed', incrementMs });
  }
  function choose(label: string) { setPreset(label); commit(baseFromPreset(label)); }
  function applyCustom(m = minutes, pms = perMoveSeconds, useInc = useIncrement, i = inc) { commit({ mode: 'fixed', initialMs: Math.max(1, m) * 60000, perMoveMs: Math.max(0, pms) * 1000 }, useInc, i); }
  return <div className="time-picker card inner">
    <h3>Thời gian ván đấu</h3>
    <label>Chọn nhanh<select value={preset} onChange={e => choose(e.target.value)}>{timePresets.map(p => <option key={p.label}>{p.label}</option>)}</select></label>
    {preset === 'Tùy chỉnh' && <div className="grid-2"><label>Phút mỗi bên<input type="number" min={1} value={minutes} onChange={e => { const v = Number(e.target.value); setMinutes(v); applyCustom(v, perMoveSeconds); }} /></label><label>Giây mỗi nước<input type="number" min={0} value={perMoveSeconds} onChange={e => { const v = Number(e.target.value); setPerMoveSeconds(v); applyCustom(minutes, v); }} /></label></div>}
    {preset !== 'Không tính giờ' && <label className="check"><input type="checkbox" checked={useIncrement} onChange={e => { const checked = e.target.checked; setUseIncrement(checked); commit(baseFromPreset(), checked, inc); }} /> Thời gian tích lũy</label>}
    {preset !== 'Không tính giờ' && useIncrement && <label>Giây cộng thêm sau mỗi nước<input type="number" min={0} max={120} value={inc} onChange={e => { const v = Number(e.target.value); setInc(v); commit(baseFromPreset(), true, v); }} /></label>}
    <p className="hint">Ví dụ: 15 phút/ván, 2 phút mỗi nước. Nếu tick “Thời gian tích lũy” và nhập 5 thì đi xong một nước được cộng thêm 5 giây.</p>
  </div>;
}
