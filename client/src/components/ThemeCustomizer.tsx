import { defaultTheme, themePresets } from '../utils/constants';

export default function ThemeCustomizer({ theme, onChange }: { theme: any; onChange: (t: any) => void }) {
  const current = { ...defaultTheme, ...theme };
  return <div className="card theme-customizer">
    <h3>Chọn bộ màu bàn cờ</h3>
    <p className="hint">Chọn nhanh 1 trong 6 combo màu đã phối sẵn để bàn cờ dễ nhìn, không cần chỉnh từng màu riêng lẻ.</p>
    <div className="theme-preset-grid">
      {themePresets.map(p => <button key={p.id} className="theme-preset-card secondary" onClick={() => onChange({ ...p.theme, pieceStyle: current.pieceStyle || 'asset' })}>
        <span className="theme-preview" style={{ ['--pBoard' as any]: p.theme.boardColor, ['--pLine' as any]: p.theme.lineColor, ['--pRed' as any]: p.theme.redPieceColor, ['--pBlack' as any]: p.theme.blackPieceColor }}>
          <i/><b/><em/>
        </span>
        <strong>{p.name}</strong>
      </button>)}
    </div>
    <label>Kiểu quân cờ<select value={current.pieceStyle} onChange={e => onChange({ ...current, pieceStyle: e.target.value })}><option value="asset">Asset PNG</option><option value="han">Chữ Hán lớn</option><option value="vi">Chữ Việt</option></select></label>
    <button className="secondary" onClick={() => onChange(defaultTheme)}>Khôi phục mặc định</button>
  </div>;
}
