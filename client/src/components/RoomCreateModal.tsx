import { useState } from 'react';
import { Socket } from 'socket.io-client';
import TimeControlPicker from './TimeControlPicker';
import ThemeCustomizer from './ThemeCustomizer';
import { defaultTheme } from '../utils/constants';

export default function RoomCreateModal({ socket, playerId, onClose }: { socket: Socket | null; playerId: string; onClose: () => void }) {
  const [name, setName] = useState('Bàn cờ của anh Linh');
  const [displayName, setDisplayName] = useState(localStorage.getItem('xiangqi_viet_name') || 'Anh Linh');
  const [side, setSide] = useState('red'); const [isPublic, setPublic] = useState(true); const [allowSpectators, setAllowSpectators] = useState(true); const [password, setPassword] = useState('');
  const [timeControl, setTimeControl] = useState<any>({ mode: 'increment', initialMs: 15 * 60000, incrementMs: 5000 }); const [theme, setTheme] = useState<any>(defaultTheme);
  const submit = () => { localStorage.setItem('xiangqi_viet_name', displayName); socket?.emit('room:create', { name, displayName, playerId, side, isPublic, allowSpectators, password: isPublic ? '' : password, timeControl, theme }); onClose(); };
  return <div className="modal-backdrop"><div className="modal wide"><h2>Tạo bàn mới</h2><div className="grid-2"><label>Tên bàn<input value={name} onChange={e => setName(e.target.value)} maxLength={40}/></label><label>Tên của bạn<input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={20}/></label><label>Chọn bên<select value={side} onChange={e => setSide(e.target.value)}><option value="red">Cầm Đỏ</option><option value="black">Cầm Đen</option><option value="auto">Tự động</option></select></label><label>Loại bàn<select value={isPublic ? 'public' : 'private'} onChange={e => setPublic(e.target.value === 'public')}><option value="public">Công khai</option><option value="private">Riêng tư</option></select></label></div>{!isPublic && <label>Mật khẩu bàn<input value={password} onChange={e => setPassword(e.target.value)} placeholder="Để trống nếu chỉ muốn riêng tư bằng link"/></label>}<label className="check"><input type="checkbox" checked={allowSpectators} onChange={e => setAllowSpectators(e.target.checked)}/> Cho người khác quan sát</label><TimeControlPicker value={timeControl} onChange={setTimeControl}/><ThemeCustomizer theme={theme} onChange={setTheme}/><div className="actions"><button className="secondary" onClick={onClose}>Hủy</button><button onClick={submit}>Tạo bàn</button></div></div></div>;
}
