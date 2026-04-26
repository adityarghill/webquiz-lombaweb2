import React from 'react';
import Tooltip from '@uiw/react-tooltip';
import HeatMap from '@uiw/react-heat-map';

const heatmapValue = [
  { date: '2016/01/11', count: 2 },
  ...[...Array(17)].map((_, idx) => ({ date: `2016/01/${idx + 10}`, count: idx, })),
  ...[...Array(17)].map((_, idx) => ({ date: `2016/02/${idx + 10}`, count: idx, })),
  { date: '2016/04/12', count: 2 },
  { date: '2016/05/01', count: 5 },
  { date: '2016/05/02', count: 5 },
  { date: '2016/05/03', count: 1 },
  { date: '2016/05/04', count: 11 },
  { date: '2016/05/08', count: 32 },
];

const productiveHours = [
  { time: '07:00 - 09:00', status: 'Sedang', color: 'bg-yellow-500' },
  { time: '09:00 - 11:00', status: 'Sangat Tinggi', color: 'bg-green-500' },
  { time: '11:00 - 13:00', status: 'Cukup', color: 'bg-blue-500' },
  { time: '14:00 - 16:00', status: 'Rendah', color: 'bg-red-500' },
  { time: '16:00 - 18:00', status: 'Sedang', color: 'bg-yellow-500' },
  { time: '19:00 - 21:00', status: 'Tinggi', color: 'bg-green-400' },
  { time: '21:00 - 23:00', status: 'Cukup', color: 'bg-blue-500' },
];

const weeklyPattern = [
  { day: 'Senin', productivity: 90, status: 'Produktif', color: 'bg-green-500' },
  { day: 'Selasa', productivity: 85, status: 'Produktif', color: 'bg-green-500' },
  { day: 'Rabu', productivity: 80, status: 'Sangat Produktif', color: 'bg-green-500' },
  { day: 'Kamis', productivity: 75, status: 'Sangat Produktif', color: 'bg-green-500' },
  { day: 'Jumat', productivity: 65, status: 'Produktif', color: 'bg-yellow-500' },
  { day: 'Sabtu', productivity: 40, status: 'Kurang Aktif', color: 'bg-red-500' },
  { day: 'Minggu', productivity: 30, status: 'Kurang Aktif', color: 'bg-red-500' },
];

export const Tables = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 text-black">
      <h1 className="text-3xl font-bold mb-2">Behavior Analysis</h1>
      <p className="text-gray-800 mb-8">Laporan mingguan kapan kamu produktif & kapan malis</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Heatmap Aktivitas */}
        <div className="border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
            <h2 className="text-lg font-semibold">HEATMAP AKTIVITAS</h2>
          </div>
          <div className="overflow-x-auto">
            <HeatMap
              value={heatmapValue}
              width={480}
              height={200}
              startDate={new Date('2016/01/01')}
              rectRender={(props, data) => {
                return (
                  <Tooltip placement="top" content={`aktivitas: ${data.count || 0}`}>
                    <rect {...props} />
                  </Tooltip>
                );
              }}
            />
          </div>
        </div>

        {/* Jam Paling Produktif */}
        <div className="border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <h2 className="text-lg font-semibold">JAM PALING PRODUKTIF</h2>
          </div>
          <div className="space-y-3">
            {productiveHours.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-black">{item.time}</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <div className={`h-2 rounded flex-1 ${item.color}`}></div>
                  <span className={`text-xs font-semibold ${
                    item.status.includes('Sangat') ? 'text-green-400' : 
                    item.status.includes('Tinggi') ? 'text-green-300' :
                    item.status.includes('Sedang') ? 'text-yellow-400' :
                    item.status.includes('Cukup') ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pola Minggu */}
      <div className="border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white p-6 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <h2 className="text-lg font-semibold">POLA MINGGU - KAPAN KAMU PRODUKTIF?</h2>
        </div>
        <div className="space-y-3">
          {weeklyPattern.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-12 text-sm font-medium">{item.day}</span>
              <div className="flex-1 flex items-center gap-2">
                <div className={`h-3 rounded ${item.color}`} style={{ width: `${item.productivity}%` }}></div>
                <span className="text-xs text-black">{item.productivity}%</span>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'Sangat Produktif' && <span className="text-green-400">🎯</span>}
                {item.status === 'Produktif' && <span className="text-green-400">✓</span>}
                {item.status === 'Kurang Aktif' && <span className="text-red-400">⚠️</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Laporan AI Mingguan */}
      <div className="border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <h2 className="text-lg font-semibold">LAPORAN AI MINGGUAN</h2>
        </div>
        <p className="text-black mb-4">
          Berdasarkan data belajarmu minggu ini, <span className="text-cyan-400 font-semibold">Ahmad</span> menunjukkan pola yang sangat konsisten. Kamu paling produktif di <span className="text-cyan-400 font-semibold">Rabu-Kamis pagi</span> dengan rata-rata fokus tertinggi (85/100).
        </p>
        <div className="bg-gray-700 p-4 rounded mb-4 border-l-4 border-yellow-500">
          <p className="text-yellow-400 font-semibold mb-1">⚠️ Catatan: ada penurunan signifikan di</p>
          <p className="text-yellow-300 text-sm">Sabtu sore - kemungkinkan kelelahan setelah seminggu penuh. Rekomendasi: jadwalkan sesli ringan di Sabtu, dan istirahat penuh di Minggu pagi.</p>
        </div>
        <p className="text-green-400 text-sm">
          🎯 <span className="font-semibold">Target minggu depan</span> Pertahankan 4 jam/hari, fokuskan Matematika yang masih 60% tertinggal.
        </p>
      </div>
    </div>
  );
};