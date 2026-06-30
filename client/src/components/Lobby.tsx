import { useEffect, useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';
import RoomCreateModal from './RoomCreateModal';
import ArchivedGames from './ArchivedGames';

export default function Lobby({ socket, rooms, archives, playerId }: { socket: Socket | null; rooms: any[]; archives: any; playerId: string }) {
  const [open, setOpen] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [displayName, setDisplayName] = useState(localStorage.getItem('xiangqi_viet_name') || 'Anh Linh');
  const [password, setPassword] = useState('');
  const [asSpectator, setAsSpectator] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('room');
    if (id) setJoinRoomId(id);
    socket?.emit('archive:list');
  }, [socket]);

  const canJoin = useMemo(() => joinRoomId.trim().length >= 4 && displayName.trim().length >= 2, [joinRoomId, displayName]);
  const join = (id = joinRoomId) => {
    localStorage.setItem('xiangqi_viet_name', displayName);
    socket?.emit('room:join', { roomId: id, playerId, displayName, password, asSpectator, side: 'auto' });
  };
  const fmt = (r: any) => r.timeControl?.mode === 'none' ? 'Không giờ' : `${Math.round(r.timeControl.initialMs / 60000)}p/ván${r.timeControl.perMoveMs ? ' · ' + Math.round(r.timeControl.perMoveMs / 1000) + 's/nước' : ''}${r.timeControl.incrementMs ? ' · +' + r.timeControl.incrementMs / 1000 + 's' : ''}`;
  const xiangqiRooms = rooms.filter(r => r.gameMode !== 'dark');
  const darkRooms = rooms.filter(r => r.gameMode === 'dark');

  const ModeSection = ({ title, rooms, dotClass }: { title: string; rooms: any[]; dotClass: string }) => <section className="lobby-mode-block">
    <div className="mode-heading"><div className="mode-title"><span className={`mode-dot ${dotClass}`}></span><h2>{title}</h2></div><span className="mode-count">{rooms.length} bàn đang mở</span></div>
    <div className="match-list">
      {rooms.length === 0 && <div className="empty-match-card">Chưa có bàn công khai cho chế độ này.</div>}
      {rooms.map(r => <button className="match-card" key={r.id} onClick={() => { setJoinRoomId(r.id); join(r.id); }}>
        <div className="match-player left"><div className="match-avatar">{(r.redName || 'Đ')[0]}</div><div><b>{r.redName || 'Đang chờ'}</b><span>{r.gameMode === 'dark' ? 'Cờ Úp' : 'Cờ Tướng'} · {fmt(r)}</span></div></div>
        <div className="match-center"><div className="vs">VS</div><div className="match-meta">Mã {r.id}{r.hasPassword ? ' · Có mật khẩu' : ''}</div></div>
        <div className="match-player right"><div><b>{r.blackName || 'Đang chờ'}</b><span>{r.status === 'playing' ? 'Đang chơi' : 'Phòng chờ'} · Xem {r.spectatorCount}</span></div><div className="match-avatar">{(r.blackName || 'Đ')[0]}</div></div>
      </button>)}
    </div>
  </section>;

  return <main className="lobby lobby-inspired">
    <section className="hero hero-inspired">
      <div>
        <div className="hero-kicker">Đang chơi · {rooms.length} bàn live</div>
        <h1>Cờ Tướng Việt - Trí Tuệ Việt</h1>
        <p>Chơi Cờ Tướng hoặc Cờ Úp online qua link. Có đồng hồ, chat, hoàn cờ, tỷ số bàn, lưu ván và xem lại lịch sử nước đi.</p>
      </div>
      <div className="actions"><button onClick={() => setOpen(true)}>Tạo bàn mới</button><button className="secondary" onClick={() => { socket?.emit('room:list'); socket?.emit('archive:list'); }}>Làm mới</button></div>
    </section>

    <section className="card join-box">
      <h2>Vào bàn bằng mã</h2>
      <div className="grid-2"><input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tên hiển thị 2-20 ký tự"/><input value={joinRoomId} onChange={e => setJoinRoomId(e.target.value.toUpperCase())} placeholder="Mã bàn"/><input value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu nếu có"/><label className="check"><input type="checkbox" checked={asSpectator} onChange={e => setAsSpectator(e.target.checked)}/> Vào xem</label></div><button disabled={!canJoin} onClick={() => join()}>Vào bàn</button>
    </section>

    <ModeSection title="Cờ Tướng" rooms={xiangqiRooms} dotClass="gold" />
    <ModeSection title="Cờ Úp" rooms={darkRooms} dotClass="purple" />

    <ArchivedGames socket={socket} archives={archives}/>
    {open && <RoomCreateModal socket={socket} playerId={playerId} onClose={() => setOpen(false)}/>} 
  </main>;
}
