"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const GaleriKegiatan = () => {
  const [galleries, setGalleries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setIsLoading(true);
      const data = await GlobalApi.getAllSidebarGallery();

      const processedGalleries = await Promise.all(
        data.map(async (item) => {
          const blob = await fetch(`data:image/jpeg;base64,${item.photo}`).then(
            (r) => r.blob()
          );
          const objectUrl = URL.createObjectURL(blob);
          return { ...item, imageUrl: objectUrl };
        })
      );

      setGalleries(processedGalleries);
    } catch (error) {
      console.error("Error fetching galleries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      galleries.forEach((item) => {
        if (item.imageUrl) {
          URL.revokeObjectURL(item.imageUrl);
        }
      });
    };
  }, [galleries]);

  if (isLoading) {
    return (
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 md:px-12 lg:px-24">
          <h2 className="text-xl font-bold mb-6 text-center">Galeri Kegiatan</h2>
          <div className="flex justify-center items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-300 rounded-lg w-[400px] h-[200px]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="galeriSec" className="bg-gray-100 py-2 z-10">
      <div className="container mx-auto px-4 md:px-12 lg:px-24">
        <h2 className="text-xl font-bold mb-6 text-center">Galeri Kegiatan</h2>
        {galleries.length > 0 && (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className="w-full"
          >
            {galleries.map((item) => (
              <SwiperSlide key={item.id} className="flex flex-col items-center">
                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
                  <Image
                    src={item.imageUrl}
                    alt={item.category}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-lg shadow-md object-cover"
                    priority
                    quality={100}
                  />
                </div>
                <p className="mt-4 text-center text-lg font-medium">{item.category}</p>
              </SwiperSlide>
            ))}
            <div className="swiper-pagination !relative mt-10"></div>
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default GaleriKegiatan;