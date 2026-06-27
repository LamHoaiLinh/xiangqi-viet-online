export default function EmojiReactions({ reactions }: { reactions: any[] }) {
  return <div className="reaction-layer">{(reactions || []).slice(-5).map((r: any) => <span key={r.id} className={`reaction ${r.role}`}>{r.emoji}</span>)}</div>;
}
