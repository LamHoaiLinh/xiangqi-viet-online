export function cleanDisplayName(name: string): string {
  return String(name || '').replace(/\s+/g, ' ').trim().slice(0, 20);
}
export function validDisplayName(name: string): boolean { const n = cleanDisplayName(name); return n.length >= 2 && n.length <= 20; }
export function cleanChat(text: string): string { return String(text || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 300); }
export function validEmoji(e: string): boolean { return ['👍','😂','😮','🔥','😭','👏','⚠️'].includes(e); }
