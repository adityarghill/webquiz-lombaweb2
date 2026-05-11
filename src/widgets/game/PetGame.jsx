import { useState, useEffect, useRef, useCallback } from "react";

import DraggableWindow from "@/widgets/game/DraggableWindow";
import LottiePlayer    from "@/widgets/game/LottiePlayer";
import BoredomBar      from "@/widgets/game/BoredomBar";
import MusicButton     from "@/widgets/game/MusicButton";
import { useMusicPlayer } from "@/context/MusicContext";

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
} from "@/widgets/game/gameConstants";

const IS_DESKTOP = typeof window !== "undefined" && window.innerWidth >= 1024;
const IS_MOBILE  = typeof window !== "undefined" && window.innerWidth < 640;

/* ── Floating particle on pet click ─────────────────────── */
function ClickParticle({ x, y, src, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <img src={src} alt="" style={{
      position: "fixed", left: x - 20, top: y - 20,
      width: 40, height: 40, pointerEvents: "none", zIndex: 9999,
      imageRendering: "pixelated",
      animation: "pfloat 0.9s ease-out forwards",
    }} />
  );
}

/* ── Rarity badge ────────────────────────────────────────── */
function RarityBadge({ label, color }) {
  return (
    <span style={{
      display: "inline-block",
      background: color,
      color: "#fff",
      fontFamily: "'Press Start 2P', monospace",
      fontSize: 5,
      padding: "2px 6px",
      borderRadius: 4,
      border: "1.5px solid rgba(0,0,0,0.3)",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      marginTop: 2,
    }}>
      {label}
    </span>
  );
}

/* ── Pet Shop Window content ─────────────────────────────── */
function PetShopContent({ unlockedPets, totalExp, onBuyPet, onSelectPet, activePetIndex }) {
  const [buying, setBuying] = useState(null); // petId being purchased

  async function handleBuy(pet, idx) {
    if (buying) return;
    if (totalExp < pet.price) return;
    setBuying(pet.id);
    await onBuyPet(pet, idx);
    setBuying(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* XP balance strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#1e1e2e", border: "2px solid #111", borderRadius: 8,
        boxShadow: "3px 3px 0 #111", padding: "6px 10px",
      }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="#FFE566" stroke="#FFE566"
          strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#FFE566",
        }}>
          XP: {totalExp ?? "—"}
        </span>
      </div>

      {/* Pet grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PETS.map((pet, idx) => {
          const isUnlocked = pet.price === 0 || unlockedPets.includes(pet.id);
          const isActive   = activePetIndex === idx;
          const canAfford  = (totalExp ?? 0) >= pet.price;
          const isBuying   = buying === pet.id;

          return (
            <div key={pet.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: isActive ? "#ffd43b22" : "#fff",
              border: isActive ? "2.5px solid #ffd43b" : "2.5px solid #ccc",
              borderRadius: 12,
              boxShadow: isActive ? "3px 3px 0 #ffd43b" : "2px 2px 0 #bbb",
              padding: "8px 10px",
              transition: "all 0.12s",
            }}>
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 8, overflow: "hidden",
                border: "2px solid #111", background: "#f0f0f0", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: isUnlocked ? 1 : 0.4,
                position: "relative",
              }}>
                <img src={pet.icon} alt={pet.label}
                  style={{ width: 36, height: 36, objectFit: "contain", imageRendering: "pixelated" }} />
                {!isUnlocked && (
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center",
                    justifyContent: "center", background: "rgba(0,0,0,0.45)", borderRadius: 6,
                  }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                      stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                    color: "#111", fontWeight: 900,
                  }}>
                    {pet.label.toUpperCase()}
                  </span>
                  <RarityBadge label={pet.rarity} color={pet.rarityColor} />
                </div>
                <p style={{
                  fontSize: 10, color: "#666", margin: "3px 0 0",
                  fontFamily: "sans-serif", lineHeight: 1.4,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  maxWidth: 120,
                }}>
                  {pet.description}
                </p>
              </div>

              {/* Action button */}
              <div style={{ flexShrink: 0 }}>
                {pet.price === 0 || isUnlocked ? (
                  /* Already unlocked → Select button */
                  <button
                    onClick={() => onSelectPet(idx)}
                    style={{
                      fontFamily: "'Press Start 2P', monospace", fontSize: 6,
                      padding: "5px 9px", borderRadius: 7, cursor: "pointer",
                      border: isActive ? "2px solid #ffd43b" : "2px solid #111",
                      background: isActive ? "#ffd43b" : "#f0f0f0",
                      color: "#111",
                      boxShadow: isActive ? "2px 2px 0 #111" : "1px 1px 0 #bbb",
                      transition: "all 0.1s",
                    }}
                  >
                    {isActive ? "✓ AKTIF" : "PILIH"}
                  </button>
                ) : (
                  /* Locked → Buy button */
                  <button
                    onClick={() => handleBuy(pet, idx)}
                    disabled={!canAfford || isBuying}
                    style={{
                      fontFamily: "'Press Start 2P', monospace", fontSize: 6,
                      padding: "5px 9px", borderRadius: 7,
                      cursor: canAfford && !isBuying ? "pointer" : "not-allowed",
                      border: "2px solid #111",
                      background: canAfford ? "#a855f7" : "#ddd",
                      color: canAfford ? "#fff" : "#999",
                      boxShadow: canAfford ? "2px 2px 0 #111" : "none",
                      display: "flex", alignItems: "center", gap: 4,
                      transition: "all 0.1s",
                      opacity: isBuying ? 0.6 : 1,
                    }}
                  >
                    {isBuying ? (
                      "..."
                    ) : (
                      <>
                        <svg width={9} height={9} viewBox="0 0 24 24" fill={canAfford ? "#FFE566" : "#999"}
                          stroke={canAfford ? "#FFE566" : "#999"} strokeWidth={1.5}>
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {pet.price}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PetGame — main component
   Props injected from PetGameWithAuth:
     initialState    — { petIndex, boredom, petBg, unlockedPets }
     totalExp        — number from userStats.total_exp
     onSelectPet     — (idx) => void  (saves to Supabase)
     onUnlockPet     — (petId) => Promise  (deducts XP, saves)
   ═══════════════════════════════════════════════════════════ */
export default function PetGame({
  initialState = null,
  totalExp = 0,
  onSelectPet: externalSelectPet,
  onUnlockPet: externalUnlockPet,
}) {
  // ── Music from singleton context ──────────────────────────
  const { playing, volume, hasCustom, togglePlay, setVolume, loadCustomTrack, clearCustomTrack } = useMusicPlayer();

  // ── Game state ────────────────────────────────────────────
  const [boredom,      setBoredom]     = useState(initialState?.boredom       ?? 80);
  const [petIndex,     setPetIndex]    = useState(initialState?.petIndex      ?? 0);
  const [unlockedPets, setUnlocked]    = useState(initialState?.unlockedPets  ?? ["cat"]);
  const [petAnim,      setPetAnim]     = useState("idle");
  const [hidden,       setHidden]      = useState({ pet: false, mood: false, select: false, shop: false });
  const [petBg,        setPetBg]       = useState(initialState?.petBg         ?? PET_BG_PALETTE[0]);
  const [tool,         setTool]        = useState("heart");
  const [particles,    setParticles]   = useState([]);
  const [toast,        setToast]       = useState(null);  // { msg, ok }

  const animTimerRef = useRef(null);
  const toastTimerRef= useRef(null);
  const pidRef       = useRef(0);

  const currentPet = PETS[petIndex];

  // ── Derived animation ─────────────────────────────────────
  const resolvedAnim =
    petAnim === "happy"        ? "happy" :
    petAnim === "bored-forced" ? "bored" :
    boredom <= BOREDOM_BORED_THRESHOLD ? "bored" : "idle";

  const animData =
    resolvedAnim === "happy" ? currentPet.happy :
    resolvedAnim === "bored" ? currentPet.bored :
    currentPet.idle;

  const isHappy = boredom >= BOREDOM_HAPPY_THRESHOLD;

  // ── Toast helper ──────────────────────────────────────────
  function showToast(msg, ok = true) {
    setToast({ msg, ok });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  }

  // ── Boredom decay ─────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setBoredom((p) => Math.max(0, p - BOREDOM_DECAY));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Pet click ─────────────────────────────────────────────
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

  // ── Boredom API for quiz integration ─────────────────────
  useEffect(() => {
    window.petAddBoredomExp = (amount = 10) =>
      setBoredom((p) => Math.min(BOREDOM_MAX, p + amount));
    return () => { delete window.petAddBoredomExp; };
  }, []);

  // ── Auto-save every 30 seconds ────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.__petSaveCallback) {
        window.__petSaveCallback({ petIndex, boredom, petBg, unlockedPets });
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [petIndex, boredom, petBg, unlockedPets]);

  // ── Select pet (unlocked only) ────────────────────────────
  function handleSelectPet(idx) {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setPetIndex(idx);
    setPetAnim("idle");
    if (window.__petSaveCallback) {
      window.__petSaveCallback({ petIndex: idx, boredom, petBg, unlockedPets });
    }
    if (externalSelectPet) externalSelectPet(idx);
  }

  // ── Buy/unlock pet with EXP ───────────────────────────────
  async function handleBuyPet(pet, idx) {
    const alreadyOwned = pet.price === 0 || unlockedPets.includes(pet.id);
    if (alreadyOwned) { handleSelectPet(idx); return; }
    if ((totalExp ?? 0) < pet.price) {
      showToast(`Butuh ${pet.price} XP. Kamu punya ${totalExp ?? 0} XP.`, false);
      return;
    }

    try {
      // Call parent handler (PetGameWithAuth) which deducts XP & saves
      if (externalUnlockPet) await externalUnlockPet(pet);
      // Optimistically update local state
      setUnlocked((prev) => [...prev, pet.id]);
      handleSelectPet(idx);
      showToast(`${pet.label} berhasil dibuka! -${pet.price} XP`, true);
    } catch (err) {
      showToast("Gagal membeli. Coba lagi.", false);
    }
  }

  // ── Window helpers ────────────────────────────────────────
  const hideWindow = (key) => setHidden((h) => ({ ...h, [key]: true  }));
  const showWindow = (key) => setHidden((h) => ({ ...h, [key]: false }));

  // ── Responsive sizes ──────────────────────────────────────
  const petCanvasSize = IS_MOBILE ? 180 : IS_DESKTOP ? 240 : 210;
  const lottieSize    = IS_MOBILE ? 150 : IS_DESKTOP ? 200 : 175;
  const moodCircle    = IS_MOBILE ? 130 : 160;
  const iconSize      = IS_MOBILE ? 44  : 54;

  const DEF_POS  = {
    boredom: { x: 20,  y: 20  },
    pet    : { x: 20,  y: 80  },
    mood   : { x: 520, y: 20  },
    select : { x: 520, y: 280 },
    shop   : { x: 260, y: 20  },
  };
  const DEF_SIZE = {
    boredom: { w: 360, h: "auto" },
    pet    : { w: 320, h: "auto" },
    mood   : { w: 230, h: "auto" },
    select : { w: 300, h: "auto" },
    shop   : { w: 300, h: "auto" },
  };

  const toolLabel = tool === "heart" ? "+HAPPY" : "+BORED";
  const toolSrc   = tool === "heart" ? heartImg : zapImg;

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes pfloat {
          0%   { transform: scale(1)   translateY(0px);   opacity: 1; }
          100% { transform: scale(1.8) translateY(-55px); opacity: 0; }
        }
        @keyframes toastIn {
          0%   { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Click particles */}
      {particles.map((p) => (
        <ClickParticle key={p.id} x={p.x} y={p.y} src={p.src} onDone={() => removeParticle(p.id)} />
      ))}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 9998,
          background: toast.ok ? "#22C55E" : "#EF4444",
          border: "3px solid #111", borderRadius: 10,
          boxShadow: "4px 4px 0 #111",
          padding: "8px 16px",
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: "#fff", whiteSpace: "nowrap",
          animation: "toastIn 0.2s ease-out",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ════════════ TOP BAR ════════════
          zIndex: 45 — deliberately BELOW sidenav (z-50)
          so the sidenav is never occluded
      ══════════════════════════════════ */}
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-2"
        style={{
          borderBottom: "3px solid #111",
          background: "#fffde7",
          position: "sticky",
          top: 0,
          zIndex: 45,    // ← was 200, now 45 — below sidenav z-50
        }}
      >
        {/* Restore hidden windows */}
        <span style={{ fontSize: 7, color: "#777" }}>WIN:</span>
        {["pet", "mood", "select", "shop"].map((key) =>
          hidden[key] ? (
            <button key={key} onClick={() => showWindow(key)} style={{
              background: WINDOW_COLORS[key].title,
              border: "2px solid #111", borderRadius: 6,
              boxShadow: "2px 2px 0 #111",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7, padding: "3px 7px", cursor: "pointer",
            }}>
              {key.toUpperCase()}.EXE ↑
            </button>
          ) : null
        )}

        {/* Tool selector */}
        <div className="flex items-center gap-1 ml-2">
          <span style={{ fontSize: 7, color: "#777" }}>TOOL:</span>
          {[
            { id: "heart", src: heartImg, label: "+HAPPY" },
            { id: "zap",   src: zapImg,   label: "+BORED" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTool(t.id)} title={t.label} style={{
              background:   tool === t.id ? "#ffd43b" : "#eee",
              border:       tool === t.id ? "2px solid #111" : "2px solid #bbb",
              borderRadius: 8,
              boxShadow:    tool === t.id ? "2px 2px 0 #111" : "none",
              padding: "3px 6px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              transition: "all 0.1s",
            }}>
              <img src={t.src} alt={t.id}
                style={{ width: 16, height: 16, imageRendering: "pixelated" }} />
              {!IS_MOBILE && (
                <span style={{ fontSize: 6, fontFamily: "'Press Start 2P', monospace" }}>
                  {t.label}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Music controls — inline in topbar (compact) ── */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Volume slider */}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 10 }}>🔈</span>
            <input
              type="range" min={0} max={1} step={0.05} value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="accent-yellow-400"
              style={{ width: IS_MOBILE ? 60 : 80 }}
            />
            <span style={{ fontSize: 10 }}>🔊</span>
          </div>

          {/* Custom BGM upload */}
          <label style={{
            background: hasCustom ? "#c8f5a0" : "#eee",
            border: "2px solid #111", borderRadius: 8,
            boxShadow: "2px 2px 0 #111",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 7, padding: "4px 7px",
            cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {hasCustom ? "♪ CUSTOM" : "♪ UPLOAD"}
            <input type="file" accept="audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadCustomTrack(f);
                e.target.value = "";
              }}
              style={{ display: "none" }} />
          </label>

          {/* Reset to default BGM */}
          {hasCustom && (
            <button onClick={clearCustomTrack} style={{
              background: "#ffc8c8", border: "2px solid #111", borderRadius: 8,
              boxShadow: "2px 2px 0 #111",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7, padding: "4px 7px", cursor: "pointer",
            }}>
              ♪ RESET
            </button>
          )}

          <MusicButton playing={playing} onToggle={togglePlay} />
        </div>
      </div>

      {/* ════════════ WINDOWS ════════════ */}
      <div
        className={IS_DESKTOP ? "relative" : "flex flex-col gap-4 p-3"}
        style={IS_DESKTOP ? { minHeight: "calc(100vh - 52px)" } : {}}
      >

        {/* Boredom.EXE */}
        <DraggableWindow id="boredom" title="Boredom.EXE" color={WINDOW_COLORS.boredom}
          defaultPos={DEF_POS.boredom} defaultSize={DEF_SIZE.boredom} hidden={false} onHide={() => {}}>
          <BoredomBar value={boredom} />
        </DraggableWindow>

        {/* Pet.EXE */}
        <DraggableWindow id="pet" title="Pet.EXE" color={WINDOW_COLORS.pet}
          defaultPos={DEF_POS.pet} defaultSize={DEF_SIZE.pet}
          hidden={hidden.pet} onHide={() => hideWindow("pet")}
          showColorPicker pickerColors={PET_BG_PALETTE}
          currentBg={petBg} onBgChange={setPetBg}>
          <div className="flex flex-col items-center">
            <div
              className="flex items-center justify-center"
              style={{
                width: "100%", minHeight: petCanvasSize,
                background: petBg, border: "3px solid #111",
                borderRadius: 12, boxShadow: "inset 2px 2px 0 rgba(0,0,0,0.08)",
                cursor: "pointer", transition: "background 0.3s ease",
                position: "relative", overflow: "hidden",
              }}
              onClick={handlePetClick} title={toolLabel}
            >
              <div style={{
                position: "absolute", top: 6, right: 6,
                background: "rgba(0,0,0,0.35)", borderRadius: 6,
                padding: "2px 5px", display: "flex", alignItems: "center", gap: 4,
                pointerEvents: "none",
              }}>
                <img src={toolSrc} alt="" style={{ width: 12, height: 12, imageRendering: "pixelated" }} />
                <span style={{ fontSize: 6, color: "#fff", fontFamily: "'Press Start 2P', monospace" }}>
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

        {/* Moodstatus.EXE */}
        <DraggableWindow id="mood" title="Moodstatus.EXE" color={WINDOW_COLORS.mood}
          defaultPos={DEF_POS.mood} defaultSize={DEF_SIZE.mood}
          hidden={hidden.mood} onHide={() => hideWindow("mood")}>
          <div className="flex flex-col items-center">
            <div style={{
              width: moodCircle, height: moodCircle,
              background: "#e8f7ff", border: "3px solid #111",
              borderRadius: "50%", boxShadow: "3px 3px 0 #111",
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src={isHappy ? happyMoodImg : sadMoodImg}
                alt={isHappy ? "Happy" : "Sad"}
                style={{
                  width: moodCircle - 28, height: moodCircle - 28,
                  objectFit: "contain", imageRendering: "pixelated",
                  transition: "opacity 0.4s",
                }} />
            </div>
            <p style={{
              fontSize: 7, textAlign: "center", marginTop: 8,
              color: isHappy ? "#5cb800" : "#ff4757",
            }}>
              {isHappy ? "HAPPY!" : "BORED..."}
            </p>
          </div>
        </DraggableWindow>

        {/* Select.EXE — quick switch between owned pets */}
        <DraggableWindow id="select" title="Select.EXE" color={WINDOW_COLORS.select}
          defaultPos={DEF_POS.select} defaultSize={DEF_SIZE.select}
          hidden={hidden.select} onHide={() => hideWindow("select")}>
          <div className="flex gap-2 flex-wrap">
            {PETS.map((pet, idx) => {
              const isOwned  = pet.price === 0 || unlockedPets.includes(pet.id);
              const isActive = petIndex === idx;
              return (
                <button key={pet.id}
                  onClick={() => isOwned ? handleSelectPet(idx) : showWindow("shop")}
                  title={isOwned ? pet.label : `Locked — Open Shop`}
                  style={{
                    background:   isActive ? "#ffd43b" : isOwned ? "#fff" : "#f0f0f0",
                    border:       isActive ? "3px solid #111" : "2px solid #aaa",
                    borderRadius: 10,
                    boxShadow:    isActive ? "3px 3px 0 #111" : "2px 2px 0 #bbb",
                    padding: 6, cursor: "pointer",
                    transform:    isActive ? "scale(1.1)" : "scale(1)",
                    transition:   "all 0.15s",
                    position: "relative", opacity: isOwned ? 1 : 0.55,
                  }}>
                  <img src={pet.icon} alt={pet.label}
                    style={{ width: iconSize, height: iconSize, objectFit: "contain",
                      imageRendering: "pixelated", display: "block" }} />
                  <p style={{ fontSize: 6, textAlign: "center", marginTop: 3, color: "#333" }}>
                    {pet.label.toUpperCase()}
                  </p>
                  {/* Lock icon overlay */}
                  {!isOwned && (
                    <div style={{
                      position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      background: "rgba(0,0,0,0.28)", borderRadius: 8,
                    }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 6, color: "#888", marginTop: 8, textAlign: "center" }}>
            Klik gembok untuk buka SHOP.EXE
          </p>
        </DraggableWindow>

        {/* Shop.EXE — unlock pets with EXP */}
        <DraggableWindow id="shop" title="Shop.EXE" color={WINDOW_COLORS.shop}
          defaultPos={DEF_POS.shop} defaultSize={DEF_SIZE.shop}
          hidden={hidden.shop} onHide={() => hideWindow("shop")}>
          <PetShopContent
            unlockedPets={unlockedPets}
            totalExp={totalExp}
            onBuyPet={handleBuyPet}
            onSelectPet={handleSelectPet}
            activePetIndex={petIndex}
          />
        </DraggableWindow>

      </div>
    </div>
  );
}