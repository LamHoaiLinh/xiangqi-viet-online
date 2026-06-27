import { Color, GameState, MoveRecord } from '../shared/gameTypes.js';

export type SeatChoice = 'red' | 'black' | 'auto';
export type Role = 'red' | 'black' | 'spectator';
export type TimeMode = 'none' | 'fixed' | 'increment';

export interface PlayerSeat { playerId: string; socketId?: string; name: string; connected: boolean; ready: boolean; joinedAt: number; avatar?: string }
export interface Spectator { playerId: string; socketId?: string; name: string; connected: boolean; joinedAt: number; avatar?: string }
export interface TimeControl { mode: TimeMode; initialMs: number; incrementMs: number }
export interface ClockState { enabled: boolean; redMs: number; blackMs: number; runningColor: Color | null; lastServerTs: number | null; timeoutColor?: Color | null }
export interface ThemeSettings { theme: 'light' | 'dark'; boardColor: string; lineColor: string; riverColor: string; redPieceColor: string; blackPieceColor: string; highlightColor: string; selectedColor: string; checkColor: string; pieceStyle: 'asset' | 'han' | 'vi' }
export interface RoomSettings { allowSpectators: boolean; spectatorChatEnabled: boolean; spectatorReactionsEnabled: boolean; isPublic: boolean; locked: boolean; timeControl: TimeControl; theme: ThemeSettings; pauseOnDisconnect: boolean }
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
}

export interface PublicRoomSummary { id: string; name: string; isPublic: boolean; locked: boolean; hasPassword: boolean; allowSpectators: boolean; redName?: string; blackName?: string; spectatorCount: number; status: GameState['status']; timeControl: TimeControl }
