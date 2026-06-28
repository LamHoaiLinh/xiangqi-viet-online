import { Color, DarkOptions, GameMode, GameState, MoveRecord } from '../shared/gameTypes.js';

export type SeatChoice = 'red' | 'black' | 'auto';
export type Role = 'red' | 'black' | 'spectator';
export type TimeMode = 'none' | 'fixed' | 'increment';

export interface PlayerSeat { playerId: string; socketId?: string; name: string; connected: boolean; ready: boolean; joinedAt: number; avatar?: string; virtual?: boolean }
export interface Spectator { playerId: string; socketId?: string; name: string; connected: boolean; joinedAt: number; avatar?: string }
export interface TimeControl { mode: TimeMode; initialMs: number; incrementMs: number }
export interface ClockState { enabled: boolean; redMs: number; blackMs: number; runningColor: Color | null; lastServerTs: number | null; timeoutColor?: Color | null }
export interface ThemeSettings { theme: 'light' | 'dark'; boardColor: string; lineColor: string; riverColor: string; redPieceColor: string; blackPieceColor: string; highlightColor: string; selectedColor: string; checkColor: string; pieceStyle: 'asset' | 'han' | 'vi' }
export type PlayMode = 'online' | 'shared' | 'ai';
export interface RoomSettings { allowSpectators: boolean; spectatorChatEnabled: boolean; spectatorReactionsEnabled: boolean; isPublic: boolean; locked: boolean; timeControl: TimeControl; theme: ThemeSettings; pauseOnDisconnect: boolean; gameMode: GameMode; darkOptions: DarkOptions; revealCapturedHiddenToAll: boolean; revealCapturedHiddenToOwner: boolean; playMode: PlayMode; aiColor?: Color | null }
export interface ScoreState { redWins: number; blackWins: number; draws: number; games: number }
export interface ChatMessage { id: string; playerId: string; name: string; role: Role | 'system'; text: string; createdAt: number }
export interface ReactionMessage { id: string; playerId: string; name: string; role: Role; emoji: string; createdAt: number }
export interface PendingRequest { id: string; by: Color; createdAt: number }
export interface Snapshot { game: GameState; clock: ClockState }
export interface Room {
  id: string;
  name: string;
  password?: string;
  ownerPlayerId: string;
  createdAt: number;
  updatedAt: number;
  red?: PlayerSeat;
  black?: PlayerSeat;
  spectators: Spectator[];
  settings: RoomSettings;
  game: GameState;
  clock: ClockState;
  undoStack: Snapshot[];
  pendingUndo?: PendingRequest;
  pendingDraw?: PendingRequest;
  newGameVotes: Record<string, boolean>;
  chat: ChatMessage[];
  reactions: ReactionMessage[];
  score: ScoreState;
  archivedGameId?: string;
}

export interface PublicRoomSummary { id: string; name: string; isPublic: boolean; locked: boolean; hasPassword: boolean; allowSpectators: boolean; redName?: string; blackName?: string; spectatorCount: number; status: GameState['status']; timeControl: TimeControl; gameMode: GameMode }

export interface GameArchiveRecord {
  id: string;
  roomId: string;
  roomName: string;
  mode: GameMode;
  darkOptions: DarkOptions;
  redName?: string;
  blackName?: string;
  winner: Color | null;
  endReason: GameState['endReason'];
  createdAt: number;
  endedAt: number;
  moveCount: number;
  moveHistory: MoveRecord[];
  scoreAfter: ScoreState;
  starred: boolean;
  /** Snapshot bàn cờ lúc bắt đầu, dùng để xem lại chính xác, đặc biệt với Cờ Úp. */
  initialGame?: GameState;
  /** Theme người chơi đã chọn lúc kết thúc ván, dùng cho giao diện xem lại. */
  theme?: ThemeSettings;
}
