"use client";
import { useEffect, useState } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

const RunningText = () => {
  const [mounted, setMounted] = useState(false);
  const [runningText, setRunningText] = useState("");

  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
      try {
        const res = await GlobalApi.getRunningText();
        const content = res?.data?.content;

        if (content && content !== "Tidak ada running text") {
          setRunningText(content);
        } else {
          setRunningText("");
        }
      } catch (error) {
        console.error("Gagal mengambil running text:", error);
        setRunningText("");
      }
    };

    fetchData();
  }, []);

  if (!mounted || !runningText) return null;

  return (
    <div className="w-full bg-gradient-to-r from-teal-500/55 to-emerald-500/35 border-b border-teal-200/20 overflow-hidden relative">
      <div className="max-w-none mx-auto py-2.5">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-8 animate-scroll">
              <div className="flex-shrink-0 text-xs md:text-sm font-medium text-gray-800 whitespace-nowrap drop-shadow-sm">
                {runningText}
              </div>
              <div className="flex-shrink-0 text-xs md:text-sm font-medium text-gray-800 whitespace-nowrap drop-shadow-sm">
                {runningText}
              </div>
              <div className="flex-shrink-0 text-xs md:text-sm font-medium text-gray-800 whitespace-nowrap drop-shadow-sm">
                {runningText}
              </div>
              <div className="flex-shrink-0 text-xs md:text-sm font-medium text-gray-800 whitespace-nowrap drop-shadow-sm">
                {runningText}
              </div>
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
            transform: translateX(calc(-50% - 16px));
          }
        }

        .animate-scroll {
          animation: scroll 25s linear infinite;
          will-change: transform;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default RunningText;
