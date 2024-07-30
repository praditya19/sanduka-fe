import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const data = [
  { cabang: "BANGSRI", kurangSetor: 1000.0 },
  { cabang: "BATEALIT", kurangSetor: 1000.0 },
  { cabang: "CABSUS DINAS PENDIDIKAN", kurangSetor: 1000.0 },
  { cabang: "CABSUS IGTKI", kurangSetor: 1000.0 },
  { cabang: "DONOROJO", kurangSetor: 1000.0 },
  { cabang: "JEPARA", kurangSetor: 1000.0 },
  { cabang: "KALINYAMATAN", kurangSetor: 1000.0 },
  { cabang: "KARIMUNJAWA", kurangSetor: 1000.0 },
  { cabang: "KEDUNG", kurangSetor: 1000.0 },
  { cabang: "KELING", kurangSetor: 1000.0 },
  { cabang: "KEMBANG", kurangSetor: 1000.0 },
  { cabang: "MAYONG", kurangSetor: 1000.0 },
  { cabang: "MLONGGO", kurangSetor: 1000.0 },
  { cabang: "NALUMSARI", kurangSetor: 1000.0 },
  { cabang: "PAKIS AJI", kurangSetor: 1000.0 },
  { cabang: "PECANGAAN", kurangSetor: 1000.0 },
];

export default function Home() {
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
                <Link href="/keuangan/organisasi">Organisasi</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <Image src="/sanduka.png" width={200} height={200} alt="Sanduka" />
          <div className="text-center md:mx-6 my-4 md:my-0">
            <h2 className="text-xl md:text-2xl font-extrabold">SALDO</h2>
            <p className="text-md md:text-lg text-gray-600">Juli 2024</p>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-lg md:text-xl font-bold mb-4">
            Santunan Duka Cita PGRI Kabupaten Jepara
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 p-4 rounded-md">
            <div>
              <h4 className="font-bold text-green-700">PEMASUKAN</h4>
              <p className="text-md md:text-lg font-semibold">876.865.500,-</p>
            </div>
            <div>
              <h4 className="font-bold text-green-700">SANDUKA</h4>
              <p className="text-md md:text-lg font-semibold">
                Rp. 300.329.150,-
              </p>
            </div>
            <div>
              <h4 className="font-bold text-green-700">PENGELUARAN</h4>
              <p className="text-md md:text-lg font-semibold">576.536.350,-</p>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <Image
            src="/logo.png"
            width={80}
            height={80}
            alt="Organisasi"
            className="mb-5"
          />
          <h3 className="text-lg md:text-xl font-bold mb-4">ORGANISASI</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 p-4 rounded-md">
            <div>
              <h4 className="font-bold text-green-700">PEMASUKAN</h4>
              <p className="text-md md:text-lg font-semibold">0,-</p>
            </div>
            <div>
              <h4 className="font-bold text-green-700">ORGANISASI</h4>
              <p className="text-md md:text-lg font-semibold">Rp. 0,-</p>
            </div>
            <div>
              <h4 className="font-bold text-green-700">PENGELUARAN</h4>
              <p className="text-md md:text-lg font-semibold">0,-</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="container w-full table-auto mb-8">
            <thead>
              <tr>
                <th className="p-2 md:p-3 border bg-green-200">No</th>
                <th className="p-2 md:p-3 border bg-green-200">Cabang</th>
                <th className="p-2 md:p-3 border bg-green-200">Kurang Setor</th>
                <th className="p-2 md:p-3 border bg-green-200">Detail</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="p-2 md:p-3 border text-center">{index + 1}</td>
                  <td className="p-2 md:p-3 border">{item.cabang}</td>
                  <td className="p-2 md:p-3 border text-center">
                    {item.kurangSetor.toFixed(2)}
                  </td>
                  <td className="p-2 md:p-3 border text-center">
                    <Link href="#" className="text-blue-500">
                      <Button>Detail</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
