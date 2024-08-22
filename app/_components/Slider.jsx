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
      title: "Pantai Kalimantan",
      description: "Nikmati indahnya pantai yang ada di Kalimantan dengan pemandangan yang memukau.",
    },
    {
      id: 2,
      imageUrl:
        "https://media.suara.com/pictures/653x366/2023/01/16/86458-ilustrasi-pantai-unsplashderek-oulasin.jpg",
      title: "Liburan di Pantai",
      description: "Pantai merupakan tempat yang tepat untuk menghabiskan waktu bersama keluarga.",
    },
    {
      id: 3,
      imageUrl:
        "https://www.blibli.com/friends-backend/wp-content/uploads/2023/08/B800788-Cover-Pantai-yang-Ada-di-Kalimantan.jpg",
      title: "Eksplorasi Pantai",
      description: "Jelajahi pantai-pantai yang indah di berbagai daerah di Indonesia.",
    },
    {
      id: 4,
      imageUrl:
        "https://media.suara.com/pictures/653x366/2023/01/16/86458-ilustrasi-pantai-unsplashderek-oulasin.jpg",
      title: "Sunset di Pantai",
      description: "Saksikan keindahan matahari terbenam di pantai yang menakjubkan.",
    },
    {
      id: 5,
      imageUrl:
        "https://www.blibli.com/friends-backend/wp-content/uploads/2023/08/B800788-Cover-Pantai-yang-Ada-di-Kalimantan.jpg",
      title: "Pantai Tropis",
      description: "Rasakan suasana tropis yang menyegarkan di pantai-pantai eksotis.",
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
      {/* Blue Background */}
      <div className="absolute inset-0 bg-blue-600 z-0"></div>

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
        className="absolute inset-0 z-30 w-screen"
        style={{ left: "-35%" }}
      >
        <img
          src="/bg_depan.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text Content */}
      <div
        className={`relative z-30 text-white py-64 px-8 max-w-7xl mx-auto transition-all duration-500 transform ${sliderList[currentSlide].textBackgroundColor} rounded-lg`}
      >
        <h1
          className={`text-4xl md:text-4xl font-bold mb-4 transition-all duration-500 transform ${
            fade ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
          }`}
        >
          {sliderList[currentSlide].title}
        </h1>
        {splitTextIntoLines(sliderList[currentSlide].description, 9).map(
          (line, index) => (
            <p
              key={index}
              className={`text-lg md:text-2xl transition-all duration-500 transform ${
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
