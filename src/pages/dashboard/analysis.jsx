import React, { useEffect, useState } from 'react';
import Tooltip from '@uiw/react-tooltip';
import HeatMap from '@uiw/react-heat-map';
import { useAuth } from '@/context/authContext';
import { supabase } from '@/utils/supabase';
import AuthGate from '@/components/AuthGate';

// ── Helpers ──────────────────────────────────────────────────
function getHour(isoString) {
  return new Date(isoString).getHours();
}

function getDayName(isoString) {
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  return days[new Date(isoString).getDay()];
}

function toDateKey(isoString) {
  return isoString.slice(0, 10).replace(/-/g, '/');
}

// ── Komponen utama analysis (hanya dirender jika sudah login) ──
function AnalysisContent() {
  const { user, userStats } = useAuth();
  const [quizResults, setQuizResults] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    fetchData();
  }, [user?.uid]);

  async function fetchData() {
    setLoading(true);
    const uid = user.uid;

    // Ambil quiz_results 90 hari terakhir
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: results } = await supabase
      .from('quiz_results')
      .select('score, total_questions, exp_earned, completed_at')
      .eq('firebase_uid', uid)
      .gte('completed_at', since)
      .order('completed_at', { ascending: true });

    // Ambil activity_log untuk heatmap
    const { data: activity } = await supabase
      .from('activity_log')
      .select('log_date, count')
      .eq('firebase_uid', uid)
      .order('log_date', { ascending: true });

    setQuizResults(results || []);

    // Format untuk heatmap
    const heatValues = (activity || []).map((a) => ({
      date: a.log_date.replace(/-/g, '/'),
      count: a.count,
    }));
    setActivityData(heatValues);

    // Generate AI-like report dari data nyata
    generateReport(results || [], activity || []);
    setLoading(false);
  }

  function generateReport(results, activity) {
    if (results.length === 0) {
      setAiReport('Belum ada data belajar. Mulai kerjakan quiz untuk melihat analisis kamu!');
      return;
    }

    const totalQuiz = results.length;
    const avgScore = results.reduce((acc, r) => acc + (r.score / r.total_questions) * 100, 0) / totalQuiz;
    const perfectCount = results.filter((r) => r.score === r.total_questions).length;
    const totalDays = new Set(results.map((r) => r.completed_at.slice(0, 10))).size;

    const dayCount = {};
    results.forEach((r) => {
      const day = getDayName(r.completed_at);
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    const hourCount = {};
    results.forEach((r) => {
      const h = getHour(r.completed_at);
      const slot = h < 9 ? 'Pagi (06-09)' : h < 12 ? 'Pagi (09-12)' : h < 15 ? 'Siang' : h < 18 ? 'Sore' : 'Malam';
      hourCount[slot] = (hourCount[slot] || 0) + 1;
    });
    const bestHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    const displayName = user.email?.split('@')[0] || 'kamu';
    setAiReport(
      `${displayName} sudah mengerjakan ${totalQuiz} quiz dalam ${totalDays} hari aktif ` +
      `dengan rata-rata skor ${avgScore.toFixed(0)}% dan ${perfectCount} perfect score. ` +
      `Paling sering belajar di hari ${bestDay}, waktu ${bestHour}. ` +
      `${avgScore >= 80 ? 'Performa sangat baik! Pertahankan konsistensinya.' : avgScore >= 60 ? 'Performa cukup baik, terus tingkatkan!' : 'Semangat! Latihan rutin akan meningkatkan skormu.'}`
    );
  }

  // ── Statistik dari hasil nyata ──────────────────────────────
  const totalQuiz = quizResults.length;
  const avgScore = totalQuiz
    ? Math.round(quizResults.reduce((a, r) => a + (r.score / r.total_questions) * 100, 0) / totalQuiz)
    : 0;

  // Hour distribution
  const hourBuckets = {
    '07-09': 0, '09-11': 0, '11-13': 0, '14-16': 0, '16-18': 0, '19-21': 0, '21-23': 0,
  };
  quizResults.forEach((r) => {
    const h = getHour(r.completed_at);
    if (h >= 7 && h < 9)   hourBuckets['07-09']++;
    else if (h >= 9 && h < 11)  hourBuckets['09-11']++;
    else if (h >= 11 && h < 13) hourBuckets['11-13']++;
    else if (h >= 14 && h < 16) hourBuckets['14-16']++;
    else if (h >= 16 && h < 18) hourBuckets['16-18']++;
    else if (h >= 19 && h < 21) hourBuckets['19-21']++;
    else if (h >= 21 && h < 23) hourBuckets['21-23']++;
  });
  const maxHour = Math.max(...Object.values(hourBuckets), 1);
  const productiveHours = Object.entries(hourBuckets).map(([time, count]) => {
    const pct = Math.round((count / maxHour) * 100);
    return {
      time: `${time.slice(0,2)}:00 - ${time.slice(3)}:00`,
      count,
      pct,
      status: pct >= 80 ? 'Sangat Tinggi' : pct >= 60 ? 'Tinggi' : pct >= 40 ? 'Sedang' : pct >= 20 ? 'Cukup' : 'Rendah',
      color: pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-green-400' : pct >= 40 ? 'bg-yellow-500' : pct >= 20 ? 'bg-blue-500' : 'bg-red-500',
    };
  });

  // Day distribution
  const dayOrder = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
  const dayCount = {};
  quizResults.forEach((r) => {
    const day = getDayName(r.completed_at);
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  const maxDay = Math.max(...Object.values(dayCount), 1);
  const weeklyPattern = dayOrder.map((day) => {
    const count = dayCount[day] || 0;
    const productivity = Math.round((count / maxDay) * 100);
    return {
      day,
      productivity,
      status: productivity >= 80 ? 'Sangat Produktif' : productivity >= 50 ? 'Produktif' : 'Kurang Aktif',
      color: productivity >= 80 ? 'bg-green-500' : productivity >= 50 ? 'bg-green-400' : productivity >= 30 ? 'bg-yellow-500' : 'bg-red-500',
    };
  });

  // Heatmap: pakai activity_log, fallback ke quiz_results jika kosong
  const heatmapValue = activityData.length > 0
    ? activityData
    : quizResults.map((r) => ({ date: toDateKey(r.completed_at), count: 1 }));

  const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  if (loading) {
    return (
      <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontWeight: 800, color: '#6B7280' }}>Memuat data analisis…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-black">
      <h1 className="text-3xl font-bold mb-2">Behavior Analysis</h1>
      <p className="text-gray-800 mb-2">
        Data belajar <strong>{user.email?.split('@')[0]}</strong> — berdasarkan aktivitas nyata kamu
      </p>

      {/* Stats bar */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {[
          { label: 'Total Quiz', value: totalQuiz },
          { label: 'Rata-rata Skor', value: `${avgScore}%` },
          { label: 'Total EXP', value: userStats?.total_exp ?? 0 },
          { label: 'Perfect Score', value: userStats?.perfect_scores ?? 0 },
        ].map((s) => (
          <div key={s.label} className="border-2 border-black rounded-2xl bg-white px-5 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex-1 min-w-[120px]">
            <p className="text-xs font-bold text-gray-500 uppercase">{s.label}</p>
            <p className="text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {totalQuiz === 0 ? (
        <div className="border-2 border-black rounded-3xl bg-white p-10 text-center shadow-[6px_5px_0px_rgba(0,0,0,1)]">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Belum Ada Data</h3>
          <p className="text-gray-600">Kerjakan quiz untuk melihat analisis perilaku belajar kamu di sini!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Heatmap */}
            <div className="border-2 border-black rounded-3xl shadow-[6px_5px_0px_rgba(0,0,0,1)] bg-white p-6">
              <div className="flex items-center mb-4">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-2" />
                <h2 className="text-lg font-semibold">HEATMAP AKTIVITAS</h2>
              </div>
              <div className="overflow-x-auto">
                {heatmapValue.length > 0 ? (
                  <HeatMap
                    value={heatmapValue}
                    width={480}
                    height={200}
                    startDate={startDate}
                    rectRender={(props, data) => (
                      <Tooltip placement="top" content={`${data.date || ''}: ${data.count || 0} quiz`}>
                        <rect {...props} />
                      </Tooltip>
                    )}
                  />
                ) : (
                  <p className="text-gray-400 text-sm py-8 text-center">Belum ada aktivitas tercatat.</p>
                )}
              </div>
            </div>

            {/* Jam produktif */}
            <div className="border-2 border-black rounded-3xl shadow-[6px_5px_0px_rgba(0,0,0,1)] bg-white p-6">
              <div className="flex items-center mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2" />
                <h2 className="text-lg font-semibold">JAM PALING PRODUKTIF</h2>
              </div>
              <div className="space-y-3">
                {productiveHours.map((item) => (
                  <div key={item.time} className="flex items-center justify-between">
                    <span className="text-sm text-black w-28">{item.time}</span>
                    <div className="flex items-center gap-2 flex-1 ml-2">
                      <div className={`h-2 rounded ${item.color}`} style={{ width: `${item.pct}%`, minWidth: 4, transition: 'width 0.5s' }} />
                      <span className="text-xs font-semibold text-gray-600">{item.count}x</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500 w-24 text-right">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pola mingguan */}
          <div className="border-2 border-black rounded-3xl shadow-[6px_5px_0px_rgba(0,0,0,1)] bg-white p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2" />
              <h2 className="text-lg font-semibold">POLA MINGGU — KAPAN KAMU PRODUKTIF?</h2>
            </div>
            <div className="space-y-3">
              {weeklyPattern.map((item) => (
                <div key={item.day} className="flex items-center gap-4">
                  <span className="w-14 text-sm font-medium">{item.day}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className={`h-3 rounded ${item.color}`} style={{ width: `${item.productivity}%`, minWidth: 4, transition: 'width 0.5s' }} />
                    <span className="text-xs text-black">{dayCount[item.day] || 0}x</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 w-32 text-right">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Laporan AI */}
          <div className="border-2 border-black rounded-3xl shadow-[6px_5px_0px_rgba(0,0,0,1)] bg-white p-6">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2" />
              <h2 className="text-lg font-semibold">RINGKASAN AKTIVITAS</h2>
            </div>
            <p className="text-black leading-relaxed">{aiReport}</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Export: dibungkus AuthGate ───────────────────────────────
export const Analysis = () => (
  <AuthGate feature="Behavior Analysis">
    <AnalysisContent />
  </AuthGate>
);

export default Analysis;
