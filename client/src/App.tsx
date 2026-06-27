import { useEffect, useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';
import { createSocket, getPlayerId } from './online/socket';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [archives, setArchives] = useState<any>({ xiangqi: [], dark: [] });
  const [room, setRoom] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState('');
  const playerId = useMemo(() => getPlayerId(), []);

  useEffect(() => {
    const s = createSocket(); setSocket(s);
    s.on('room:list', setRooms);
    s.on('archive:list', setArchives);
    s.on('room:state', setRoom);
    s.on('room:joined', (p) => { setRole(p.role); history.replaceState(null, '', `?room=${p.roomId}`); });
    s.on('room:delete', () => { setRoom(null); setRole(null); history.replaceState(null, '', location.pathname); });
    s.on('error:message', (m) => { setError(String(m)); setTimeout(() => setError(''), 4500); });
    s.on('game:moveRejected', (m) => { setError(m.reason || 'Nước đi bị từ chối.'); setTimeout(() => setError(''), 4500); });
    s.emit('archive:list');
    return () => { s.disconnect(); };
  }, []);

  const leave = () => { socket?.emit('room:leave'); setRoom(null); setRole(null); history.replaceState(null, '', location.pathname); };

  return <div className="app-shell">
    {error && <div className="toast">{error}</div>}
    {!room ? <Lobby socket={socket} rooms={rooms} archives={archives} playerId={playerId} /> : <GameScreen socket={socket} room={room} role={role} playerId={playerId} onLeave={leave} />}
  </div>;
}
