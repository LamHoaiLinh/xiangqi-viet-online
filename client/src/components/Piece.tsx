import { Piece as PieceModel, pieceNameVi } from '../../../shared/gameTypes';
import { ASSET } from '../utils/constants';
const han: any = { red: { general: '帥', advisor: '仕', elephant: '相', rook: '俥', horse: '傌', cannon: '炮', pawn: '兵' }, black: { general: '將', advisor: '士', elephant: '象', rook: '車', horse: '馬', cannon: '砲', pawn: '卒' } };
const viShort: any = { general: 'Tg', advisor: 'Sĩ', elephant: 'Tg', rook: 'Xe', horse: 'Mã', cannon: 'Pháo', pawn: 'Tốt' };
export default function Piece({ piece, style, theme }: { piece: PieceModel; style: 'asset' | 'han' | 'vi'; theme: any }) {
  const src = `${ASSET}/pieces/piece_${piece.color}_${piece.type}.png`;
  if (style === 'asset') return <img className="piece-img" src={src} alt={pieceNameVi[piece.type]} draggable={false} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />;
  const text = style === 'han' ? han[piece.color][piece.type] : viShort[piece.type];
  return <span className="piece-fallback" style={{ color: piece.color === 'red' ? theme.redPieceColor : theme.blackPieceColor }}>{text}</span>;
}
