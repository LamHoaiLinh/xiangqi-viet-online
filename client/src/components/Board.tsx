import { useMemo, useState } from 'react';
import { Piece as PieceModel, Position } from '../../../shared/gameTypes';
import { getLegalMoves, pieceAt } from '../../../shared/xiangqiRules';
import Piece from './Piece';
import { ASSET } from '../utils/constants';

function same(a?: Position, b?: Position) { return !!a && !!b && a.row === b.row && a.col === b.col; }
export default function Board({ game, role, socket, theme }: { game: any; role: string | null; socket: any; theme: any }) {
  const [selected, setSelected] = useState<Position | null>(null);
  const selectedPiece = selected ? pieceAt(game, selected) : undefined;
  const legal = useMemo(() => selectedPiece ? getLegalMoves(game, selectedPiece) : [], [game, selectedPiece?.id, selectedPiece?.row, selectedPiece?.col]);
  const canMove = role === 'red' || role === 'black';
  const onPoint = (pos: Position) => {
    const p = pieceAt(game, pos);
    if (selected && legal.some(m => same(m, pos))) { socket?.emit('game:move', { from: selected, to: pos }); setSelected(null); return; }
    if (p && canMove && p.color === role && game.turn === role && game.status === 'playing') setSelected(pos); else setSelected(null);
  };
  const style: any = { '--board': theme.boardColor, '--line': theme.lineColor, '--river': theme.riverColor, '--legal': theme.highlightColor, '--selected': theme.selectedColor, '--check': theme.checkColor };
  const boardImg = theme.theme === 'dark' ? `${ASSET}/boards/board_dark.png` : `${ASSET}/boards/board_light.png`;
  return <div className="board-wrap" style={style}><div className="board" style={{ backgroundImage: `linear-gradient(var(--board), var(--board)), url(${boardImg})` }}>
    <div className="river-label">楚 河&nbsp;&nbsp; HÀN GIỚI</div>
    {Array.from({ length: 10 }).map((_, r) => Array.from({ length: 9 }).map((_, c) => <button key={`${r}-${c}`} className={`point ${legal.some(m => m.row === r && m.col === c) ? 'legal' : ''} ${same(selected || undefined, {row:r,col:c}) ? 'selected' : ''} ${game.lastMove && (same(game.lastMove.from,{row:r,col:c}) || same(game.lastMove.to,{row:r,col:c})) ? 'last' : ''}`} style={{ left: `${(c / 8) * 100}%`, top: `${(r / 9) * 100}%` }} onClick={() => onPoint({ row: r, col: c })} aria-label={`${r},${c}`} />))}
    {game.pieces.map((p: PieceModel) => <div key={p.id} className={`piece ${game.checkColor === p.color && p.type === 'general' ? 'in-check' : ''}`} style={{ left: `${(p.col / 8) * 100}%`, top: `${(p.row / 9) * 100}%` }} onClick={() => onPoint({ row: p.row, col: p.col })}><Piece piece={p} style={theme.pieceStyle || 'asset'} theme={theme}/></div>)}
  </div></div>;
}
