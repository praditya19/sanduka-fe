'use client';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { membersData } from '../data.js';

function DataAnggota() {
    const [maxItems, setMaxItems] = useState(10);
    const [selectedCabang, setSelectedCabang] = useState("-- Cabang --");
    const [selectedUnitKerja, setSelectedUnitKerja] = useState("-- Unit Kerja --");

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
                  text-align: center;
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
                .vertical-text {
                  display: flex;
                  flex-direction: column;
                }
              </style>
            </head>
            <body>
              <div class="title">Data Anggota ${selectedCabang === "-- Cabang --" ? "Cabang" : `Unit Kerja ${selectedCabang}`}</div>
              <table>
                <thead>
                  <tr class="header-row">
                    <th>No</th>
                    <th>Unit Kerja</th>
                    <th>Jumlah</th>
                    <th>Nama</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  ${groupedData.slice(0, maxItems).map((group, index) => `
                    <tr>
                      <td rowspan="${group.items.length + 1}">${index + 1}</td>
                      <td rowspan="${group.items.length + 1}">${group.kerja}</td>
                      <td rowspan="${group.items.length + 1}">${group.jumlah}</td>
                    </tr>
                    ${group.items.map((item, subIndex) => `
                      <tr>
                        <td>${subIndex + 1}. <span class="font-bold">${item.nama}</span> / ${item.npa}</td>
                        <td class="vertical-text">
                            <div>KTA Digital : ${item.anggota}</div>
                            <div>Daspen : ${item.pgri}</div>
                            <div>Sanduka : </div>
                        </td>
                      </tr>
                    `).join('')}
                  `).join('')}
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

    const groupedData = [];
    const groupByKerja = filteredData.reduce((acc, item) => {
        if (!acc[item.kerja]) {
            acc[item.kerja] = [];
        }
        acc[item.kerja].push(item);
        return acc;
    }, {});

    for (const [kerja, items] of Object.entries(groupByKerja)) {
        groupedData.push({ kerja, jumlah: items.length, items });
    }

    return (
        <div className="min-h-screen bg-gray-50 p-2 md:p-6">
            <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
                <div className="container mx-auto">
                    <h1 className="text-xl md:text-3xl font-extrabold">
                        KEANGGOTAAN BY NAME
                    </h1>
                    {/* <nav className="mt-4">
                        <ul className="flex flex-wrap space-x-4 md:space-x-6">
                            <li className="cursor-pointer">
                                <Link href="/anggota/data-anggota">Data Anggota</Link>
                            </li>
                            <li className="cursor-pointer">
                                <Link href="/anggota/data-anggota/by-name">Data By Name</Link>
                            </li>
                        </ul>
                    </nav> */}
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
                        </select>
                        <select
                            className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
                            value={selectedUnitKerja}
                            onChange={(e) => setSelectedUnitKerja(e.target.value)}
                        >
                            <option>-- Unit Kerja --</option>
                            <option>SMAN 2 Jepara</option>
                            <option>SDN 3 Jepara</option>
                        </select>
                        <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
                            <option>Semua</option>
                        </select>
                    </div>
                    <p className="text-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto">
                        Data Anggota By Name
                    </p>
                    <div className="flex items-end w-full md:w-auto mt-2 md:mt-0">
                        <div className="space-x-2 w-full flex md:block">
                            <label htmlFor="maxItems" className="mr-2">Tampilkan :</label>
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
                            <th className="p-2 md:p-3 border text-white bg-green-700">Unit Kerja
                                {/* {selectedCabang === "-- Cabang --" ? "Cabang" : `Unit Kerja ${selectedCabang}`} */}
                            </th>
                            <th className="p-2 md:p-3 border text-white bg-green-700">Jumlah</th>
                            <th className="p-2 md:p-3 border text-white bg-green-700">Nama</th>
                            <th className="p-2 md:p-3 border text-white bg-green-700">Keterangan</th>
                            <th className="p-2 md:p-3 border text-white bg-green-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedData.slice(0, maxItems).map((group, index) => (
                            <tr key={index}>
                                <td className="border text-center">{index + 1}</td>
                                <td className="border text-center">{group.kerja}</td>
                                <td className="border text-center">{group.jumlah}</td>
                                <td className="border">
                                    {group.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`mb-1 justify-center py-6 pl-2 ${index < group.items.length - 1 ? 'border-b' : ''}`}
                                        >
                                            {index + 1}. <span className="font-bold">{item.nama}</span> / {item.npa}
                                        </div>
                                    ))}
                                </td>
                                <td className="border">
                                    {group.items.map((item, index) => (
                                        <div key={index} className={`mb-1 pl-2 ${index < group.items.length - 1 ? 'border-b' : ''}`}
                                        >
                                            <div>KTA Digital : {item.anggota}</div>
                                            <div>Daspen : {item.pgri}</div>
                                            <div>Sanduka : </div>
                                        </div>
                                    ))}
                                </td>
                                <td className="p-2 md:p-3 border text-center">
                                    <Link href="#" className="text-blue-500">
                                        <div className="flex flex-col space-y-2 items-center">
                                            <Button className="w-24 bg-blue-500">Edit</Button>
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
