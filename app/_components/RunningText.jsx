"use client";
import { useEffect, useState } from "react";

const RunningText = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const announcements = [
    "📢 Selamat datang di Portal Sanduka PGRI - Kelola keuangan keluarga besar dengan mudah",
    "📝 Silakan login untuk mengakses fitur lengkap dan data anggota",
    "🔔 Update sistem dilakukan setiap hari Selasa pukul 22:00 - 23:00 WIB",
  ];

  if (!mounted) return null;

  return (
    <div className="fixed top-16 md:top-20 inset-x-0 z-40 w-full bg-gradient-to-r from-teal-500/5 to-emerald-500/5 border-b border-teal-200/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-emerald-500/10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 flex items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold rounded-full whitespace-nowrap shadow-md">
              <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></span>
              PENGUMUMAN
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex gap-12 animate-scroll">
              {announcements.map((announcement, index) => (
                <div
                  key={`text-${index}`}
                  className="flex-shrink-0 text-sm md:text-base font-medium text-gray-700 whitespace-nowrap"
                >
                  {announcement}
                </div>
              ))}

              {announcements.map((announcement, index) => (
                <div
                  key={`text-duplicate-${index}`}
                  className="flex-shrink-0 text-sm md:text-base font-medium text-gray-700 whitespace-nowrap"
                >
                  {announcement}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 24px));
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default RunningText;
