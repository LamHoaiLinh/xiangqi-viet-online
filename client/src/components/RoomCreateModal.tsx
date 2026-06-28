import { useState } from 'react';
import { Socket } from 'socket.io-client';
import TimeControlPicker from './TimeControlPicker';
import ThemeCustomizer from './ThemeCustomizer';
import { defaultTheme } from '../utils/constants';
import { darkSwapLabel, DarkSwapMode, GameMode } from '../../../shared/gameTypes';

const swapOptions: Array<{ value: DarkSwapMode; label: string }> = [
  { value: 'none', label: darkSwapLabel.none },
  { value: 'horse_advisor', label: darkSwapLabel.horse_advisor },
  { value: 'cannon_elephant', label: darkSwapLabel.cannon_elephant },
  { value: 'rook_advisor', label: darkSwapLabel.rook_advisor },
  { value: 'rook_horse', label: darkSwapLabel.rook_horse }
];

export default function RoomCreateModal({ socket, playerId, onClose }: { socket: Socket | null; playerId: string; onClose: () => void }) {
  const [name, setName] = useState('Bàn cờ của tôi');
  const [displayName, setDisplayName] = useState(localStorage.getItem('xiangqi_viet_name') || 'Anh Linh');
  const [side, setSide] = useState('red');
  const [isPublic, setPublic] = useState(true);
  const [allowSpectators, setAllowSpectators] = useState(true);
  const [password, setPassword] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('xiangqi');
  const [darkOptions, setDarkOptions] = useState<{ redSwap: DarkSwapMode; blackSwap: DarkSwapMode }>({ redSwap: 'none', blackSwap: 'none' });
  const [revealCapturedHiddenToAll, setRevealCapturedHiddenToAll] = useState(false);
  const [revealCapturedHiddenToOwner, setRevealCapturedHiddenToOwner] = useState(true);
  const [timeControl, setTimeControl] = useState<any>({ mode: 'increment', initialMs: 15 * 60000, incrementMs: 5000 });
  const [theme, setTheme] = useState<any>(defaultTheme);

  const submit = () => {
    localStorage.setItem('xiangqi_viet_name', displayName);
    socket?.emit('room:create', { name, displayName, playerId, side, isPublic, allowSpectators, password: isPublic ? '' : password, timeControl, theme, gameMode, darkOptions, revealCapturedHiddenToAll, revealCapturedHiddenToOwner });
    onClose();
  };

  return <div className="modal-backdrop"><div className="modal wide"><h2>Tạo bàn mới</h2><div className="grid-2"><label>Tên bàn<input value={name} onChange={e => setName(e.target.value)} maxLength={40}/></label><label>Tên của bạn<input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={20}/></label><label>Chế độ chơi<select value={gameMode} onChange={e => setGameMode(e.target.value as GameMode)}><option value="xiangqi">Cờ Tướng</option><option value="dark">Cờ Úp</option></select></label><label>Chọn bên<select value={side} onChange={e => setSide(e.target.value)}><option value="red">Cầm Đỏ</option><option value="black">Cầm Đen</option><option value="auto">Tự động</option></select></label><label>Loại bàn<select value={isPublic ? 'public' : 'private'} onChange={e => setPublic(e.target.value === 'public')}><option value="public">Công khai</option><option value="private">Riêng tư</option></select></label></div>{gameMode === 'dark' && <section className="card inner"><h3>Tùy chọn Cờ Úp</h3><p className="hint">Quân úp giờ là quân trống, không hiện chữ “Úp”. Khi đi hoặc ăn thì mới lật quân thật. Tướng vẫn ở trong cung. Các quân đã lật ở Cờ Úp được đi theo luật đã cấu hình.</p><div className="grid-2"><label>Đỏ chọn hoán đổi<select value={darkOptions.redSwap} onChange={e => setDarkOptions(v => ({ ...v, redSwap: e.target.value as DarkSwapMode }))}>{swapOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label><label>Đen chọn hoán đổi<select value={darkOptions.blackSwap} onChange={e => setDarkOptions(v => ({ ...v, blackSwap: e.target.value as DarkSwapMode }))}>{swapOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label></div><label className="check"><input type="checkbox" checked={revealCapturedHiddenToAll} onChange={e => setRevealCapturedHiddenToAll(e.target.checked)} /> Mọi người đều được xem quân úp đã bị ăn</label><label className="check"><input type="checkbox" checked={revealCapturedHiddenToOwner} onChange={e => setRevealCapturedHiddenToOwner(e.target.checked)} /> Chủ quân được xem quân úp của mình khi đã bị ăn</label></section>}{!isPublic && <label>Mật khẩu bàn<input value={password} onChange={e => setPassword(e.target.value)} placeholder="Để trống nếu chỉ muốn riêng tư bằng link"/></label>}<label className="check"><input type="checkbox" checked={allowSpectators} onChange={e => setAllowSpectators(e.target.checked)}/> Cho người khác quan sát</label><TimeControlPicker value={timeControl} onChange={setTimeControl}/><ThemeCustomizer theme={theme} onChange={setTheme}/><div className="actions"><button className="secondary" onClick={onClose}>Hủy</button><button onClick={submit}>Tạo bàn</button></div></div></div>;
}
