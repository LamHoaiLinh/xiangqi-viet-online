import { Server, Socket } from 'socket.io';
import { applyLegalMove, cloneGameState, forceEnd } from '../shared/xiangqiRules.js';
import { Color, DarkOptions, defaultDarkOptions, GameMode, opposite } from '../shared/gameTypes.js';
import { afterMoveSwitchClock, cloneClock, materializeClock } from './clockManager.js';
import { addSystemChat, cleanupRoomIfNeeded, createRoom, drawGame, getRoom, joinRoom, leavePlayer, publicSummaries, resetNewGameIfBothVote, resign, roleOf, sanitizeRoom, setReady, timeoutGame, updateScoreIfNeeded } from './roomManager.js';
import { cleanChat, cleanDisplayName, validDisplayName, validEmoji } from './moderation.js';
import { isPerpetualCheckBlocked, isPracticalChaseBlocked } from './repetitionRules.js';
import { archiveEndedGame, exportArchiveBackup, importArchiveBackup, listArchives, setArchiveStar } from './archiveStore.js';
import { Room, SeatChoice, TimeControl } from './types.js';

function emitRoom(io: Server, room: Room) { io.to(room.id).emit('room:state', sanitizeRoom(room)); io.emit('room:list', publicSummaries()); }
function finishIfEnded(room: Room): boolean {
  if (room.game.status !== 'ended') return false;
  const before = room.archivedGameId;
  updateScoreIfNeeded(room);
  archiveEndedGame(room);
  return before !== room.archivedGameId;
}
function emitError(socket: Socket, message: string) { socket.emit('error:message', message); }
function getJoinedRoom(socket: Socket): Room | undefined { const id = socket.data.roomId; return id ? getRoom(id) : undefined; }

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    socket.emit('room:list', publicSummaries());

    socket.on('room:list', () => socket.emit('room:list', publicSummaries()));

    socket.on('archive:list', () => socket.emit('archive:list', listArchives()));
    socket.on('archive:export', () => socket.emit('archive:export', exportArchiveBackup()));
    socket.on('archive:import', (payload) => {
      const result = importArchiveBackup(payload?.backup, !!payload?.replace);
      socket.emit('archive:importResult', result);
      if (!result.ok) return emitError(socket, result.message || 'Không nhập được dữ liệu ván đã lưu.');
      io.emit('archive:list', listArchives());
    });
    socket.on('archive:star', (payload) => {
      const ok = setArchiveStar(String(payload?.id || ''), !!payload?.starred);
      if (!ok) return emitError(socket, 'Không tìm thấy ván để đánh dấu sao.');
      io.emit('archive:list', listArchives());
    });

    socket.on('room:create', (payload) => {
      const playerId = String(payload?.playerId || '');
      const displayName = cleanDisplayName(payload?.displayName);
      if (!playerId || !validDisplayName(displayName)) return emitError(socket, 'Tên hiển thị cần từ 2 đến 20 ký tự.');
      const tc: TimeControl = normalizeTimeControl(payload?.timeControl);
      const room = createRoom({
        name: payload?.name || 'Bàn cờ', playerId, displayName,
        side: (payload?.side || 'red') as SeatChoice, password: payload?.password,
        settings: {
          allowSpectators: !!payload?.allowSpectators,
          isPublic: !!payload?.isPublic,
          spectatorChatEnabled: true,
          spectatorReactionsEnabled: true,
          timeControl: tc,
          theme: payload?.theme,
          gameMode: normalizeGameMode(payload?.gameMode),
          darkOptions: normalizeDarkOptions(payload?.darkOptions)
        }
      });
      socket.data.roomId = room.id; socket.data.playerId = playerId; socket.join(room.id);
      const role = roleOf(room, playerId);
      socket.emit('room:joined', { roomId: room.id, role });
      emitRoom(io, room);
    });

    socket.on('room:join', (payload) => {
      const room = getRoom(String(payload?.roomId || '').toUpperCase());
      if (!room) return emitError(socket, 'Không tìm thấy bàn.');
      const playerId = String(payload?.playerId || '');
      const displayName = cleanDisplayName(payload?.displayName);
      if (!playerId || !validDisplayName(displayName)) return emitError(socket, 'Tên hiển thị cần từ 2 đến 20 ký tự.');
      const result = joinRoom(room, { playerId, socketId: socket.id, displayName, password: payload?.password, asSpectator: !!payload?.asSpectator, side: payload?.side });
      if (!result.ok) return emitError(socket, result.reason || 'Không vào được bàn.');
      socket.data.roomId = room.id; socket.data.playerId = playerId; socket.join(room.id);
      socket.emit('room:joined', { roomId: room.id, role: result.role });
      emitRoom(io, room);
    });

    socket.on('room:leave', () => {
      const room = getJoinedRoom(socket); const playerId = socket.data.playerId;
      if (!room || !playerId) return;
      leavePlayer(room, playerId, true); socket.leave(room.id); socket.data.roomId = undefined;
      const deleted = cleanupRoomIfNeeded(room);
      if (deleted) io.to(room.id).emit('room:delete', { roomId: room.id }); else emitRoom(io, room);
      io.emit('room:list', publicSummaries());
    });

    socket.on('room:updateSettings', (payload) => {
      const room = getJoinedRoom(socket); if (!room) return;
      if (room.ownerPlayerId !== socket.data.playerId) return emitError(socket, 'Chỉ chủ bàn được đổi thiết lập bàn.');
      if (typeof payload?.name === 'string' && room.game.status !== 'playing') room.name = payload.name.trim().slice(0, 40) || room.name;
      if (typeof payload?.allowSpectators === 'boolean') room.settings.allowSpectators = payload.allowSpectators;
      if (typeof payload?.spectatorChatEnabled === 'boolean') room.settings.spectatorChatEnabled = payload.spectatorChatEnabled;
      if (typeof payload?.spectatorReactionsEnabled === 'boolean') room.settings.spectatorReactionsEnabled = payload.spectatorReactionsEnabled;
      if (typeof payload?.locked === 'boolean' && room.game.status !== 'playing') room.settings.locked = payload.locked;
      if (payload?.theme) room.settings.theme = { ...room.settings.theme, ...payload.theme };
      if (room.game.status !== 'playing' && (payload?.gameMode === 'xiangqi' || payload?.gameMode === 'dark')) room.settings.gameMode = payload.gameMode;
      if (room.game.status !== 'playing' && payload?.darkOptions) room.settings.darkOptions = normalizeDarkOptions(payload.darkOptions);
      emitRoom(io, room);
    });

    socket.on('game:ready', (payload) => {
      const room = getJoinedRoom(socket); if (!room) return;
      setReady(room, socket.data.playerId, !!payload?.ready);
      emitRoom(io, room);
    });

    socket.on('game:move', (payload) => {
      const room = getJoinedRoom(socket); if (!room) return;
      const playerId = socket.data.playerId; const role = roleOf(room, playerId);
      if (role !== 'red' && role !== 'black') return emitError(socket, 'Người xem không được đi quân.');
      if (room.game.turn !== role) return emitError(socket, 'Chưa tới lượt của bạn.');
      materializeClock(room);
      if (room.clock.timeoutColor) { timeoutGame(room, room.clock.timeoutColor); if (finishIfEnded(room)) io.emit('archive:list', listArchives()); emitRoom(io, room); return; }
      const beforeGame = cloneGameState(room.game); const beforeClock = cloneClock(room.clock);
      const res = applyLegalMove(room.game, payload, Date.now());
      if (!res.ok || !res.nextState) return socket.emit('game:moveRejected', { reason: res.reason, legalMoves: res.legalMoves });
      room.undoStack.push({ game: beforeGame, clock: beforeClock });
      room.game = res.nextState;
      const last = room.game.lastMove;
      afterMoveSwitchClock(room, role);
      if (last) { last.redMsBefore = beforeClock.redMs; last.blackMsBefore = beforeClock.blackMs; last.redMsAfter = room.clock.redMs; last.blackMsAfter = room.clock.blackMs; last.incrementMsApplied = room.settings.timeControl.mode === 'increment' ? room.settings.timeControl.incrementMs : 0; }
      if (isPerpetualCheckBlocked(room)) { room.game = forceEnd(room.game, null, 'repetition'); addSystemChat(room, 'Hệ thống phát hiện chiếu dai/lặp thế ở mức thực dụng. Ván được xử hòa.'); }
      if (isPracticalChaseBlocked(room)) { addSystemChat(room, 'Cảnh báo: Không được bắt đuổi dai. Bản này xử lý ở mức thực dụng.'); }
      if (room.game.status === 'ended') { addSystemChat(room, endText(room.game.winner, room.game.endReason)); if (finishIfEnded(room)) io.emit('archive:list', listArchives()); }
      emitRoom(io, room);
    });

    socket.on('undo:request', () => {
      const room = getJoinedRoom(socket); if (!room) return;
      const role = roleOf(room, socket.data.playerId); if (role !== 'red' && role !== 'black') return emitError(socket, 'Người xem không được xin hoàn cờ.');
      const now = Date.now(); if (room.pendingUndo && now - room.pendingUndo.createdAt < 12_000) return emitError(socket, 'Bạn đang xin hoàn cờ quá nhanh.');
      room.pendingUndo = { id: `${now}`, by: role, createdAt: now }; addSystemChat(room, `${role === 'red' ? 'Đỏ' : 'Đen'} xin hoàn lại nước vừa đi.`); emitRoom(io, room);
    });
    socket.on('undo:accept', () => {
      const room = getJoinedRoom(socket); if (!room || !room.pendingUndo) return;
      const role = roleOf(room, socket.data.playerId); if (role !== opposite(room.pendingUndo.by)) return emitError(socket, 'Chỉ đối thủ mới được đồng ý hoàn cờ.');
      const snap = room.undoStack.pop(); if (!snap) return emitError(socket, 'Không còn nước để hoàn.');
      room.game = snap.game; room.clock = snap.clock; room.pendingUndo = undefined; addSystemChat(room, 'Hai bên đồng ý hoàn cờ.'); emitRoom(io, room);
    });
    socket.on('undo:reject', () => { const room = getJoinedRoom(socket); if (!room) return; room.pendingUndo = undefined; addSystemChat(room, 'Yêu cầu hoàn cờ đã bị từ chối.'); emitRoom(io, room); });

    socket.on('draw:request', () => {
      const room = getJoinedRoom(socket); if (!room) return;
      const role = roleOf(room, socket.data.playerId); if (role !== 'red' && role !== 'black') return emitError(socket, 'Người xem không được xin hòa.');
      room.pendingDraw = { id: `${Date.now()}`, by: role, createdAt: Date.now() }; addSystemChat(room, `${role === 'red' ? 'Đỏ' : 'Đen'} xin hòa.`); emitRoom(io, room);
    });
    socket.on('draw:accept', () => { const room = getJoinedRoom(socket); if (!room || !room.pendingDraw) return; const role = roleOf(room, socket.data.playerId); if (role !== opposite(room.pendingDraw.by)) return emitError(socket, 'Chỉ đối thủ mới được đồng ý hòa.'); drawGame(room); if (finishIfEnded(room)) io.emit('archive:list', listArchives()); emitRoom(io, room); });
    socket.on('draw:reject', () => { const room = getJoinedRoom(socket); if (!room) return; room.pendingDraw = undefined; addSystemChat(room, 'Yêu cầu hòa đã bị từ chối.'); emitRoom(io, room); });
    socket.on('resign:confirm', () => { const room = getJoinedRoom(socket); if (!room) return; const role = roleOf(room, socket.data.playerId); if (role !== 'red' && role !== 'black') return emitError(socket, 'Người xem không được đầu hàng.'); resign(room, role); if (finishIfEnded(room)) io.emit('archive:list', listArchives()); emitRoom(io, room); });
    socket.on('game:newRequest', () => { const room = getJoinedRoom(socket); if (!room) return; resetNewGameIfBothVote(room, socket.data.playerId); emitRoom(io, room); });

    socket.on('chat:send', (payload) => {
      const room = getJoinedRoom(socket); if (!room) return; const role = roleOf(room, socket.data.playerId); if (!role) return;
      if (role === 'spectator' && !room.settings.spectatorChatEnabled) return emitError(socket, 'Chat người xem đã bị tắt.');
      const text = cleanChat(payload?.text); if (!text) return;
      const name = role === 'spectator' ? room.spectators.find(s => s.playerId === socket.data.playerId)?.name : room[role]?.name;
      room.chat.push({ id: `${Date.now()}-${Math.random()}`, playerId: socket.data.playerId, name: name || 'Bạn', role, text, createdAt: Date.now() }); room.chat = room.chat.slice(-120); emitRoom(io, room);
    });
    socket.on('reaction:send', (payload) => {
      const room = getJoinedRoom(socket); if (!room) return; const role = roleOf(room, socket.data.playerId); if (!role || !validEmoji(payload?.emoji)) return;
      if (role === 'spectator' && !room.settings.spectatorReactionsEnabled) return emitError(socket, 'Biểu cảm người xem đã bị tắt.');
      const name = role === 'spectator' ? room.spectators.find(s => s.playerId === socket.data.playerId)?.name : room[role]?.name;
      const reaction = { id: `${Date.now()}-${Math.random()}`, playerId: socket.data.playerId, name: name || 'Bạn', role, emoji: payload.emoji, createdAt: Date.now() };
      room.reactions.push(reaction); room.reactions = room.reactions.slice(-30); io.to(room.id).emit('reaction:broadcast', reaction); emitRoom(io, room);
    });

    socket.on('disconnect', () => {
      const room = getJoinedRoom(socket); const playerId = socket.data.playerId;
      if (!room || !playerId) return;
      leavePlayer(room, playerId, false);
      emitRoom(io, room);
    });
  });

  setInterval(() => {
    for (const room of Array.from((globalThis as any).__roomsHack || [])) void room;
  }, 1000);

  setInterval(() => {
    import('./roomManager.js').then(({ allRooms }) => {
      for (const room of allRooms()) {
        materializeClock(room);
        if (room.clock.timeoutColor && room.game.status === 'playing') { timeoutGame(room, room.clock.timeoutColor); if (finishIfEnded(room)) io.emit('archive:list', listArchives()); }
        if (!cleanupRoomIfNeeded(room, true)) emitRoom(io, room);
      }
    });
  }, 1000);
}


function normalizeGameMode(raw: any): GameMode {
  return raw === 'dark' ? 'dark' : 'xiangqi';
}
function normalizeDarkOptions(raw: any): DarkOptions {
  const clean = (v: any) => v === 'horse_advisor' || v === 'cannon_elephant' ? v : 'none';
  return { redSwap: clean(raw?.redSwap || defaultDarkOptions.redSwap), blackSwap: clean(raw?.blackSwap || defaultDarkOptions.blackSwap) };
}

function normalizeTimeControl(raw: any): TimeControl {
  const mode = raw?.mode === 'none' ? 'none' : raw?.mode === 'fixed' ? 'fixed' : 'increment';
  const initialMs = Math.min(24 * 60 * 60_000, Math.max(30_000, Number(raw?.initialMs || 15 * 60_000)));
  const incrementMs = Math.min(120_000, Math.max(0, Number(raw?.incrementMs || 0)));
  return { mode, initialMs, incrementMs: mode === 'increment' ? incrementMs : 0 };
}
function endText(winner: Color | null, reason: any) { if (!winner) return 'Ván cờ kết thúc hòa.'; return `${winner === 'red' ? 'Đỏ' : 'Đen'} thắng (${reason || 'kết thúc'}).`; }
