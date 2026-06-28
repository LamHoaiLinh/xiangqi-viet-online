import { BOARD_COLS, BOARD_ROWS, Color, DarkOptions, defaultDarkOptions, GameMode, GameRules, GameState, MoveInput, MoveRecord, MoveValidationResult, Piece, PieceType, Position, opposite, pieceLetterVi, pieceNameVi } from './gameTypes.js';

const gameId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const clonePiece = (p: Piece): Piece => ({ ...p });
const cloneMove = (m: MoveRecord): MoveRecord => ({ ...m, from: { ...m.from }, to: { ...m.to }, piece: clonePiece(m.piece), captured: m.captured ? clonePiece(m.captured) : undefined });
export const cloneGameState = (s: GameState): GameState => ({
  ...s,
  rules: { mode: s.rules?.mode || 'xiangqi', darkOptions: { ...(s.rules?.darkOptions || defaultDarkOptions) } },
  pieces: s.pieces.map(clonePiece),
  captured: { red: s.captured.red.map(clonePiece), black: s.captured.black.map(clonePiece) },
  moveHistory: s.moveHistory.map(cloneMove),
  lastMove: s.lastMove ? cloneMove(s.lastMove) : undefined,
  repetition: { ...s.repetition }
});

const normalizeRules = (mode: GameMode = 'xiangqi', darkOptions?: Partial<DarkOptions>): GameRules => ({
  mode,
  darkOptions: {
    redSwap: darkOptions?.redSwap || 'none',
    blackSwap: darkOptions?.blackSwap || 'none'
  }
});

const initialSlots = (color: Color): Array<{ type: PieceType; row: number; col: number; index: number }> => {
  const top = color === 'black';
  const r0 = top ? 0 : 9;
  const rPawn = top ? 3 : 6;
  const rCannon = top ? 2 : 7;
  return [
    { type: 'rook', row: r0, col: 0, index: 1 }, { type: 'horse', row: r0, col: 1, index: 1 }, { type: 'elephant', row: r0, col: 2, index: 1 },
    { type: 'advisor', row: r0, col: 3, index: 1 }, { type: 'general', row: r0, col: 4, index: 1 }, { type: 'advisor', row: r0, col: 5, index: 2 },
    { type: 'elephant', row: r0, col: 6, index: 2 }, { type: 'horse', row: r0, col: 7, index: 2 }, { type: 'rook', row: r0, col: 8, index: 2 },
    { type: 'cannon', row: rCannon, col: 1, index: 1 }, { type: 'cannon', row: rCannon, col: 7, index: 2 },
    { type: 'pawn', row: rPawn, col: 0, index: 1 }, { type: 'pawn', row: rPawn, col: 2, index: 2 }, { type: 'pawn', row: rPawn, col: 4, index: 3 },
    { type: 'pawn', row: rPawn, col: 6, index: 4 }, { type: 'pawn', row: rPawn, col: 8, index: 5 }
  ];
};

function shuffledTypes(slots: Array<{ type: PieceType }>): PieceType[] {
  const arr = slots.filter(s => s.type !== 'general').map(s => s.type);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createInitialGameState(mode: GameMode = 'xiangqi', darkOptions?: Partial<DarkOptions>): GameState {
  const rules = normalizeRules(mode, darkOptions);
  const pieces: Piece[] = [];
  (['black', 'red'] as Color[]).forEach(color => {
    const slots = initialSlots(color);
    const actual = shuffledTypes(slots);
    let k = 0;
    for (const slot of slots) {
      if (rules.mode === 'dark' && slot.type !== 'general') {
        const type = actual[k++];
        pieces.push({ id: `${color}-dark-${slot.type}-${slot.index}-${slot.row}-${slot.col}`, color, type, row: slot.row, col: slot.col, hidden: true, moveAs: slot.type, startType: slot.type });
      } else {
        pieces.push({ id: `${color}-${slot.type}-${slot.index}-${slot.row}-${slot.col}`, color, type: slot.type, row: slot.row, col: slot.col, hidden: false, moveAs: slot.type, startType: slot.type });
      }
    }
  });
  const state: GameState = { id: gameId(), rules, status: 'waiting', pieces, turn: 'red', winner: null, endReason: null, moveHistory: [], captured: { red: [], black: [] }, repetition: {} };
  state.repetition[boardKey(state)] = 1;
  return state;
}

export function pieceAt(state: GameState, pos: Position): Piece | undefined {
  return state.pieces.find(p => p.row === pos.row && p.col === pos.col);
}

export function isInside(pos: Position): boolean { return pos.row >= 0 && pos.row < BOARD_ROWS && pos.col >= 0 && pos.col < BOARD_COLS; }
const samePos = (a: Position, b: Position) => a.row === b.row && a.col === b.col;
function inPalace(color: Color, pos: Position): boolean {
  const rows = color === 'red' ? [7, 8, 9] : [0, 1, 2];
  return rows.includes(pos.row) && pos.col >= 3 && pos.col <= 5;
}
function crossedRiver(color: Color, row: number): boolean { return color === 'red' ? row <= 4 : row >= 5; }
function isDarkRevealed(state: GameState, piece: Piece): boolean { return state.rules?.mode === 'dark' && !piece.hidden && piece.type !== 'general'; }
function countBetween(state: GameState, a: Position, b: Position): number {
  let count = 0;
  if (a.row === b.row) {
    const [min, max] = [Math.min(a.col, b.col), Math.max(a.col, b.col)];
    for (let c = min + 1; c < max; c++) if (pieceAt(state, { row: a.row, col: c })) count++;
  } else if (a.col === b.col) {
    const [min, max] = [Math.min(a.row, b.row), Math.max(a.row, b.row)];
    for (let r = min + 1; r < max; r++) if (pieceAt(state, { row: r, col: a.col })) count++;
  }
  return count;
}
function addIfFreeOrEnemy(state: GameState, out: Position[], color: Color, pos: Position) {
  if (!isInside(pos)) return;
  const target = pieceAt(state, pos);
  if (!target || target.color !== color) out.push(pos);
}

export function effectivePieceTypes(state: GameState, piece: Piece): PieceType[] {
  if (state.rules?.mode !== 'dark') return [piece.type];
  if (piece.hidden) return [piece.moveAs || piece.startType || piece.type];
  const swap = piece.color === 'red' ? state.rules.darkOptions.redSwap : state.rules.darkOptions.blackSwap;
  const pairs: Record<string, PieceType[]> = {
    horse_advisor: ['horse', 'advisor'],
    cannon_elephant: ['cannon', 'elephant'],
    rook_advisor: ['rook', 'advisor'],
    rook_horse: ['rook', 'horse']
  };
  const pair = pairs[swap];
  if (pair && pair.includes(piece.type)) return pair;
  return [piece.type];
}

export function effectivePieceType(state: GameState, piece: Piece): PieceType {
  return effectivePieceTypes(state, piece)[0];
}

export function effectivePieceLabel(state: GameState, piece: Piece): string {
  return effectivePieceTypes(state, piece).map(t => pieceLetterVi[t]).join('+');
}

export function isSwapAffected(state: GameState, piece: Piece): boolean {
  if (state.rules?.mode !== 'dark' || piece.hidden) return false;
  const types = effectivePieceTypes(state, piece);
  return types.length > 1 || types[0] !== piece.type;
}

function pushUnique(out: Position[], pos: Position) {
  if (!out.some(x => x.row === pos.row && x.col === pos.col)) out.push(pos);
}
function addIfFreeOrEnemyUnique(state: GameState, out: Position[], color: Color, pos: Position) {
  if (!isInside(pos)) return;
  const target = pieceAt(state, pos);
  if (!target || target.color !== color) pushUnique(out, pos);
}

function generatePseudoMovesByType(state: GameState, piece: Piece, type: PieceType): Position[] {
  const out: Position[] = [];
  const darkRevealed = isDarkRevealed(state, piece);
  if (type === 'general') {
    // Tướng/Soái luôn đi 1 ô ngang/dọc trong cung, kể cả Cờ Úp.
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => {
      const to = { row: piece.row + dr, col: piece.col + dc };
      if (inPalace(piece.color, to)) addIfFreeOrEnemyUnique(state, out, piece.color, to);
    });
  }
  if (type === 'advisor') {
    // Cờ Tướng: Sĩ ở trong cung. Cờ Úp sau khi lật: Sĩ được đi chéo 1 ô toàn bàn.
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
      const to = { row: piece.row + dr, col: piece.col + dc };
      if ((darkRevealed || inPalace(piece.color, to)) && isInside(to)) addIfFreeOrEnemyUnique(state, out, piece.color, to);
    });
  }
  if (type === 'elephant') {
    // Cờ Tướng: Tượng không qua sông. Cờ Úp sau khi lật: Tượng được qua sông nhưng vẫn bị cản mắt Tượng.
    [[2,2],[2,-2],[-2,2],[-2,-2]].forEach(([dr, dc]) => {
      const eye = { row: piece.row + dr / 2, col: piece.col + dc / 2 };
      const to = { row: piece.row + dr, col: piece.col + dc };
      const legalSide = darkRevealed || (piece.color === 'red' ? to.row >= 5 : to.row <= 4);
      if (isInside(to) && legalSide && !pieceAt(state, eye)) addIfFreeOrEnemyUnique(state, out, piece.color, to);
    });
  }
  if (type === 'horse') {
    const moves = [
      { dr: -2, dc: -1, leg: { row: piece.row - 1, col: piece.col } }, { dr: -2, dc: 1, leg: { row: piece.row - 1, col: piece.col } },
      { dr: 2, dc: -1, leg: { row: piece.row + 1, col: piece.col } }, { dr: 2, dc: 1, leg: { row: piece.row + 1, col: piece.col } },
      { dr: -1, dc: -2, leg: { row: piece.row, col: piece.col - 1 } }, { dr: 1, dc: -2, leg: { row: piece.row, col: piece.col - 1 } },
      { dr: -1, dc: 2, leg: { row: piece.row, col: piece.col + 1 } }, { dr: 1, dc: 2, leg: { row: piece.row, col: piece.col + 1 } }
    ];
    moves.forEach(m => { if (!pieceAt(state, m.leg)) addIfFreeOrEnemyUnique(state, out, piece.color, { row: piece.row + m.dr, col: piece.col + m.dc }); });
  }
  if (type === 'rook' || type === 'cannon') {
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => {
      let jumped = false;
      for (let step = 1; step < 10; step++) {
        const to = { row: piece.row + dr * step, col: piece.col + dc * step };
        if (!isInside(to)) break;
        const target = pieceAt(state, to);
        if (type === 'rook') {
          if (!target) pushUnique(out, to); else { if (target.color !== piece.color) pushUnique(out, to); break; }
        } else {
          if (!jumped) { if (!target) pushUnique(out, to); else jumped = true; }
          else if (target) { if (target.color !== piece.color) pushUnique(out, to); break; }
        }
      }
    });
  }
  if (type === 'pawn') {
    const dir = piece.color === 'red' ? -1 : 1;
    addIfFreeOrEnemyUnique(state, out, piece.color, { row: piece.row + dir, col: piece.col });
    if (crossedRiver(piece.color, piece.row)) {
      addIfFreeOrEnemyUnique(state, out, piece.color, { row: piece.row, col: piece.col - 1 });
      addIfFreeOrEnemyUnique(state, out, piece.color, { row: piece.row, col: piece.col + 1 });
    }
  }
  return out;
}

export function generatePseudoMoves(state: GameState, piece: Piece): Position[] {
  const out: Position[] = [];
  for (const type of effectivePieceTypes(state, piece)) {
    generatePseudoMovesByType(state, piece, type).forEach(pos => pushUnique(out, pos));
  }
  return out;
}

function generalsFace(state: GameState): boolean {
  const red = state.pieces.find(p => p.color === 'red' && p.type === 'general');
  const black = state.pieces.find(p => p.color === 'black' && p.type === 'general');
  if (!red || !black || red.col !== black.col) return false;
  return countBetween(state, red, black) === 0;
}

export function isSquareAttacked(state: GameState, pos: Position, byColor: Color): boolean {
  if (generalsFace(state)) {
    const g = state.pieces.find(p => p.color === byColor && p.type === 'general');
    if (g && g.col === pos.col && countBetween(state, g, pos) === 0) return true;
  }
  return state.pieces.some(p => p.color === byColor && generatePseudoMoves(state, p).some(m => samePos(m, pos)));
}

export function isInCheck(state: GameState, color: Color): boolean {
  const general = state.pieces.find(p => p.color === color && p.type === 'general');
  if (!general) return true;
  if (generalsFace(state)) return true;
  return isSquareAttacked(state, { row: general.row, col: general.col }, opposite(color));
}

function movePieceUnsafe(state: GameState, from: Position, to: Position): { next: GameState; moved?: Piece; captured?: Piece; wasHidden?: boolean; movedAs?: PieceType; revealedType?: PieceType } {
  const next = cloneGameState(state);
  const idx = next.pieces.findIndex(p => p.row === from.row && p.col === from.col);
  if (idx < 0) return { next };
  const movingId = next.pieces[idx].id;
  const movingBefore = clonePiece(next.pieces[idx]);
  const captureIdx = next.pieces.findIndex((p, i) => i !== idx && p.row === to.row && p.col === to.col);
  let captured: Piece | undefined;
  if (captureIdx >= 0) {
    captured = clonePiece(next.pieces[captureIdx]);
    next.pieces.splice(captureIdx, 1);
  }
  const moved = next.pieces.find(p => p.id === movingId)!;
  moved.row = to.row; moved.col = to.col;
  let revealedType: PieceType | undefined;
  if (state.rules?.mode === 'dark' && moved.hidden) {
    moved.hidden = false;
    revealedType = moved.type;
  }
  return { next, moved: clonePiece(moved), captured, wasHidden: !!movingBefore.hidden, movedAs: movingBefore.hidden ? (movingBefore.moveAs || movingBefore.startType || movingBefore.type) : effectivePieceType(state, movingBefore), revealedType };
}

export function getLegalMoves(state: GameState, piece: Piece): Position[] {
  return generatePseudoMoves(state, piece).filter(to => {
    const { next } = movePieceUnsafe(state, { row: piece.row, col: piece.col }, to);
    return !isInCheck(next, piece.color);
  });
}

export function hasAnyLegalMove(state: GameState, color: Color): boolean {
  return state.pieces.some(p => p.color === color && getLegalMoves(state, p).length > 0);
}

export function boardKey(state: GameState): string {
  const list = state.pieces.map(p => `${p.color[0]}${p.hidden ? 'U' + (p.moveAs || '') : p.type}${p.row}${p.col}`).sort().join('|');
  return `${state.turn}:${state.rules?.mode || 'xiangqi'}:${list}`;
}

function makeNotation(state: GameState, before: Piece, moved: Piece, from: Position, to: Position, captured?: Piece, revealedType?: PieceType, movedAs?: PieceType): string {
  const dir = to.row < from.row ? '+' : to.row > from.row ? '-' : '=';
  const color = before.color === 'red' ? 'Đỏ' : 'Đen';
  const shownType = before.hidden ? 'Úp' : pieceLetterVi[before.type];
  const acted = before.hidden && movedAs ? `(${pieceLetterVi[movedAs]})` : '';
  const combo = !before.hidden && state.rules?.mode === 'dark' && isSwapAffected(state, before) ? `(${effectivePieceLabel(state, before)})` : '';
  const swap = combo;
  const reveal = revealedType ? ` · lật ${pieceNameVi[revealedType]}` : '';
  return `${color} ${shownType}${acted}${swap}${from.col + 1}${dir}${to.col + 1}${captured ? 'x' : ''}${reveal}`;
}

export function applyLegalMove(state: GameState, input: MoveInput, now = Date.now()): MoveValidationResult {
  if (state.status !== 'playing') return { ok: false, reason: 'Ván chưa ở trạng thái đang chơi.' };
  const piece = pieceAt(state, input.from);
  if (!piece) return { ok: false, reason: 'Không có quân ở vị trí đã chọn.' };
  if (piece.color !== state.turn) return { ok: false, reason: 'Chưa tới lượt bên này.' };
  const legal = getLegalMoves(state, piece);
  if (!legal.some(m => samePos(m, input.to))) return { ok: false, reason: 'Nước đi không hợp lệ hoặc làm Tướng bị chiếu.' , legalMoves: legal };
  const { next, moved, captured, movedAs, revealedType } = movePieceUnsafe(state, input.from, input.to);
  if (!moved) return { ok: false, reason: 'Không thể di chuyển quân.' };
  next.turn = opposite(state.turn);
  if (captured) next.captured[captured.color].push(captured);
  const move: MoveRecord = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    from: { ...input.from }, to: { ...input.to }, piece: { ...moved }, captured,
    notation: makeNotation(state, piece, moved, input.from, input.to, captured, revealedType, movedAs), createdAt: now,
    revealedType, movedAs
  };
  const checked = isInCheck(next, next.turn) ? next.turn : null;
  move.checkColor = checked;
  next.checkColor = checked;
  next.moveHistory.push(move);
  next.lastMove = move;
  const key = boardKey(next);
  next.repetition[key] = (next.repetition[key] || 0) + 1;
  if (checked && !hasAnyLegalMove(next, next.turn)) {
    next.status = 'ended'; next.winner = piece.color; next.endReason = 'checkmate';
  } else if (!checked && !hasAnyLegalMove(next, next.turn)) {
    next.status = 'ended'; next.winner = null; next.endReason = 'stalemate';
  } else if (next.repetition[key] >= 6) {
    next.status = 'ended'; next.winner = null; next.endReason = 'repetition';
  }
  return { ok: true, nextState: next };
}

export function forceEnd(state: GameState, winner: Color | null, endReason: GameState['endReason']): GameState {
  const next = cloneGameState(state);
  next.status = 'ended'; next.winner = winner; next.endReason = endReason;
  return next;
}

export function resetForNewGame(mode: GameMode = 'xiangqi', darkOptions?: Partial<DarkOptions>): GameState {
  const state = createInitialGameState(mode, darkOptions);
  state.status = 'waiting';
  return state;
}
