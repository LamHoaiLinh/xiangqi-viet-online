import { useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';
import MobileGameLayout from './MobileGameLayout';
import MoveHistory from './MoveHistory';
import CapturedPieces from './CapturedPieces';
import ChatBox from './ChatBox';
import ThemeCustomizer from './ThemeCustomizer';
import HelpModal from './HelpModal';
import { darkSwapLabel } from '../../../shared/gameTypes';

export default function GameScreen({ socket, room, role, playerId, onLeave }: { socket: Socket | null; room: any; role: string | null; playerId: string; onLeave: () => void }) {
  const [showTheme, setShowTheme] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const isPlayer = role === 'red' || role === 'black';
  const seat = role === 'red' ? room.red : role === 'black' ? room.black : null;
  const theme = useMemo(() => room.settings.theme || {}, [room.settings.theme]);
  const share = `${location.origin}${location.pathname}?room=${room.id}`;
  const modeText = room.settings.gameMode === 'dark' ? 'Cờ Úp' : 'Cờ Tướng';
  const statusText = room.game.status === 'waiting' ? 'Đang chờ sẵn sàng' : room.game.status === 'playing' ? `Lượt ${room.game.turn === 'red' ? 'Đỏ' : 'Đen'}` : room.game.winner ? `${room.game.winner === 'red' ? 'Đỏ' : 'Đen'} thắng` : 'Hòa';
  const copy = () => navigator.clipboard?.writeText(share);
  const updateTheme = (t: any) => socket?.emit('room:updateSettings', { theme: t });
  const score = room.score || { redWins: 0, blackWins: 0, draws: 0, games: 0 };

  return <main className="game-screen">
    <header className="game-header">
      <div>
        <h1>{room.name}</h1>
        <p><span className="mode-badge">{modeText}</span> · Mã bàn <b>{room.id}</b> · {statusText} · Vai trò: {role === 'spectator' ? 'Quan sát' : role === 'red' ? 'Đỏ' : 'Đen'}</p>
        {room.settings.gameMode === 'dark' && <p className="hint">Đỏ: {darkSwapLabel[room.settings.darkOptions?.redSwap || 'none']} · Đen: {darkSwapLabel[room.settings.darkOptions?.blackSwap || 'none']}</p>}
      </div>
      <div className="actions"><button className="secondary" onClick={copy}>Copy link</button><button className="secondary" onClick={onLeave}>Rời bàn</button></div>
    </header>

    <section className="score-board"><div className="score-cell"><span>Đỏ thắng</span><b>{score.redWins}</b></div><div className="score-cell"><span>Đen thắng</span><b>{score.blackWins}</b></div><div className="score-cell"><span>Hòa</span><b>{score.draws}</b></div><div className="score-cell"><span>Tổng ván</span><b>{score.games}</b></div></section>

    <div className="game-grid">
      <section>
        <MobileGameLayout room={room} role={role} socket={socket} theme={theme}/>
        <CapturedPieces captured={room.game.captured} role={role} settings={room.settings} theme={theme}/>
        <div className="actions game-actions">
          {isPlayer && <><button onClick={() => socket?.emit('undo:request')}>Xin hoàn cờ</button><button onClick={() => socket?.emit('draw:request')}>Xin hòa</button><button className="danger-btn" onClick={() => confirm('Bạn chắc chắn đầu hàng?') && socket?.emit('resign:confirm')}>Đầu hàng</button></>}
          <button className="secondary" onClick={() => setShowTheme(!showTheme)}>Tùy chỉnh</button>
          <button className="secondary" onClick={() => setShowHelp(true)}>Hướng dẫn</button>
          {room.game.status === 'ended' && <><button onClick={() => socket?.emit('game:newRequest')}>Chơi tiếp</button>{room.archivedGameId && <button className="secondary" onClick={() => socket?.emit('archive:star', { id: room.archivedGameId, starred: true })}>★ Ưu tiên lưu ván này</button>}</>}
        </div>
        {showTheme && <ThemeCustomizer theme={theme} onChange={updateTheme}/>} 
      </section>
      <aside>
        <MoveHistory moves={room.game.moveHistory}/>
        <ChatBox socket={socket} room={room}/>
        <section className="card"><h3>Người quan sát</h3><p>{room.spectators?.length || 0} người</p>{room.ownerPlayerId === playerId && <div className="actions"><button className="secondary" onClick={() => socket?.emit('room:updateSettings', { spectatorChatEnabled: !room.settings.spectatorChatEnabled })}>{room.settings.spectatorChatEnabled ? 'Tắt chat người xem' : 'Bật chat người xem'}</button><button className="secondary" onClick={() => socket?.emit('room:updateSettings', { allowSpectators: !room.settings.allowSpectators })}>{room.settings.allowSpectators ? 'Tắt quan sát' : 'Bật quan sát'}</button></div>}</section>
      </aside>
    </div>
    {showHelp && <HelpModal onClose={() => setShowHelp(false)}/>} 
  </main>;
}
