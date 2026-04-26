import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
} from "@material-tailwind/react";
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

export function FokusMode() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [focusMode, setFocusMode] = useState("deep");
  const [sessionCount, setSessionCount] = useState(0);
  const [material, setMaterial] = useState("");
  const [target, setTarget] = useState("");
  const [sessions, setSessions] = useState([]);

  const focusModes = {
    deep: { name: "Deep Focus", color: "text-pink-500", duration: 25 * 60 },
    light: { name: "Light Study", color: "text-yellow-400", duration: 20 * 60 },
    break: { name: "Break", color: "text-red-500", duration: 5 * 60 },
  };

  const durations = [15, 25, 45, 60, 90];

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setSessionCount((prev) => prev + 1);
      if (sessions.length < 5) {
        setSessions([
          ...sessions,
          {
            id: Date.now(),
            material,
            target,
            duration: focusModes[focusMode].duration,
          },
        ]);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, focusMode, material, target, sessions]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDurationChange = (minutes) => {
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(focusModes[focusMode].duration);
    setIsRunning(false);
  };

  const handleFocusModeChange = (mode) => {
    setFocusMode(mode);
    setTimeLeft(focusModes[mode].duration);
    setIsRunning(false);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h2" className="text-blackgray mb-2">
            Pomodoro Smart
          </Typography>
          <Typography className="text-blue-gray-400">
            Timer cerdas yang menyesuaikan dirimu
          </Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Timer */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-700 border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white">
              <CardBody className="text-center">
                {/* Focus Modes */}
                <div className="flex gap-3 justify-center mb-6">
                  {Object.entries(focusModes).map(([key, { name, color }]) => (
                    <Button
                        key={key}
                        onClick={() => handleFocusModeChange(key)}
                        className={`py-2 px-4 text-sm rounded-lg transition ${
                          focusMode === key
                            ? "bg-lemon border-2 border-black text-black "
                            : "bg-slate-600 text-black"
                        }`}
                      >
                        <span className={focusMode === key ? "" : color}>
                          {focusMode === key ? "✓ " : ""}
                        </span>
                        {name}
                      </Button>
                  ))}
                </div>

                {/* Timer Display */}
                <div className="mb-8">
                  <div className="relative w-48 h-48 mx-auto mb-4">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 200 200"
                    >
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="2"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray={`${
                          (565 * timeLeft) /
                          focusModes[focusMode].duration
                        } 565`}
                        strokeLinecap="round"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="#1e293b"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Typography
                        variant="h1"
                        className="text-white text-4xl font-bold"
                      >
                        {formatTime(timeLeft)}
                      </Typography>
                    </div>
                  </div>
                  <Typography className="text-blue-gray-400 uppercase tracking-wider">
                    {focusModes[focusMode].name}
                  </Typography>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    className="bg-lemon hover:bg-blue-600 text-blackgray rounded-full p-4 w-16 h-16 flex items-center justify-center"
                  >
                    {isRunning ? (
                      <PauseIcon className="w-6 h-6" />
                    ) : (
                      <PlayIcon className="w-6 h-6" />
                    )}
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="bg-slate-600 hover:bg-slate-500 text-blackgray rounded-full p-4 w-16 h-16 flex items-center justify-center"
                  >
                    <ArrowPathIcon className="w-6 h-6" />
                  </Button>
                </div>

                {/* Duration Selection */}
                <Typography className="text-blue-gray-400 text-sm mb-3">
                  Sesuaikan durasi
                </Typography>
                <div className="flex gap-2 justify-center flex-wrap">
                  {durations.map((duration) => (
                    <Button
                      key={duration}
                      onClick={() => handleDurationChange(duration)}
                      className={`px-4 py-2 text-sm rounded-lg transition ${
                        timeLeft === duration * 60
                          ? "bg-lemon border-2 border-black text-black "
                            : "bg-slate-600 text-black"
                      }`}
                    >
                      {duration}m
                    </Button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="lg:col-grid-2 space-y-6">
            {/* Session Today */}
            <Card className="bg-slate-700 border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white">
              <CardBody>
                <Typography variant="h6" className="text-blackgray mb-4">
                  SESI HARI INI
                </Typography>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Typography className="text-blue-gray-400">
                      Sesi Selesai
                    </Typography>
                    <Typography className="text-green-400 font-bold">
                      ✓ {sessionCount}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography className="text-blue-gray-400">
                      Total Fokus
                    </Typography>
                    <Typography className="text-blue-400 font-bold">
                      ⏱ {Math.floor((sessionCount * focusModes[focusMode].duration) / 60)}m
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography className="text-blue-gray-400">
                      Streak Sesi
                    </Typography>
                    <Typography className="text-orange-400 font-bold">
                      🔥 {sessionCount > 0 ? sessionCount : 0}
                    </Typography>
                  </div>
                </div>

                {sessions.length > 0 && (
                  <div className="mt-4 p-3 bg-teal-950 border border-teal-700 rounded-lg">
                    <Typography className="text-teal-300 text-sm">
                       AI: Kamu cocok dengan sesi{" "}
                      <strong>{sessions.length * 25} menit</strong> berdasarkan
                      histori fokusmu. Coba hari ini!
                    </Typography>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Learning Material */}
            <Card className="bg-slate-700 border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white">
              <CardBody>
                <Typography variant="h6" className="text-blackgray mb-4">
                  SEDANG BELAJAR APA?
                </Typography>
                <Typography className="text-blue-gray-400 text-sm mb-2">
                  MATERI SAAT INI
                </Typography>
                <Input
                  placeholder="cth: Bab 3 - Turunan Fungsi"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="mb-4 bg-slate-600 border-slate-500 text-blackgray focus:outline-none"
                  
                />

                <Typography className="text-blue-gray-400 text-sm mb-2">
                  TARGET SESI INI
                </Typography>
                <Input
                  placeholder="cth: Selesaikan 5 soal latihan"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-slate-600 border-slate-500 text-blackgray focus:outline-none"
                  
                />
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Session History */}
        {sessions.length > 0 && (
          <Card className="mt-6 bg-slate-700 border border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <CardBody>
              <Typography variant="h6" className="text-blackgray mb-4">
                Riwayat Sesi Hari Ini
              </Typography>
              <div className="space-y-2">
                {sessions.map((session, idx) => (
                  <div
                    key={session.id}
                    className="p-3 bg-slate-600 rounded-lg text-blue-gray-300"
                  >
                    <Typography className="text-sm">
                      Sesi {idx + 1}: <strong>{session.material || "Fokus"}</strong>
                    </Typography>
                    <Typography className="text-xs text-blue-gray-400">
                      Target: {session.target || "Menyelesaikan tugas"}
                    </Typography>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

export default FokusMode;