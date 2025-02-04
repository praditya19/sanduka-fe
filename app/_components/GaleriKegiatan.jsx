"use client";
import React, { useState, useEffect } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

const GaleriKegiatan = () => {
  const [galleries, setGalleries] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

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
      const data = await GlobalApi.getAllSidebarGallery();
      setGalleries(data);
    } catch (error) {
      console.error("Error fetching galleries:", error);
    }
  };

  const getPrevIndex = (index) =>
    index === 0 ? galleries.length - 1 : index - 1;
  const getNextIndex = (index) =>
    index === galleries.length - 1 ? 0 : index + 1;

  const getVisibleItems = () => {
    if (galleries.length < 3) return galleries;
    return [
      galleries[getPrevIndex(activeIndex)],
      galleries[activeIndex],
      galleries[getNextIndex(activeIndex)],
    ];
  };

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
                    className={`transition-transform duration-1000 ease-in-out ${
                      isActive
                        ? "scale-110 opacity-100 z-20"
                        : "scale-90 opacity-60 z-10"
                    }`}
                  >
                    <img
                      src={`data:image/jpeg;base64,${item.photo}`}
                      alt={item.category}
                      className="rounded-lg shadow-md w-[400px] h-[200px] object-cover"
                    />
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