export const ASSET = '/assets';
export const emojis = ['👍','😂','😮','🔥','😭','👏','⚠️'];
export const defaultTheme = {
  theme: 'light',
  boardColor: '#f6ead2',
  lineColor: '#9a6a2f',
  riverColor: '#efe4cb',
  redPieceColor: '#c62828',
  blackPieceColor: '#222222',
  highlightColor: '#48b87a',
  selectedColor: '#f2c94c',
  checkColor: '#ff4d4f',
  pieceStyle: 'asset',
  pieceSet: 'classic',
  boardAsset: 'board_classic_ivory.png',
  sceneAsset: 'scene_blank.png'
};
export const themePresets = [
  { id: 'classic', name: 'Ngà cổ điển', theme: { ...defaultTheme, boardColor: '#f6ead2', lineColor: '#9a6a2f', riverColor: '#efe4cb', redPieceColor: '#c62828', blackPieceColor: '#222222', highlightColor: '#49c277', selectedColor: '#f4d35e', checkColor: '#ff4d4f', pieceSet: 'classic', boardAsset: 'board_classic_ivory.png', sceneAsset: 'scene_blank.png' } },
  { id: 'royal', name: 'Lam hoàng gia', theme: { ...defaultTheme, boardColor: '#163d74', lineColor: '#d5b14c', riverColor: '#214f93', redPieceColor: '#c62828', blackPieceColor: '#222222', highlightColor: '#4ade80', selectedColor: '#facc15', checkColor: '#ef4444', pieceSet: 'royal', boardAsset: 'board_royal_blue.png', sceneAsset: 'scene_blank.png' } },
  { id: 'wood', name: 'Nâu gỗ', theme: { ...defaultTheme, boardColor: '#4e2d16', lineColor: '#d0a54d', riverColor: '#654122', redPieceColor: '#c62828', blackPieceColor: '#222222', highlightColor: '#65d38a', selectedColor: '#ffd166', checkColor: '#ef4444', pieceSet: 'wood', boardAsset: 'board_wood_brown.png', sceneAsset: 'scene_blank.png' } },
  { id: 'jade', name: 'Ngọc bích', theme: { ...defaultTheme, boardColor: '#49a99d', lineColor: '#f2cc63', riverColor: '#5ab8ab', redPieceColor: '#c62828', blackPieceColor: '#222222', highlightColor: '#34d399', selectedColor: '#fde047', checkColor: '#ef4444', pieceSet: 'jade', boardAsset: 'board_jade_green.png', sceneAsset: 'scene_blank.png' } },
  { id: 'crimson', name: 'Đỏ son', theme: { ...defaultTheme, boardColor: '#b1241d', lineColor: '#f0c35a', riverColor: '#c43a31', redPieceColor: '#c62828', blackPieceColor: '#222222', highlightColor: '#57d986', selectedColor: '#ffd166', checkColor: '#ff5a5f', pieceSet: 'crimson', boardAsset: 'board_crimson_red.png', sceneAsset: 'scene_blank.png' } }
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
