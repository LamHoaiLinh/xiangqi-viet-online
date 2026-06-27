export const ASSET = '/assets';
export const emojis = ['👍','😂','😮','🔥','😭','👏','⚠️'];
export const defaultTheme = { theme: 'light', boardColor: '#f4d39a', lineColor: '#6d3518', riverColor: '#d9f2ff', redPieceColor: '#b51f1f', blackPieceColor: '#222222', highlightColor: '#48b87a', selectedColor: '#f2c94c', checkColor: '#ff4d4f', pieceStyle: 'asset' };
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
