export const ASSET = '/assets';
export const emojis = ['👍','😂','😮','🔥','😭','👏','⚠️'];
export const defaultTheme = {
  theme: 'light',
  boardColor: '#f4d39a',
  lineColor: '#8b6b3f',
  riverColor: '#d6dcd1',
  redPieceColor: '#b51f1f',
  blackPieceColor: '#222222',
  highlightColor: '#48b87a',
  selectedColor: '#f2c94c',
  checkColor: '#ff4d4f',
  pieceStyle: 'asset',
  boardAsset: 'board_classic_ornate.png',
  sceneAsset: 'scene_classic.png'
};
export const themePresets = [
  { id: 'classic', name: 'Gỗ cổ điển', theme: { ...defaultTheme, boardColor: '#f4d39a', lineColor: '#8c7047', riverColor: '#d7ddd5', redPieceColor: '#b51f1f', blackPieceColor: '#222222', highlightColor: '#4db87c', selectedColor: '#f0ca61', checkColor: '#ff4d4f', boardAsset: 'board_classic_ornate.png', sceneAsset: 'scene_classic.png' } },
  { id: 'royal', name: 'Hoàng gia', theme: { ...defaultTheme, boardColor: '#f1c36d', lineColor: '#89633a', riverColor: '#dddac8', redPieceColor: '#9f1239', blackPieceColor: '#1e293b', highlightColor: '#22c55e', selectedColor: '#facc15', checkColor: '#dc2626', boardAsset: 'board_royal_ornate.png', sceneAsset: 'scene_royal.png' } },
  { id: 'jade', name: 'Ngọc xanh', theme: { ...defaultTheme, boardColor: '#d4c08a', lineColor: '#657350', riverColor: '#cde1d5', redPieceColor: '#b91c1c', blackPieceColor: '#064e3b', highlightColor: '#16a34a', selectedColor: '#eab308', checkColor: '#ef4444', boardAsset: 'board_jade_ornate.png', sceneAsset: 'scene_jade.png' } },
  { id: 'ink', name: 'Mặc thủy', theme: { ...defaultTheme, boardColor: '#c7b299', lineColor: '#6e645a', riverColor: '#d5dadd', redPieceColor: '#991b1b', blackPieceColor: '#111827', highlightColor: '#10b981', selectedColor: '#f59e0b', checkColor: '#b91c1c', boardAsset: 'board_ink_ornate.png', sceneAsset: 'scene_ink.png' } },
  { id: 'sunset', name: 'Hoàng hôn', theme: { ...defaultTheme, boardColor: '#f0b775', lineColor: '#915c35', riverColor: '#ead0bf', redPieceColor: '#be123c', blackPieceColor: '#431407', highlightColor: '#84cc16', selectedColor: '#fbbf24', checkColor: '#e11d48', boardAsset: 'board_sunset_ornate.png', sceneAsset: 'scene_sunset.png' } },
  { id: 'night', name: 'Đêm trầm', theme: { ...defaultTheme, theme: 'dark', boardColor: '#7c4a24', lineColor: '#d6c29b', riverColor: '#5d7081', redPieceColor: '#f87171', blackPieceColor: '#f8fafc', highlightColor: '#4ade80', selectedColor: '#fde047', checkColor: '#fb7185', boardAsset: 'board_night_ornate.png', sceneAsset: 'scene_night.png' } }
];
export const timePresets = [
  { label: 'Không tính giờ', mode: 'none', initialMs: 15 * 60000, incrementMs: 0 },
  { label: '3 phút', mode: 'fixed', initialMs: 3 * 60000, incrementMs: 0 },
  { label: '5 phút', mode: 'fixed', initialMs: 5 * 60000, incrementMs: 0 },
  { label: '10 phút', mode: 'fixed', initialMs: 10 * 60000, incrementMs: 0 },
  { label: '15 phút', mode: 'fixed', initialMs: 15 * 60000, incrementMs: 0 },
  { label: '15 phút + 5 giây', mode: 'increment', initialMs: 15 * 60000, incrementMs: 5000 },
  { label: '30 phút', mode: 'fixed', initialMs: 30 * 60000, incrementMs: 0 },
  { label: '30 phút + 10 giây', mode: 'increment', initialMs: 30 * 60000, incrementMs: 10000 },
  { label: 'Tùy chỉnh', mode: 'custom', initialMs: 15 * 60000, incrementMs: 5_000 }
];
