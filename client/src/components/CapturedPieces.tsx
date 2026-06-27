import { pieceNameVi } from '../../../shared/gameTypes';

function visibleText(piece: any, bucket: 'red' | 'black', role: string | null, settings: any) {
  const revealAll = !!settings?.revealCapturedHiddenToAll;
  const revealOwner = !!settings?.revealCapturedHiddenToOwner;
  const capturer = bucket === 'red' ? 'black' : 'red';
  const owner = bucket;

  if (!piece.hidden) return pieceNameVi[piece.type];
  if (revealAll) return `${pieceNameVi[piece.type]} (úp)`;
  if (role === capturer) return `${pieceNameVi[piece.type]} (úp)`;
  if (revealOwner && role === owner) return `${pieceNameVi[piece.type]} (úp)`;
  return 'Quân úp';
}

export default function CapturedPieces({ captured, role, settings }: { captured: any; role: string | null; settings: any }) {
  return <div className="captured">
    <span>Đỏ bị ăn: {captured.red?.map((p: any) => visibleText(p, 'red', role, settings)).join(', ') || '—'}</span>
    <span>Đen bị ăn: {captured.black?.map((p: any) => visibleText(p, 'black', role, settings)).join(', ') || '—'}</span>
  </div>;
}
