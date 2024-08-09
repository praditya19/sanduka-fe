import React from "react";
import Image from "next/image";

const galleryItems = [
  { id: 1, src: "https://picsum.photos/300/200?random=2", alt: "Gambar 2" },
  { id: 2, src: "https://picsum.photos/300/200?random=3", alt: "Gambar 3" },
  { id: 3, src: "https://picsum.photos/300/200?random=4", alt: "Gambar 4" },
  { id: 4, src: "https://picsum.photos/300/200?random=5", alt: "Gambar 5" },
  { id: 5, src: "https://picsum.photos/300/200?random=6", alt: "Gambar 6" },
];

function GaleriKegiatan() {
  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4 md:px-12 lg:px-24">
        <h2 className="text-3xl font-bold mb-8 text-center">Galeri Kegiatan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105"
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={300}
                height={200}
                className="object-cover w-full h-48"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GaleriKegiatan;
