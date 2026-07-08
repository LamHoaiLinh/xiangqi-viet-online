import { DarkSwapMode, GameMode, GameState } from '../shared/gameTypes.js';
import { cloneGameState } from '../shared/xiangqiRules.js';
import { GameArchiveRecord, Room, ThemeSettings } from './types.js';

const archives: Record<GameMode, GameArchiveRecord[]> = { xiangqi: [], dark: [] };
const BACKUP_VERSION = 2;

function cloneGameMaybe(g?: GameState): GameState | undefined {
  return g ? cloneGameState(g) : undefined;
}

function cloneThemeMaybe(t?: ThemeSettings): ThemeSettings | undefined {
  return t ? { ...t } : undefined;
}

function cloneArchive(r: GameArchiveRecord): GameArchiveRecord {
  return {
    ...r,
    darkOptions: { ...r.darkOptions },
    scoreAfter: { ...r.scoreAfter },
    theme: cloneThemeMaybe(r.theme),
    initialGame: cloneGameMaybe(r.initialGame),
    moveHistory: r.moveHistory.map(m => ({
      ...m,
      from: { ...m.from },
      to: { ...m.to },
      piece: { ...m.piece },
      captured: m.captured ? { ...m.captured } : undefined
    }))
  };
}

function trimMode(mode: GameMode) {
  const list = archives[mode].sort((a, b) => b.endedAt - a.endedAt);
  const starred = list.filter(g => g.starred);
  const normal = list.filter(g => !g.starred).slice(0, 50);
  archives[mode] = [...starred, ...normal].sort((a, b) => b.endedAt - a.endedAt);
}

function inferInitialGameFromFinal(finalGame: GameState): GameState {
  const initial = cloneGameState(finalGame);
  for (const move of [...finalGame.moveHistory].reverse()) {
    const movedId = move.piece?.id;
    let moving = movedId ? initial.pieces.find(p => p.id === movedId) : undefined;
    if (!moving) moving = initial.pieces.find(p => p.row === move.to.row && p.col === move.to.col && p.color === move.piece?.color);
    if (moving) {
      if (move.piece) {
        moving.id = move.piece.id;
        moving.color = move.piece.color;
        moving.type = move.piece.type;
        moving.moveAs = move.piece.moveAs;
        moving.startType = move.piece.startType;
      }
      moving.row = move.from.row;
      moving.col = move.from.col;
      if (move.revealedType) moving.hidden = true;
      else moving.hidden = move.piece?.hidden;
    }
    if (move.captured) {
      const exists = initial.pieces.some(p => p.id === move.captured?.id);
      if (!exists) initial.pieces.push({ ...move.captured, row: move.to.row, col: move.to.col });
    }
  }
  initial.status = 'playing';
  initial.turn = 'red';
  initial.winner = null;
  initial.endReason = null;
  initial.moveHistory = [];
  initial.captured = { red: [], black: [] };
  initial.lastMove = undefined;
  initial.checkColor = null;
  initial.repetition = {};
  return initial;
}

export function archiveEndedGame(room: Room): GameArchiveRecord | null {
  if (room.game.status !== 'ended') return null;
  if (room.archivedGameId === room.game.id) return archives[room.settings.gameMode].find(g => g.id === room.game.id) || null;
  const record: GameArchiveRecord = {
    id: room.game.id,
    roomId: room.id,
    roomName: room.name,
    mode: room.settings.gameMode,
    darkOptions: { ...room.settings.darkOptions },
    redName: room.red?.name,
    blackName: room.black?.name,
    winner: room.game.winner,
    endReason: room.game.endReason,
    createdAt: room.createdAt,
    endedAt: Date.now(),
    moveCount: room.game.moveHistory.length,
    moveHistory: room.game.moveHistory.map(m => ({ ...m, from: { ...m.from }, to: { ...m.to }, piece: { ...m.piece }, captured: m.captured ? { ...m.captured } : undefined })),
    scoreAfter: { ...room.score },
    starred: false,
    initialGame: inferInitialGameFromFinal(room.game),
    theme: { ...room.settings.theme }
  };
  archives[record.mode] = [record, ...archives[record.mode].filter(g => g.id !== record.id)];
  room.archivedGameId = record.id;
  trimMode(record.mode);
  return record;
}

export function listArchives() {
  return {
    xiangqi: archives.xiangqi.map(cloneArchive),
    dark: archives.dark.map(cloneArchive)
  };
}

export function setArchiveStar(id: string, starred: boolean): boolean {
  for (const mode of ['xiangqi', 'dark'] as GameMode[]) {
    const item = archives[mode].find(g => g.id === id);
    if (item) {
      item.starred = starred;
      trimMode(mode);
      return true;
    }
  }
  return false;
}

export function exportArchiveBackup() {
  const data = listArchives();
  return {
    app: 'xiangqi-viet-online',
    backupType: 'saved-games',
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    note: 'File JSON này dùng để nhập lại toàn bộ ván Cờ Tướng/Cờ Úp đã lưu nếu Render restart hoặc redeploy làm mất RAM. Version 2 có kèm snapshot bàn cờ ban đầu để xem lại chính xác.',
    counts: {
      xiangqi: data.xiangqi.length,
      dark: data.dark.length,
      starredXiangqi: data.xiangqi.filter(g => g.starred).length,
      starredDark: data.dark.filter(g => g.starred).length
    },
    archives: data
  };
}

function cleanString(value: unknown, max = 120): string {
  return String(value || '').trim().slice(0, max);
}

function cleanNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function cleanMode(value: unknown): GameMode | null {
  return value === 'xiangqi' || value === 'dark' ? value : null;
}

function cleanDarkSwap(value: unknown): DarkSwapMode {
  return value === 'horse_advisor' || value === 'cannon_elephant' || value === 'rook_advisor' || value === 'rook_horse' ? value : 'none';
}

function cleanTheme(raw: any): ThemeSettings | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  return {
    theme: raw.theme === 'dark' ? 'dark' : 'light',
    boardColor: cleanString(raw.boardColor, 20) || '#f4d39a',
    lineColor: cleanString(raw.lineColor, 20) || '#6d3518',
    riverColor: cleanString(raw.riverColor, 20) || '#d9f2ff',
    redPieceColor: cleanString(raw.redPieceColor, 20) || '#b51f1f',
    blackPieceColor: cleanString(raw.blackPieceColor, 20) || '#222222',
    highlightColor: cleanString(raw.highlightColor, 20) || '#48b87a',
    selectedColor: cleanString(raw.selectedColor, 20) || '#f2c94c',
    checkColor: cleanString(raw.checkColor, 20) || '#ff4d4f',
    pieceStyle: raw.pieceStyle === 'han' || raw.pieceStyle === 'vi' ? raw.pieceStyle : 'asset',
    pieceSet: cleanString(raw.pieceSet, 50) || 'classic',
    boardAsset: cleanString(raw.boardAsset, 120) || 'board_classic_ivory.png',
    sceneAsset: cleanString(raw.sceneAsset, 120) || 'scene_blank.png'
  };
}

function cleanInitialGame(raw: any): GameState | undefined {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.pieces)) return undefined;
  try {
    const g = raw as GameState;
    return cloneGameState({
      ...g,
      status: 'playing',
      turn: g.turn === 'black' ? 'black' : 'red',
      winner: null,
      endReason: null,
      moveHistory: [],
      captured: { red: [], black: [] },
      lastMove: undefined,
      checkColor: null,
      repetition: {}
    });
  } catch {
    return undefined;
  }
}

function normalizeRecord(raw: any): GameArchiveRecord | null {
  const mode = cleanMode(raw?.mode);
  const id = cleanString(raw?.id, 160);
  if (!mode || !id || !Array.isArray(raw?.moveHistory)) return null;
  const score = raw?.scoreAfter || {};
  return {
    id,
    roomId: cleanString(raw?.roomId, 80) || 'imported',
    roomName: cleanString(raw?.roomName, 80) || 'Ván nhập lại',
    mode,
    darkOptions: {
      redSwap: cleanDarkSwap(raw?.darkOptions?.redSwap),
      blackSwap: cleanDarkSwap(raw?.darkOptions?.blackSwap)
    },
    redName: raw?.redName ? cleanString(raw.redName, 40) : undefined,
    blackName: raw?.blackName ? cleanString(raw.blackName, 40) : undefined,
    winner: raw?.winner === 'red' || raw?.winner === 'black' ? raw.winner : null,
    endReason: ['checkmate', 'stalemate', 'resign', 'draw', 'timeout', 'manual', 'repetition'].includes(raw?.endReason) ? raw.endReason : null,
    createdAt: cleanNumber(raw?.createdAt, Date.now()),
    endedAt: cleanNumber(raw?.endedAt, Date.now()),
    moveCount: Math.max(0, Math.floor(cleanNumber(raw?.moveCount, raw.moveHistory.length))),
    moveHistory: raw.moveHistory.map((m: any, index: number) => ({
      ...m,
      id: cleanString(m?.id, 120) || `${id}-m${index + 1}`,
      from: { row: cleanNumber(m?.from?.row), col: cleanNumber(m?.from?.col) },
      to: { row: cleanNumber(m?.to?.row), col: cleanNumber(m?.to?.col) },
      piece: m?.piece ? { ...m.piece } : undefined,
      captured: m?.captured ? { ...m.captured } : undefined,
      notation: cleanString(m?.notation, 220) || `Nước ${index + 1}`,
      createdAt: cleanNumber(m?.createdAt, Date.now()),
      note: m?.note ? cleanString(m.note, 220) : undefined
    })),
    scoreAfter: {
      redWins: Math.max(0, Math.floor(cleanNumber(score.redWins))),
      blackWins: Math.max(0, Math.floor(cleanNumber(score.blackWins))),
      draws: Math.max(0, Math.floor(cleanNumber(score.draws))),
      games: Math.max(0, Math.floor(cleanNumber(score.games)))
    },
    starred: !!raw?.starred,
    initialGame: cleanInitialGame(raw?.initialGame),
    theme: cleanTheme(raw?.theme)
  };
}

export function importArchiveBackup(rawBackup: any, replace = false) {
  const source = rawBackup?.archives || rawBackup;
  const incoming = [
    ...(Array.isArray(source?.xiangqi) ? source.xiangqi : []),
    ...(Array.isArray(source?.dark) ? source.dark : [])
  ];
  if (incoming.length === 0) {
    return { ok: false, imported: 0, updated: 0, skipped: 0, replaced: false, message: 'File không có dữ liệu ván đã lưu hợp lệ.' };
  }

  if (replace) {
    archives.xiangqi = [];
    archives.dark = [];
  }

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const raw of incoming) {
    const record = normalizeRecord(raw);
    if (!record) { skipped++; continue; }
    const list = archives[record.mode];
    const existingIndex = list.findIndex(g => g.id === record.id);
    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      list[existingIndex] = { ...record, starred: existing.starred || record.starred };
      updated++;
    } else {
      list.push(record);
      imported++;
    }
  }

  trimMode('xiangqi');
  trimMode('dark');

  return {
    ok: imported + updated > 0,
    imported,
    updated,
    skipped,
    replaced: replace,
    counts: {
      xiangqi: archives.xiangqi.length,
      dark: archives.dark.length,
      starredXiangqi: archives.xiangqi.filter(g => g.starred).length,
      starredDark: archives.dark.filter(g => g.starred).length
    },
    message: replace
      ? `Đã nhập thay thế: thêm ${imported}, cập nhật ${updated}, bỏ qua ${skipped}.`
      : `Đã nhập gộp: thêm ${imported}, cập nhật ${updated}, bỏ qua ${skipped}.`
  };
}
