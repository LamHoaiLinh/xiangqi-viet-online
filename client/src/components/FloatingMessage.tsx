export default function FloatingMessage({ room }: { room: any }) {
  const last = room.chat?.filter((m: any) => m.role !== 'system').slice(-1)[0];
  if (!last) return null;
  return <div className={`floating-msg ${last.role}`}>{last.name}: {last.text}</div>;
}
