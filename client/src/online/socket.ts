import { io, Socket } from 'socket.io-client';

const PLAYER_KEY = 'xiangqi_viet_player_id';
export function getPlayerId() {
  let id = localStorage.getItem(PLAYER_KEY);
  if (!id) { id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`; localStorage.setItem(PLAYER_KEY, id); }
  return id;
}
export function createSocket(): Socket { return io('/', { transports: ['websocket', 'polling'], auth: { playerId: getPlayerId() } }); }
