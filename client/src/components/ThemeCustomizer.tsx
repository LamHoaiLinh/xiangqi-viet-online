import { defaultTheme } from '../utils/constants';

const fields = [
  ['boardColor', 'Màu bàn'], ['lineColor', 'Màu đường kẻ'], ['riverColor', 'Màu sông'], ['redPieceColor', 'Màu quân Đỏ'], ['blackPieceColor', 'Màu quân Đen'], ['highlightColor', 'Màu nước hợp lệ'], ['selectedColor', 'Màu quân chọn'], ['checkColor', 'Màu báo chiếu']
];
export default function ThemeCustomizer({ theme, onChange }: { theme: any; onChange: (t: any) => void }) {
  const t = { ...defaultTheme, ...theme };
  return <div className="card theme-customizer">
    <h3>Tùy chỉnh giao diện</h3>
    <div className="grid-2"><label>Theme<select value={t.theme} onChange={e => onChange({ ...t, theme: e.target.value })}><option value="light">Sáng</option><option value="dark">Tối</option></select></label><label>Style quân<select value={t.pieceStyle} onChange={e => onChange({ ...t, pieceStyle: e.target.value })}><option value="asset">Asset PNG</option><option value="han">Chữ Hán</option><option value="vi">Chữ Việt</option></select></label></div>
    <div className="color-grid">{fields.map(([k, label]) => <label key={k}>{label}<input type="color" value={t[k]} onChange={e => onChange({ ...t, [k]: e.target.value })}/></label>)}</div>
    <button className="secondary" onClick={() => onChange(defaultTheme)}>Khôi phục mặc định</button>
  </div>;
}
