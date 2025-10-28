"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

function TabNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: "byNominal", label: "Inputan By Nominal", path: "/by-nominal" },
    { id: "lainLain", label: "Inputan Lain-lain", path: "/by-nominal/lain-lain" },
    { id: "rekap", label: "Rekap By Nominal", path: "/anggota/rekap-anggota" },
  ];

  return (
    <div className="flex border-b border-gray-300">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.path)}
            className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
              isActive
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-teal-600"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default TabNavigation;
