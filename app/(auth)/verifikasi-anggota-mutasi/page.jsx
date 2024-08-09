"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSearch,
  faTimesCircle,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const VerifikasiAnggotaMutasi = () => {
  const [selectedRow, setSelectedRow] = useState(null);

  const tableData = [
    {
      no: 1,
      foto: "/sanduka.png",
      cabang: "BANGSRI",
      unitKerja: "SMAN 1 Jepara",
      nama: "Bagas Adi Prabowo, S.Pd",
      npaPGRI: "123456",
      contactNumber: "+6287839465101",
      status: "Belum di verifikasi",
    },
    {
      no: 2,
      foto: "/sanduka.png",
      cabang: "BANGSRI",
      unitKerja: "SMAN 1 Jepara",
      nama: "Nanda coding, S.Pd",
      npaPGRI: "123456",
      contactNumber: "+62895704340678",
      status: "Belum di verifikasi",
    },
  ];

  const handleUserClick = (rowId) => {
    const row = tableData.find((item) => item.no === rowId);
    setSelectedRow(row);
  };

  const handleClosePopup = () => {
    setSelectedRow(null);
  };

  return (
    <div>
      <header className="bg-teal-700 text-white text-lg font-bold mb-8 py-4 px-6 md:px-12 shadow-md fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto">
          <h1>Verifikasi Anggota</h1>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-16">
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Kabupaten
            </label>
            <select className="border rounded-lg p-2 w-full bg-white shadow-sm">
              <option>Pilih Kabupaten</option>
              <option>Jepara</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Kecamatan / Cabang
            </label>
            <select className="border rounded-lg p-2 w-full bg-white shadow-sm">
              <option>Pilih Cabang</option>
              <option>BANGSRI</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center">
              <FontAwesomeIcon icon={faSearch} size="lg" />
              <span className="ml-2">Cari data filter</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full mt-4 bg-white shadow-lg rounded-lg border border-gray-200">
            <thead className="bg-teal-700 text-white">
              <tr>
                {[
                  "No.",
                  "Foto",
                  "Cabang",
                  "Unit Kerja",
                  "Nama",
                  "NPA PGRI",
                  "Status",
                  "Whatsapp",
                  "Aksi",
                ].map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-2 text-center font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">{row.no}</td>
                  <td className="px-4 py-2 text-center">
                    <Image
                      src={row.foto}
                      width={60}
                      height={60}
                      alt="Anggota Foto"
                      className="mx-auto"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">{row.cabang}</td>
                  <td className="px-4 py-2 text-center">{row.unitKerja}</td>
                  <td className="px-4 py-2 text-center">{row.nama}</td>
                  <td className="px-4 py-2 text-center">{row.npaPGRI}</td>
                  <td
                    className={`px-4 py-2 text-center font-bold rounded-lg ${
                      row.status === "Belum di verifikasi"
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {row.status}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Button
                      onClick={() =>
                        window.open(
                          `https://wa.me/${row.contactNumber}`,
                          "_blank"
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                    </Button>
                  </td>
                  <td className="px-4 py-2 text-center space-x-2 flex items-center justify-center">
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faTimesCircle} size="lg" />
                    </Button>
                    <Button
                      onClick={() => handleUserClick(row.no)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-full flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faUser} size="lg" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Popup */}
        {selectedRow && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 sm:mx-0">
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Detail Anggota
                </h2>
              </div>
              <div className="flex flex-col items-center mb-6">
                <Image
                  src={selectedRow.foto}
                  width={90}
                  height={90}
                  alt="Anggota Foto"
                  className="mb-4 rounded-full border border-gray-200"
                />
                <div className="space-y-2 text-center">
                  <p className="text-lg font-semibold text-gray-800">
                    <strong>Cabang:</strong> {selectedRow.cabang}
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    <strong>Unit Kerja:</strong> {selectedRow.unitKerja}
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    <strong>Nama:</strong> {selectedRow.nama}
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    <strong>NPA PGRI:</strong> {selectedRow.npaPGRI}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      selectedRow.status === "Belum di verifikasi"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    <strong>Status:</strong> {selectedRow.status}
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    <strong>Contact Number:</strong> {selectedRow.contactNumber}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleClosePopup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifikasiAnggotaMutasi;
