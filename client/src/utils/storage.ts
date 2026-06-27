export function loadJson<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(key); return raw ? { ...fallback, ...JSON.parse(raw) } : fallback; } catch { return fallback; } }
export function saveJson<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }
