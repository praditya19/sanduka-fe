"use client";
import Header from "@/app/_components/Header";
import React, { useState } from "react";

const eventData = [
  {
    id: 1,
    title: "Workshop Web Development",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    shortDesc:
      "Workshop intensif membahas pengembangan web modern menggunakan React dan Tailwind CSS.",
    fullDesc:
      "Workshop Web Development ini ditujukan untuk mahasiswa dan umum yang ingin memperdalam pengembangan web modern menggunakan React, Tailwind CSS, dan praktik terbaik industri. Peserta akan mendapatkan materi, studi kasus, dan sertifikat.",
    date: "12 Maret 2026",
    location: "Universitas Semarang",
  },
  {
    id: 2,
    title: "Seminar Teknologi Digital",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    shortDesc:
      "Seminar membahas tren teknologi digital, AI, dan peluang karier di industri IT.",
    fullDesc:
      "Seminar Teknologi Digital menghadirkan pembicara profesional dari industri IT yang akan membahas perkembangan AI, transformasi digital, dan strategi membangun karier di dunia teknologi.",
    date: "20 April 2026",
    location: "Gedung Serbaguna",
  },
  {
    id: 3,
    title: "Hackathon Nasional",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    shortDesc:
      "Kompetisi hackathon nasional untuk menciptakan solusi digital inovatif dalam waktu terbatas.",
    fullDesc:
      "Hackathon Nasional ini mempertemukan talenta muda dari berbagai daerah untuk berkolaborasi menciptakan solusi digital inovatif. Event ini melatih kerja tim, kreativitas, dan problem solving.",
    date: "5 Mei 2026",
    location: "Online & Offline",
  },
  {
    id: 4,
    title: "Workshop Web Development",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    shortDesc:
      "Workshop intensif membahas pengembangan web modern menggunakan React dan Tailwind CSS.",
    fullDesc:
      "Workshop Web Development ini ditujukan untuk mahasiswa dan umum yang ingin memperdalam pengembangan web modern menggunakan React, Tailwind CSS, dan praktik terbaik industri. Peserta akan mendapatkan materi, studi kasus, dan sertifikat.",
    date: "12 Maret 2026",
    location: "Universitas Semarang",
  },
  {
    id: 5,
    title: "Seminar Teknologi Digital",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    shortDesc:
      "Seminar membahas tren teknologi digital, AI, dan peluang karier di industri IT.",
    fullDesc:
      "Seminar Teknologi Digital menghadirkan pembicara profesional dari industri IT yang akan membahas perkembangan AI, transformasi digital, dan strategi membangun karier di dunia teknologi.",
    date: "20 April 2026",
    location: "Gedung Serbaguna",
  },
  {
    id: 6,
    title: "Hackathon Nasional",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    shortDesc:
      "Kompetisi hackathon nasional untuk menciptakan solusi digital inovatif dalam waktu terbatas.",
    fullDesc:
      "Hackathon Nasional ini mempertemukan talenta muda dari berbagai daerah untuk berkolaborasi menciptakan solusi digital inovatif. Event ini melatih kerja tim, kreativitas, dan problem solving.",
    date: "5 Mei 2026",
    location: "Online & Offline",
  },
  {
    id: 7,
    title: "Workshop Web Development",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    shortDesc:
      "Workshop intensif membahas pengembangan web modern menggunakan React dan Tailwind CSS.",
    fullDesc:
      "Workshop Web Development ini ditujukan untuk mahasiswa dan umum yang ingin memperdalam pengembangan web modern menggunakan React, Tailwind CSS, dan praktik terbaik industri. Peserta akan mendapatkan materi, studi kasus, dan sertifikat.",
    date: "12 Maret 2026",
    location: "Universitas Semarang",
  },
  {
    id: 8,
    title: "Seminar Teknologi Digital",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    shortDesc:
      "Seminar membahas tren teknologi digital, AI, dan peluang karier di industri IT.",
    fullDesc:
      "Seminar Teknologi Digital menghadirkan pembicara profesional dari industri IT yang akan membahas perkembangan AI, transformasi digital, dan strategi membangun karier di dunia teknologi.",
    date: "20 April 2026",
    location: "Gedung Serbaguna",
  },
  {
    id: 9,
    title: "Hackathon Nasional",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    shortDesc:
      "Kompetisi hackathon nasional untuk menciptakan solusi digital inovatif dalam waktu terbatas.",
    fullDesc:
      "Hackathon Nasional ini mempertemukan talenta muda dari berbagai daerah untuk berkolaborasi menciptakan solusi digital inovatif. Event ini melatih kerja tim, kreativitas, dan problem solving.",
    date: "5 Mei 2026",
    location: "Online & Offline",
  },
];

const Event = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const limitWords = (text, maxWords = 20) => {
    const words = text.split(" ");
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : text;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10 pt-28">
        <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              <span className="">
                Event
              </span>
            </h2>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventData.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {event.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {limitWords(event.shortDesc, 20)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DETAIL EVENT */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <img
              src={selectedEvent.image}
              alt={selectedEvent.title}
              className="w-full h-56 object-cover rounded-lg mb-4"
            />

            <h2 className="text-2xl font-bold mb-2">
              {selectedEvent.title}
            </h2>

            <p className="text-gray-700 text-sm leading-relaxed">
              {selectedEvent.fullDesc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;
