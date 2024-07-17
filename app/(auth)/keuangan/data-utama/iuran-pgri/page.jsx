"use client";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [iuranPB, setIuranPB] = useState(600);
  const [iuranProvinsi, setIuranProvinsi] = useState(1200);
  const [iuranKabupaten, setIuranKabupaten] = useState(1800);
  const [iuranCabang, setIuranCabang] = useState(2400);
  const [sumbanganSanduka, setSumbanganSanduka] = useState(3000);
  const [totalIuran, setTotalIuran] = useState(6000);
  const [totalSumbangan, setTotalSumbangan] = useState(9000);

  useEffect(() => {
    const total = iuranPB + iuranProvinsi + iuranKabupaten + iuranCabang;
    setTotalIuran(total);
    setTotalSumbangan(total + sumbanganSanduka);
  }, [iuranPB, iuranProvinsi, iuranKabupaten, iuranCabang, sumbanganSanduka]);

  const handleInputChange = (event, setFunction) => {
    const value = parseInt(event.target.value, 10) || 0;
    setFunction(value);
  };

  const handleReset = () => {
    setIuranPB(600);
    setIuranProvinsi(1200);
    setIuranKabupaten(1800);
    setIuranCabang(2400);
    setSumbanganSanduka(3000);
    setTotalIuran(6000);
    setTotalSumbangan(9000);
  };

  return (
    <div className="container mx-auto p-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-200 p-4 rounded-lg">
          <h2 className="bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-5">
            Besaran Iuran PGRI
          </h2>
          <div className="mb-4">
            <label
              htmlFor="iuranPB"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Iuran PB
            </label>
            <input
              type="number"
              id="iuranPB"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={iuranPB}
              onChange={(event) => handleInputChange(event, setIuranPB)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="iuranProvinsi"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Iuran Provinsi
            </label>
            <input
              type="number"
              id="iuranProvinsi"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={iuranProvinsi}
              onChange={(event) => handleInputChange(event, setIuranProvinsi)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="iuranKabupaten"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Iuran Kabupaten
            </label>
            <input
              type="number"
              id="iuranKabupaten"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={iuranKabupaten}
              onChange={(event) => handleInputChange(event, setIuranKabupaten)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="iuranCabang"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Iuran Cabang/Ranting
            </label>
            <input
              type="number"
              id="iuranCabang"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={iuranCabang}
              onChange={(event) => handleInputChange(event, setIuranCabang)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="totalIuran"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Total Iuran
            </label>
            <input
              type="number"
              id="totalIuran"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                totalIuran == totalIuran ? "bg-gray-200" : ""
              }`}
              value={totalIuran}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="sumbanganSanduka"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Sumbangan Sanduka
            </label>
            <input
              type="number"
              id="sumbanganSanduka"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={sumbanganSanduka}
              onChange={(event) =>
                handleInputChange(event, setSumbanganSanduka)
              }
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="totalSumbangan"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Total Sumbangan dan Iuran PGRI
            </label>
            <input
              type="number"
              id="totalSumbangan"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                totalSumbangan == totalIuran + sumbanganSanduka
                  ? "bg-gray-200"
                  : ""
              }`}
              value={totalSumbangan}
              readOnly
            />
          </div>
          <div className="flex justify-center space-x-2">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Simpan
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
        <div className="bg-teal-200 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Informasi Tambahan</h2>
          <h3 className="text-lg font-bold mb-2">Jumlah Anggota : 6938</h3>
          <h3 className="text-lg font-bold mb-2">
            Setor Provinsi : Rp. 8.325.600
          </h3>
          <div className="mb-4">
            <p className="bg-teal-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Jumlah Anggota Selisih laporan Cabang
            </p>
            <div className="flex items-center mt-2">
              <select className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>-- Cabang --</option>
              </select>
              <select className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>-- Bulan --</option>
              </select>
              <select className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>-- Tahun --</option>
              </select>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Data Cabang"
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="keterangaSilisih"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Keterangan Selisih data
            </label>
            <textarea
              id="keterangaSilisih"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="5"
            ></textarea>
          </div>
          <div className="flex justify-center">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
