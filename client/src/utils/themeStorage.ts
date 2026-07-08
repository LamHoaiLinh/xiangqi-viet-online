import { boardAssetOptions, defaultTheme, pieceSetOptions } from './constants';

const STORAGE_KEY = 'xiangqi_viet_visual_theme_v3';
const allowedBoards = new Set<string>(boardAssetOptions as readonly string[]);
const allowedPieceSets = new Set<string>(pieceSetOptions.map(x => x.id));

export function normalizeVisualTheme(input?: any, fallback?: any) {
  const merged: any = { ...defaultTheme, ...(fallback || {}), ...(input || {}) };
  if (!allowedBoards.has(String(merged.boardAsset || ''))) merged.boardAsset = defaultTheme.boardAsset;
  if (!allowedPieceSets.has(String(merged.pieceSet || ''))) merged.pieceSet = defaultTheme.pieceSet;
  merged.sceneAsset = 'scene_blank.png';
  merged.pieceStyle = 'asset';
  return merged;
}

export function loadVisualTheme(fallback?: any) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeVisualTheme(raw ? JSON.parse(raw) : undefined, fallback);
  } catch {
    return normalizeVisualTheme(undefined, fallback);
  }
}

export function saveVisualTheme(theme: any) {
  const normalized = normalizeVisualTheme(theme);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized)); } catch {}
  return normalized;
}
