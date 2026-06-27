import { BOARD_COLS, BOARD_ROWS, CapturedState, Color, GameState, MoveInput, MoveRecord, MoveValidationResult, Piece, PieceType, Position, opposite, pieceLetterVi } from './gameTypes.js';

const clonePiece = (p: Piece): Piece => ({ ...p });
export const cloneGameState = (s: GameState): GameState => ({
  ...s,
  pieces: s.pieces.map(clonePiece),
  captured: { red: s.captured.red.map(clonePiece), black: s.captured.black.map(clonePiece) },
  moveHistory: s.moveHistory.map(m => ({ ...m, from: { ...m.from }, to: { ...m.to }, piece: clonePiece(m.piece), captured: m.captured ? clonePiece(m.captured) : undefined })),
  lastMove: s.lastMove ? { ...s.lastMove, from: { ...s.lastMove.from }, to: { ...s.lastMove.to }, piece: clonePiece(s.lastMove.piece), captured: s.lastMove.captured ? clonePiece(s.lastMove.captured) : undefined } : undefined,
  repetition: { ...s.repetition }
});

export function createInitialGameState(): GameState {
  const pieces: Piece[] = [];
  const add = (color: Color, type: PieceType, row: number, col: number, index = 0) => pieces.push({ id: `${color}-${type}-${index}-${row}-${col}`, color, type, row, col });
  // Đen ở trên, Đỏ ở dưới. Đỏ đi trước và đi hướng lên phía hàng nhỏ hơn.
  (['black', 'red'] as Color[]).forEach(color => {
    const top = color === 'black';
    const r0 = top ? 0 : 9;
    const rPawn = top ? 3 : 6;
    const rCannon = top ? 2 : 7;
    add(color, 'rook', r0, 0, 1); add(color, 'horse', r0, 1, 1); add(color, 'elephant', r0, 2, 1); add(color, 'advisor', r0, 3, 1); add(color, 'general', r0, 4, 1); add(color, 'advisor', r0, 5, 2); add(color, 'elephant', r0, 6, 2); add(color, 'horse', r0, 7, 2); add(color, 'rook', r0, 8, 2);
    add(color, 'cannon', rCannon, 1, 1); add(color, 'cannon', rCannon, 7, 2);
    [0,2,4,6,8].forEach((c, i) => add(color, 'pawn', rPawn, c, i + 1));
  });
  const state: GameState = { status: 'waiting', pieces, turn: 'red', winner: null, endReason: null, moveHistory: [], captured: { red: [], black: [] }, repetition: {} };
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

export function generatePseudoMoves(state: GameState, piece: Piece): Position[] {
  const out: Position[] = [];
  const from = { row: piece.row, col: piece.col };
  if (piece.type === 'general') {
    // Tướng/Soái đi 1 ô ngang/dọc trong cung. Nước bắt mặt tướng được xét ở kiểm tra chiếu.
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => {
      const to = { row: piece.row + dr, col: piece.col + dc };
      if (inPalace(piece.color, to)) addIfFreeOrEnemy(state, out, piece.color, to);
    });
  }
  if (piece.type === 'advisor') {
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
      const to = { row: piece.row + dr, col: piece.col + dc };
      if (inPalace(piece.color, to)) addIfFreeOrEnemy(state, out, piece.color, to);
    });
  }
  if (piece.type === 'elephant') {
    // Tượng đi chéo 2 điểm, không qua sông và bị chặn mắt tượng ở ô giữa.
    [[2,2],[2,-2],[-2,2],[-2,-2]].forEach(([dr, dc]) => {
      const eye = { row: piece.row + dr / 2, col: piece.col + dc / 2 };
      const to = { row: piece.row + dr, col: piece.col + dc };
      const legalSide = piece.color === 'red' ? to.row >= 5 : to.row <= 4;
      if (isInside(to) && legalSide && !pieceAt(state, eye)) addIfFreeOrEnemy(state, out, piece.color, to);
    });
  }
  if (piece.type === 'horse') {
    // Mã đi chữ nhật. Nếu ô chân Mã bị chặn thì không được đi hướng đó.
    const moves = [
      { dr: -2, dc: -1, leg: { row: piece.row - 1, col: piece.col } }, { dr: -2, dc: 1, leg: { row: piece.row - 1, col: piece.col } },
      { dr: 2, dc: -1, leg: { row: piece.row + 1, col: piece.col } }, { dr: 2, dc: 1, leg: { row: piece.row + 1, col: piece.col } },
      { dr: -1, dc: -2, leg: { row: piece.row, col: piece.col - 1 } }, { dr: 1, dc: -2, leg: { row: piece.row, col: piece.col - 1 } },
      { dr: -1, dc: 2, leg: { row: piece.row, col: piece.col + 1 } }, { dr: 1, dc: 2, leg: { row: piece.row, col: piece.col + 1 } }
    ];
    moves.forEach(m => { if (!pieceAt(state, m.leg)) addIfFreeOrEnemy(state, out, piece.color, { row: piece.row + m.dr, col: piece.col + m.dc }); });
  }
  if (piece.type === 'rook' || piece.type === 'cannon') {
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => {
      let jumped = false;
      for (let step = 1; step < 10; step++) {
        const to = { row: piece.row + dr * step, col: piece.col + dc * step };
        if (!isInside(to)) break;
        const target = pieceAt(state, to);
        if (piece.type === 'rook') {
          if (!target) out.push(to); else { if (target.color !== piece.color) out.push(to); break; }
        } else {
          // Pháo đi như Xe khi không ăn. Khi ăn phải có đúng 1 quân làm ngòi ở giữa.
          if (!jumped) { if (!target) out.push(to); else jumped = true; }
          else if (target) { if (target.color !== piece.color) out.push(to); break; }
        }
      }
    });
  }
  if (piece.type === 'pawn') {
    // Tốt chỉ đi thẳng trước khi qua sông. Sau khi qua sông được đi ngang, không được đi lùi.
    const dir = piece.color === 'red' ? -1 : 1;
    addIfFreeOrEnemy(state, out, piece.color, { row: piece.row + dir, col: piece.col });
    if (crossedRiver(piece.color, piece.row)) {
      addIfFreeOrEnemy(state, out, piece.color, { row: piece.row, col: piece.col - 1 });
      addIfFreeOrEnemy(state, out, piece.color, { row: piece.row, col: piece.col + 1 });
    }
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

function movePieceUnsafe(state: GameState, from: Position, to: Position): { next: GameState; moved?: Piece; captured?: Piece } {
  const next = cloneGameState(state);
  const idx = next.pieces.findIndex(p => p.row === from.row && p.col === from.col);
  if (idx < 0) return { next };
  const captureIdx = next.pieces.findIndex((p, i) => i !== idx && p.row === to.row && p.col === to.col);
  let captured: Piece | undefined;
  if (captureIdx >= 0) {
    captured = clonePiece(next.pieces[captureIdx]);
    next.pieces.splice(captureIdx, 1);
  }
  const moved = next.pieces.find(p => p.id === state.pieces[idx].id)!;
  moved.row = to.row; moved.col = to.col;
  return { next, moved: clonePiece(moved), captured };
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
  const list = state.pieces.map(p => `${p.color[0]}${p.type[0]}${p.row}${p.col}`).sort().join('|');
  return `${state.turn}:${list}`;
}

function makeNotation(piece: Piece, from: Position, to: Position, captured?: Piece): string {
  const dir = to.row < from.row ? '+' : to.row > from.row ? '-' : '=';
  return `${piece.color === 'red' ? 'Đỏ' : 'Đen'} ${pieceLetterVi[piece.type]}${from.col + 1}${dir}${to.col + 1}${captured ? 'x' : ''}`;
}

export function applyLegalMove(state: GameState, input: MoveInput, now = Date.now()): MoveValidationResult {
  if (state.status !== 'playing') return { ok: false, reason: 'Ván chưa ở trạng thái đang chơi.' };
  const piece = pieceAt(state, input.from);
  if (!piece) return { ok: false, reason: 'Không có quân ở vị trí đã chọn.' };
  if (piece.color !== state.turn) return { ok: false, reason: 'Chưa tới lượt bên này.' };
  const legal = getLegalMoves(state, piece);
  if (!legal.some(m => samePos(m, input.to))) return { ok: false, reason: 'Nước đi không hợp lệ hoặc làm Tướng bị chiếu.' , legalMoves: legal };
  const { next, moved, captured } = movePieceUnsafe(state, input.from, input.to);
  if (!moved) return { ok: false, reason: 'Không thể di chuyển quân.' };
  next.turn = opposite(state.turn);
  if (captured) next.captured[captured.color].push(captured);
  const move: MoveRecord = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    from: { ...input.from }, to: { ...input.to }, piece: { ...piece }, captured,
    notation: makeNotation(piece, input.from, input.to, captured), createdAt: now
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

export function resetForNewGame(): GameState {
  const state = createInitialGameState();
  state.status = 'waiting';
  return state;
}
