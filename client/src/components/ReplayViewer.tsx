import { useEffect, useMemo, useState } from 'react';
import { GameState, MoveRecord, opposite, Piece as PieceModel } from '../../../shared/gameTypes';
import { createInitialGameState } from '../../../shared/xiangqiRules';
import Board from './Board';
import CapturedPieces from './CapturedPieces';
import MoveHistory from './MoveHistory';
import { defaultTheme } from '../utils/constants';

function deepClone<T>(value: T): T { return JSON.parse(JSON.stringify(value)); }

function prepareInitial(record: any): GameState {
  const source = record.initialGame || createInitialGameState(record.mode, record.darkOptions);
  const initial: GameState = deepClone(source);
  initial.status = 'playing';
  initial.turn = 'red';
  initial.winner = null;
  initial.endReason = null;
  initial.moveHistory = [];
  initial.captured = { red: [], black: [] };
  initial.lastMove = undefined;
  initial.checkColor = null;
  initial.repetition = {};
  initial.rules = { mode: record.mode || initial.rules?.mode || 'xiangqi', darkOptions: record.darkOptions || initial.rules?.darkOptions || { redSwap: 'none', blackSwap: 'none' } };
  return initial;
}

function applyReplayMove(prev: GameState, move: MoveRecord, isLast: boolean, record: any): GameState {
  const next: GameState = deepClone(prev);
  const movingId = move.piece?.id;
  let moving = movingId ? next.pieces.find(p => p.id === movingId) : undefined;
  if (!moving) moving = next.pieces.find(p => p.row === move.from.row && p.col === move.from.col && p.color === move.piece?.color);

  const captureIndex = next.pieces.findIndex((p: PieceModel) => {
    if (moving && p.id === moving.id) return false;
    if (move.captured?.id && p.id === move.captured.id) return true;
    return p.row === move.to.row && p.col === move.to.col && p.color !== move.piece?.color;
  });
  if (captureIndex >= 0) next.pieces.splice(captureIndex, 1);

  if (moving) {
    const patch: any = move.piece || {};
    moving.id = patch.id || moving.id;
    moving.color = patch.color || moving.color;
    moving.type = patch.type || moving.type;
    moving.hidden = patch.hidden;
    moving.moveAs = patch.moveAs;
    moving.startType = patch.startType;
    moving.row = move.to.row;
    moving.col = move.to.col;
  }

  if (move.captured) next.captured[move.captured.color].push({ ...move.captured });
  next.turn = opposite(prev.turn);
  next.lastMove = deepClone(move);
  next.checkColor = move.checkColor || null;
  next.moveHistory = [...prev.moveHistory.map(m => deepClone(m)), deepClone(move)];
  if (isLast) {
    next.status = 'ended';
    next.winner = record.winner || null;
    next.endReason = record.endReason || null;
  }
  return next;
}

function buildStates(record: any): GameState[] {
  const states: GameState[] = [prepareInitial(record)];
  const moves: MoveRecord[] = record.moveHistory || [];
  moves.forEach((m, index) => {
    states.push(applyReplayMove(states[states.length - 1], m, index === moves.length - 1, record));
  });
  return states;
}

export default function ReplayViewer({ record, onClose }: { record: any; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const states = useMemo(() => buildStates(record), [record]);
  const total = states.length - 1;
  const current = states[Math.min(step, total)] || states[0];
  const theme = record.theme || defaultTheme;
  const room = useMemo(() => ({
    id: record.roomId || record.id,
    name: record.roomName,
    red: { name: record.redName || 'Đỏ' },
    black: { name: record.blackName || 'Đen' },
    settings: {
      gameMode: record.mode,
      darkOptions: record.darkOptions || { redSwap: 'none', blackSwap: 'none' },
      theme,
      playMode: 'replay',
      revealCapturedHiddenToAll: true,
      revealCapturedHiddenToOwner: true
    },
    pendingUndo: null,
    pendingDraw: null
  }), [record, theme]);

  useEffect(() => { setStep(0); setPlaying(false); }, [record?.id]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep(s => {
        if (s >= total) { setPlaying(false); return s; }
        return s + 1;
      });
    }, 850);
    return () => window.clearInterval(timer);
  }, [playing, total]);

  const move = step > 0 ? record.moveHistory?.[step - 1] : null;
  const hasExactInitial = !!record.initialGame;

  return <div className="modal-backdrop"><div className="modal replay-modal">
    <div className="replay-head">
      <div>
        <h2>{record.starred ? '★ ' : ''}Xem lại ván cờ</h2>
        <p>{record.roomName} · {record.redName || 'Đỏ'} vs {record.blackName || 'Đen'} · {record.mode === 'dark' ? 'Cờ Úp' : 'Cờ Tướng'}</p>
        {!hasExactInitial && record.mode === 'dark' && <p className="hint">Ván Cờ Úp cũ chưa có snapshot ban đầu nên chỉ xem lại gần đúng. Các ván lưu sau bản này sẽ xem lại chính xác.</p>}
      </div>
      <button className="secondary" onClick={onClose}>Đóng</button>
    </div>

    <div className="replay-grid">
      <section>
        <Board room={room} game={current} role="spectator" socket={null} theme={theme}/>
        <CapturedPieces captured={current.captured} role="spectator" settings={room.settings} theme={theme}/>
        <div className="replay-controls card inner">
          <div className="actions centered"><button className="secondary" onClick={() => setStep(0)}>Về đầu</button><button className="secondary" onClick={() => setStep(s => Math.max(0, s - 1))}>Lùi</button><button onClick={() => setPlaying(v => !v)}>{playing ? 'Tạm dừng' : 'Phát lại'}</button><button className="secondary" onClick={() => setStep(s => Math.min(total, s + 1))}>Tiến</button><button className="secondary" onClick={() => setStep(total)}>Về cuối</button></div>
          <input type="range" min={0} max={total} value={step} onChange={e => setStep(Number(e.target.value))}/>
          <p><b>Nước {step}/{total}</b>{move ? ` · ${move.notation}${move.checkColor ? ' · chiếu' : ''}` : ' · Vị trí ban đầu'}</p>
        </div>
      </section>
      <aside>
        <MoveHistory moves={current.moveHistory}/>
      </aside>
    </div>
  </div></div>;
}
