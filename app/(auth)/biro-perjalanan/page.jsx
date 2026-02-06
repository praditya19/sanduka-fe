"use client";
import React, { useState } from "react";
import Header from "@/app/_components/Header";
import { Share2, Facebook, Send } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const travelPackages = [
  {
    id: 1,
    title: "[BEST SELLER] 04D/03N EXPLORE BALI CULTURE & NATURE",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800",
    country: "Bali",
    duration: "04D/03N",
    departures: [
      "Every Monday & Friday",
      "15, 22, 29 Mar 2026",
      "5, 12 Apr 2026",
    ],
    priceOld: "8,500,000",
    priceNew: "6,990,000",
    discount: "18%",
    rating: 4.9,
    reviews: 342,
    tag: "Best Seller",
    tagColor: "bg-red-500",
    highlights: [
      "Ubud Tour",
      "Tanah Lot",
      "Uluwatu Kecak Dance",
      "Private Villa",
    ],
    includes: [
      "4-star Hotel",
      "All Meals",
      "Private Guide",
      "Airport Transfer",
    ],
  },
  {
    id: 2,
    title: "05D/04N LOMBOK & GILI ISLANDS PARADISE ESCAPE",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800",
    country: "Lombok",
    duration: "05D/04N",
    departures: ["10, 17, 24 May 2026", "7, 14, 21 Jun 2026"],
    priceOld: "12,800,000",
    priceNew: "10,500,000",
    discount: "18%",
    rating: 4.8,
    reviews: 215,
    tag: "Beach",
    tagColor: "bg-blue-500",
    highlights: [
      "Gili Trawangan",
      "Mount Rinjani View",
      "Snorkeling",
      "Senggigi Beach",
    ],
    includes: ["Beach Resort", "Breakfast", "Boat Transfer", "Snorkeling Gear"],
  },
  {
    id: 3,
    title: "06D/05N KOMODO ISLAND ADVENTURE & PINK BEACH",
    image:
      "https://images.unsplash.com/photo-1588666309990-d68f08e3d4c6?auto=format&fit=crop&w=800",
    country: "Labuan Bajo",
    duration: "06D/05N",
    departures: ["28, 29, 30 Jun 2026", "12, 19, 26 Jul 2026"],
    priceOld: "18,500,000",
    priceNew: "15,800,000",
    discount: "15%",
    rating: 4.9,
    reviews: 187,
    tag: "Adventure",
    tagColor: "bg-green-500",
    highlights: [
      "Komodo Dragons",
      "Pink Beach",
      "Padar Island",
      "Liveaboard Cruise",
    ],
    includes: ["Liveaboard Cabin", "All Meals", "Park Fees", "Dive Guide"],
  },
  {
    id: 4,
    title: "07D/06N RAJA AMPAT DIVING & ISLAND HOPPING",
    image:
      "https://images.unsplash.com/photo-1516496728166-4e2d0c3b5b48?auto=format&fit=crop&w=800",
    country: "West Papua",
    duration: "07D/06N",
    departures: ["5 Apr 2026", "3 May 2026", "7 Jun 2026"],
    priceOld: "25,000,000",
    priceNew: "21,500,000",
    discount: "14%",
    rating: 4.7,
    reviews: 134,
    tag: "Premium",
    tagColor: "bg-purple-500",
    highlights: [
      "World-Class Diving",
      "Wayag Islands",
      "Manta Rays",
      "Private Boat",
    ],
    includes: ["Eco Resort", "3 Dives Daily", "All Equipment", "Marine Guide"],
  },
  {
    id: 5,
    title: "05D/04N YOGYAKARTA CULTURE & BOROBUDUR SUNRISE",
    image:
      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800",
    country: "Yogyakarta",
    duration: "05D/04N",
    departures: [
      "Every Thursday & Sunday",
      "20, 27 Mar 2026",
      "3, 10 Apr 2026",
    ],
    priceOld: "7,800,000",
    priceNew: "6,200,000",
    discount: "21%",
    rating: 4.6,
    reviews: 289,
    tag: "Cultural",
    tagColor: "bg-amber-600",
    highlights: [
      "Borobudur Sunrise",
      "Prambanan Temple",
      "Malioboro Street",
      "Silver Workshop",
    ],
    includes: [
      "Boutique Hotel",
      "Daily Breakfast",
      "Entrance Fees",
      "Cultural Guide",
    ],
  },
  {
    id: 6,
    title: "04D/03N JAKARTA CITY TOUR & THOUSAND ISLANDS",
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800",
    country: "Jakarta",
    duration: "04D/03N",
    departures: ["Weekends Only", "14-15 Mar 2026", "21-22 Mar 2026"],
    priceOld: "5,500,000",
    priceNew: "4,200,000",
    discount: "24%",
    rating: 4.3,
    reviews: 176,
    tag: "City",
    tagColor: "bg-gray-600",
    highlights: [
      "National Monument",
      "Old Town Tour",
      "Thousand Islands",
      "Shopping Tour",
    ],
    includes: ["4-star Hotel", "Breakfast", "City Tour", "Island Transfer"],
  },
  {
    id: 7,
    title: "08D/07N SUMATRA JUNGLE ADVENTURE & ORANGUTAN",
    image:
      "https://images.unsplash.com/photo-1573843989-c9d4a65d6c8c?auto=format&fit=crop&w=800",
    country: "Sumatra",
    duration: "08D/07N",
    departures: ["15, 22 May 2026", "5, 12 Jun 2026", "3, 10 Jul 2026"],
    priceOld: "16,800,000",
    priceNew: "13,900,000",
    discount: "17%",
    rating: 4.8,
    reviews: 98,
    tag: "Wildlife",
    tagColor: "bg-orange-500",
    highlights: [
      "Orangutan Trekking",
      "Lake Toba",
      "Jungle Camping",
      "Elephant Sanctuary",
    ],
    includes: [
      "Lodge & Camping",
      "All Meals",
      "Guide & Porter",
      "Conservation Fees",
    ],
  },
  {
    id: 8,
    title: "06D/05N BROMO & IJEN CRATER SUNRISE EXPERIENCE",
    image:
      "https://images.unsplash.com/photo-1558636506-c5e7f8d683a3?auto=format&fit=crop&w=800",
    country: "East Java",
    duration: "06D/05N",
    departures: ["25, 26, 27 May 2026", "8, 9, 10 Jun 2026"],
    priceOld: "9,800,000",
    priceNew: "7,900,000",
    discount: "19%",
    rating: 4.9,
    reviews: 231,
    tag: "Volcano",
    tagColor: "bg-red-700",
    highlights: [
      "Mount Bromo Sunrise",
      "Ijen Blue Fire",
      "Madakaripura Waterfall",
      "Coffee Plantation",
    ],
    includes: ["Hotel & Homestay", "Jeep Tour", "Gas Masks", "Local Guide"],
  },
  {
    id: 9,
    title: "05D/04N FLORES OVERLAND & KELIMUTU COLORED LAKES",
    image:
      "https://images.unsplash.com/photo-1593702275686-2f6d7d3e5d30?auto=format&fit=crop&w=800",
    country: "Flores",
    duration: "05D/04N",
    departures: ["18, 25 Mar 2026", "1, 8 Apr 2026", "6, 13 May 2026"],
    priceOld: "11,200,000",
    priceNew: "9,300,000",
    discount: "17%",
    rating: 4.5,
    reviews: 112,
    tag: "Nature",
    tagColor: "bg-teal-500",
    highlights: [
      "Kelimutu Lakes",
      "Traditional Village",
      "Spider Rice Field",
      "Hot Springs",
    ],
    includes: ["Local Homestay", "All Meals", "4WD Vehicle", "English Guide"],
  },
];

const TravelPage = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);

  const getShareLinks = (pkg) => {
    const url = typeof window !== "undefined" ? window.location.href : "";

    const text = encodeURIComponent(pkg.title);

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <Header />

      <div
        className="relative py-24 mt-20 px-6 bg-center bg-cover"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto text-center text-white ">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tour and Travel
          </h1>
          <p className="text-xl md:text-2xl font-light mb-6">
            Temukan Destinasi Menakjubkan dengan Paket Eksklusif
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {travelPackages.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span className="flex items-center mr-4">
                    <span className="text-blue-500 mr-1">📍</span>
                    {item.country}
                  </span>
                  <span className="flex items-center">
                    <span className="text-blue-500 mr-1">⏱️</span>
                    {item.duration}
                  </span>
                </div>

                <h3 className="font-bold text-lg leading-tight text-gray-800 mb-4 line-clamp-2">
                  {item.title}
                </h3>

                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">📅</span> Keberangkatan yang
                    Tersedia:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {item.departures.map((date, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full"
                      >
                        {date}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-700 mt-1">
                      IDR {item.priceNew}
                      <span className="text-sm text-gray-500 font-normal">
                        {" "}
                        /person
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedPackage(item)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center group/btn"
                  >
                    <span>Details</span>
                    <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Tidak Menemukan yang Anda Cari?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Kami menyesuaikan tur berdasarkan preferensi Anda. Hubungi pakar
            perjalanan kami untuk rencana perjalanan yang dipersonalisasi.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            ✨ Hubungi Pakar Perjalanan Kami
          </button>
        </div>
      </div>

      {/* Modal Detail Paket Perjalanan */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-auto shadow-2xl">
            {/* Header Modal */}
            <div className="relative h-80 overflow-hidden rounded-t-2xl">
              <img
                src={selectedPackage.image}
                alt={selectedPackage.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex gap-2 mb-2">
                  <span
                    className={`${selectedPackage.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full`}
                  >
                    {selectedPackage.tag}
                  </span>
                  <span className="bg-yellow-400 text-gray-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    ⭐ {selectedPackage.rating} ({selectedPackage.reviews}{" "}
                    reviews)
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{selectedPackage.title}</h2>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="absolute top-4 right-4 bg-white hover:bg-gray-200 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl transition"
              >
                ✕
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 max-h-[60vh] overflow-y-auto mb-4">
              {/* Info Dasar */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedPackage.duration}
                  </div>
                  <div className="text-xs text-gray-600">Durasi</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    📍 {selectedPackage.country}
                  </div>
                  <div className="text-xs text-gray-600">Destinasi</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-red-600">
                    -{selectedPackage.discount}
                  </div>
                  <div className="text-xs text-gray-600">Diskon</div>
                </div>
              </div>

              {/* Harga */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Harga per Orang
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-700">
                    IDR {selectedPackage.priceNew}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    IDR {selectedPackage.priceOld}
                  </span>
                </div>
              </div>

              {/* Keberangkatan */}
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  📅 Keberangkatan Tersedia
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPackage.departures.map((date, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      {date}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  ✨ Highlight Paket
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPackage.highlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <span className="text-lg">🎯</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Includes */}
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  ✅ Yang Termasuk
                </h3>
                <div className="space-y-2">
                  {selectedPackage.includes.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <span className="text-lg">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Share Section */}
            <div className="px-6 pb-2">
              <p className="text-sm font-medium text-gray-600 mb-3">
                Bagikan paket perjalanan ini
              </p>

              <div className="flex items-center gap-3">
                <a
                  href={getShareLinks(selectedPackage).facebook}
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition"
                  title="Share ke Facebook"
                >
                  <Facebook size={18} />
                </a>

                <a
                  href={getShareLinks(selectedPackage).twitter}
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition"
                  title="Share ke X"
                >
                  𝕏
                </a>

                <a
                  href={getShareLinks(selectedPackage).whatsapp}
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-90 transition"
                  title="Share ke WhatsApp"
                >
                  <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                </a>

                <a
                  href={getShareLinks(selectedPackage).telegram}
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-90 transition"
                  title="Share ke Telegram"
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

            {/* Footer Modal */}
            <div className="border-t p-6 flex gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setSelectedPackage(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
              >
                Tutup
              </button>
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition shadow-lg">
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelPage;
