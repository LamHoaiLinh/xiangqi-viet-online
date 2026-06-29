import { useEffect, useMemo, useRef, useState } from 'react';
import { Piece as PieceModel, Position, opposite } from '../../../shared/gameTypes';
import { getLegalMoves, isPieceDefended, isSwapAffected, pieceAt } from '../../../shared/xiangqiRules';
import Piece from './Piece';
import { ASSET } from '../utils/constants';

function same(a?: Position | null, b?: Position | null) { return !!a && !!b && a.row === b.row && a.col === b.col; }
const GRID_LEFT = 6.0;
const GRID_TOP = 5.2;
const GRID_WIDTH = 88.0;
const GRID_HEIGHT = 89.2;
const pctX = (col: number) => `${GRID_LEFT + (col / 8) * GRID_WIDTH}%`;
const pctY = (row: number) => `${GRID_TOP + (row / 9) * GRID_HEIGHT}%`;
const spanW = (cols: number) => `${(cols / 8) * GRID_WIDTH}%`;
const spanH = (rows: number) => `${(rows / 9) * GRID_HEIGHT}%`;

export default function Board({ room, game, role, socket, theme }: { room: any; game: any; role: string | null; socket: any; theme: any }) {
  const [selected, setSelected] = useState<Position | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const viewerColor = role === 'black' ? 'black' : 'red';
  const canMove = role === 'red' || role === 'black';
  const seat = role === 'red' ? room.red : role === 'black' ? room.black : null;

  const toDisplay = (pos: Position): Position => viewerColor === 'black' ? { row: 9 - pos.row, col: 8 - pos.col } : pos;
  const toActual = (pos: Position): Position => viewerColor === 'black' ? { row: 9 - pos.row, col: 8 - pos.col } : pos;
  const selectedPiece = selected ? pieceAt(game, selected) : undefined;
  const legal = useMemo(() => selectedPiece ? getLegalMoves(game, selectedPiece) : [], [game, selectedPiece]);

  useEffect(() => { setSelected(null); }, [game.lastMove?.id]);
  useEffect(() => {
    if (!game.lastMove?.id) return;
    try {
      if (!audioRef.current) audioRef.current = new Audio(`${ASSET}/sounds/move_sound.mp3`);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, [game.lastMove?.id]);

  const onPoint = (displayPos: Position) => {
    const pos = toActual(displayPos);
    const p = pieceAt(game, pos);
    if (selected && legal.some(m => same(m, pos))) {
      socket?.emit('game:move', { from: selected, to: pos });
      return;
    }
    const canSelectPiece = room.settings?.playMode === 'shared' ? p?.color === game.turn : p?.color === role;
    if (p && canMove && canSelectPiece && game.status === 'playing') {
      setSelected(pos);
      return;
    }
    setSelected(null);
  };

  const style: any = {
    '--board': theme.boardColor || '#f4d39a',
    '--line': theme.lineColor || '#6d3518',
    '--river': theme.riverColor || '#d9f2ff',
    '--legal': theme.highlightColor || '#48b87a',
    '--selected': theme.selectedColor || '#f2c94c',
    '--check': theme.checkColor || '#ff4d4f',
    '--redPiece': theme.redPieceColor || '#b51f1f',
    '--blackPiece': theme.blackPieceColor || '#222222'
  };

  const horizontalLines = Array.from({ length: 10 }, (_, r) => <i key={`h-${r}`} className="board-line h" style={{ top: pctY(r), left: `${GRID_LEFT}%`, width: `${GRID_WIDTH}%` }} />);
  const verticalLines = Array.from({ length: 9 }, (_, c) => <i key={`v-${c}`} className="board-line v" style={{ left: pctX(c), top: `${GRID_TOP}%`, height: `${GRID_HEIGHT}%` }} />);
  const showUndo = room.pendingUndo && canMove && room.pendingUndo.by !== role;
  const showDraw = room.pendingDraw && canMove && room.pendingDraw.by !== role;
  const hintColor = room.settings?.playMode === 'shared' ? game.turn : role;
  const canSeeCaptureHints = canMove && game.status === 'playing' && (room.settings?.playMode === 'shared' || game.turn === role);
  const capturableIds = useMemo(() => {
    const ids = new Set<string>();
    if (!canSeeCaptureHints || (hintColor !== 'red' && hintColor !== 'black')) return ids;
    for (const p of game.pieces.filter((x: PieceModel) => x.color === hintColor)) {
      for (const to of getLegalMoves(game, p)) {
        const target = pieceAt(game, to);
        if (target && target.color === opposite(hintColor) && !isPieceDefended(game, target)) ids.add(target.id);
      }
    }
    return ids;
  }, [game, canSeeCaptureHints, hintColor]);

  const noCapturePly = game.noCapturePly || 0;
  const drawRemaining = Math.max(0, 100 - noCapturePly);
  const showNoCaptureWarning = game.status === 'playing' && drawRemaining > 0 && drawRemaining <= 10;
  const mySeatId = role === 'red' ? room.red?.playerId : role === 'black' ? room.black?.playerId : null;
  const otherRole = role === 'red' ? 'black' : role === 'black' ? 'red' : null;
  const otherSeatId = otherRole ? room[otherRole]?.playerId : null;
  const newGameVotes = room.newGameVotes || {};
  const showNewGameRequest = game.status === 'ended' && mySeatId && otherSeatId && newGameVotes[otherSeatId] && !newGameVotes[mySeatId];
  const endTitle = game.winner ? `${game.winner === 'red' ? 'Đỏ' : 'Đen'} thắng` : 'Ván cờ hòa';
  const endReasonText: Record<string, string> = { checkmate: 'Chiếu bí', stalemate: 'Hết nước đi hợp lệ', resign: 'Đầu hàng', draw: 'Hai bên đồng ý hòa', timeout: 'Rụng kim', repetition: 'Lặp thế/chiếu dai', no_capture_50: '50 nước mỗi bên không ăn quân', manual: 'Kết thúc thủ công' };

  const boardAsset = theme.boardAsset || 'board_classic_ornate.png';
  const sceneAsset = theme.sceneAsset || 'scene_classic.png';

  return <div className="board-shell scenic-shell" style={{ ...style, backgroundImage: `url(${ASSET}/scenes/${sceneAsset})` }}>
    <div className="board-inner scenic-inner">
      <div className={`board board-${viewerColor}`} style={{ backgroundImage: `url(${ASSET}/boards/${boardAsset})` }}>
        <div className="board-surface" />
        <div className="grid-lines">{horizontalLines}{verticalLines}</div>
        <div className="palace palace-top" style={{ left: pctX(3), top: pctY(0), width: spanW(2), height: spanH(2) }}><span/><span/></div>
        <div className="palace palace-bottom" style={{ left: pctX(3), top: pctY(7), width: spanW(2), height: spanH(2) }}><span/><span/></div>

        {Array.from({ length: 10 }).map((_, r) => Array.from({ length: 9 }).map((_, c) => {
          const displayPos = { row: r, col: c };
          const actual = toActual(displayPos);
          return <button
            key={`${r}-${c}`}
            className={`point ${legal.some(m => same(m, actual)) ? 'legal' : ''} ${same(selected, actual) ? 'selected' : ''} ${game.lastMove && (same(game.lastMove.from, actual) || same(game.lastMove.to, actual)) ? 'last' : ''}`}
            style={{ left: pctX(c), top: pctY(r) }}
            onClick={() => onPoint(displayPos)}
            aria-label={`${actual.row},${actual.col}`}
          />;
        }))}

        {game.pieces.map((p: PieceModel) => {
          const display = toDisplay({ row: p.row, col: p.col });
          const isSelected = same(selected, { row: p.row, col: p.col });
          const swapped = isSwapAffected(game, p);
          const justRevealed = !!game.lastMove?.revealedType && game.lastMove?.piece?.id === p.id;
          return <div
            key={p.id}
            className={`piece ${game.checkColor === p.color && p.type === 'general' ? 'in-check' : ''} ${isSelected ? 'piece-lifted' : ''} ${capturableIds.has(p.id) ? 'capture-hint' : ''} ${swapped ? 'piece-swap-marker' : ''} ${justRevealed ? 'piece-reveal-flip' : ''}`}
            style={{ left: pctX(display.col), top: pctY(display.row) }}
            onClick={() => onPoint(display)}
          >
            <Piece piece={p} style={'asset'} theme={theme} game={game}/>
          </div>;
        })}

        {showNoCaptureWarning && <div className="draw-countdown">Còn {drawRemaining} nước không ăn quân sẽ tự động hòa</div>}

        {game.status === 'ended' && <div className="end-overlay">
          <div className="end-overlay-card">
            <h2>{endTitle}</h2>
            <p>{endReasonText[game.endReason || ''] || 'Ván cờ đã kết thúc.'}</p>
            {canMove && <button onClick={() => socket?.emit('game:newRequest')}>Chơi tiếp</button>}
          </div>
        </div>}

        {showNewGameRequest && <div className="request-overlay">
          <div className="request-overlay-card">
            <h3>Đối thủ muốn chơi tiếp</h3>
            <p>Đối thủ muốn chơi tiếp, bạn sẵn sàng chứ?</p>
            <div className="actions centered"><button onClick={() => socket?.emit('game:newRequest')}>Sẵn sàng chơi tiếp</button></div>
          </div>
        </div>}

        {(showUndo || showDraw) && <div className="request-overlay">
          <div className="request-overlay-card">
            <h3>{showUndo ? 'Xin hoàn cờ' : 'Xin hòa cờ'}</h3>
            <p>{showUndo ? 'Đối thủ muốn hoàn lại nước vừa đi.' : 'Đối thủ gửi đề nghị hòa cờ.'}</p>
            <div className="actions centered">
              {showUndo
                ? <><button onClick={() => socket?.emit('undo:accept')}>Đồng ý</button><button className="secondary" onClick={() => socket?.emit('undo:reject')}>Từ chối</button></>
                : <><button onClick={() => socket?.emit('draw:accept')}>Đồng ý</button><button className="secondary" onClick={() => socket?.emit('draw:reject')}>Từ chối</button></>}
            </div>
          </div>
        </div>}

        {game.status === 'waiting' && <div className="ready-overlay">
          <div className="ready-overlay-card">
            <div className="ready-status-row">
              <span>Đỏ: {room.red?.name || 'trống'} {room.red?.ready ? '✅' : '⏳'}</span>
              <span>Đen: {room.black?.name || 'trống'} {room.black?.ready ? '✅' : '⏳'}</span>
            </div>
            {canMove
              ? <div className="ready-actions"><button className="ready-btn" onClick={() => socket?.emit('game:ready', { ready: !seat?.ready })}>{seat?.ready ? 'Hủy sẵn sàng' : 'Sẵn sàng'}</button><button className="secondary" onClick={() => socket?.emit('game:startShared')}>Tự chơi 2 người</button><button className="secondary" onClick={() => socket?.emit('game:startAi')}>Chơi thử với máy</button></div>
              : <div className="ready-wait-text">Chờ hai người chơi bấm Sẵn sàng</div>}
          </div>
        </div>}
      </div>
    </div>
  </div>;
}
