import Board from './Board';
import GameClock from './GameClock';
import FloatingMessage from './FloatingMessage';
import EmojiReactions from './EmojiReactions';

export default function MobileGameLayout({ room, role, socket, theme }: { room: any; role: string | null; socket: any; theme: any }) {
  const viewerColor = role === 'black' ? 'black' : 'red';
  const me = viewerColor === 'black' ? room.black : room.red;
  const opp = viewerColor === 'black' ? room.red : room.black;
  const myClockMs = viewerColor === 'black' ? room.clock.blackMs : room.clock.redMs;
  const oppClockMs = viewerColor === 'black' ? room.clock.redMs : room.clock.blackMs;
  const myActive = room.clock.runningColor === viewerColor;
  const oppActive = !!room.clock.runningColor && room.clock.runningColor !== viewerColor;

  return <div className="mobile-layout">
    <div className="opponent-strip">
      <div className="avatar">{opp?.name?.[0] || '?'}</div>
      <div>
        <b>{opp?.name || 'Đối thủ'}</b>
        <GameClock label="Đồng hồ" ms={oppClockMs} active={oppActive} enabled={room.clock.enabled} moveMs={oppActive ? room.clock.moveMs : null}/>
      </div>
    </div>
    <div className="board-zone">
      <Board room={room} game={room.game} role={role} socket={socket} theme={theme} />
      <FloatingMessage room={room}/>
      <EmojiReactions reactions={room.reactions}/>
    </div>
    <div className="me-strip">
      <div className="avatar me">{me?.name?.[0] || 'B'}</div>
      <div>
        <b>{me?.name || 'Bạn'}</b>
        <GameClock label="Đồng hồ" ms={myClockMs} active={myActive} enabled={room.clock.enabled} moveMs={myActive ? room.clock.moveMs : null}/>
      </div>
    </div>
  </div>;
}
