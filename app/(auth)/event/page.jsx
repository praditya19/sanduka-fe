"use client";
import Header from "@/app/_components/Header";
import React, { useEffect, useRef, useState } from "react";
import {
  Share2,
  Facebook,
  Send,
  ChevronLeft,
  ChevronRight,
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
  const [direction, setDirection] = useState("left");
  const [isPaused, setIsPaused] = useState(false);

  const sliderRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const scrollAmount = 320; // lebar card + gap

  // 👉 AUTO SCROLL
  useEffect(() => {
    if (selectedEvent || isHovered) return; // pause kalau popup buka / hover

    const interval = setInterval(() => {
      if (sliderRef.current) {
        sliderRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });

        // kalau sudah mentok kanan → balik ke awal
        if (
          sliderRef.current.scrollLeft + sliderRef.current.offsetWidth >=
          sliderRef.current.scrollWidth
        ) {
          sliderRef.current.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedEvent, isHovered]);

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
      <div className="max-w-[1120px] overflow-hidden mx-auto px-6 py-10 pt-24">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            <span className="">Event PGRI Jepara</span>
          </h3>
          <span className="">
            Kegiatan dan acara yang dapat diikuti semua anggota PGRI Kabupaten
            Jepara
          </span>
        </div>

        <div className="relative overflow-hidden">
          {/* BUTTON LEFT */}
          <button
            onClick={() => setDirection("right")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:scale-110 transition"
          >
            <ChevronLeft size={22} />
          </button>

          <div
            className={`flex gap-6 w-max ${
              direction === "left" ? "animate-left" : "animate-right"
            } ${isPaused || selectedEvent ? "paused" : ""}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {[...eventData, ...eventData].map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                onClick={() => setSelectedEvent(event)}
                className="flex-shrink-0 w-[300px] h-[520px] rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-[#0f172a] text-white"
              >
                {/* Image */}
                <div className="h-[220px] overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col justify-between h-[300px]">
                  <div>
                    <h2 className="text-xl font-bold mb-3">{event.title}</h2>

                    <p className="text-sm text-gray-300 mb-4">
                      {limitWords(event.shortDesc, 18)}
                    </p>

                    <div className="space-y-2 text-sm text-gray-400">
                      <p>📅 {event.date}</p>
                      <p>📍 {event.location}</p>
                      <p>👥 Kuota: 75 orang</p>
                    </div>
                  </div>

                  <button className="mt-6 w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 font-semibold hover:opacity-90 transition">
                    Daftar Event
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setDirection("left")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:scale-110 transition"
          >
            <ChevronRight size={22} />
          </button>
          <style jsx>{`
            @keyframes scroll-left {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }

            @keyframes scroll-right {
              0% {
                transform: translateX(-50%);
              }
              100% {
                transform: translateX(0);
              }
            }

            .animate-left {
              animation: scroll-left 60s linear infinite;
            }

            .animate-right {
              animation: scroll-right 60s linear infinite;
            }

            .paused {
              animation-play-state: paused;
            }
          `}</style>
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
