"use client";
import Header from "@/app/_components/Header";
import React, { useState } from "react";
import {
  Share2,
  Facebook,
  Send,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

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
  const handleShare = (event) => {
    const shareData = {
      title: event.title,
      text: event.shortDesc,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.error(err));
    } else {
      navigator.clipboard.writeText(
        `${event.title}\n\n${event.shortDesc}\n\n${window.location.href}`,
      );
      alert("Link event berhasil disalin!");
    }
  };
  const getShareLinks = (event) => {
    const url = typeof window !== "undefined" ? window.location.href : "";

    const text = encodeURIComponent(event.title);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url,
      )}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
        url,
      )}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(
        url,
      )}&text=${text}`,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10 pt-28">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            <span className="">Event</span>
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

            <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>

            <p className="text-gray-700 text-sm leading-relaxed">
              {selectedEvent.fullDesc}
            </p>
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-600 mb-3">
                Bagikan event ini
              </p>

              <div className="flex items-center gap-3">
                <a
                  href={getShareLinks(selectedEvent).facebook}
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90"
                >
                  <Facebook size={18} />
                </a>

                <a
                  href={getShareLinks(selectedEvent).twitter}
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90"
                >
                  𝕏
                </a>

                <a
                  href={getShareLinks(selectedEvent).whatsapp}
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-90"
                >
                  <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                </a>

                <a
                  href={getShareLinks(selectedEvent).telegram}
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-90"
                >
                  <Send size={18} />
                </a>
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-teal-100 hover:text-teal-600 transition text-gray-600 font-semibold text-xs"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;
