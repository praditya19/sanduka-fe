"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

// Fungsi untuk membagi teks menjadi beberapa baris
const splitTextIntoLines = (text, maxWordsPerLine) => {
  const words = text.split(" ");
  const lines = [];
  for (let i = 0; i < words.length; i += maxWordsPerLine) {
    lines.push(words.slice(i, i + maxWordsPerLine).join(" "));
  }
  return lines;
};

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(false);

  const sliderList = [
    {
      id: 1,
      imageUrl:
        "https://www.blibli.com/friends-backend/wp-content/uploads/2023/08/B800788-Cover-Pantai-yang-Ada-di-Kalimantan.jpg",
      title: "APA ITU SANDUKA?",
      description:
        "Sanduka adalah santunan duka cita bagi anggota PGRI Aktif yang terdaftar di dalam database keanggotaan PGRI Kabupaten Jepara sebagai wujud solidaritas.",
    },
    {
      id: 2,
      imageUrl:
        "https://media.suara.com/pictures/653x366/2023/01/16/86458-ilustrasi-pantai-unsplashderek-oulasin.jpg",
      title: "BERAPA SUMBANGAN ANGGOTA?",
      description:
        "Berdasarkan surat keputusan Pengurus PGRI Kabupaten Jepara nomor :034/SK/PGRI JPR/XXII/2020 tentang Teknis Pelaksanaan Dana Setia Kawan Duka PGRI Kabupaten Jepara, sumbangan Sanduka ditetapkan sebesar Rp. 3000 tiap anggota, dibayarkan tiap bulan, bersamaan dengan iuran anggota PGRI.",
    },
    {
      id: 3,
      imageUrl:
        "https://www.blibli.com/friends-backend/wp-content/uploads/2023/08/B800788-Cover-Pantai-yang-Ada-di-Kalimantan.jpg",
      title: " BERAPA SANTUNAN YANG DITERIMA?",
      description:
        "Sesuai keputusan bersama Pengurus PGRI Kabupaten Jepara dan Pengurus Cabang se-Kabupaten Jepara, maka disepakati sebesar Rp.2.500.000,- dengan kuota 5 orang tiap bulan dan apabila anggota meninggal lebih daripada kuota akan diperhitungkan pada bulan berikutnya.",
    },
    {
      id: 4,
      imageUrl:
        "https://media.suara.com/pictures/653x366/2023/01/16/86458-ilustrasi-pantai-unsplashderek-oulasin.jpg",
      title: "BAGAIMANA CARA PENGAJUANNYA?",
      description:
        "Pengurus Cabang melaporkan kematian anggotanya secara online melalui aplikasi sanduka.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true); // Start fade out
      setTimeout(() => {
        setCurrentSlide((prevSlide) =>
          prevSlide === sliderList.length - 1 ? 0 : prevSlide + 1
        );
        setFade(false); // Start fade in
      }, 500); // Duration matches the fade-out transition
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderList]);

  const prevSlide = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === 0 ? sliderList.length - 1 : prevSlide - 1
      );
      setFade(false);
    }, 500);
  };

  const nextSlide = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === sliderList.length - 1 ? 0 : prevSlide + 1
      );
      setFade(false);
    }, 500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Slider */}
      <div
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out z-10"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {sliderList.map((slider) => (
          <div key={slider.id} className="relative w-full h-full flex-shrink-0">
            <Image
              src={slider.imageUrl}
              alt={`Slide ${slider.id}`}
              layout="fill"
              objectFit="cover"
              quality={100}
            />
          </div>
        ))}
      </div>

      {/* SVG Overlay */}
      <div
        className={`absolute top-[-33%] inset-x-0 z-30 w-full h-full lg:w-screen lg:left-[-35%] lg:top-0`}
      >
        <img
          src="/bg_depan.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text Content */}
      <div
        className={`relative z-30 text-white  py-64 px-20 max-w-7xl mx-auto transition-all duration-500 transform rounded-lg ${
          fade ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
        } ${sliderList[currentSlide].textBackgroundColor} 
    md:top-0 top-[-30%] -left-12 sm:-left-14`} // Menambahkan class untuk top di layar HP
      >
        <h1
          className={`text-xl md:text-3xl font-bold mb-2 transition-all duration-500 transform ${
            fade ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
          }`}
        >
          {sliderList[currentSlide].title}
        </h1>
        {splitTextIntoLines(sliderList[currentSlide].description, 8).map(
          (line, index) => (
            <p
              key={index}
              className={`text-sm md:text-xl transition-all duration-500 transform ${
                fade ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
              }`}
            >
              {line}
            </p>
          )
        )}
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute top-1/2 left-0 transform -translate-y-1/2 text-white p-4 rounded-full opacity-70 hover:opacity-100 text-3xl z-40"
        onClick={prevSlide}
      >
        &#10094;
      </button>
      <button
        className="absolute top-1/2 right-0 transform -translate-y-1/2 text-white p-4 rounded-full opacity-70 hover:opacity-100 text-3xl z-40"
        onClick={nextSlide}
      >
        &#10095;
      </button>
    </div>
  );
};

export default Slider;