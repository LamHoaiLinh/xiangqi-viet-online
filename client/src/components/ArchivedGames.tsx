import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { darkSwapLabel } from '../../../shared/gameTypes';
import ReplayViewer from './ReplayViewer';

const fmtDate = (ts: number) => new Date(ts).toLocaleString('vi-VN');
const reasonText: any = { checkmate: 'chiếu bí', stalemate: 'hết nước', resign: 'đầu hàng', draw: 'hòa', timeout: 'rụng kim', repetition: 'lặp thế', no_capture_50: '50 nước không ăn quân', manual: 'kết thúc' };
function result(g: any) {
  if (!g.winner) return `Hòa${g.endReason ? ' · ' + (reasonText[g.endReason] || g.endReason) : ''}`;
  return `${g.winner === 'red' ? 'Đỏ' : 'Đen'} thắng${g.endReason ? ' · ' + (reasonText[g.endReason] || g.endReason) : ''}`;
}

function downloadJson(data: any) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `co-tuong-viet-saved-games-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ArchivedGames({ socket, archives }: { socket: Socket | null; archives: any }) {
  const [mode, setMode] = useState<'xiangqi' | 'dark'>('xiangqi');
  const [selected, setSelected] = useState<any | null>(null);
  const [replay, setReplay] = useState<any | null>(null);
  const [backupMsg, setBackupMsg] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const replaceImportRef = useRef(false);
  const list = archives?.[mode] || [];

  useEffect(() => {
    if (!socket) return;
    const onExport = (backup: any) => {
      downloadJson(backup);
      setBackupMsg(`Đã xuất ${backup?.counts?.xiangqi || 0} ván Cờ Tướng và ${backup?.counts?.dark || 0} ván Cờ Úp ra file JSON.`);
    };
    const onImportResult = (r: any) => setBackupMsg(r?.message || 'Đã nhập dữ liệu ván đã lưu.');
    socket.on('archive:export', onExport);
    socket.on('archive:importResult', onImportResult);
    return () => {
      socket.off('archive:export', onExport);
      socket.off('archive:importResult', onImportResult);
    };
  }, [socket]);

  const requestExport = () => {
    if (socket) socket.emit('archive:export');
    else downloadJson({ app: 'xiangqi-viet-online', backupType: 'saved-games', version: 1, exportedAt: Date.now(), archives });
  };

  const openImport = (replace: boolean) => {
    replaceImportRef.current = replace;
    fileRef.current?.click();
  };

  const handleImportFile = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const replace = replaceImportRef.current;
      const ok = confirm(replace
        ? 'Nhập THAY THẾ sẽ xóa kho ván đang có trên server rồi nạp dữ liệu từ file JSON. Bạn chắc chắn muốn làm?'
        : 'Nhập GỘP sẽ thêm/cập nhật ván trong file JSON vào kho hiện tại, không xóa ván đang có. Bạn muốn tiếp tục?');
      if (!ok) return;
      socket?.emit('archive:import', { backup, replace });
      setBackupMsg('Đang gửi file backup lên server để nhập lại dữ liệu...');
    } catch {
      setBackupMsg('File nhập không phải JSON hợp lệ hoặc đã bị hỏng.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return <section className="card archive-box">
    <div className="archive-head"><h2>Ván đã lưu</h2><div className="actions"><button className={mode === 'xiangqi' ? '' : 'secondary'} onClick={() => { setMode('xiangqi'); setSelected(null); }}>Cờ Tướng ({archives?.xiangqi?.length || 0})</button><button className={mode === 'dark' ? '' : 'secondary'} onClick={() => { setMode('dark'); setSelected(null); }}>Cờ Úp ({archives?.dark?.length || 0})</button><button className="secondary" onClick={() => socket?.emit('archive:list')}>Làm mới</button></div></div>
    <p className="hint">Mỗi chế độ tự giữ 50 ván gần nhất. Ván có dấu sao được giữ ưu tiên và không tính vào giới hạn 50 ván thường.</p>
    <div className="backup-tools">
      <button onClick={requestExport}>Xuất tất cả ván ra JSON</button>
      <button className="secondary" onClick={() => openImport(false)}>Nhập gộp từ JSON</button>
      <button className="secondary danger-outline" onClick={() => openImport(true)}>Nhập thay thế từ JSON</button>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => handleImportFile(e.target.files?.[0])}/>
    </div>
    <p className="hint">Nên bấm <b>Xuất tất cả ván ra JSON</b> sau mỗi buổi chơi. Khi Render mất RAM, deploy lại hoặc restart, dùng <b>Nhập gộp</b> để nạp lại file backup.</p>
    {backupMsg && <p className="backup-msg">{backupMsg}</p>}
    {list.length === 0 && <p className="muted">Chưa có ván nào được lưu.</p>}
    <div className="archive-list">
      {list.map((g: any) => <div key={g.id} className="archive-row" onClick={() => setReplay(g)} role="button" tabIndex={0}>
        <span><b>{g.roomName}</b> · {fmtDate(g.endedAt)}</span>
        <span>{g.redName || 'Đỏ'} vs {g.blackName || 'Đen'} · {result(g)} · {g.moveCount} nước</span>
        {g.mode === 'dark' && <span>Đỏ: {darkSwapLabel[g.darkOptions?.redSwap || 'none']} · Đen: {darkSwapLabel[g.darkOptions?.blackSwap || 'none']}</span>}
        <div className="archive-actions">
          <button onClick={(e) => { e.stopPropagation(); setReplay(g); }}>Xem lại</button>
          <button className="secondary" onClick={(e) => { e.stopPropagation(); setSelected(g); }}>Lịch sử chữ</button>
          <button className="secondary archive-star" onClick={(e) => { e.stopPropagation(); socket?.emit('archive:star', { id: g.id, starred: !g.starred }); }}>{g.starred ? '★ Đang ưu tiên' : '☆ Gắn sao'}</button>
        </div>
      </div>)}
    </div>
    {replay && <ReplayViewer record={replay} onClose={() => setReplay(null)}/>}
    {selected && <div className="modal-backdrop"><div className="modal wide"><h2>{selected.starred ? '★ ' : ''}{selected.roomName}</h2><p>{selected.redName || 'Đỏ'} vs {selected.blackName || 'Đen'} · {result(selected)} · {fmtDate(selected.endedAt)}</p>{selected.mode === 'dark' && <p className="hint">Cờ Úp · Đỏ: {darkSwapLabel[selected.darkOptions?.redSwap || 'none']} · Đen: {darkSwapLabel[selected.darkOptions?.blackSwap || 'none']}</p>}<ol className="replay-list">{selected.moveHistory.map((m: any, i: number) => <li key={m.id || i}>{m.notation}{m.checkColor ? ' + chiếu' : ''}{m.note ? ` · ${m.note}` : ''}</li>)}</ol><div className="actions"><button onClick={() => setReplay(selected)}>Xem lại bàn cờ</button><button onClick={() => socket?.emit('archive:star', { id: selected.id, starred: !selected.starred })}>{selected.starred ? 'Bỏ sao' : 'Gắn sao ván này'}</button><button className="secondary" onClick={() => setSelected(null)}>Đóng</button></div></div></div>}
  </section>;
}
