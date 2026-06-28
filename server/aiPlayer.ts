import { Color, MoveInput, PieceType, opposite } from '../shared/gameTypes.js';
import { cloneGameState, getLegalMoves, isInCheck, pieceAt, applyLegalMove } from '../shared/xiangqiRules.js';
import { GameState } from '../shared/gameTypes.js';

const value: Record<PieceType, number> = { general: 10000, rook: 520, cannon: 350, horse: 320, elephant: 180, advisor: 180, pawn: 90 };
const centerCols = [3, 4, 5];

function wouldCheck(state: GameState, move: MoveInput, color: Color) {
  const res = applyLegalMove(cloneGameState(state), move, Date.now());
  return !!res.nextState && isInCheck(res.nextState, opposite(color));
}

function openingBonus(state: GameState, fromId: string, to: { row: number; col: number }, color: Color) {
  const moveCount = state.moveHistory.filter(m => m.piece.color === color).length;
  if (moveCount > 5) return 0;
  const key = `${fromId}:${to.row}:${to.col}`;
  const redPlans = [
    /red-(horse|dark-horse).*:7:[0-8]/,
    /red-(cannon|dark-cannon).*:7:[0-8]/,
    /red-(pawn|dark-pawn).*:5:[02468]/,
    /red-(rook|dark-rook).*:8:[0-8]/
  ];
  const blackPlans = [
    /black-(horse|dark-horse).*:2:[0-8]/,
    /black-(cannon|dark-cannon).*:2:[0-8]/,
    /black-(pawn|dark-pawn).*:4:[02468]/,
    /black-(rook|dark-rook).*:1:[0-8]/
  ];
  const plans = color === 'red' ? redPlans : blackPlans;
  return plans.some(rx => rx.test(key)) ? 90 + Math.random() * 80 : Math.random() * 45;
}

export function chooseAiMove(state: GameState, color: Color): MoveInput | null {
  const options: Array<{ move: MoveInput; score: number }> = [];
  for (const p of state.pieces.filter(x => x.color === color)) {
    const moves = getLegalMoves(state, p);
    for (const to of moves) {
      const target = pieceAt(state, to);
      let score = Math.random() * 35;
      if (target && target.color !== color) score += value[target.type] * 1.6 - value[p.type] * 0.18;
      if (centerCols.includes(to.col)) score += 12;
      if ((color === 'red' && to.row < p.row) || (color === 'black' && to.row > p.row)) score += 8;
      if (wouldCheck(state, { from: { row: p.row, col: p.col }, to }, color)) score += 160;
      score += openingBonus(state, p.id, to, color);
      options.push({ move: { from: { row: p.row, col: p.col }, to }, score });
    }
  }
  if (!options.length) return null;
  options.sort((a, b) => b.score - a.score);
  const pool = options.slice(0, Math.min(6, options.length));
  return pool[Math.floor(Math.random() * pool.length)].move;
}
