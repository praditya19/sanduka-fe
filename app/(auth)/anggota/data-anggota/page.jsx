'use client';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { membersData } from "../data.js";

function DataAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const [selectedCabang, setSelectedCabang] = useState("-- Cabang --");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("-- Unit Kerja --");

  const calculateRetirementDate = (birthDate) => {
    const [day, month, year] = birthDate.split(" ");
    const birthYear = parseInt(year);
    const birthMonth = new Date(`${month} 1, ${year}`).getMonth() + 1; // Get month index (0-11) and convert to 1-12
    const retirementYear = birthYear + 60;
    return `${birthMonth.toString().padStart(2, '0')}-${retirementYear}`; // Pad month with leading zero if needed
  };

  const formatCurrency = (amount) => {
    return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
  };

  const handlePrint = () => {
    const filteredDataForPrint = selectedCabang === "-- Cabang --"
      ? membersData
      : membersData.filter(item => item.cabang === selectedCabang);
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Data Anggota</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .title, .subtitle {
              text-align: center;
              margin-bottom: 10px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #00796b;
            }
            .subtitle {
              font-size: 20px;
              font-weight: normal;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #ccc;
            }
            th, td {
              padding: 8px;
              border: 1px solid #ccc;
            }
            .header-row th[colspan="2"] {
              text-align: center;
            }
            .total-row {
              font-weight: bold;
              background-color: #e0f2f1;
            }
          </style>
        </head>
        <body>
          <div class="title">Data Anggota</div>
          <table>
            <thead>
              <tr class="header-row">
                <th>No</th>
                <th>Foto</th>
                <th>Nama</th>
                <th>Tanggal Lahir</th>
                <th>Unit Kerja</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDataForPrint
                .map(
                  (item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td></td>
                      <td>
                        <div class="font-bold">${item.nama}</div>
                        <div>${item.npa}</div>
                        <div>${item.tugas}</div>
                      </td>
                      <td>
                        <div>${item.lahir}, ${item.tanggal}</div>
                        <div>${item.usia} Tahun</div>
                        <div>Prediksi Pensiun: ${calculateRetirementDate(item.tanggal)}</div>
                      </td>
                      <td>
                      <div>${item.kerja},</div>
                        <div>anggota: ${item.gabung}</div>
                        <div>${item.golongan}/${formatCurrency(item.iuran)}</div>
                      </td>
                      <td></td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const filteredData = selectedCabang === "-- Cabang --"
    ? membersData
    : membersData.filter(item => item.cabang === selectedCabang);

  const jumlahAnggota = filteredData.length;

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
        <div className="container mx-auto">
          <h1 className="text-xl md:text-3xl font-extrabold">
            DATA ANGGOTA
          </h1>
        </div>
      </header>
      <div className="mb-4">
        <div className="flex flex-wrap items-start mt-2 justify-between">
          <div className="flex flex-wrap items-center space-x-2 mb-2 md:mb-0">
            <select
              className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
              value={selectedCabang}
              onChange={(e) => setSelectedCabang(e.target.value)}
            >
              <option>-- Cabang --</option>
              <option>BANGSRI</option>
              <option>JEPARA</option>
              {/* Add other options as needed */}
            </select>
            <select
              className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
              value={selectedUnitKerja}
              onChange={(e) => setSelectedUnitKerja(e.target.value)}
            >
              <option>-- Unit Kerja --</option>
              <option>SMAN 2 Jepara</option>
              <option>SDN 3 Jepara</option>
              {/* Add other options as needed */}
            </select>
            <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
              <option>Semua</option>
              {/* Add other options as needed */}
            </select>
            <p className="py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto">
              Jumlah Anggota : {jumlahAnggota}
            </p>
          </div>
          <p className="text-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto">
            Data Anggota
          </p>
          <div className="flex items-end w-full md:w-auto mt-2 md:mt-0">
            <div className="space-x-2 w-full flex md:block">
              <label htmlFor="maxItems" className="mr-2">Tampilkan:</label>
              <select
                id="maxItems"
                value={maxItems}
                onChange={(e) => setMaxItems(parseInt(e.target.value))}
                className="shadow appearance-none border rounded w-full md:w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
              <Button className="px-8 mt-2 md:mt-0" variant="outline" onClick={handlePrint}>Cetak</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="container w-full table-auto mb-8">
          <thead>
            <tr>
              <th className="p-2 md:p-3 border text-white bg-green-700">No</th>
              <th className="p-2 md:p-3 border text-white bg-green-700">Foto</th>
              <th className="p-2 md:p-3 border text-white bg-green-700">Nama</th>
              <th className="p-2 md:p-3 border text-white bg-green-700">Tanggal Lahir</th>
              <th className="p-2 md:p-3 border text-white bg-green-700">Unit Kerja</th>
              <th className="p-2 md:p-3 border text-white bg-green-700">Keterangan</th>
              <th className="p-2 md:p-3 border text-white bg-green-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(0, maxItems).map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="p-2 md:p-3 border text-center">{index + 1}</td>
                <td className="p-2 md:p-3 border"></td>
                <td className="p-2 md:p-3 border">
                  <div className="font-bold">{item.nama}</div>
                  <div>{item.npa}</div>
                  <div>{item.tugas}</div>
                </td>
                <td className="p-2 md:p-3 border">
                  <div>{item.lahir}, {item.tanggal}</div>
                  <div>{item.usia} Tahun</div>
                  <div>Prediksi Pensiun: {calculateRetirementDate(item.tanggal)}</div>
                </td>
                <td className="p-2 md:p-3 border">
                  <div>{item.kerja},</div>
                  <div>anggota: {item.gabung}</div>
                  <div>{item.golongan}/{formatCurrency(item.iuran)}</div>
                </td>
                <td className="p-2 md:p-3 border"></td>
                <td className="p-2 md:p-3 border">
                  <Link href="#" className="text-blue-500">
                    <div className="flex flex-col space-y-2 items-center">
                      <Button className="w-24 bg-blue-500">Edit Data</Button>
                      <Button className="w-24 bg-red-600">Lapor</Button>
                    </div>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataAnggota;
