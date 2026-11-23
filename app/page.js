"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import GaleriKegiatan from "./_components/GaleriKegiatan";
import Header from "./_components/Header";
import RunningText from "./_components/RunningText";
import Footer from "./_components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlobalApi from "./_utils/GlobalApi";
import News from "./_components/News";
import BiroTravel from "./_components/BiroTravel";
import Tentang from "./_components/Tentang";
import LembagaDisplay from "./_components/Lembaga";
import Live from "./_components/Live";
import Metsos from "./_components/Metsos";
import SandukaHome from "./(auth)/sanduka-home/page";

export default function Home() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [infoGallery, setInfoGallery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchInfoGallery();
  }, []);

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
      <div className="mt-14 md:mt-20">
        <RunningText />
      </div>

      <Live />
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-teal-950 via-teal-800 to-emerald-700 text-white">
        <div className="absolute inset-0 -z-10 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-10 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide text-teal-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              PGRI KABUPATEN JEPARA
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Solidaritas anggota,
              <span className="block text-teal-200">layanan dalam satu tempat.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-teal-50/85 sm:text-lg">
              Akses layanan Sanduka PGRI Jepara, cari informasi keanggotaan, dan ikuti kegiatan terbaru dengan mudah.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#layanan-anggota"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-teal-900 shadow-lg shadow-teal-950/20 transition hover:-translate-y-0.5 hover:bg-teal-50"
              >
                Cari layanan anggota <span aria-hidden="true">↓</span>
              </Link>
              <Link
                href="/event"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Lihat kegiatan
              </Link>
            </div>
          </div>
          <div className="relative mx-auto flex w-full max-w-md items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-2xl shadow-teal-950/25 backdrop-blur-sm sm:p-10">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-300/20 blur-2xl" />
            <Image
              src="/sanduka_bg_white.png"
              width={560}
              height={280}
              alt="Sanduka PGRI Kabupaten Jepara"
              className="relative h-auto w-full max-w-sm object-contain"
              priority
            />
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-slate-50 to-white pt-10 md:pt-14">
        <News />
        <GaleriKegiatan />
        <SandukaHome showHeader={false} />
        <BiroTravel />
        <Tentang />
        <LembagaDisplay />
        <Metsos />
      </div>
      <Footer />
    </div>
  );
}
