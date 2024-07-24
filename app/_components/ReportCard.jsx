import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn } from "@fortawesome/free-solid-svg-icons";
import React from "react";

export default function ReportCard() {
  return (
    <div className="max-w-sm mx-auto bg-white shadow-md rounded-2xl overflow-hidden my-4">
      <div className="bg-gradient-to-r from-yellow-400 to-red-500 p-4 text-center">
        <div className="flex justify-center">
          <Image
            src="https://via.placeholder.com/150"
            width={170}
            height={170}
            alt="Profile"
            className="mx-auto"
          />
        </div>
        <h2 className="text-2xl font-bold text-white mt-2">MARDJONO</h2>
      </div>
      <div className="p-4">
        <p className="text-center font-semibold text-lg mb-2">
          Meninggal Kamis, 0024-05-31
        </p>
        <p className="text-center text-gray-700">-1944 Tahun</p>
        <p className="text-center text-gray-700">12320200465</p>
        <p className="text-center text-gray-700">Jepara, 1968-03-14</p>
        <p className="text-center text-gray-700">Guru</p>
        <p className="text-center text-gray-700">SMPN 2 PECANGAAN</p>
        <p className="text-center text-gray-700">Cabang PECANGAAN</p>
        <p className="text-center text-gray-700">
          PECANGAAN KULON RT.02/II PECANGAAN
        </p>
        <p className="text-center text-gray-700">Catatan :</p>
        <div className="flex justify-around my-4">
          <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl">
            Lokasi
          </Button>
          <Button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl">
            Batal
          </Button>
          <Button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl">
            Verifikasi
          </Button>
        </div>
        <div className="bg-blue-500 text-white font-bold py-2 px-4 rounded-xl text-center flex items-center justify-center">
          <FontAwesomeIcon icon={faBullhorn} className="mr-2 w-5 h-5" /> PELAPOR
        </div>
        <p className="text-center text-gray-700 mt-2">
          Selasa, 16/07/2024, 11:33:58am
        </p>
        <p className="text-center text-gray-700">HABIB NOR HAQIQI</p>
        <p className="text-center text-gray-700">📞 6281325552982</p>
      </div>
    </div>
  );
}
