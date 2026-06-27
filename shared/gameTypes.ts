export type Color = 'red' | 'black';
export type PieceType = 'general' | 'advisor' | 'elephant' | 'rook' | 'horse' | 'cannon' | 'pawn';
export type GameStatus = 'waiting' | 'playing' | 'ended';
export type EndReason = 'checkmate' | 'stalemate' | 'resign' | 'draw' | 'timeout' | 'manual' | 'repetition' | null;

export interface Position { row: number; col: number }
export interface Piece { id: string; color: Color; type: PieceType; row: number; col: number }
export interface MoveInput { from: Position; to: Position }
export interface MoveRecord {
  id: string;
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  notation: string;
  createdAt: number;
  checkColor?: Color | null;
  redMsBefore?: number;
  blackMsBefore?: number;
  redMsAfter?: number;
  blackMsAfter?: number;
  incrementMsApplied?: number;
  note?: string;
}
export interface CapturedState { red: Piece[]; black: Piece[] }
export interface GameState {
  status: GameStatus;
  pieces: Piece[];
  turn: Color;
  winner: Color | null;
  endReason: EndReason;
  moveHistory: MoveRecord[];
  captured: CapturedState;
  lastMove?: MoveRecord;
  checkColor?: Color | null;
  repetition: Record<string, number>;
}

export interface MoveValidationResult {
  ok: boolean;
  reason?: string;
  nextState?: GameState;
  legalMoves?: Position[];
}

export const BOARD_ROWS = 10;
export const BOARD_COLS = 9;
export const opposite = (c: Color): Color => (c === 'red' ? 'black' : 'red');

export const pieceNameVi: Record<PieceType, string> = {
  general: 'Tướng',
  advisor: 'Sĩ',
  elephant: 'Tượng',
  rook: 'Xe',
  horse: 'Mã',
  cannon: 'Pháo',
  pawn: 'Tốt'
};

export const pieceLetterVi: Record<PieceType, string> = {
  general: 'Tg', advisor: 'S', elephant: 'T', rook: 'X', horse: 'M', cannon: 'P', pawn: 'B'
};
