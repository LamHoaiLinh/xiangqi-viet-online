import { pieceNameVi } from '../../../shared/gameTypes';
export default function CapturedPieces({ captured }: { captured: any }) {
  return <div className="captured"><span>Đỏ bị ăn: {captured.red?.map((p: any) => pieceNameVi[p.type]).join(', ') || '—'}</span><span>Đen bị ăn: {captured.black?.map((p: any) => pieceNameVi[p.type]).join(', ') || '—'}</span></div>;
}
