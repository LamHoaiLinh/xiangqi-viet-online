import { defaultTheme, pieceSetOptions, themePresets } from '../utils/constants';

export default function ThemeCustomizer({ theme, onChange }: { theme: any; onChange: (t: any) => void }) {
  const current = { ...defaultTheme, ...theme };
  return <div className="card theme-customizer">
    <h3>Chọn bàn cờ</h3>
    <p className="hint">Bấm trực tiếp vào hình bàn cờ. Lựa chọn trong lúc chơi được áp dụng ngay trên thiết bị của người đang chọn.</p>
    <div className="theme-preset-grid">
      {themePresets.map(p => {
        const active = current.boardAsset === p.theme.boardAsset;
        return <button
          type="button"
          key={p.id}
          aria-pressed={active}
          className={`theme-preset-card secondary ${active ? 'active' : ''}`}
          onClick={() => onChange({ ...current, ...p.theme, pieceStyle: 'asset', pieceSet: current.pieceSet || 'classic' })}
        >
          <span className="theme-preview" style={{ ['--pBoard' as any]: p.theme.boardColor, ['--pLine' as any]: p.theme.lineColor, ['--pRed' as any]: p.theme.redPieceColor, ['--pBlack' as any]: p.theme.blackPieceColor, backgroundImage: `url(/assets/boards/${p.theme.boardAsset})` }}>
            <i/><b/><em/>
          </span>
          <strong>{p.name}</strong>
          {active && <small>Đang chọn</small>}
        </button>;
      })}
    </div>

    <h3>Bộ quân cờ</h3>
    <div className="piece-set-grid">
      {pieceSetOptions.map(p => {
        const active = current.pieceSet === p.id;
        return <button
          type="button"
          key={p.id}
          aria-pressed={active}
          className={`piece-set-card secondary ${active ? 'active' : ''}`}
          onClick={() => onChange({ ...current, pieceStyle: 'asset', pieceSet: p.id })}
        >
          <span className="piece-set-preview">
            <img src={`/assets/pieces/${p.id}/piece_black_rook.png`} alt="Xe đen" draggable={false}/>
            <img src={`/assets/pieces/${p.id}/piece_red_general.png`} alt="Tướng đỏ" draggable={false}/>
          </span>
          <strong>{p.name}</strong>
          <small>{active ? 'Đang chọn' : p.hint}</small>
        </button>;
      })}
    </div>
    <button type="button" className="secondary" onClick={() => onChange({ ...defaultTheme })}>Khôi phục mặc định</button>
  </div>;
}
