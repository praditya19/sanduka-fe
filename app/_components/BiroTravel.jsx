import React from "react";
import Header from "@/app/_components/Header";
import Link from "next/link";

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
    priceNew: "6,990,000",
  },
  {
    id: 2,
    title: "05D/04N LOMBOK & GILI ISLANDS PARADISE ESCAPE",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800",
    country: "Lombok",
    duration: "05D/04N",
    departures: ["10, 17, 24 May 2026", "7, 14, 21 Jun 2026"],
    priceNew: "10,500,000",
  },
  {
    id: 3,
    title: "06D/05N KOMODO ISLAND ADVENTURE & PINK BEACH",
    image:
      "https://images.unsplash.com/photo-1588666309990-d68f08e3d4c6?auto=format&fit=crop&w=800",
    country: "Labuan Bajo",
    duration: "06D/05N",
    departures: ["28, 29, 30 Jun 2026", "12, 19, 26 Jul 2026"],
    priceNew: "15,800,000",
  },
  {
    id: 4,
    title: "07D/06N RAJA AMPAT DIVING & ISLAND HOPPING",
    image:
      "https://images.unsplash.com/photo-1516496728166-4e2d0c3b5b48?auto=format&fit=crop&w=800",
    country: "West Papua",
    duration: "07D/06N",
    departures: ["5 Apr 2026", "3 May 2026", "7 Jun 2026"],
    priceNew: "21,500,000",
  },
  {
    id: 5,
    title: "05D/04N YOGYAKARTA CULTURE & BOROBUDUR SUNRISE",
    image:
      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800",
    country: "Yogyakarta",
    duration: "05D/04N",
    departures: ["20, 27 Mar 2026", "3, 10 Apr 2026"],
    priceNew: "6,200,000",
  },
];

const parseFirstDate = (departures) => {
  for (let d of departures) {
    const match = d.match(/(\d{1,2})\s([A-Za-z]+)\s(\d{4})/);
    if (match) {
      return new Date(`${match[1]} ${match[2]} ${match[3]}`);
    }
  }
  return null;
};

const BiroTravel = () => {
  const latestTrips = [...travelPackages]
    .map((item) => ({
      ...item,
      nearestDate: parseFirstDate(item.departures),
    }))
    .filter((item) => item.nearestDate !== null)
    .sort((a, b) => b.nearestDate - a.nearestDate)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <Header />

      <div
        className="relative h-[75vh] bg-center bg-cover bg-fixed flex items-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-10 text-white shadow-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tour and Travel
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-6">
              Temukan Destinasi Wisata Terbaik dengan Pengalaman Tak Terlupakan
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/biro-perjalanan">
                <button className="bg-orange-500 hover:bg-orange-600 transition px-6 py-3 rounded-xl font-semibold shadow-lg">
                  Lihat Paket
                </button>
              </Link>
              <button className="border border-white hover:bg-white hover:text-black transition px-6 py-3 rounded-xl font-semibold">
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Perjalanan Terbaru
          </h2>
          <span className="text-sm text-blue-600 font-medium">
            Keberangkatan Terdekat
          </span>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestTrips.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Terbaru
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-2">
                  {item.title}
                </h3>

                <div className="flex text-xs text-gray-500 mb-2">
                  <span className="mr-3">📍 {item.country}</span>
                  <span>⏱️ {item.duration}</span>
                </div>

                <p className="text-lg font-bold text-blue-700">
                  IDR {item.priceNew}
                </p>

                <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg">
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div> */}
      </section>
    </div>
  );
};

export default BiroTravel;
