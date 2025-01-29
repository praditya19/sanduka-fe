"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const galleryItems = [
  { id: 1, src: "/gallery/galeri1.jpg", alt: "Gambar 2" },
  { id: 2, src: "/gallery/galeri2.jpg", alt: "Gambar 3" },
  { id: 3, src: "/gallery/galeri3.jpg", alt: "Gambar 4" },
  { id: 4, src: "/gallery/galeri4.jpg", alt: "Gambar 5" },
  { id: 5, src: "/gallery/galeri6.jpg", alt: "Gambar 6" },
  { id: 6, src: "/gallery/galeri8.jpg", alt: "Gambar 7" },
  { id: 7, src: "/gallery/galeri9.jpg", alt: "Gambar 8" },
  { id: 8, src: "/gallery/galeri10.jpg", alt: "Gambar 9" },
  { id: 9, src: "/gallery/galeri12.jpg", alt: "Gambar 10" },
  { id: 10, src: "/gallery/galeri13.jpg", alt: "Gambar 11" },
  { id: 11, src: "/gallery/galeri14.jpg", alt: "Gambar 12" },
]

function GaleriKegiatan() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % galleryItems.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  const getPrevIndex = (index) =>
    index === 0 ? galleryItems.length - 1 : index - 1;
  const getNextIndex = (index) =>
    index === galleryItems.length - 1 ? 0 : index + 1;

  const visibleItems = [
    galleryItems[getPrevIndex(activeIndex)],
    galleryItems[activeIndex],
    galleryItems[getNextIndex(activeIndex)],
  ];

  return (
    <div id="galeriSec" className="bg-gray-100 py-12">
      <div className="container mx-auto px-4 md:px-12 lg:px-24">
        <h2 className="text-xl font-bold mb-6 text-center">Galeri Kegiatan</h2>
        <div className="relative w-full flex items-center justify-center">
          <div className="flex justify-center items-center space-x-4">
            {visibleItems.map((item, index) => {
              const isActive = item.id === galleryItems[activeIndex].id;

              return (
                <div
                  key={item.id}
                  className={`transition-transform duration-1000 ease-in-out ${
                    isActive
                      ? "scale-110 opacity-100 z-20"
                      : "scale-90 opacity-60 z-10"
                  }`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={400}
                    height={300}
                    className="rounded-lg shadow-md"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GaleriKegiatan;
