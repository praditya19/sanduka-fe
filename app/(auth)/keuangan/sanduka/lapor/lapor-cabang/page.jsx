import ReportCard from "@/app/_components/ReportCard";
import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LaporCabang() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Keuangan Data Utama
          </h1>
          <nav className="mt-4">
            <ul className="flex flex-wrap space-x-4 md:space-x-6">
              <li className="cursor-pointer">
                <Link href="/keuangan/home">Home</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/data-utama">Data Utama</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/sanduka">Sanduka</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="#">Organisasi</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <h1 className="text-3xl font-bold text-green-700 mb-8 text-center mt-4">
        DATA LAPOR
      </h1>
      <ReportCard />
    </div>
  );
}
