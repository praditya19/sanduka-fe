"use client";

import { RefreshCcw } from "lucide-react";

const ServerDown = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 px-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-md w-full text-center border border-red-100">
        
        {/* Icon */}
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
                d="M9.75 17L15 12l-5.25-5M4.5 4.5h15v15h-15z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Server Sedang Down
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Mohon maaf, server sedang mengalami gangguan atau dalam proses
          maintenance. Silakan coba beberapa saat lagi.
        </p>

        {/* Button */}
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
