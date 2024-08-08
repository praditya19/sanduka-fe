"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function App() {
    const [isAgreed, setIsAgreed] = useState(false);

    const handleCheckboxChange = () => {
      setIsAgreed(!isAgreed);
    };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-r from-blue-500 to-green-500 min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center justify-center w-full max-w-4xl">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full">
        <div className="flex items-center justify-center mb-6">
          <Image src="/sanduka.png" width={250} height={200} alt="logo" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Pendaftaran Peserta Baru</h2>
        <p className="mb-6 text-gray-600 text-center">
          Dengan memilih "Saya Setuju" di bawah ini, maka saya menyatakan menerima dan menyetujui syarat dan ketentuan layanan pendaftaran JKN-KIS tersebut dan saya menyatakan bahwa saya:
        </p>
        <ol className="list-decimal list-inside mb-6 text-gray-600">
          <li className="mb-2">
            Menyetujui bahwa iuran yang dibayarkan sebagai hibah dan tidak dikembalikan sekalipun belum mendapatkan manfaat pelayanan kesehatan dan iuran tersebut sudah dikhlaskan untuk menolong peserta lain yang membutuhkan sebagai bentuk gotong royong.
          </li>
          <li className="mb-2">
            Memberikan kuasa kepada BPJS Kesehatan untuk mengelola dana amanat milik seluruh Peserta yang merupakan himpunan iuran beserta hasil pengembangannya untuk pembayaran manfaat kepada Peserta sesuai Peraturan Perundang-Undangan.
          </li>
          <li className="mb-2">
            Atas kuasa pengelolaan dana manfaat sebagaimana tercantum pada angka 2, BPJS Kesehatan berhak untuk mendapatkan dana operasional penyelenggaraan program Jaminan Kesehatan dari sebagian iuran peserta yang besarnya sesuai dengan Peraturan Perundang-Undangan.
          </li>
        </ol>
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={handleCheckboxChange}
            className="w-4 h-4 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
            id="agreement"
          />
          <label htmlFor="agreement" className="ml-2 text-sm text-gray-600">
            Saya setuju
          </label>
        </div>
        <div className="flex justify-between">
          <Link href="/sign-in">
            <Button className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
              Sebelumnya
            </Button>
          </Link>
          <Link href={isAgreed ? "/create-account" : "#"}>
            <Button
              className={`${
                isAgreed ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              } text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105`}
              disabled={!isAgreed}
            >
              Selanjutnya
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
}

export default App;
