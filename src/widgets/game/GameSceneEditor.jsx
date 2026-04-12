import { useEffect, useRef, useState, useCallback } from "react";
import { Typography } from "@material-tailwind/react";
import lottie from "lottie-web";

const PRESETS = [
  { label: "Tengah", x: 50, y: 50 },
  { label: "Bawah", x: 50, y: 80 },
  { label: "Atas", x: 50, y: 20 },
  { label: "Kiri", x: 20, y: 50 },
  { label: "Kanan", x: 80, y: 50 },
  { label: "Kanan bawah", x: 80, y: 80 },
];

const ASPECTS = [
  { label: "16:9 (Landscape)", value: 56.25 },
  { label: "4:3", value: 75 },
  { label: "9:16 (Portrait)", value: 177.78 },
  { label: "1:1 (Square)", value: 100 },
];

export default function GameSceneEditor() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [charSize, setCharSize] = useState(150);
  const [charScale, setCharScale] = useState(100);
  const [aspectPadding, setAspectPadding] = useState(56.25);
  const [bgUrl, setBgUrl] = useState(null);
  const [bgName, setBgName] = useState(null);
  const [charName, setCharName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const sceneRef = useRef(null);
  const lottieContRef = useRef(null);
  const lottieAnimRef = useRef(null);
  const placeholderRef = useRef(null);

  const computedSize = Math.round(charSize * charScale / 100);

  // ── Lottie loader ──────────────────────────────────────────────
  const loadLottie = useCallback((animData) => {
    if (lottieAnimRef.current) {
      lottieAnimRef.current.destroy();
      lottieAnimRef.current = null;
    }
    if (!lottieContRef.current) return;
    lottieContRef.current.innerHTML = "";
    if (placeholderRef.current) placeholderRef.current.style.display = "none";
    lottieAnimRef.current = lottie.loadAnimation({
      container: lottieContRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: animData,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (lottieAnimRef.current) lottieAnimRef.current.destroy();
    };
  }, []);

  // ── Drag logic ─────────────────────────────────────────────────
  const getPosFromEvent = useCallback((e) => {
    if (!sceneRef.current) return null;
    const rect = sceneRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  const handleSceneDown = useCallback((e) => {
    setIsDragging(true);
    const p = getPosFromEvent(e);
    if (p) setPos(p);
    e.preventDefault();
  }, [getPosFromEvent]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging) return;
      const p = getPosFromEvent(e);
      if (p) setPos(p);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging, getPosFromEvent]);

  // ── File handlers ──────────────────────────────────────────────
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBgUrl(URL.createObjectURL(file));
    setBgName(file.name);
  };

  const handleCharUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const animData = JSON.parse(ev.target.result);
        loadLottie(animData);
        setCharName(file.name);
      } catch {
        alert("File JSON tidak valid atau bukan file Lottie.");
      }
    };
    reader.readAsText(file);
  };

  // ── Sub-components ─────────────────────────────────────────────
  const SliderRow = ({ icon, min, max, value, onChange, display }) => (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-blue-gray-400 w-4">{icon}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-blue-500"
      />
      <span className="text-xs font-semibold text-blue-500 w-10 text-right">{display}</span>
    </div>
  );

  const UploadButton = ({ id, accept, onChange, name, label, icon }) => (
    <label
      htmlFor={id}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-blue-gray-200 text-sm text-blue-gray-500 cursor-pointer hover:bg-blue-gray-50 transition-colors"
    >
      <span className="text-base">{name ? "✓" : icon}</span>
      <span className="truncate text-xs">{name || label}</span>
      <input id={id} type="file" accept={accept} onChange={onChange} className="hidden" />
    </label>
  );

  const Panel = ({ title, children }) => (
    <div className="bg-white border border-blue-gray-100 rounded-xl p-4 shadow-sm">
      {title && (
        <Typography
          variant="small"
          className="font-semibold text-blue-gray-600 uppercase tracking-wider mb-3 text-xs"
        >
          {title}
        </Typography>
      )}
      {children}
    </div>
  );

  return (
    <div className="mt-12 px-4 md:px-6 pb-8">

      <div className="mb-6">
        <Typography variant="h5" color="blue-gray">
          Game Scene Editor
        </Typography>
        <Typography variant="small" className="text-blue-gray-500 mt-1">
          Upload background dan karakter Lottie, lalu atur posisinya.
        </Typography>
      </div>

      <div className="flex flex-wrap gap-4">

        {/* ── Left Panel ── */}
        <div className="flex flex-col gap-3 w-64 shrink-0">

          <Panel title="Upload Aset">
            <Typography variant="small" className="text-blue-gray-400 text-xs mb-1">
              Background Image
            </Typography>
            <UploadButton
              id="bg-upload"
              accept="image/*"
              onChange={handleBgUpload}
              icon="🖼"
              name={bgName}
              label="Pilih gambar background"
            />
            <Typography variant="small" className="text-blue-gray-400 text-xs mt-3 mb-1">
              Lottie Character (JSON)
            </Typography>
            <UploadButton
              id="char-upload"
              accept=".json,application/json"
              onChange={handleCharUpload}
              icon="☺"
              name={charName}
              label="Pilih file Lottie (.json)"
            />
          </Panel>

          <Panel title="Posisi Karakter">
            <div className="grid grid-cols-3 gap-1 mb-3">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPos({ x: p.x, y: p.y })}
                  className="py-1 px-1 text-xs rounded-md border border-blue-gray-100 bg-blue-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-blue-gray-600 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <SliderRow
              icon="X" min={0} max={100}
              value={Math.round(pos.x)}
              onChange={(v) => setPos((p) => ({ ...p, x: v }))}
              display={`${Math.round(pos.x)}%`}
            />
            <SliderRow
              icon="Y" min={0} max={100}
              value={Math.round(pos.y)}
              onChange={(v) => setPos((p) => ({ ...p, y: v }))}
              display={`${Math.round(pos.y)}%`}
            />

            <Typography variant="small" className="text-blue-gray-400 text-xs mt-1 mb-1">
              Ukuran
            </Typography>
            <SliderRow
              icon="↔" min={50} max={400}
              value={charSize}
              onChange={setCharSize}
              display={`${charSize}px`}
            />

            <Typography variant="small" className="text-blue-gray-400 text-xs mb-1">
              Skala
            </Typography>
            <SliderRow
              icon="%" min={50} max={200}
              value={charScale}
              onChange={setCharScale}
              display={`${charScale}%`}
            />

            <Typography variant="small" className="text-blue-gray-400 text-xs mt-2">
              👆 Drag langsung di canvas untuk geser karakter
            </Typography>
          </Panel>

          <Panel title="Scene">
            <Typography variant="small" className="text-blue-gray-400 text-xs mb-1">
              Rasio Aspek
            </Typography>
            <select
              value={aspectPadding}
              onChange={(e) => setAspectPadding(Number(e.target.value))}
              className="w-full text-xs bg-blue-gray-50 border border-blue-gray-100 rounded-lg px-2 py-1.5 text-blue-gray-700 focus:outline-none"
            >
              {ASPECTS.map((a) => (
                <option key={a.label} value={a.value}>{a.label}</option>
              ))}
            </select>
          </Panel>
        </div>

        {/* ── Scene Canvas ── */}
        <div className="flex-1 min-w-72">
          <Typography variant="small" className="text-blue-gray-500 font-medium mb-2">
            Preview Scene
          </Typography>

          <div
            ref={sceneRef}
            className="relative w-full rounded-xl overflow-hidden border border-blue-gray-100 shadow-sm cursor-crosshair select-none"
            style={{ paddingTop: `${aspectPadding}%` }}
            onMouseDown={handleSceneDown}
            onTouchStart={handleSceneDown}
          >
            {/* Background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: bgUrl
                  ? `url(${bgUrl})`
                  : "repeating-conic-gradient(#e8eaf0 0% 25%, #cfd4de 0% 50%)",
                backgroundSize: bgUrl ? "cover" : "24px 24px",
                backgroundPosition: "center",
              }}
            />

            {/* Character */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                ref={lottieContRef}
                style={{ width: computedSize, height: computedSize }}
              />
              <div
                ref={placeholderRef}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-blue-gray-300 bg-white/60"
                style={{ width: computedSize, height: computedSize }}
              >
                <span className="text-3xl">☺</span>
                <span className="text-xs text-blue-gray-400 mt-1">Karakter</span>
              </div>
            </div>

            {/* Drag dot */}
            <div
              className="absolute w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow pointer-events-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            />

            {/* Coord badge */}
            <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
              {Math.round(pos.x)}%, {Math.round(pos.y)}%
            </div>
          </div>

          <Typography variant="small" className="text-blue-gray-400 mt-2 text-center text-xs">
            Klik atau drag di canvas untuk memindah karakter
          </Typography>
        </div>

      </div>
    </div>
  );
}