"use client";

import { RefreshCcw } from "lucide-react";

const ServerDown = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 px-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-md w-full text-center border border-red-100">
   
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 2.5l-1.5 1.5L5 2.5m3 12.5l-3-3m10.5-10l1.5 1.5L19 2.5m-3 12.5l3-3m-6-6L5 20.25M19 3.75l-14 14.5"
              />
            </svg>
          </div>
        </div>

        
        <p className="text-gray-600 mb-6">
          Mohon maaf, layanan sedang dalam proses maintenance. Kami berusaha
          menyelesaikannya secepatnya. Terima kasih atas kesabaran dan
          pengertian Anda.
        </p>

        <button
          onClick={handleReload}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition duration-300"
        >
          <RefreshCcw size={18} />
          Coba Lagi
        </button>
      </div>
    </div>
  );
};

export default ServerDown;
