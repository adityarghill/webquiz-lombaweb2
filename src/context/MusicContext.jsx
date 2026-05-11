/**
 * MusicContext.jsx
 * 
 * Singleton audio engine that lives at the dashboard layout level.
 * The <audio> element never unmounts — navigation doesn't kill it.
 * PetGame controls it via useMusicPlayer() hook.
 */
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import gameMusicSrc from "@/assets/game/gamemusic.ogg";

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const audioRef        = useRef(null);
  const customSrcRef    = useRef(null);          // blob URL of user-uploaded track
  const [playing,    setPlaying]   = useState(false);
  const [volume,     setVolumeState] = useState(0.7);
  const [hasCustom,  setHasCustom]  = useState(false);

  // ── Create audio once ─────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) return;
    const audio       = new Audio(gameMusicSrc);
    audio.loop        = true;
    audio.volume      = 0.7;
    audioRef.current  = audio;

    // Clean up blob URL on unmount (app teardown only)
    return () => {
      audio.pause();
      if (customSrcRef.current) URL.revokeObjectURL(customSrcRef.current);
    };
  }, []);

  // ── Sync volume ───────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // ── Play / pause ──────────────────────────────────────────────
  const setPlaying_ = useCallback((next) => {
    if (!audioRef.current) return;
    if (next) audioRef.current.play().catch(() => {});
    else      audioRef.current.pause();
    setPlaying(next);
  }, []);

  const togglePlay = useCallback(() => setPlaying_(!playing), [playing, setPlaying_]);

  // ── Custom audio upload ───────────────────────────────────────
  const loadCustomTrack = useCallback((file) => {
    if (!file || !audioRef.current) return;
    const wasPlaying = !audioRef.current.paused;
    audioRef.current.pause();

    // Revoke old blob
    if (customSrcRef.current) URL.revokeObjectURL(customSrcRef.current);
    const blobUrl         = URL.createObjectURL(file);
    customSrcRef.current  = blobUrl;

    audioRef.current.src  = blobUrl;
    audioRef.current.load();
    setHasCustom(true);

    if (wasPlaying) audioRef.current.play().catch(() => {});
  }, []);

  const clearCustomTrack = useCallback(() => {
    if (!audioRef.current) return;
    const wasPlaying = !audioRef.current.paused;
    audioRef.current.pause();

    if (customSrcRef.current) {
      URL.revokeObjectURL(customSrcRef.current);
      customSrcRef.current = null;
    }

    audioRef.current.src = gameMusicSrc;
    audioRef.current.load();
    setHasCustom(false);

    if (wasPlaying) audioRef.current.play().catch(() => {});
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
  }, []);

  const value = {
    playing,
    volume,
    hasCustom,
    togglePlay,
    setPlaying: setPlaying_,
    setVolume,
    loadCustomTrack,
    clearCustomTrack,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

/** Hook — use anywhere inside MusicProvider */
export function useMusicPlayer() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicPlayer must be used inside <MusicProvider>");
  return ctx;
}