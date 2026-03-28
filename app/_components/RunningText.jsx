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
    <div className="fixed top-16 md:top-20 inset-x-0 z-40 w-full bg-gradient-to-r from-teal-500/5 to-emerald-500/5 border-b border-teal-200/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 pointer-events-none" />

      <div className="relative max-w-none mx-auto py-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-12 animate-scroll">
              <div className="flex-shrink-0 text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">
                {runningText}
              </div>

              <div className="flex-shrink-0 text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">
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
