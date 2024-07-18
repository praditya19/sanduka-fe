"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";

export default function Iuran() {
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
    const value = parseInt(event.target.value.replace(/\D/g, ""), 10) || 0;
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

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="bg-blue-500 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-5 text-center">
            Besaran Iuran PGRI
          </h2>
          <div className="mb-4">
            <Label
              htmlFor="iuranPB"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Iuran PB
            </Label>
            <Input
              type="text"
              id="iuranPB"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formatRupiah(iuranPB)}
              onChange={(event) => handleInputChange(event, setIuranPB)}
            />
          </div>
          <div className="mb-4">
            <Label
              htmlFor="iuranProvinsi"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Iuran Provinsi
            </Label>
            <Input
              type="text"
              id="iuranProvinsi"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formatRupiah(iuranProvinsi)}
              onChange={(event) => handleInputChange(event, setIuranProvinsi)}
            />
          </div>
          <div className="mb-4">
            <Label
              htmlFor="iuranKabupaten"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Iuran Kabupaten
            </Label>
            <Input
              type="text"
              id="iuranKabupaten"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formatRupiah(iuranKabupaten)}
              onChange={(event) => handleInputChange(event, setIuranKabupaten)}
            />
          </div>
          <div className="mb-4">
            <Label
              htmlFor="iuranCabang"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Iuran Cabang/Ranting
            </Label>
            <Input
              type="text"
              id="iuranCabang"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formatRupiah(iuranCabang)}
              onChange={(event) => handleInputChange(event, setIuranCabang)}
            />
          </div>
          <div className="mb-4">
            <Label
              htmlFor="totalIuran"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Total Iuran
            </Label>
            <Input
              type="text"
              id="totalIuran"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                totalIuran === totalIuran ? "bg-gray-200" : ""
              }`}
              value={formatRupiah(totalIuran)}
              readOnly
            />
          </div>
          <div className="mb-4">
            <Label
              htmlFor="sumbanganSanduka"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Sumbangan Sanduka
            </Label>
            <Input
              type="text"
              id="sumbanganSanduka"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formatRupiah(sumbanganSanduka)}
              onChange={(event) =>
                handleInputChange(event, setSumbanganSanduka)
              }
            />
          </div>
          <div className="mb-4">
            <h2 className="bg-blue-500 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-1 text-center">
              Total Sumbangan dan Iuran PGRI
            </h2>
            <Input
              type="text"
              id="totalSumbangan"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                totalSumbangan === totalIuran + sumbanganSanduka
                  ? "bg-gray-200"
                  : ""
              }`}
              value={formatRupiah(totalSumbangan)}
              readOnly
            />
          </div>
          <div className="flex justify-center space-x-2">
            <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Simpan
            </Button>
            <Button
              className="bg-red-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-2">Jumlah Anggota : 6938</h3>
          <h3 className="text-lg font-bold mb-2">
            Setor Provinsi : Rp. 8.325.600
          </h3>
          <div className="mb-4">
            <p className="bg-teal-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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
            <Label
              htmlFor="keterangaSilisih"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Keterangan Selisih data
            </Label>
            <textarea
              id="keterangaSilisih"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="5"
            ></textarea>
          </div>
          <div className="flex justify-center">
            <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
