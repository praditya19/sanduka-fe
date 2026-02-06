"use client";
import React, { useState } from "react";
import { Share2, CheckCircle } from "lucide-react";

export default function ShareButton({ title, url, text }) {
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title || "PGRI Sanduka",
      text: text || title || "Lihat ini di PGRI Sanduka",
      url: url || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareUrl = `${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareUrl);
        setShowCopyMessage(true);
        setTimeout(() => setShowCopyMessage(false), 2000);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
        title="Bagikan"
      >
        <Share2 size={18} />
        <span className="hidden sm:inline">Bagikan</span>
      </button>

      {showCopyMessage && (
        <div className="absolute top-full right-0 mt-2 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap text-sm z-50">
          <CheckCircle size={16} />
          <span>Link disalin!</span>
        </div>
      )}
    </div>
  );
}
