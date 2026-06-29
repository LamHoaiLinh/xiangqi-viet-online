import Piece from './Piece';
import { defaultTheme } from '../utils/constants';

function canReveal(piece: any, bucket: 'red' | 'black', role: string | null, settings: any) {
  const revealAll = !!settings?.revealCapturedHiddenToAll;
  const revealOwner = !!settings?.revealCapturedHiddenToOwner;
  const capturer = bucket === 'red' ? 'black' : 'red';
  const owner = bucket;
  if (!piece.hidden) return true;
  if (revealAll) return true;
  if (role === capturer) return true;
  if (revealOwner && role === owner) return true;
  return false;
}

function displayPiece(piece: any, bucket: 'red' | 'black', role: string | null, settings: any) {
  const reveal = canReveal(piece, bucket, role, settings);
  return reveal ? { ...piece, hidden: false } : { ...piece, hidden: true };
}

function CapturedRow({ title, pieces, bucket, role, settings, theme }: { title: string; pieces: any[]; bucket: 'red' | 'black'; role: string | null; settings: any; theme: any }) {
  return <div className="captured-row"><span className="captured-title">{title}</span><div className="captured-piece-list">
    {pieces?.length ? pieces.map((p: any, i: number) => <span key={`${p.id || i}-${i}`} className="captured-piece"><Piece piece={displayPiece(p, bucket, role, settings)} style={'asset'} theme={theme || defaultTheme} game={{ rules: { mode: settings?.gameMode || 'xiangqi', darkOptions: settings?.darkOptions || { redSwap: 'none', blackSwap: 'none' } } }}/></span>) : <span className="captured-empty">—</span>}
  </div></div>;
}

export default function CapturedPieces({ captured, role, settings, theme }: { captured: any; role: string | null; settings: any; theme?: any }) {
  const t = theme || settings?.theme || defaultTheme;
  return <div className="captured">
    <CapturedRow title="Đỏ bị ăn" pieces={captured.red || []} bucket="red" role={role} settings={settings} theme={t}/>
    <CapturedRow title="Đen bị ăn" pieces={captured.black || []} bucket="black" role={role} settings={settings} theme={t}/>
  </div>;
}
