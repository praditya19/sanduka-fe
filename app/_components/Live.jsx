"use client";
import React from "react";
import { Youtube } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const Live = () => {
  const liveLink =
    "";

  const phoneNumber = "6285649590078";
  const whatsappLink = `https://wa.me/${phoneNumber}`;

  return (
    <>
      {/* 🔴 LIVE - Kanan Atas */}
      {liveLink && (
        <div className="fixed top-[85px] right-2 z-50">
          <a
            href={liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 
                       text-white text-sm font-semibold px-4 py-2 
                       rounded-full shadow-lg transition-all duration-300 
                       animate-pulse"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <Youtube size={16} />
            LIVE
          </a>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center 
                     bg-green-500 hover:bg-green-600 
                     text-white p-3 rounded-full 
                     shadow-lg transition-all duration-300"
        >
          <FaWhatsapp size={23} />
        </a>
      </div>
    </>
  );
};

export default Live;
