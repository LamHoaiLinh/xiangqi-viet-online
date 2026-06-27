export default function MoveHistory({ moves }: { moves: any[] }) {
  return <div className="card move-history"><h3>Lịch sử nước đi</h3><ol>{moves.map((m, i) => <li key={m.id || i}>{m.notation}{m.checkColor ? ' +' : ''}{m.note ? ` · ${m.note}` : ''}</li>)}</ol></div>;
}
