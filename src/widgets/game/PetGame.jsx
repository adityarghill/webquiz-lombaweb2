import { useState, useEffect, useRef, useCallback } from "react";

import DraggableWindow from "@/widgets/game/DraggableWindow";
import LottiePlayer    from "@/widgets/game/LottiePlayer";
import BoredomBar      from "@/widgets/game/BoredomBar";
import MusicButton     from "@/widgets/game/MusicButton";

import {
  PETS,
  BOREDOM_MAX,
  BOREDOM_DECAY,
  BOREDOM_HAPPY_THRESHOLD,
  BOREDOM_BORED_THRESHOLD,
  HAPPY_ANIM_DURATION,
  BORED_ANIM_DURATION,
  CLICK_BOREDOM_GAIN,
  ZAP_BOREDOM_LOSS,
  WINDOW_COLORS,
  PET_BG_PALETTE,
  happyMoodImg,
  sadMoodImg,
  heartImg,
  zapImg,
  gameMusicSrc,
} from "@/widgets/game/gameConstants";

// ── Breakpoint flags (evaluated once on load) ──────────────────────────────────
const IS_DESKTOP = typeof window !== "undefined" && window.innerWidth >= 1024;
const IS_MOBILE  = typeof window !== "undefined" && window.innerWidth < 640;

// ── Particle: floating heart/zap on pet click ─────────────────────────────────
function ClickParticle({ x, y, src, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <img
      src={src}
      alt=""
      style={{
        position: "fixed",
        left: x - 20,
        top:  y - 20,
        width: 40,
        height: 40,
        pointerEvents: "none",
        zIndex: 9999,
        imageRendering: "pixelated",
        animation: "pfloat 0.9s ease-out forwards",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PetGame() {

  // ── State ──────────────────────────────────────────────────────────────────
  const [boredom,     setBoredom]   = useState(80);
  const [petIndex,    setPetIndex]  = useState(0);
  const [petAnim,     setPetAnim]   = useState("idle"); // "idle"|"happy"|"bored-forced"
  const [musicPlaying, setMusic]    = useState(false);
  const [volume,      setVolume]    = useState(0.7);
  const [customAudio, setCustomAudio] = useState(null);
  const [hidden,      setHidden]    = useState({ pet: false, mood: false, select: false });
  const [petBg,       setPetBg]     = useState(PET_BG_PALETTE[0]);
  const [tool,        setTool]      = useState("heart"); // "heart"|"zap"
  const [particles,   setParticles] = useState([]);

  const animTimerRef = useRef(null);
  const audioRef     = useRef(null);
  const pidRef       = useRef(0);

  const currentPet = PETS[petIndex];

  // ── Derived animation ───────────────────────────────────────────────────────
  const resolvedAnim =
    petAnim === "happy"        ? "happy" :
    petAnim === "bored-forced" ? "bored" :
    boredom <= BOREDOM_BORED_THRESHOLD ? "bored" : "idle";

  const animData =
    resolvedAnim === "happy" ? currentPet.happy :
    resolvedAnim === "bored" ? currentPet.bored :
    currentPet.idle;

  const isHappy = boredom >= BOREDOM_HAPPY_THRESHOLD;

  // ── Boredom decay ───────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setBoredom((p) => Math.max(0, p - BOREDOM_DECAY));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Pet click ───────────────────────────────────────────────────────────────
  const handlePetClick = useCallback((e) => {
    const pid = ++pidRef.current;
    const src = tool === "heart" ? heartImg : zapImg;
    setParticles((prev) => [...prev, { id: pid, x: e.clientX, y: e.clientY, src }]);

    if (tool === "heart") {
      setPetAnim("happy");
      setBoredom((p) => Math.min(BOREDOM_MAX, p + CLICK_BOREDOM_GAIN));
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      animTimerRef.current = setTimeout(() => setPetAnim("idle"), HAPPY_ANIM_DURATION);
    } else {
      setPetAnim("bored-forced");
      setBoredom((p) => Math.max(0, p - ZAP_BOREDOM_LOSS));
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      animTimerRef.current = setTimeout(() => setPetAnim("idle"), BORED_ANIM_DURATION);
    }
  }, [tool]);

  const removeParticle = useCallback((id) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Quiz API ────────────────────────────────────────────────────────────────
  useEffect(() => {
    window.petAddBoredomExp = (amount = 10) =>
      setBoredom((p) => Math.min(BOREDOM_MAX, p + amount));
    return () => { delete window.petAddBoredomExp; };
  }, []);

  // ── Audio ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const src = customAudio || gameMusicSrc;

    if (!audioRef.current) {
      audioRef.current       = new Audio(src);
      audioRef.current.loop  = true;
    } else if (audioRef.current.getAttribute("data-src") !== src) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.pause();
      audioRef.current       = new Audio(src);
      audioRef.current.loop  = true;
      audioRef.current.setAttribute("data-src", src);
      audioRef.current.volume = volume;
      if (wasPlaying) audioRef.current.play().catch(() => {});
      return;
    }

    audioRef.current.volume = volume;
    if (musicPlaying) audioRef.current.play().catch(() => {});
    else              audioRef.current.pause();
  }, [musicPlaying, volume, customAudio]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (customAudio) URL.revokeObjectURL(customAudio);
    setCustomAudio(URL.createObjectURL(file));
  };

  // ── Window helpers ──────────────────────────────────────────────────────────
  const hideWindow = (key) => setHidden((h) => ({ ...h, [key]: true  }));
  const showWindow = (key) => setHidden((h) => ({ ...h, [key]: false }));

  const handleSelectPet = (idx) => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setPetIndex(idx);
    setPetAnim("idle");
  };

  // ── Responsive sizes ────────────────────────────────────────────────────────
  const petCanvasSize = IS_MOBILE ? 180 : IS_DESKTOP ? 240 : 210;
  const lottieSize    = IS_MOBILE ? 150 : IS_DESKTOP ? 200 : 175;
  const moodCircle    = IS_MOBILE ? 130 : 160;
  const iconSize      = IS_MOBILE ? 44  : 54;

  // Desktop default window positions & sizes
  const DEF_POS  = {
    boredom : { x: 20,  y: 20  },
    pet     : { x: 20,  y: 80  },
    mood    : { x: 520, y: 20  },
    select  : { x: 520, y: 280 },
  };
  const DEF_SIZE = {
    boredom : { w: 360, h: "auto" },
    pet     : { w: 320, h: "auto" },
    mood    : { w: 230, h: "auto" },
    select  : { w: 300, h: "auto" },
  };

  // ── Tool cursor label ───────────────────────────────────────────────────────
  const toolLabel = tool === "heart" ? "+HAPPY" : "+BORED";
  const toolSrc   = tool === "heart" ? heartImg : zapImg;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative w-full"
      style={{
        minHeight: "100vh",
        background: "#f5f7c0",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.11) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(0,0,0,0.11) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        fontFamily: "'Press Start 2P', monospace",
        overflowY: IS_DESKTOP ? "hidden" : "auto",
      }}
    >
      {/* ── Keyframes & font ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes pfloat {
          0%   { transform: scale(1)   translateY(0px);   opacity: 1; }
          100% { transform: scale(1.8) translateY(-55px); opacity: 0; }
        }
      `}</style>

      {/* ── Click particles ── */}
      {particles.map((p) => (
        <ClickParticle
          key={p.id}
          x={p.x}
          y={p.y}
          src={p.src}
          onDone={() => removeParticle(p.id)}
        />
      ))}

      {/* ════════════ TOP BAR ════════════ */}
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-2"
        style={{
          borderBottom: "3px solid #111",
          background: "#fffde7",
          position: "sticky",
          top: 0,
          zIndex: 200,
        }}
      >
        {/* Hidden window restore buttons */}
        <span style={{ fontSize: 7, color: "#777" }}>WIN:</span>
        {["pet", "mood", "select"].map((key) =>
          hidden[key] ? (
            <button
              key={key}
              onClick={() => showWindow(key)}
              style={{
                background: WINDOW_COLORS[key].title,
                border: "2px solid #111",
                borderRadius: 6,
                boxShadow: "2px 2px 0 #111",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 7,
                padding: "3px 7px",
                cursor: "pointer",
              }}
            >
              {key.toUpperCase()}.EXE ↑
            </button>
          ) : null
        )}

        {/* ── Tool selector ── */}
        <div className="flex items-center gap-1 ml-2">
          <span style={{ fontSize: 7, color: "#777" }}>TOOL:</span>
          {[
            { id: "heart", src: heartImg, label: "+HAPPY" },
            { id: "zap",   src: zapImg,   label: "+BORED" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.label}
              style={{
                background:  tool === t.id ? "#ffd43b" : "#eee",
                border:      tool === t.id ? "2px solid #111" : "2px solid #bbb",
                borderRadius: 8,
                boxShadow:   tool === t.id ? "2px 2px 0 #111" : "none",
                padding: "3px 6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.1s",
              }}
            >
              <img
                src={t.src}
                alt={t.id}
                style={{ width: 16, height: 16, imageRendering: "pixelated" }}
              />
              {!IS_MOBILE && (
                <span style={{ fontSize: 6, fontFamily: "'Press Start 2P', monospace" }}>
                  {t.label}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Music controls ── */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Volume */}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 10 }}>🔈</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="accent-yellow-400"
              style={{ width: IS_MOBILE ? 60 : 80 }}
            />
            <span style={{ fontSize: 10 }}>🔊</span>
          </div>

          {/* Custom BGM upload */}
          <label
            style={{
              background: customAudio ? "#c8f5a0" : "#eee",
              border: "2px solid #111",
              borderRadius: 8,
              boxShadow: "2px 2px 0 #111",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              padding: "4px 7px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {customAudio ? "♪ CUSTOM" : "♪ UPLOAD"}
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              style={{ display: "none" }}
            />
          </label>

          <MusicButton playing={musicPlaying} onToggle={() => setMusic((m) => !m)} />
        </div>
      </div>

      {/* ════════════ WINDOWS ════════════
          Desktop  → absolute floating (draggable + resizable)
          Mobile / Tablet → stacked flex column
      ══════════════════════════════════ */}
      <div
        className={IS_DESKTOP ? "relative" : "flex flex-col gap-4 p-3"}
        style={IS_DESKTOP ? { minHeight: "calc(100vh - 52px)" } : {}}
      >

        {/* ── Boredom.EXE ── */}
        <DraggableWindow
          id="boredom"
          title="Boredom.EXE"
          color={WINDOW_COLORS.boredom}
          defaultPos={DEF_POS.boredom}
          defaultSize={DEF_SIZE.boredom}
          hidden={false}
          onHide={() => {}}
        >
          <BoredomBar value={boredom} />
        </DraggableWindow>

        {/* ── Pet.EXE ── */}
        <DraggableWindow
          id="pet"
          title="Pet.EXE"
          color={WINDOW_COLORS.pet}
          defaultPos={DEF_POS.pet}
          defaultSize={DEF_SIZE.pet}
          hidden={hidden.pet}
          onHide={() => hideWindow("pet")}
          showColorPicker
          pickerColors={PET_BG_PALETTE}
          currentBg={petBg}
          onBgChange={setPetBg}
        >
          <div className="flex flex-col items-center">
            {/* Pet canvas */}
            <div
              className="flex items-center justify-center"
              style={{
                width: "100%",
                minHeight: petCanvasSize,
                background: petBg,
                border: "3px solid #111",
                borderRadius: 12,
                boxShadow: "inset 2px 2px 0 rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "background 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onClick={handlePetClick}
              title={toolLabel}
            >
              {/* Active tool badge */}
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  background: "rgba(0,0,0,0.35)",
                  borderRadius: 6,
                  padding: "2px 5px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  pointerEvents: "none",
                }}
              >
                <img
                  src={toolSrc}
                  alt=""
                  style={{ width: 12, height: 12, imageRendering: "pixelated" }}
                />
                <span
                  style={{
                    fontSize: 6,
                    color: "#fff",
                    fontFamily: "'Press Start 2P', monospace",
                  }}
                >
                  {toolLabel}
                </span>
              </div>

              <LottiePlayer animData={animData} size={lottieSize} />
            </div>

            <p style={{ fontSize: 6, color: "#888", marginTop: 6, textAlign: "center" }}>
              CLICK TO INTERACT
            </p>
          </div>
        </DraggableWindow>

        {/* ── Moodstatus.EXE ── */}
        <DraggableWindow
          id="mood"
          title="Moodstatus.EXE"
          color={WINDOW_COLORS.mood}
          defaultPos={DEF_POS.mood}
          defaultSize={DEF_SIZE.mood}
          hidden={hidden.mood}
          onHide={() => hideWindow("mood")}
        >
          <div className="flex flex-col items-center">
            <div
              style={{
                width: moodCircle,
                height: moodCircle,
                background: "#e8f7ff",
                border: "3px solid #111",
                borderRadius: "50%",
                boxShadow: "3px 3px 0 #111",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={isHappy ? happyMoodImg : sadMoodImg}
                alt={isHappy ? "Happy" : "Sad"}
                style={{
                  width: moodCircle - 28,
                  height: moodCircle - 28,
                  objectFit: "contain",
                  imageRendering: "pixelated",
                  transition: "opacity 0.4s",
                }}
              />
            </div>
            <p
              style={{
                fontSize: 7,
                textAlign: "center",
                marginTop: 8,
                color: isHappy ? "#5cb800" : "#ff4757",
              }}
            >
              {isHappy ? "HAPPY!" : "BORED..."}
            </p>
          </div>
        </DraggableWindow>

        {/* ── Select.EXE ── */}
        <DraggableWindow
          id="select"
          title="Select.EXE"
          color={WINDOW_COLORS.select}
          defaultPos={DEF_POS.select}
          defaultSize={DEF_SIZE.select}
          hidden={hidden.select}
          onHide={() => hideWindow("select")}
        >
          <div className="flex gap-2 flex-wrap">
            {PETS.map((pet, idx) => (
              <button
                key={pet.id}
                onClick={() => handleSelectPet(idx)}
                style={{
                  background:  petIndex === idx ? "#ffd43b" : "#fff",
                  border:      petIndex === idx ? "3px solid #111" : "2px solid #aaa",
                  borderRadius: 10,
                  boxShadow:   petIndex === idx ? "3px 3px 0 #111" : "2px 2px 0 #bbb",
                  padding: 6,
                  cursor: "pointer",
                  transform:   petIndex === idx ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.15s",
                }}
                title={pet.label}
              >
                <img
                  src={pet.icon}
                  alt={pet.label}
                  style={{
                    width: iconSize,
                    height: iconSize,
                    objectFit: "contain",
                    imageRendering: "pixelated",
                    display: "block",
                  }}
                />
                <p style={{ fontSize: 6, textAlign: "center", marginTop: 3, color: "#333" }}>
                  {pet.label.toUpperCase()}
                </p>
              </button>
            ))}
          </div>
        </DraggableWindow>

      </div>
    </div>
  );
}