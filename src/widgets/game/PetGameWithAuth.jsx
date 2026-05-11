/**
 * PetGameWithAuth.jsx
 *
 * Wrapper responsibilities:
 * 1. AuthGate — block unlogged users
 * 2. Load pet state from Supabase (petIndex, boredom, petBg, unlockedPets)
 * 3. Auto-save state every 30s via debounced window callback
 * 4. Handle unlockPet — deduct XP from user_stats + update pet_state
 * 5. Pass totalExp & unlock handler down to PetGame
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/authContext";
import { supabase } from "@/utils/supabase";
import AuthGate from "@/components/AuthGate";
import PetGame from "@/widgets/game/PetGame";

function PetGameLoader() {
  const { user, userStats, refreshUserStats } = useAuth();
  const [initialState, setInitialState] = useState(null);
  const [loading, setLoading]           = useState(true);
  const saveTimerRef = useRef(null);

  // ── Load ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    loadPetState();
  }, [user?.uid]);

  async function loadPetState() {
    const { data, error } = await supabase
      .from("pet_state")
      .select("pet_index, boredom, pet_bg, unlocked_pets")
      .eq("firebase_uid", user.uid)
      .maybeSingle();

    if (error) console.error("[PetGame] load:", error.message);

    setInitialState({
      petIndex:     data?.pet_index     ?? 0,
      boredom:      data?.boredom       ?? 80,
      petBg:        data?.pet_bg        ?? "#fff8f8",
      // unlocked_pets is stored as a JSON array of pet IDs e.g. ["cat","dog"]
      unlockedPets: data?.unlocked_pets ?? ["cat"],
    });
    setLoading(false);
  }

  // ── Save (debounced 5s) ───────────────────────────────────
  const savePetState = useCallback(async (state) => {
    if (!user?.uid) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const { error } = await supabase.from("pet_state").upsert(
        {
          firebase_uid:   user.uid,
          pet_index:      state.petIndex,
          boredom:        Math.round(state.boredom),
          pet_bg:         state.petBg,
          unlocked_pets:  state.unlockedPets,   // JSON array
          updated_at:     new Date().toISOString(),
        },
        { onConflict: "firebase_uid" }
      );
      if (error) console.error("[PetGame] save:", error.message);
    }, 5000);
  }, [user?.uid]);

  useEffect(() => {
    window.__petSaveCallback = savePetState;
    return () => { delete window.__petSaveCallback; };
  }, [savePetState]);

  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  // ── Unlock pet handler ────────────────────────────────────
  // Called by PetGame when user clicks "Buy" in the shop.
  // Atomically: read current XP → deduct → write back → save unlocked list.
  const handleUnlockPet = useCallback(async (pet) => {
    if (!user?.uid) throw new Error("Not logged in");

    const { data: stats, error: readErr } = await supabase
      .from("user_stats")
      .select("total_exp")
      .eq("firebase_uid", user.uid)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);

    const currentExp = stats?.total_exp ?? 0;
    if (currentExp < pet.price) throw new Error("XP tidak cukup");

    // Deduct XP
    const { error: deductErr } = await supabase
      .from("user_stats")
      .update({
        total_exp:  currentExp - pet.price,
        updated_at: new Date().toISOString(),
      })
      .eq("firebase_uid", user.uid);
    if (deductErr) throw new Error(deductErr.message);

    // Update unlocked_pets in pet_state
    const { data: ps } = await supabase
      .from("pet_state")
      .select("unlocked_pets")
      .eq("firebase_uid", user.uid)
      .maybeSingle();

    const existing = ps?.unlocked_pets ?? ["cat"];
    const updated  = Array.from(new Set([...existing, pet.id]));

    await supabase.from("pet_state").upsert(
      { firebase_uid: user.uid, unlocked_pets: updated, updated_at: new Date().toISOString() },
      { onConflict: "firebase_uid" }
    );

    // Refresh context so navbar/QuizList show new XP immediately
    refreshUserStats();
  }, [user?.uid, refreshUserStats]);

  if (loading) {
    return (
      <div style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 44, height: 44, border: "3px solid #111",
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontWeight: 800, color: "#6B7280" }}>Memuat pet kamu…</p>
        </div>
      </div>
    );
  }

  return (
    <PetGame
      initialState={initialState}
      totalExp={userStats?.total_exp ?? 0}
      onUnlockPet={handleUnlockPet}
    />
  );
}

export default function PetGameWithAuth() {
  return (
    <AuthGate feature="Pet Space">
      <PetGameLoader />
    </AuthGate>
  );
}