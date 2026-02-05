"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import GaleriKegiatan from "./_components/GaleriKegiatan";
import Header from "./_components/Header";
import RunningText from "./_components/RunningText";
import Footer from "./_components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GlobalApi from "./_utils/GlobalApi";
import News from "./_components/News";
import LayananKami from "./_components/LayananKami";
import BiroTravel from "./_components/BiroTravel";

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
      if (url.startsWith("www.")) {
        url = "https://" + url;
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-[90vw] max-h-[90vh] text-center flex flex-col items-center my-auto">
            <div className="relative w-auto max-w-full max-h-full flex flex-col items-center rounded-lg">
              <button
                className="absolute top-3 right-2 text-red-500 hover:text-gray-400 z-50 p-2"
                onClick={closePopup}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className="w-5 h-5 pointer-events-none"
                />
              </button>

              {isLoading ? (
                <div className="w-full h-80 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : infoGallery && infoGallery.photo ? (
                <div className="relative w-auto max-w-full p-2">
                  <img
                    src={`data:image/jpeg;base64,${infoGallery.photo}`}
                    alt={infoGallery.deskripsi || "Info Image"}
                    className="w-auto max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              ) : (
                <img
                  className="w-auto max-w-full max-h-[70vh] object-contain rounded-lg"
                  src={"/gif_hal_depan.gif"}
                  alt="Default Popup"
                />
              )}

              {showButton && (
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white mt-2 px-4 py-2 rounded-lg"
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
      <RunningText />
      <div className="pt-[120px] md:pt-[140px]">
        <News />
        <GaleriKegiatan />
        <LayananKami />
        <BiroTravel />
      </div>
      <Footer />
    </div>
  );
}
