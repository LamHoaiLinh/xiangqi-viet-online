import { useEffect, useMemo, useRef, useState } from 'react';
import { Piece as PieceModel, Position } from '../../../shared/gameTypes';
import { getLegalMoves, pieceAt } from '../../../shared/xiangqiRules';
import Piece from './Piece';
import { ASSET } from '../utils/constants';

function same(a?: Position | null, b?: Position | null) { return !!a && !!b && a.row === b.row && a.col === b.col; }

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
    if (p && canMove && p.color === role && game.turn === role && game.status === 'playing') {
      setSelected(pos);
      return;
    }
    setSelected(null);
  };

  const style: any = {
    '--board': theme.boardColor,
    '--line': theme.lineColor,
    '--river': theme.riverColor,
    '--legal': theme.highlightColor,
    '--selected': theme.selectedColor,
    '--check': theme.checkColor,
    '--redPiece': theme.redPieceColor,
    '--blackPiece': theme.blackPieceColor
  };
  const boardImg = theme.theme === 'dark' ? `${ASSET}/boards/board_dark.png` : `${ASSET}/boards/board_light.png`;

  return <div className="board-wrap" style={style}>
    <div className="board-frame">
      <div className={`board board-${viewerColor}`} style={{ backgroundImage: `url(${boardImg})`, backgroundColor: theme.boardColor }}>
        <div className="river-label"><span className="river-left">楚河</span><span className="river-mid">SỞ HÀ - HÁN GIỚI</span><span className="river-right">漢界</span></div>
        {Array.from({ length: 10 }).map((_, r) => Array.from({ length: 9 }).map((_, c) => {
          const displayPos = { row: r, col: c };
          const actual = toActual(displayPos);
          return <button
            key={`${r}-${c}`}
            className={`point ${legal.some(m => same(m, actual)) ? 'legal' : ''} ${same(selected, actual) ? 'selected' : ''} ${game.lastMove && (same(game.lastMove.from, actual) || same(game.lastMove.to, actual)) ? 'last' : ''}`}
            style={{ left: `${(c / 8) * 100}%`, top: `${(r / 9) * 100}%` }}
            onClick={() => onPoint(displayPos)}
            aria-label={`${actual.row},${actual.col}`}
          />;
        }))}

        {game.pieces.map((p: PieceModel) => {
          const display = toDisplay({ row: p.row, col: p.col });
          const isSelected = same(selected, { row: p.row, col: p.col });
          return <div
            key={p.id}
            className={`piece ${game.checkColor === p.color && p.type === 'general' ? 'in-check' : ''} ${isSelected ? 'piece-lifted' : ''}`}
            style={{ left: `${(display.col / 8) * 100}%`, top: `${(display.row / 9) * 100}%` }}
            onClick={() => onPoint(display)}
          >
            <Piece piece={p} style={theme.pieceStyle || 'asset'} theme={theme} game={game}/>
          </div>;
        })}

        {game.status === 'waiting' && <div className="ready-overlay">
          <div className="ready-overlay-card">
            <div className="ready-status-row">
              <span>Đỏ: {room.red?.name || 'trống'} {room.red?.ready ? '✅' : '⏳'}</span>
              <span>Đen: {room.black?.name || 'trống'} {room.black?.ready ? '✅' : '⏳'}</span>
            </div>
            {canMove
              ? <button className="ready-btn" onClick={() => socket?.emit('game:ready', { ready: !seat?.ready })}>{seat?.ready ? 'Hủy sẵn sàng' : 'Sẵn sàng'}</button>
              : <div className="ready-wait-text">Chờ hai người chơi bấm Sẵn sàng</div>}
          </div>
        </div>}
      </div>
    </div>
  </div>;
}
