export type Color = 'red' | 'black';
export type PieceType = 'general' | 'advisor' | 'elephant' | 'rook' | 'horse' | 'cannon' | 'pawn';
export type GameStatus = 'waiting' | 'playing' | 'ended';
export type EndReason = 'checkmate' | 'stalemate' | 'resign' | 'draw' | 'timeout' | 'manual' | 'repetition' | null;
export type GameMode = 'xiangqi' | 'dark';
export type DarkSwapMode = 'none' | 'horse_advisor' | 'cannon_elephant' | 'rook_advisor' | 'rook_horse';

export interface Position { row: number; col: number }
export interface DarkOptions { redSwap: DarkSwapMode; blackSwap: DarkSwapMode }
export interface GameRules { mode: GameMode; darkOptions: DarkOptions }
export interface Piece {
  id: string;
  color: Color;
  type: PieceType;
  row: number;
  col: number;
  /** Cờ Úp: quân còn úp sẽ đi theo vai trò ở vị trí ban đầu, khi đi/ăn mới lật ra type thật. */
  hidden?: boolean;
  /** Cờ Úp: kiểu đi khi quân còn úp. */
  moveAs?: PieceType;
  /** Cờ Úp: kiểu quân ở vị trí xuất phát để xem lại/quy chiếu. */
  startType?: PieceType;
}
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
  revealedType?: PieceType;
  movedAs?: PieceType;
}
export interface CapturedState { red: Piece[]; black: Piece[] }
export interface GameState {
  id: string;
  rules: GameRules;
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

export const defaultDarkOptions: DarkOptions = { redSwap: 'none', blackSwap: 'none' };
export const defaultRules: GameRules = { mode: 'xiangqi', darkOptions: defaultDarkOptions };

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

export const darkSwapLabel: Record<DarkSwapMode, string> = {
  none: 'Không hoán đổi',
  horse_advisor: 'Mã + Sĩ',
  cannon_elephant: 'Pháo + Tượng',
  rook_advisor: 'Xe + Sĩ',
  rook_horse: 'Xe + Mã'
};
