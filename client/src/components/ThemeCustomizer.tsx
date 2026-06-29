import { defaultTheme, themePresets } from '../utils/constants';

const pieceSets = [
  { id: 'classic', name: 'Quân mặc định', hint: 'Bộ quân đang dùng' },
  { id: 'gold_large', name: 'Quân vàng lớn', hint: 'Bộ quân anh vừa gửi' }
];

export default function ThemeCustomizer({ theme, onChange }: { theme: any; onChange: (t: any) => void }) {
  const current = { ...defaultTheme, ...theme };
  return <div className="card theme-customizer">
    <h3>Chọn giao diện bàn cờ</h3>
    <p className="hint">Giữ nguyên logic game. Anh có thể chọn bàn cờ và chọn 1 trong 2 bộ quân cờ asset PNG.</p>
    <div className="theme-preset-grid">
      {themePresets.map(p => <button key={p.id} className="theme-preset-card secondary" onClick={() => onChange({ ...p.theme, pieceStyle: 'asset', pieceSet: current.pieceSet || 'classic' })}>
        <span className="theme-preview" style={{ ['--pBoard' as any]: p.theme.boardColor, ['--pLine' as any]: p.theme.lineColor, ['--pRed' as any]: p.theme.redPieceColor, ['--pBlack' as any]: p.theme.blackPieceColor, backgroundImage: `url(/assets/boards/${p.theme.boardAsset})` }}>
          <i/><b/><em/>
        </span>
        <strong>{p.name}</strong>
      </button>)}
    </div>

    <h3>Bộ quân cờ</h3>
    <div className="piece-set-grid">
      {pieceSets.map(p => <button key={p.id} className={`piece-set-card secondary ${current.pieceSet === p.id ? 'active' : ''}`} onClick={() => onChange({ ...current, pieceStyle: 'asset', pieceSet: p.id })}>
        <span className="piece-set-preview">
          <img src={`/assets/pieces/${p.id}/piece_black_rook.png`} alt="Xe đen" draggable={false}/>
          <img src={`/assets/pieces/${p.id}/piece_red_general.png`} alt="Tướng đỏ" draggable={false}/>
        </span>
        <strong>{p.name}</strong>
        <small>{p.hint}</small>
      </button>)}
    </div>
    <button className="secondary" onClick={() => onChange(defaultTheme)}>Khôi phục mặc định</button>
  </div>;
}
