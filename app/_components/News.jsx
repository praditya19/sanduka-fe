import React from "react";

const newsData = [
  {
    id: 1,
    title: 'Ilmuwan temukan "kota yang hilang" di gunung bawah laut Arktik',
    excerpt:
      "Peneliti menemukan struktur misterius di dasar laut Arktik yang diduga sebagai kota kuno yang hilang dari peradaban manusia.",
    image:
      "https://images.unsplash.com/photo-1581091215367-59ab6c4a3a1b?q=80&w=1200",
    contributor: "Tim Sains",
    editor: "Redaksi Kompas",
    date: "13 Februari 2026",
    views: 189,
    link: "/berita/1",
  },
  {
    id: 2,
    title: "Fenomena es abadi Arktik mulai mencair lebih cepat",
    excerpt:
      "Perubahan iklim global mempercepat pencairan es abadi di kawasan kutub utara yang berdampak pada ekosistem.",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200",
    contributor: "Andi Pratama",
    editor: "Editor Lingkungan",
    date: "13 Februari 2026",
    views: 254,
    link: "/berita/2",
  },
  {
    id: 3,
    title: "Teknologi sonar ungkap rahasia dasar laut terdalam",
    excerpt:
      "Teknologi sonar generasi terbaru membantu ilmuwan mengungkap struktur laut terdalam yang sebelumnya tidak terjangkau.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200",
    contributor: "Dewi Lestari",
    editor: "Editor Sains",
    date: "13 Februari 2026",
    views: 321,
    link: "/berita/3",
  },
  {
    id: 4,
    title: "Ekspedisi laut Arktik temukan spesies baru",
    excerpt:
      "Ekspedisi ilmiah di wilayah Arktik berhasil menemukan spesies laut baru yang mampu bertahan di suhu ekstrem.Ekspedisi ilmiah di wilayah Arktik berhasil menemukan spesies laut baru yang mampu bertahan di suhu ekstrem.Ekspedisi ilmiah di wilayah Arktik berhasil menemukan spesies laut baru yang mampu bertahan di suhu ekstrem.Ekspedisi ilmiah di wilayah Arktik berhasil menemukan spesies laut baru yang mampu bertahan di suhu ekstrem.Ekspedisi ilmiah di wilayah Arktik berhasil menemukan spesies laut baru yang mampu bertahan di suhu ekstrem.Ekspedisi ilmiah di wilayah Arktik berhasil menemukan spesies laut baru yang mampu bertahan di suhu ekstrem.Ekspedisi ilmiah di wilayah Arktik berhasil menemukan spesies laut baru yang mampu bertahan di suhu ekstrem.Ekspedisi ilmiah di wilayah Arktik berhasil menemukan spesies laut baru yang mampu bertahan di suhu ekstrem.Ekspedisi ilmiah di wilayah Arktik berhasil menemukan spesies laut baru yang mampu bertahan di suhu ekstrem.Ekspedisi ilmiah di wilayah Arktik berhasil menemukan spesies laut baru yang mampu bertahan di suhu ekstrem.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200",
    contributor: "Riset Laut",
    editor: "Editor Biologi",
    date: "13 Februari 2026",
    views: 412,
    link: "/berita/4",
  },
];

// Helper: potong max 20 kata
const truncateWords = (text, maxWords = 20) => {
  const words = text.split(" ");
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "..."
    : text;
};

const News = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Berita{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
            Terbaru
          </span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Tetap update dengan informasi terbaru dari kami
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newsData.slice(0, 4).map((news) => (
          <div
            key={news.id}
            className="rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition"
          >
            {/* Image + Title Overlay */}
            <div className="relative h-56">
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Title */}
              <h3 className="absolute bottom-4 left-4 right-4 text-white text-lg font-semibold leading-snug">
                {news.title}
              </h3>
            </div>
            {/* Footer */}
            <div className="p-4 border-t text-xs text-gray-500 flex flex-wrap justify-between gap-2">
              <div>
                <span className="font-medium text-gray-700">
                  Contributor: {news.contributor} | Editor: {news.editor}
                </span>

                <div className="mt-1 text-gray-400">{news.date}</div>
              </div>

              <div>👁️ {news.views} views</div>
            </div>
            {/* Content */}
            <div className="px-4 space-y-3 pb-4">
              <p className="text-sm text-gray-600">
                {truncateWords(news.excerpt, 20)}
              </p>

              <a
                href={news.link}
                className="inline-block text-sm font-medium text-teal-600 hover:underline"
              >
                Baca Selengkapnya →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
