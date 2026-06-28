import { Piece as PieceModel, pieceNameVi } from '../../../shared/gameTypes';
import { effectivePieceLabel, isSwapAffected } from '../../../shared/xiangqiRules';
import { ASSET } from '../utils/constants';

const han: any = { red: { general: '帥', advisor: '仕', elephant: '相', rook: '俥', horse: '傌', cannon: '炮', pawn: '兵' }, black: { general: '將', advisor: '士', elephant: '象', rook: '車', horse: '馬', cannon: '砲', pawn: '卒' } };
const viShort: any = { general: 'Tg', advisor: 'Sĩ', elephant: 'Tượng', rook: 'Xe', horse: 'Mã', cannon: 'Pháo', pawn: 'Tốt' };

export default function Piece({ piece, style, theme, game }: { piece: PieceModel; style: 'asset' | 'han' | 'vi'; theme: any; game?: any }) {
  if (piece.hidden) {
    return <span
      className="piece-fallback piece-hidden"
      style={{ ['--hiddenAccent' as any]: piece.color === 'red' ? theme.redPieceColor : theme.blackPieceColor }}
      title="Quân úp"
      aria-label="Quân úp"
    />;
  }

  const swapped = game ? isSwapAffected(game, piece) : false;
  const comboLabel = swapped && game ? effectivePieceLabel(game, piece) : '';
  const swapTitle = swapped ? ` · có thêm chức năng ${comboLabel}` : '';
  const cls = `piece-fallback ${swapped ? 'piece-swap-glow' : ''}`;

  if (style === 'asset') {
    const src = `${ASSET}/pieces/piece_${piece.color}_${piece.type}.png`;
    return <span
      className={`${cls} piece-asset-only`}
      title={`${pieceNameVi[piece.type]}${swapTitle}`}
      style={{ color: piece.color === 'red' ? theme.redPieceColor : theme.blackPieceColor }}
    >
      <img className="piece-img" src={src} alt={pieceNameVi[piece.type]} draggable={false} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}/>
    </span>;
  }

  const text = style === 'han' ? han[piece.color][piece.type] : viShort[piece.type];
  return <span
    className={`${cls} piece-text piece-text-${style}`}
    title={`${pieceNameVi[piece.type]}${swapTitle}`}
    style={{ color: piece.color === 'red' ? theme.redPieceColor : theme.blackPieceColor }}
  >
    {text}
  </span>;
}
