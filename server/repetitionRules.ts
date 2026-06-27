import { Room } from './types.js';

export const repetitionConfig = {
  maxPerpetualCheckCycles: 3,
  perpetualCheckPenalty: 'block_move' as 'block_move' | 'lose_game',
  maxPerpetualChaseCycles: 3,
  chaseRuleMode: 'practical' as const
};

export function isPerpetualCheckBlocked(room: Room): boolean {
  const h = room.game.moveHistory.slice(-8);
  if (h.length < 6) return false;
  const turnJustMoved = h[h.length - 1]?.piece.color;
  if (!turnJustMoved) return false;
  const checksBySame = h.filter(m => m.piece.color === turnJustMoved && m.checkColor).length;
  return checksBySame >= repetitionConfig.maxPerpetualCheckCycles + 1;
}

export function isPracticalChaseBlocked(room: Room): boolean {
  const h = room.game.moveHistory.slice(-10);
  if (h.length < 8) return false;
  const last = h[h.length - 1];
  if (!last) return false;
  const samePieceMoves = h.filter(m => m.piece.id === last.piece.id && !m.captured).length;
  const noCapture = h.every(m => !m.captured);
  return noCapture && samePieceMoves >= repetitionConfig.maxPerpetualChaseCycles + 2;
}
