"use client";
import React, { useEffect, useState } from "react";
import { Youtube } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import GlobalApi from "@/app/_utils/GlobalApi";

const Live = () => {
  const [liveLink, setLiveLink] = useState("");

  const phoneNumber = "6285649590078";
  const whatsappLink = `https://wa.me/${phoneNumber}`;

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const res = await GlobalApi.getLinkLive();

        // Jika url tidak ada atau tulisannya "Tidak ada link live", jangan tampilkan tombol
        if (
          res?.data?.url &&
          res.data.url !== "Tidak ada link live" &&
          res.data.url.trim() !== ""
        ) {
          setLiveLink(res.data.url);
        } else {
          setLiveLink(""); // pastikan kosong
        }
      } catch (error) {
        console.error("Gagal mengambil live link:", error);
      }
    };

    fetchLink();
  }, []);

  return (
    <>
      {/* 🔴 LIVE BUTTON */}
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

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <div className="bg-white rounded-2xl shadow-xl p-3 max-w-[200px] relative">
          <p className="text-xs text-gray-600">
            Hai! Ada yang bisa kami bantu? 👋
          </p>
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white transform rotate-45"></div>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center 
               bg-green-500 hover:bg-green-600 
               text-white p-3 rounded-full 
               shadow-lg transition-all duration-300
               hover:scale-110 transform"
        >
          <FaWhatsapp size={23} />
        </a>
      </div>
    </>
  );
};

export default Live;
