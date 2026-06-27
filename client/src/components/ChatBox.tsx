import { useState } from 'react';
import { emojis } from '../utils/constants';
export default function ChatBox({ socket, room, collapsedDefault = true }: { socket: any; room: any; collapsedDefault?: boolean }) {
  const [text, setText] = useState(''); const [collapsed, setCollapsed] = useState(collapsedDefault);
  const send = () => { if (!text.trim()) return; socket?.emit('chat:send', { text }); setText(''); };
  const messages = collapsed ? room.chat.slice(-4) : room.chat.slice(-80);
  return <div className={`card chat ${collapsed ? 'collapsed' : ''}`}><div className="chat-head"><h3>Chat</h3><button className="secondary small" onClick={() => setCollapsed(!collapsed)}>{collapsed ? 'Mở rộng' : 'Thu gọn'}</button></div><div className="chat-lines">{messages.map((m: any) => <p key={m.id} className={m.role === 'system' ? 'system' : ''}><b>{m.name}</b>: {m.text}</p>)}</div><div className="emoji-row">{emojis.map(e => <button key={e} className="emoji" onClick={() => socket?.emit('reaction:send', { emoji: e })}>{e}</button>)}</div><div className="chat-input"><input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder="Nhắn trong bàn..."/><button onClick={send}>Gửi</button></div></div>;
}
