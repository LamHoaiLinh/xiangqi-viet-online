import { createInitialGameState, forceEnd, resetForNewGame } from '../shared/xiangqiRules.js';
import { Color, defaultDarkOptions, GameMode, opposite } from '../shared/gameTypes.js';
import { createClock, materializeClock, startClock, stopClock } from './clockManager.js';
import { PublicRoomSummary, Role, Room, RoomSettings, SeatChoice, Spectator, ThemeSettings, TimeControl } from './types.js';
import { cleanDisplayName } from './moderation.js';

const rooms = new Map<string, Room>();
export const RECONNECT_GRACE_MS = 120_000;

export const defaultTheme: ThemeSettings = {
  theme: 'light', boardColor: '#f4d39a', lineColor: '#6d3518', riverColor: '#d9f2ff', redPieceColor: '#b51f1f', blackPieceColor: '#222222', highlightColor: '#48b87a', selectedColor: '#f2c94c', checkColor: '#ff4d4f', pieceStyle: 'asset', pieceSet: 'classic', boardAsset: 'board_classic_ivory.png', sceneAsset: 'scene_blank.png'
};
export const defaultTimeControl: TimeControl = { mode: 'fixed', initialMs: 15 * 60_000, perMoveMs: 2 * 60_000, incrementMs: 0 };
export const defaultSettings = (partial?: Partial<RoomSettings>): RoomSettings => ({
  allowSpectators: true, spectatorChatEnabled: true, spectatorReactionsEnabled: true, isPublic: true, locked: false, pauseOnDisconnect: false,
  timeControl: defaultTimeControl, theme: defaultTheme, gameMode: 'xiangqi', darkOptions: defaultDarkOptions,
  revealCapturedHiddenToAll: false, revealCapturedHiddenToOwner: true, playMode: 'online', aiColor: null, ...partial
});

function rid() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
function now() { return Date.now(); }

export function allRooms() { return [...rooms.values()]; }
export function getRoom(id: string) { return rooms.get(id.toUpperCase()); }
export function deleteRoom(id: string) { rooms.delete(id.toUpperCase()); }

export function publicSummaries(): PublicRoomSummary[] {
  return allRooms().filter(r => r.settings.isPublic && !r.settings.locked).map(r => ({
    id: r.id, name: r.name, isPublic: r.settings.isPublic, locked: r.settings.locked, hasPassword: !!r.password,
    allowSpectators: r.settings.allowSpectators, redName: r.red?.name, blackName: r.black?.name,
    spectatorCount: r.spectators.filter(s => s.connected).length, status: r.game.status, timeControl: r.settings.timeControl, gameMode: r.settings.gameMode
  }));
}

export function createRoom(input: { name: string; playerId: string; displayName: string; side: SeatChoice; password?: string; settings: Partial<RoomSettings> }): Room {
  let id = rid(); while (rooms.has(id)) id = rid();
  const settings = defaultSettings(input.settings);
  const game = createInitialGameState(settings.gameMode, settings.darkOptions);
  const room: Room = { id, name: String(input.name || 'Bàn cờ').trim().slice(0, 40) || 'Bàn cờ', password: input.password?.trim() || undefined, ownerPlayerId: input.playerId,
    createdAt: now(), updatedAt: now(), spectators: [], settings, game, clock: createClock(settings.timeControl), undoStack: [], newGameVotes: {}, chat: [], reactions: [], score: { redWins: 0, blackWins: 0, draws: 0, games: 0 } };
  const side: Color = input.side === 'black' ? 'black' : input.side === 'red' ? 'red' : 'red';
  room[side] = { playerId: input.playerId, name: cleanDisplayName(input.displayName), connected: true, ready: false, joinedAt: now() };
  rooms.set(id, room);
  addSystemChat(room, `${room[side]?.name} đã tạo bàn.`);
  return room;
}

export function joinRoom(room: Room, input: { playerId: string; socketId: string; displayName: string; password?: string; asSpectator?: boolean; side?: SeatChoice }): { ok: boolean; role?: Role; reason?: string } {
  if (room.password && room.password !== input.password && !isKnownPlayer(room, input.playerId)) return { ok: false, reason: 'Mật khẩu bàn không đúng.' };
  const existing = roleOf(room, input.playerId);
  if (existing) { reconnect(room, input.playerId, input.socketId); return { ok: true, role: existing }; }
  if (room.settings.locked) return { ok: false, reason: 'Bàn đang khóa.' };
  const name = cleanDisplayName(input.displayName);
  if (!input.asSpectator) {
    const preferred = input.side === 'black' ? 'black' : input.side === 'red' ? 'red' : undefined;
    const candidates: Color[] = preferred ? [preferred, opposite(preferred)] : ['red', 'black'];
    for (const color of candidates) {
      if (!room[color]) {
        room[color] = { playerId: input.playerId, socketId: input.socketId, name, connected: true, ready: false, joinedAt: now() };
        addSystemChat(room, `${name} đã vào ghế ${color === 'red' ? 'Đỏ' : 'Đen'}.`);
        room.updatedAt = now(); return { ok: true, role: color };
      }
    }
  }
  if (!room.settings.allowSpectators) return { ok: false, reason: 'Bàn này không cho quan sát.' };
  const sp: Spectator = { playerId: input.playerId, socketId: input.socketId, name, connected: true, joinedAt: now() };
  room.spectators.push(sp); addSystemChat(room, `${name} đang quan sát.`); room.updatedAt = now();
  return { ok: true, role: 'spectator' };
}

export function reconnect(room: Room, playerId: string, socketId: string) {
  for (const color of ['red','black'] as Color[]) if (room[color]?.playerId === playerId) { room[color]!.socketId = socketId; room[color]!.connected = true; addSystemChat(room, `${room[color]!.name} đã kết nối lại.`); }
  const sp = room.spectators.find(s => s.playerId === playerId); if (sp) { sp.socketId = socketId; sp.connected = true; }
}

export function leavePlayer(room: Room, playerId: string, explicit = true) {
  for (const color of ['red','black'] as Color[]) {
    if (room[color]?.playerId === playerId) {
      const name = room[color]!.name;
      if (explicit) { delete room[color]; addSystemChat(room, `${name} đã rời bàn.`); }
      else { room[color]!.connected = false; addSystemChat(room, `${name} mất kết nối, đang chờ vào lại.`); }
    }
  }
  room.spectators = room.spectators.filter(s => s.playerId !== playerId);
  transferOwner(room);
}

export function cleanupRoomIfNeeded(room: Room, forceDisconnectedExpired = false): boolean {
  const t = now();
  if (forceDisconnectedExpired) {
    for (const color of ['red','black'] as Color[]) {
      const seat = room[color];
      if (seat && !seat.connected && t - seat.joinedAt > RECONNECT_GRACE_MS) delete room[color];
    }
  }
  if ((!room.red || room.red.virtual) && (!room.black || room.black.virtual)) { rooms.delete(room.id); return true; }
  return false;
}

export function roleOf(room: Room, playerId: string): Role | null {
  if (room.red?.playerId === playerId) return 'red'; if (room.black?.playerId === playerId) return 'black';
  if (room.spectators.some(s => s.playerId === playerId)) return 'spectator'; return null;
}
export function isKnownPlayer(room: Room, playerId: string) { return !!roleOf(room, playerId); }
export function seatByRole(room: Room, role: Role) { return role === 'red' || role === 'black' ? room[role] : undefined; }
export function canControl(room: Room, playerId: string) { const role = roleOf(room, playerId); return role === 'red' || role === 'black'; }

export function setReady(room: Room, playerId: string, ready: boolean) {
  const role = roleOf(room, playerId); if (role !== 'red' && role !== 'black') return;
  room[role]!.ready = ready;
  if (room.red && room.black && room.red.ready && room.black.ready && room.game.status !== 'playing') {
    room.game.status = 'playing'; room.game.turn = 'red'; room.game.winner = null; room.game.endReason = null; room.undoStack = []; room.archivedGameId = undefined; room.clock = createClock(room.settings.timeControl); startClock(room); addSystemChat(room, `${room.settings.gameMode === 'dark' ? 'Ván Cờ Úp' : 'Ván Cờ Tướng'} bắt đầu. Đỏ đi trước.`);
  }
}

export function resetNewGameIfBothVote(room: Room, playerId: string) {
  room.newGameVotes[playerId] = true;
  if (room.red && room.black && room.newGameVotes[room.red.playerId] && room.newGameVotes[room.black.playerId]) {
    room.game = resetForNewGame(room.settings.gameMode, room.settings.darkOptions); room.clock = createClock(room.settings.timeControl); room.undoStack = []; room.pendingDraw = undefined; room.pendingUndo = undefined; room.newGameVotes = {}; room.archivedGameId = undefined; room.red.ready = false; room.black.ready = false; addSystemChat(room, 'Hai bên đã đồng ý chơi tiếp. Tỷ số bàn được giữ nguyên.');
  }
}



function startGame(room: Room, message: string) {
  room.game.status = 'playing';
  room.game.turn = 'red';
  room.game.winner = null;
  room.game.endReason = null;
  room.game.noCapturePly = 0;
  room.undoStack = [];
  room.archivedGameId = undefined;
  room.clock = createClock(room.settings.timeControl);
  startClock(room);
  addSystemChat(room, message);
}

export function startSharedGame(room: Room, playerId: string) {
  const role = roleOf(room, playerId);
  if (role !== 'red' && role !== 'black') return false;
  if (!room.red) room.red = { playerId: `shared-red-${room.id}`, name: 'Người chơi Đỏ', connected: true, ready: true, joinedAt: now(), virtual: true };
  if (!room.black) room.black = { playerId: `shared-black-${room.id}`, name: 'Người chơi Đen', connected: true, ready: true, joinedAt: now(), virtual: true };
  room.red.ready = true; room.black.ready = true;
  room.settings.playMode = 'shared';
  room.settings.aiColor = null;
  startGame(room, 'Bắt đầu chế độ tự chơi 2 người chung một màn hình.');
  return true;
}

export function startAiGame(room: Room, playerId: string) {
  const role = roleOf(room, playerId);
  if (role !== 'red' && role !== 'black') return null;
  const aiColor: Color = opposite(role);
  if (!room[aiColor] || room[aiColor]?.virtual) room[aiColor] = { playerId: `ai-${aiColor}-${room.id}`, name: 'Máy luyện cờ', connected: true, ready: true, joinedAt: now(), virtual: true };
  room[role]!.ready = true;
  room[aiColor]!.ready = true;
  room.settings.playMode = 'ai';
  room.settings.aiColor = aiColor;
  startGame(room, `Bắt đầu chơi thử với máy. Máy cầm ${aiColor === 'red' ? 'Đỏ' : 'Đen'}.`);
  return aiColor;
}

export function addSystemChat(room: Room, text: string) { room.chat.push({ id: `${Date.now()}-${Math.random()}`, playerId: 'system', name: 'Hệ thống', role: 'system', text, createdAt: now() }); room.chat = room.chat.slice(-100); }
export function resign(room: Room, color: Color) { room.game = forceEnd(room.game, opposite(color), 'resign'); stopClock(room); addSystemChat(room, `${color === 'red' ? 'Đỏ' : 'Đen'} đã đầu hàng.`); }
export function drawGame(room: Room) { room.game = forceEnd(room.game, null, 'draw'); stopClock(room); addSystemChat(room, 'Hai bên đồng ý hòa.'); }
export function timeoutGame(room: Room, color: Color) { room.game = forceEnd(room.game, opposite(color), 'timeout'); stopClock(room); addSystemChat(room, `${color === 'red' ? 'Đỏ' : 'Đen'} rụng kim, thua giờ.`); }

export function updateScoreIfNeeded(room: Room) {
  if (room.game.status !== 'ended') return;
  if (room.archivedGameId === room.game.id) return;
  room.score.games += 1;
  if (room.game.winner === 'red') room.score.redWins += 1;
  else if (room.game.winner === 'black') room.score.blackWins += 1;
  else if (room.game.endReason !== 'manual') room.score.draws += 1;
}

function transferOwner(room: Room) { if (room.ownerPlayerId && roleOf(room, room.ownerPlayerId)) return; room.ownerPlayerId = room.red?.playerId || room.black?.playerId || room.spectators[0]?.playerId || room.ownerPlayerId; }

export function sanitizeRoom(room: Room) {
  materializeClock(room);
  return { ...room, password: undefined, hasPassword: !!room.password, clock: { ...room.clock }, undoStack: undefined };
}
