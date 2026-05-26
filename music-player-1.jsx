import { useState, useRef, useEffect, useCallback } from "react";

const tracks = [
  { id: 1, title: "Midnight Drive", artist: "Tove Lo", album: "Dirt Femme", duration: 214, hue: "255,255,255" },
  { id: 2, title: "As It Was", artist: "Harry Styles", album: "Harry's House", duration: 167, hue: "255,200,120" },
  { id: 3, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: 200, hue: "255,80,80" },
  { id: 4, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: 203, hue: "120,200,255" },
  { id: 5, title: "Stay", artist: "Kid LAROI & Bieber", album: "F*CK LOVE 3", duration: 141, hue: "180,255,150" },
  { id: 6, title: "Heat Waves", artist: "Glass Animals", album: "Dreamland", duration: 238, hue: "255,160,80" },
];

const waveSeeds = [
  [0.5,0.8,0.4,0.9,0.6,0.3,0.85,0.55,0.7,0.45,0.9,0.6,0.35,0.75,0.5,0.88,0.4,0.65,0.8,0.5,0.9,0.3,0.7,0.6,0.45,0.85,0.5,0.7,0.4,0.9],
  [0.7,0.4,0.9,0.5,0.8,0.6,0.3,0.75,0.55,0.9,0.4,0.65,0.85,0.5,0.7,0.45,0.9,0.6,0.35,0.8,0.5,0.7,0.4,0.85,0.6,0.3,0.75,0.55,0.9,0.4],
  [0.3,0.9,0.5,0.7,0.4,0.85,0.6,0.35,0.8,0.5,0.7,0.45,0.9,0.6,0.3,0.75,0.55,0.9,0.4,0.65,0.85,0.5,0.7,0.45,0.9,0.6,0.35,0.8,0.5,0.7],
  [0.8,0.5,0.7,0.4,0.9,0.6,0.35,0.75,0.55,0.85,0.4,0.65,0.9,0.5,0.7,0.45,0.8,0.6,0.3,0.75,0.55,0.9,0.4,0.65,0.85,0.5,0.7,0.45,0.9,0.6],
  [0.6,0.3,0.85,0.5,0.7,0.45,0.9,0.6,0.35,0.8,0.5,0.7,0.4,0.9,0.6,0.3,0.75,0.55,0.85,0.4,0.65,0.9,0.5,0.7,0.45,0.8,0.6,0.3,0.75,0.55],
  [0.9,0.6,0.35,0.8,0.5,0.7,0.45,0.9,0.6,0.3,0.75,0.55,0.85,0.4,0.65,0.9,0.5,0.7,0.45,0.8,0.6,0.3,0.75,0.55,0.9,0.4,0.65,0.85,0.5,0.7],
];

function fmt(s) {
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function App() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [vol, setVol] = useState(0.75);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState({});
  const [tab, setTab] = useState("now"); // now | queue
  const [pressing, setPressing] = useState(null);
  const ticker = useRef(null);
  const track = tracks[idx];
  const waves = waveSeeds[idx];

  useEffect(() => {
    clearInterval(ticker.current);
    if (playing) {
      ticker.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 0.2;
          if (next >= track.duration) { handleNext(); return 0; }
          setProgress(next / track.duration);
          return next;
        });
      }, 200);
    }
    return () => clearInterval(ticker.current);
  }, [playing, idx]);

  const handleNext = useCallback(() => {
    setElapsed(0); setProgress(0);
    setIdx(shuffle ? Math.floor(Math.random() * tracks.length) : (i => (i + 1) % tracks.length));
  }, [shuffle]);

  const handlePrev = () => { setElapsed(0); setProgress(0); setIdx(i => (i - 1 + tracks.length) % tracks.length); };

  const handleSeek = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    setProgress(p); setElapsed(p * track.duration);
  };

  const selectTrack = i => { setIdx(i); setElapsed(0); setProgress(0); setPlaying(true); };

  const glassBtn = (id, children, onClick, active = false, size = 44) => (
    <button
      key={id}
      onMouseDown={() => setPressing(id)}
      onMouseUp={() => { setPressing(null); onClick(); }}
      onMouseLeave={() => setPressing(null)}
      onTouchStart={() => setPressing(id)}
      onTouchEnd={() => { setPressing(null); onClick(); }}
      style={{
        width: size, height: size, borderRadius: size / 2,
        background: pressing === id
          ? "rgba(255,255,255,0.18)"
          : active
            ? `rgba(${track.hue},0.25)`
            : "rgba(255,255,255,0.07)",
        border: `1px solid ${active ? `rgba(${track.hue},0.5)` : "rgba(255,255,255,0.12)"}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: active ? `rgb(${track.hue})` : "#fff",
        fontSize: size > 44 ? 22 : 16,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s cubic-bezier(.4,0,.2,1)",
        transform: pressing === id ? "scale(0.92)" : "scale(1)",
        boxShadow: pressing === id
          ? "none"
          : active
            ? `0 0 16px rgba(${track.hue},0.3), inset 0 1px 0 rgba(255,255,255,0.15)`
            : "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.4)",
        outline: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >{children}</button>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        @keyframes barspin {
          0%   { height: 4px; }
          25%  { height: 14px; }
          50%  { height: 6px; }
          75%  { height: 18px; }
          100% { height: 4px; }
        }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 3px; border-radius: 2px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,0.5); }
        .track-item:active { background: rgba(255,255,255,0.08) !important; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* Ambient glow background blobs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${track.hue},0.12) 0%, transparent 70%)`,
          top: "10%", left: "50%", transform: "translateX(-50%)",
          transition: "background 1.2s ease",
          animation: "glow 4s ease-in-out infinite",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${track.hue},0.08) 0%, transparent 70%)`,
          bottom: "5%", right: "10%",
          transition: "background 1.2s ease",
          filter: "blur(60px)",
        }} />
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 390,
        background: "rgba(18,18,18,0.85)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRadius: 32,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
        animation: "fadeUp 0.4s ease",
      }}>

        {/* Top notch bar */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, margin: "14px 20px 0", padding: 4, background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
          {["now", "queue"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "7px 0", borderRadius: 9,
              background: tab === t ? "rgba(255,255,255,0.12)" : "transparent",
              border: tab === t ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
              color: tab === t ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              letterSpacing: 0.3,
              transition: "all 0.2s",
              boxShadow: tab === t ? "inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
            }}>
              {t === "now" ? "Now Playing" : "Queue"}
            </button>
          ))}
        </div>

        {tab === "now" ? (
          <div style={{ padding: "24px 24px 28px", animation: "fadeUp 0.3s ease" }}>

            {/* Album art (abstract glass orb) */}
            <div style={{
              width: "100%", aspectRatio: "1",
              borderRadius: 24,
              background: `radial-gradient(135deg at 30% 30%, rgba(${track.hue},0.25) 0%, rgba(0,0,0,0.8) 60%, rgba(${track.hue},0.08) 100%)`,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(${track.hue},0.1)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
              marginBottom: 24,
              transition: "background 1s ease",
            }}>
              {/* Inner gloss */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "50%",
                background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)",
                borderRadius: "24px 24px 0 0",
              }} />
              {/* Big note icon */}
              <div style={{
                fontSize: 80, opacity: 0.15,
                userSelect: "none",
                filter: "blur(1px)",
              }}>♫</div>
              {/* Orb glow */}
              <div style={{
                position: "absolute", width: 160, height: 160, borderRadius: "50%",
                background: `radial-gradient(circle, rgba(${track.hue},0.18) 0%, transparent 70%)`,
                animation: playing ? "glow 2s ease-in-out infinite" : "none",
              }} />
              {/* Playing bars */}
              {playing && (
                <div style={{
                  position: "absolute", bottom: 20, right: 20,
                  display: "flex", gap: 3, alignItems: "flex-end", height: 24,
                }}>
                  {[0, 0.2, 0.4, 0.1].map((delay, i) => (
                    <div key={i} style={{
                      width: 3, borderRadius: 2,
                      background: `rgb(${track.hue})`,
                      animation: `barspin 0.8s ease-in-out ${delay}s infinite`,
                      boxShadow: `0 0 6px rgba(${track.hue},0.8)`,
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* Track info + like */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: -0.3, lineHeight: 1.2 }}>{track.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 3, fontWeight: 400 }}>{track.artist}</div>
              </div>
              {glassBtn("like", liked[track.id] ? "♥" : "♡", () => setLiked(p => ({ ...p, [track.id]: !p[track.id] })), liked[track.id])}
            </div>

            {/* Waveform / seek bar */}
            <div style={{ marginBottom: 6 }}>
              <div
                onClick={handleSeek}
                style={{ display: "flex", alignItems: "center", gap: 2, height: 36, cursor: "pointer", padding: "0 2px" }}
              >
                {waves.map((h, i) => {
                  const pct = i / waves.length;
                  const played = pct < progress;
                  return (
                    <div key={i} style={{
                      flex: 1,
                      height: `${h * 80}%`,
                      minHeight: 3,
                      borderRadius: 2,
                      background: played
                        ? `rgba(${track.hue},0.9)`
                        : "rgba(255,255,255,0.12)",
                      boxShadow: played ? `0 0 4px rgba(${track.hue},0.5)` : "none",
                      transition: "background 0.3s, box-shadow 0.3s",
                    }} />
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 11, color: `rgba(${track.hue},0.9)`, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{fmt(elapsed)}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontVariantNumeric: "tabular-nums" }}>-{fmt(track.duration - elapsed)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
              {glassBtn("shuf", "⇌", () => setShuffle(!shuffle), shuffle)}
              {glassBtn("prev", "⏮", handlePrev)}
              {/* Big play button */}
              <button
                onMouseDown={() => setPressing("play")}
                onMouseUp={() => { setPressing(null); setPlaying(!playing); }}
                onMouseLeave={() => setPressing(null)}
                onTouchStart={() => setPressing("play")}
                onTouchEnd={() => { setPressing(null); setPlaying(!playing); }}
                style={{
                  width: 68, height: 68, borderRadius: 34,
                  background: pressing === "play"
                    ? "rgba(255,255,255,0.85)"
                    : "#fff",
                  border: "none",
                  color: "#000",
                  fontSize: 24,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.8)`,
                  transition: "all 0.15s cubic-bezier(.4,0,.2,1)",
                  transform: pressing === "play" ? "scale(0.93)" : "scale(1)",
                  outline: "none",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {playing ? "⏸" : "▶"}
              </button>
              {glassBtn("next", "⏭", handleNext)}
              {glassBtn("rep", "↺", () => setRepeat(!repeat), repeat)}
            </div>

            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
              <span style={{ fontSize: 12, opacity: 0.3 }}>🔈</span>
              <input
                type="range" min={0} max={1} step={0.01} value={vol}
                onChange={e => setVol(+e.target.value)}
                style={{
                  flex: 1,
                  background: `linear-gradient(to right, rgba(${track.hue},0.8) ${vol * 100}%, rgba(255,255,255,0.12) ${vol * 100}%)`,
                  borderRadius: 2,
                  transition: "background 0.1s",
                }}
              />
              <span style={{ fontSize: 12, opacity: 0.3 }}>🔊</span>
            </div>
          </div>
        ) : (
          /* Queue tab */
          <div style={{ padding: "16px 0 8px", maxHeight: 520, overflowY: "auto", animation: "fadeUp 0.3s ease" }}>
            {tracks.map((t, i) => (
              <div
                key={t.id}
                className="track-item"
                onClick={() => { selectTrack(i); setTab("now"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 20px",
                  cursor: "pointer",
                  background: i === idx ? "rgba(255,255,255,0.06)" : "transparent",
                  borderLeft: i === idx ? `2px solid rgba(${track.hue},0.8)` : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {/* Mini art */}
                <div style={{
                  width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                  background: `radial-gradient(135deg, rgba(${t.hue},0.3) 0%, rgba(0,0,0,0.6) 100%)`,
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, opacity: 0.7,
                }}>♫</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: i === idx ? "#fff" : "rgba(255,255,255,0.7)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{t.artist}</div>
                </div>

                {/* Playing indicator */}
                {i === idx && playing ? (
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 16 }}>
                    {[0, 0.15, 0.3].map((d, j) => (
                      <div key={j} style={{
                        width: 3, borderRadius: 2,
                        background: `rgba(${track.hue},1)`,
                        animation: `barspin 0.8s ease-in-out ${d}s infinite`,
                      }} />
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontVariantNumeric: "tabular-nums" }}>{fmt(t.duration)}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Home indicator */}
        <div style={{ display: "flex", justifyContent: "center", padding: "0 0 12px" }}>
          <div style={{ width: 120, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>
    </div>
  );
}
