"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderList = [
    {
      id: 1,
      imageUrl:
        "https://www.blibli.com/friends-backend/wp-content/uploads/2023/08/B800788-Cover-Pantai-yang-Ada-di-Kalimantan.jpg",
    },
    {
      id: 2,
      imageUrl:
        "https://media.suara.com/pictures/653x366/2023/01/16/86458-ilustrasi-pantai-unsplashderek-oulasin.jpg",
    },
    {
      id: 3,
      imageUrl:
        "https://www.blibli.com/friends-backend/wp-content/uploads/2023/08/B800788-Cover-Pantai-yang-Ada-di-Kalimantan.jpg",
    },
    {
      id: 4,
      imageUrl:
        "https://media.suara.com/pictures/653x366/2023/01/16/86458-ilustrasi-pantai-unsplashderek-oulasin.jpg",
    },
    {
      id: 5,
      imageUrl:
        "https://www.blibli.com/friends-backend/wp-content/uploads/2023/08/B800788-Cover-Pantai-yang-Ada-di-Kalimantan.jpg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === sliderList.length - 1 ? 0 : prevSlide + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderList]);

  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? sliderList.length - 1 : prevSlide - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === sliderList.length - 1 ? 0 : prevSlide + 1
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
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
      <button
        className="absolute top-1/2 left-0 transform -translate-y-1/2  text-white p-4 rounded-full opacity-70 hover:opacity-100 text-3xl"
        onClick={prevSlide}
      >
        &#10094;
      </button>
      <button
        className="absolute top-1/2 right-0 transform -translate-y-1/2  text-white p-4 rounded-full opacity-70 hover:opacity-100 text-3xl"
        onClick={nextSlide}
      >
        &#10095;
      </button>
    </div>
  );
};

export default Slider;
