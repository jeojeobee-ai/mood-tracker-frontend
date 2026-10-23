'use client';
import { useEffect, useState } from 'react';

const API = 'http://localhost:4000/moods';
const FACES = ['😭', '😕', '😐', '🙂', '😄'];
const STICKERS = ['⭐', '🎉', '❤️', '☕', '🌧️', '💪', '😴', '🍰'];
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad = (n) => String(n).padStart(2, '0');
const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const now = new Date();
const TODAY = key(now.getFullYear(), now.getMonth(), now.getDate());

export default function Home() {
  const [records, setRecords] = useState({});
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sel, setSel] = useState(TODAY);
  const [mood, setMood] = useState(0);
  const [note, setNote] = useState('');
  const [stickers, setStickers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    fetch(API)
      .then((r) => r.json())
      .then((list) => setRecords(Object.fromEntries(list.map((m) => [m.date, m]))))
      .catch(() => setError('서버에 연결할 수 없어요'));

  useEffect(() => { load(); }, []);

  // 날짜를 고르면 그날 기록을 입력칸에 불러온다.
  useEffect(() => {
    const r = records[sel];
    setMood(r ? r.mood : 0);
    setNote(r ? r.note : '');
    setStickers(r ? r.stickers : []);
  }, [sel, records]);

  const toggle = (s) =>
    setStickers((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : cur.length < 5 ? [...cur, s] : cur));

  const save = async () => {
    if (!mood) return;
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: sel, mood, note, stickers }),
    });
    setEditing(false);
    load();
  };

  const remove = async () => {
    await fetch(`${API}/${sel}`, { method: 'DELETE' });
    load();
  };

  const move = (delta) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const first = new Date(year, month, 1).getDay();
  const last = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: last }, (_, i) => i + 1)];

  return (
    <main>
      <h1>오늘 기분 기록기</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => move(-1)}>◀</button>
        <strong>{year}년 {month + 1}월</strong>
        <button onClick={() => move(1)}>▶</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginTop: 8, textAlign: 'center' }}>
        {DAYS.map((d) => <div key={d} style={{ fontSize: 12, color: '#888' }}>{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const k = key(year, month, d);
          const r = records[k];
          const future = k > TODAY;
          return (
            <button
              key={k}
              disabled={future}
              onClick={() => { setSel(k); setEditing(false); }}
              style={{
                minHeight: 62, padding: 2, borderRadius: 8, cursor: future ? 'default' : 'pointer',
                border: sel === k ? '2px solid #f5a623' : '1px solid #ddd',
                background: k === TODAY ? '#fff6dd' : 'white', opacity: future ? 0.4 : 1,
              }}
            >
              <div style={{ fontSize: 11, color: '#666' }}>{d}</div>
              <div style={{ fontSize: 20 }}>{r ? FACES[r.mood - 1] : ''}</div>
              <div style={{ fontSize: 11, lineHeight: 1 }}>{r ? r.stickers.join('') : ''}</div>
            </button>
          );
        })}
      </div>

      <h3 style={{ marginTop: 24 }}>{sel === TODAY ? `오늘 (${sel})` : sel}</h3>
      {records[sel] && !editing ? (
        <section>
          <div style={{ fontSize: 13, color: '#666' }}>기분</div>
          <div style={{ fontSize: 40 }}>{FACES[records[sel].mood - 1]}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 12 }}>메모</div>
          <p style={{ margin: '4px 0', padding: 10, background: '#f7f7f7', borderRadius: 8, minHeight: 20 }}>
            {records[sel].note || '메모 없음'}
          </p>
          <div style={{ fontSize: 13, color: '#666', marginTop: 12 }}>스티커</div>
          <div style={{ fontSize: 32 }}>
            {records[sel].stickers.length ? records[sel].stickers.join(' ') : <span style={{ fontSize: 14, color: '#999' }}>스티커 없음</span>}
          </div>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => setEditing(true)} style={{ padding: '8px 16px' }}>수정하기</button>{' '}
            <button onClick={remove} style={{ padding: '8px 16px' }}>지우기</button>
          </div>
        </section>
      ) : (
      <div>
      <p style={{ margin: '0 0 4px', fontSize: 13, color: '#666' }}>기분은?</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {FACES.map((f, i) => (
          <button
            key={f}
            onClick={() => setMood(i + 1)}
            style={{ fontSize: 32, background: mood === i + 1 ? '#ffe9a8' : 'none', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer' }}
          >
            {f}
          </button>
        ))}
      </div>
      <p style={{ margin: '12px 0 4px', fontSize: 13, color: '#666' }}>스티커 (최대 5개)</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {STICKERS.map((s) => (
          <button
            key={s}
            onClick={() => toggle(s)}
            style={{ fontSize: 24, background: stickers.includes(s) ? '#ffe9a8' : 'none', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer' }}
          >
            {s}
          </button>
        ))}
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={200}
        placeholder="한 줄 메모 (선택)"
        style={{ width: '100%', margin: '12px 0', padding: 8, boxSizing: 'border-box' }}
      />
      <button onClick={save} disabled={!mood} style={{ padding: '8px 16px' }}>기록하기</button>{' '}
      {records[sel] && <button onClick={() => setEditing(false)} style={{ padding: '8px 16px' }}>취소</button>}
      </div>
      )}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </main>
  );
}