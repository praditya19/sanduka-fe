"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";

const galleryItems = [
  { id: 1, src: "https://picsum.photos/800/600?random=2", alt: "Gambar 2" },
  { id: 2, src: "https://picsum.photos/800/600?random=3", alt: "Gambar 3" },
  { id: 3, src: "https://picsum.photos/800/600?random=4", alt: "Gambar 4" },
  { id: 4, src: "https://picsum.photos/800/600?random=5", alt: "Gambar 5" },
  { id: 5, src: "https://picsum.photos/800/600?random=6", alt: "Gambar 6" },
];

function GaleriKegiatan() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % galleryItems.length);
    }, 3000); // Ubah gambar setiap 3 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="galeriSec" className="bg-gray-100 py-12">
      <div className="container mx-auto px-4 md:px-12 lg:px-24">
        <h2 className="text-2xl font-bold mb-8 text-center">Galeri Kegiatan</h2>
        <div className="relative w-full h-[600px] flex items-center justify-center">
          {galleryItems.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{ zIndex: index === activeIndex ? 1 : 0 }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GaleriKegiatan;
