import React from "react";
import Image from "next/image";

function Tentang() {
  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4 md:px-12 lg:px-24">
        <h2 className="text-3xl font-bold mb-8 text-center">Tentang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg card">
            <div className="flex items-center mb-2">
              <Image
                src="/1.png"
                alt="Apa itu Sanduka"
                width={40}
                height={40}
                className="mr-2"
              />
              <h4 className="text-xl font-bold">APA ITU SANDUKA</h4>
            </div>
            <p className="text-gray-700 text-sm text-justify">
              Sanduka adalah santunan duka cita bagi anggota PGRI Aktif yang
              terdaftar di dalam database keanggotaan PGRI Kabupaten Jepara
              sebagai wujud solidaritas.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg card">
            <div className="flex items-center mb-2">
              <Image
                src="/2.png"
                alt="Berapa Sumbangan Anggota"
                width={40}
                height={40}
                className="mr-2"
              />
              <h4 className="text-xl font-bold">BERAPA SUMBANGAN ANGGOTA?</h4>
            </div>
            <p className="text-gray-700 text-sm text-justify">
              Berdasarkan surat keputusan Pengurus PGRI Kabupaten Jepara nomor
              :034/SK/PGRI JPR/XXII/2020 tentang Teknis Pelaksanaan Dana Setia
              Kawan Duka PGRI Kabupaten Jepara, sumbangan Sanduka ditetapkan
              sebesar Rp. 3000 tiap anggota, dibayarkan tiap bulan, bersamaan
              dengan iuran anggota PGRI.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg card">
            <div className="flex items-center mb-2">
              <Image
                src="/3.png"
                alt="Berapa Santunan yang Diterima"
                width={40}
                height={40}
                className="mr-2"
              />
              <h4 className="text-xl font-bold">
                BERAPA SANTUNAN YANG DITERIMA?
              </h4>
            </div>
            <p className="text-gray-700 text-sm text-justify">
              Sesuai keputusan bersama Pengurus PGRI Kabupaten Jepara dan
              Pengurus Cabang se-Kabupaten Jepara, maka disepakati sebesar
              Rp.2.500.000,- dengan kuota 5 orang tiap bulan dan apabila anggota
              meninggal lebih daripada kuota akan diperhitungkan pada bulan
              berikutnya.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg card">
            <div className="flex items-center mb-2">
              <Image
                src="/4.png"
                alt="Bagaimana Cara Pengajuannya"
                width={40}
                height={40}
                className="mr-2"
              />
              <h4 className="text-xl font-bold">
                BAGAIMANA CARA PENGAJUANNYA?
              </h4>
            </div>
            <p className="text-gray-700 text-sm text-justify">
              Pengurus Cabang melaporkan kematian anggotanya secara online
              melalui aplikasi sanduka.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tentang;
