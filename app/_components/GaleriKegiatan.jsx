"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import GlobalApi from "@/app/_utils/GlobalApi";

const GaleriKegiatan = () => {
  const [galleries, setGalleries] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGalleries();
  }, []);

  useEffect(() => {
    if (galleries.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % galleries.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [galleries]);

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

  const getPrevIndex = (index) =>
    index === 0 ? galleries.length - 1 : index - 1;
  const getNextIndex = (index) =>
    index === galleries.length - 1 ? 0 : index + 1;

  const getVisibleItems = () => {
    if (window.innerWidth < 768) {
      return [galleries[activeIndex]];
    }
    if (galleries.length < 3) return galleries;
    return [
      galleries[getPrevIndex(activeIndex)],
      galleries[activeIndex],
      galleries[getNextIndex(activeIndex)],
    ];
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 md:px-12 lg:px-24">
          <h2 className="text-xl font-bold mb-6 text-center">
            Galeri Kegiatan
          </h2>
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
    <div id="galeriSec" className="bg-gray-100 py-12">
      <div className="container mx-auto px-4 md:px-12 lg:px-24">
        <h2 className="text-xl font-bold mb-6 text-center">Galeri Kegiatan</h2>
        {galleries.length > 0 && (
          <div className="relative w-full flex items-center justify-center">
            <div className="flex justify-center items-center space-x-4">
              {getVisibleItems().map((item) => {
                const isActive = item.id === galleries[activeIndex].id;
                return (
                  <div
                    key={item.id}
                    className={`gallery-item transition-transform duration-1000 ease-in-out ${
                      isActive
                        ? "active scale-110 opacity-100 z-20"
                        : "scale-90 opacity-60 z-10"
                    }`}
                  >
                    <div className="relative w-[350px] h-[200px] sm:w-[400px]">
                      <Image
                        src={item.imageUrl}
                        alt={item.category}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-lg shadow-md object-cover"
                        priority={isActive}
                        loading={isActive ? "eager" : "lazy"}
                        quality={isActive ? 100 : 75}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GaleriKegiatan;
