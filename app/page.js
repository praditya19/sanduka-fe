"use client";
import React, { useState, useEffect } from "react";
import Slider from "./_components/Slider";
import LayananKami from "./_components/LayananKami";
import Flowchart from "./_components/Flowchart";
import GaleriKegiatan from "./_components/GaleriKegiatan";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import Tentang from "./_components/Tentang";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const closePopup = () => setIsPopupVisible(false);

  const router = useRouter();
  useEffect(() => {
    if (router.pathname !== "/") {
      router.push("/");
    }
  }, [router]);

  return (
    <div>
      {/* Popup Section */}
      {isPopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative p-6 w-11/12 max-w-lg text-center">
            <button
              className="absolute top-0 right-0 text-white hover:text-gray-700 text-2xl font-bold"
              onClick={closePopup}
            >
              &times;
            </button>

            <Image
              className="w-full h-auto max-h-80 rounded-lg mb-4"
              src={"/login.png"}
              alt="Popup"
              width={110}
              height={110}
            />

            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={closePopup}
            >
              Informasi Selengkapnya
            </button>
          </div>
        </div>
      )}

      <Header />
      <Slider />
      <Tentang />
      <LayananKami />
      <GaleriKegiatan />
      <Flowchart />
      <Footer />
    </div>
  );
}
