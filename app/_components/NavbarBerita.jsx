"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NavbarBerita = () => {
  const pathname = usePathname();

  const menu = [
    { name: "Buat Berita", path: "/berita/create-berita" },
    { name: "Semua Berita", path: "/berita/view-berita" },
  ];

  return (
    <div className="bg-white shadow-md rounded-xl p-4 mb-8">
      <div className="flex flex-wrap gap-4">
        {menu.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className={`px-5 py-2 rounded-lg font-medium transition 
              ${
                pathname === item.path
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 hover:bg-blue-100"
              }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavbarBerita;
