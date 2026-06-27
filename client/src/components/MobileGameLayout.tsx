import Board from './Board';
import GameClock from './GameClock';
import FloatingMessage from './FloatingMessage';
import EmojiReactions from './EmojiReactions';

export default function MobileGameLayout({ room, role, socket, theme }: { room: any; role: string | null; socket: any; theme: any }) {
  const me = role === 'black' ? room.black : room.red; const opp = role === 'black' ? room.red : room.black;
  return <div className="mobile-layout"><div className="opponent-strip"><div className="avatar">{opp?.name?.[0] || '?'}</div><div><b>{opp?.name || 'Đối thủ'}</b><GameClock label="Đồng hồ" ms={role === 'black' ? room.clock.redMs : room.clock.blackMs} active={room.clock.runningColor && room.clock.runningColor !== role} enabled={room.clock.enabled}/></div></div><div className="board-zone"><Board game={room.game} role={role} socket={socket} theme={theme}/><FloatingMessage room={room}/><EmojiReactions reactions={room.reactions}/></div><div className="me-strip"><div className="avatar me">{me?.name?.[0] || 'T'}</div><div><b>{me?.name || 'Bạn'}</b><GameClock label="Đồng hồ" ms={role === 'black' ? room.clock.blackMs : room.clock.redMs} active={room.clock.runningColor === role} enabled={room.clock.enabled}/></div></div></div>;
}
