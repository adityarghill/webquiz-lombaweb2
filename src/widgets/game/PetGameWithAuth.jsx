/**
 * PetGameWithAuth.jsx
 * 
 * Wrapper untuk PetGame yang:
 * 1. Blokir unlogged user via AuthGate
 * 2. Load state pet dari Supabase (petIndex, boredom, petBg) saat mount
 * 3. Save state pet ke Supabase setiap 30 detik (debounced)
 * 
 * PetGame sendiri tidak diubah — state diteruskan via window-level callbacks.
 */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { supabase } from '@/utils/supabase';
import AuthGate from '@/components/AuthGate';
import PetGame from './PetGame';

// State global yang bisa diakses PetGame via window object
// Ini pendekatan non-invasif agar PetGame tidak perlu diubah
function PetGameLoader() {
  const { user } = useAuth();
  const [initialState, setInitialState] = useState(null);
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef(null);
  const latestStateRef = useRef({ petIndex: 0, boredom: 80, petBg: '#FFF9E6' });

  // ── Load state dari Supabase ──
  useEffect(() => {
    if (!user?.uid) return;
    loadPetState();
  }, [user?.uid]);

  async function loadPetState() {
    const { data, error } = await supabase
      .from('pet_state')
      .select('pet_index, boredom, pet_bg')
      .eq('firebase_uid', user.uid)
      .maybeSingle();

    if (error) console.error('[PetGame] load error:', error.message);

    const loaded = {
      petIndex: data?.pet_index ?? 0,
      boredom:  data?.boredom  ?? 80,
      petBg:    data?.pet_bg   ?? '#FFF9E6',
    };
    latestStateRef.current = loaded;
    setInitialState(loaded);
    setLoading(false);
  }

  // ── Save state ke Supabase (dipanggil dari window callback) ──
  async function savePetState(state) {
    if (!user?.uid) return;
    latestStateRef.current = state;

    // Debounce: batalkan save sebelumnya
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from('pet_state')
        .upsert(
          {
            firebase_uid: user.uid,
            pet_index:    state.petIndex,
            boredom:      Math.round(state.boredom),
            pet_bg:       state.petBg,
            updated_at:   new Date().toISOString(),
          },
          { onConflict: 'firebase_uid' }
        );
      if (error) console.error('[PetGame] save error:', error.message);
    }, 5000); // save 5 detik setelah perubahan terakhir
  }

  // Ekspos callback ke window agar PetGame bisa memanggil tanpa prop drilling
  useEffect(() => {
    window.__petSaveCallback = savePetState;
    return () => { delete window.__petSaveCallback; };
  }, [user?.uid]);

  // Cleanup timer saat unmount
  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontWeight: 800, color: '#6B7280' }}>Memuat pet kamu…</p>
        </div>
      </div>
    );
  }

  return <PetGame initialState={initialState} />;
}

// ── Export: PetGame dibungkus AuthGate ──────────────────────
export default function PetGameWithAuth() {
  return (
    <AuthGate feature="Pet Space">
      <PetGameLoader />
    </AuthGate>
  );
}