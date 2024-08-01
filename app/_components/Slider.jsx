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
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === sliderList.length - 1 ? 0 : prevSlide + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderList]);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="relative flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {sliderList.map((slider) => (
          <div key={slider.id} className="w-full flex-shrink-0">
            <Image
              src={slider.imageUrl}
              alt={`Slide ${slider.id}`}
              width={1000}
              height={400}
              className="w-full h-[200px] md:h-[550px] object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
