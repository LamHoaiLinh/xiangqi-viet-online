import { defaultTheme, themePresets } from '../utils/constants';

export default function ThemeCustomizer({ theme, onChange }: { theme: any; onChange: (t: any) => void }) {
  const current = { ...defaultTheme, ...theme };
  return <div className="card theme-customizer">
    <h3>Chọn bộ màu bàn cờ</h3>
    <p className="hint">Bản này nâng cấp theo hướng đẹp hơn: mỗi combo có nền phong cảnh thủy mặc riêng, bàn cờ gỗ chạm hoa văn riêng và quân cờ asset PNG đồng bộ với hiệu ứng chọn/cờ úp.</p>
    <div className="theme-preset-grid">
      {themePresets.map(p => <button key={p.id} className="theme-preset-card secondary" onClick={() => onChange({ ...p.theme, pieceStyle: 'asset' })}>
        <span className="theme-preview" style={{ ['--pBoard' as any]: p.theme.boardColor, ['--pLine' as any]: p.theme.lineColor, ['--pRed' as any]: p.theme.redPieceColor, ['--pBlack' as any]: p.theme.blackPieceColor, backgroundImage: `url(/assets/scenes/${p.theme.sceneAsset})` }}>
          <i/><b/><em/>
        </span>
        <strong>{p.name}</strong>
      </button>)}
    </div>
    <div className="hint"><b>Kiểu quân cờ:</b> Asset PNG cố định.</div>
    <button className="secondary" onClick={() => onChange(defaultTheme)}>Khôi phục mặc định</button>
  </div>;
}
