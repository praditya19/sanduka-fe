"use client";
import React, { useState, useEffect } from "react";
import Slider from "./_components/Slider";
import LayananKami from "./_components/LayananKami";
import Flowchart from "./_components/Flowchart";
import GaleriKegiatan from "./_components/GaleriKegiatan";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GlobalApi from "./_utils/GlobalApi";

export default function Home() {
  const [isPopupVisible, setIsPopupVisible] = useState(false); 
  const [infoGallery, setInfoGallery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (router.pathname !== "/") {
      router.push("/");
    }

    fetchInfoGallery();
  }, [router]);

  const fetchInfoGallery = async () => {
    try {
      setIsLoading(true);
      const data = await GlobalApi.getSidebarGalleryByCategory("INFO");

      if (data.length > 0) {
        setInfoGallery(data[0]);
        setIsPopupVisible(true);
      }
    } catch (error) {
      console.error("Error fetching INFO gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractUrl = (text) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    const cleanText = tempDiv.textContent || tempDiv.innerText || "";
    
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;
    const match = cleanText.match(urlRegex);
    
    if (match) {
      let url = match[0];
      if (url.startsWith('www.')) {
        url = 'https://' + url;
      }
      return url;
    }
    return null;
  };

  const hasUrl = (text) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    const cleanText = tempDiv.textContent || tempDiv.innerText || "";
    
    const urlRegex = /https?:\/\/|www\./i;
    return urlRegex.test(cleanText);
  };

  const handleLogin = () => {
    if (infoGallery?.deskripsi) {
      const url = extractUrl(infoGallery.deskripsi);
      if (url) {
        window.open(url, "_blank");
        return;
      }
    }
    router.push("/sign-in");
  };

  const closePopup = () => setIsPopupVisible(false);

  const showButton = infoGallery?.deskripsi && hasUrl(infoGallery.deskripsi);

  return (
    <div>
      {/* Popup Section */}
      {isPopupVisible && infoGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative p-6 w-11/12 max-w-lg text-center">
            <button
              className="absolute top-0 right-0 text-white hover:text-gray-700 text-2xl font-bold"
              onClick={closePopup}
            >
              &times;
            </button>

            <div className="relative">
              {isLoading ? (
                <div className="w-full h-80 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : infoGallery && infoGallery.photo ? (
                <div className="relative w-full max-h-80">
                  <Image
                    src={`data:image/jpeg;base64,${infoGallery.photo}`}
                    alt={infoGallery.deskripsi || "Info Image"}
                    width={800} 
                    height={600} 
                    className="w-full h-auto max-h-80 rounded-lg"
                    priority 
                  />
                </div>
              ) : (
                <Image
                  className="w-full h-auto max-h-80 rounded-lg"
                  src={"/gif_hal_depan.gif"}
                  alt="Default Popup"
                  width={800} 
                  height={600} 
                  priority 
                />
              )}

              {showButton && (
                <button
                  className="absolute bg-blue-500 hover:bg-blue-600 text-white mt-6 px-4 py-2 rounded-lg"
                  style={{
                    top: "95%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}
                  onClick={handleLogin}
                >
                  Selengkapnya
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Header />
      <Slider />
      <div className="relative z-40 mt-0 md:-mt-24 -mt-16">
        <LayananKami />
      </div>
      <GaleriKegiatan />
      <Flowchart />
      <Footer />
    </div>
  );
}