import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";

const VerifikasiAnggotaMutasi = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        VERIFIKASI ANGGOTA DAN MUTASI
      </h1>
      <div className="flex flex-wrap justify-center space-x-4 mb-8">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center mb-2 md:mb-0">
          Anggota Baru
          <span className="bg-green-600 rounded-full px-2 py-1 ml-2 text-sm">
            4
          </span>
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center mb-2 md:mb-0">
          Mutasi Cabang
          <span className="bg-red-600 rounded-full px-2 py-1 ml-2 text-sm">
            4
          </span>
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center mb-2 md:mb-0">
          Mutasi Kabupaten
          <span className="bg-red-600 rounded-full px-2 py-1 ml-2 text-sm">
            4
          </span>
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center mb-2 md:mb-0">
          Mutasi Unit
          <span className="bg-red-600 rounded-full px-2 py-1 ml-2 text-sm">
            4
          </span>
        </Button>
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Kabupaten
        </label>
        <select className="border rounded p-2 w-full">
          <option>Jepara</option>
        </select>
      </div>
      <div className="flex flex-wrap space-x-0 md:space-x-4 mb-6">
        <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
          <label className="block mb-2 font-medium text-gray-700">Cabang</label>
          <select className="border rounded p-2 w-full">
            <option>Jepara</option>
          </select>
        </div>
        <div className="flex-1 w-full md:w-auto">
          <label className="block mb-2 font-medium text-gray-700">
            Unit Kerja
          </label>
          <select className="border rounded p-2 w-full">
            <option>SDN 1 Jepara</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap space-x-0 md:space-x-4 mb-6">
        <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
          <label className="block mb-2 font-medium text-gray-700">Bulan</label>
          <select className="border rounded p-2 w-full">
            <option>Januari</option>
          </select>
        </div>
        <div className="flex-1 w-full md:w-auto">
          <label className="block mb-2 font-medium text-gray-700">Tahun</label>
          <Input
            type="text"
            className="border rounded p-2 w-full"
            defaultValue="2017"
          />
        </div>
      </div>
      <div className="text-center mb-6">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full w-24">
          Cetak
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full mt-4 bg-white shadow-md rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">No.</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Foto</th>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Tgl Lahir</th>
              <th className="px-4 py-2">Unit Kerja</th>
              <th className="px-4 py-2">Keterangan</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-100">
              <td className="px-4 py-2 text-center">1</td>
              <td className="px-4 py-2 text-center">09.45.00 09/09/2023</td>
              <td className="px-4 py-2 text-center">
                <Image
                  src="/sanduka.png"
                  width={170}
                  height={170}
                  alt="logo"
                  className="rounded-full mx-auto"
                />
              </td>
              <td className="px-4 py-2 text-center">no name</td>
              <td className="px-4 py-2 text-center">Jepara, 10/02/1987</td>
              <td className="px-4 py-2 text-center">SMAN 1 Jepara</td>
              <td className="px-4 py-2 text-center">anggota baru</td>
              <td className="px-4 py-2 text-center space-x-2 flex items-center justify-center">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full w-8 h-8">
                  <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full w-8 h-8">
                  <FontAwesomeIcon icon={faTimesCircle} size="lg" />
                </Button>
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-full w-8 h-8">
                  <FontAwesomeIcon icon={faMobileAlt} size="lg" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerifikasiAnggotaMutasi;
