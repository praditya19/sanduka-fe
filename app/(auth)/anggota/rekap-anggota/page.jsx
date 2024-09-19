"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { membersData } from "../data.js";
import { useRouter } from "next/navigation";
import HeaderHome from "@/app/_components/HeaderHome";
import  HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";

function formatRupiah(angka) {
  if (isNaN(angka)) return "Rp. 0";
  var reverse = angka.toString().split("").reverse().join(""),
    ribuan = reverse.match(/\d{1,3}/g);
  ribuan = ribuan.join(".").split("").reverse().join("");
  return "Rp. " + ribuan;
}

function RekapAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const [selectedCabang, setSelectedCabang] = useState("-- Cabang --");
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  const aggregateData = () => {
    const filteredData =
      selectedCabang === "-- Cabang --"
        ? membersData
        : membersData.filter((member) => member.cabang === selectedCabang);

    const aggregated = {
      JumlahPNS: 0,
      JumlahPPPK: 0,
      JumlahNonPNS: 0,
      JumlahSemua: filteredData.length,
    };

    const aggregatedByUnitKerja = {};
    filteredData.forEach((item) => {
      if (!aggregatedByUnitKerja[item.kerja]) {
        aggregatedByUnitKerja[item.kerja] = {
          PNS: 0,
          PPPK: 0,
          NonPNS: 0,
          anggota: 0,
          Iuran: 0,
        };
      }
      switch (item.status) {
        case "PNS":
          aggregated.JumlahPNS++;
          aggregatedByUnitKerja[item.kerja].PNS++;
          break;
        case "PPPK":
          aggregated.JumlahPPPK++;
          aggregatedByUnitKerja[item.kerja].PPPK++;
          break;
        case "Non PNS":
          aggregated.JumlahNonPNS++;
          aggregatedByUnitKerja[item.kerja].NonPNS++;
          break;
        default:
          break;
      }
      aggregatedByUnitKerja[item.kerja].anggota++;
      aggregatedByUnitKerja[item.kerja].Iuran += item.iuran;
    });

    return {
      aggregated,
      aggregatedByUnitKerja: Object.entries(aggregatedByUnitKerja).map(
        ([kerja, data], index) => ({
          kerja,
          ...data,
          index,
        })
      ),
    };
  };

  const { aggregated, aggregatedByUnitKerja } = aggregateData();
  const { JumlahPNS, JumlahPPPK, JumlahNonPNS, JumlahSemua } = aggregated;

  const totalIuran = formatRupiah(
    aggregatedByUnitKerja.reduce((total, item) => total + item.Iuran, 0)
  );

  const handlePrint = () => {
    const filteredDataForPrint =
      selectedCabang === "-- Cabang --"
        ? aggregatedByUnitKerja
        : aggregatedByUnitKerja.filter(
            (item) => item.cabang === selectedCabang
          );

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
              </style>
            </head>
            <body>
              <div class="title">Data Anggota</div>
              <table>
                <thead>
                  <tr class="header-row">
                    <th rowSpan="2">No</th>
                    <th rowSpan="2">Unit Kerja</th>
                    <th colSpan="3">Status Anggota</th>
                    <th rowSpan="2">Jumlah</th>
                    <th rowSpan="2">Iuran</th>
                  </tr>
                  <tr>
                    <th>PNS</th>
                    <th>PPPK</th>
                    <th>Non PNS</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredDataForPrint
                    .slice(0, maxItems)
                    .map(
                      (item, index) => `
                    <tr class="${index % 2 === 0 ? "bg-gray-50" : "bg-white"}">
                      <td>${index + 1}</td>
                      <td>${item.kerja}</td>
                      <td>${item.PNS}</td>
                      <td>${item.PPPK}</td>
                      <td>${item.NonPNS}</td>
                      <td>${item.anggota}</td>
                      <td>${formatRupiah(item.Iuran)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2">Jumlah :</td>
                    <td>${JumlahPNS}</td>
                    <td>${JumlahPPPK}</td>
                    <td>${JumlahNonPNS}</td>
                    <td>${JumlahSemua}</td>
                    <td>${totalIuran}</td>
                  </tr>
                  <tr>
                    <td colSpan="2">Total Sumbangan :</td>
                    <td colSpan="5">${totalIuran}</td>
                  </tr>
                </tfoot>
              </table>
            </body>
          </html>
        `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? (
        <HeaderMobile />
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="mb-4">
            <div className="flex flex-wrap items-start mt-14 justify-between">
              <div className="flex flex-wrap items-center space-x-2">
                <select
                  className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
                  value={selectedCabang}
                  onChange={(e) => setSelectedCabang(e.target.value)}
                >
                  <option>-- Cabang --</option>
                  <option>BANGSRI</option>
                  <option>JEPARA</option>
                </select>
                <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
                  <option>-- Unit Kerja --</option>
                  {/* Add options dynamically if available */}
                </select>
                <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
                  <option>Semua</option>
                </select>
                <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option>Bulan</option>
                  {/* Add options dynamically if available */}
                </select>
                <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option>Tahun</option>
                  {/* Add options dynamically if available */}
                </select>
              </div>
              <div className="flex items-end mt-2 md:mt-0">
                <div className="mb-4 space-x-2">
                  <label htmlFor="maxItems" className="mr-2">
                    Tampilkan:
                  </label>
                  <select
                    id="maxItems"
                    value={maxItems}
                    onChange={(e) => setMaxItems(parseInt(e.target.value))}
                    className="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                  <Button
                    className="px-8"
                    variant="outline"
                    onClick={handlePrint}
                  >
                    Cetak
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="container w-full table-auto mb-8">
              <thead>
                <tr>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    No
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    Unit Kerja
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    colSpan="3"
                  >
                    Keuangan
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    Jumlah
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    Iuran
                  </th>
                </tr>
                <tr>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    PGRI
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    Sanduka
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    DASPEN
                  </th>
                </tr>
              </thead>
              <tbody>
                {aggregatedByUnitKerja.slice(0, maxItems).map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="p-2 md:p-3 border text-center">
                      {index + 1}
                    </td>
                    <td className="p-2 md:p-3 border">{item.kerja}</td>
                    <td className="p-2 md:p-3 border text-center">
                      {item.PNS}
                    </td>
                    <td className="p-2 md:p-3 border text-center">
                      {item.PPPK}
                    </td>
                    <td className="p-2 md:p-3 border text-center">
                      {item.NonPNS}
                    </td>
                    <td className="p-2 md:p-3 border text-center">
                      {item.anggota}
                    </td>
                    <td className="p-2 md:p-3 border text-center">
                      {formatRupiah(item.Iuran)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="2"
                    className="p-2 md:p-3 border bg-green-200 text-left"
                  >
                    Jumlah :
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    {JumlahPNS}
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    {JumlahPPPK}
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    {JumlahNonPNS}
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    {JumlahSemua}
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    {totalIuran}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="2"
                    className="p-2 md:p-3 border bg-green-200 text-left"
                  >
                    Total Sumbangan :
                  </td>
                  <td
                    colSpan="5"
                    className="p-2 md:p-3 border bg-green-200 text-left"
                  >
                    {totalIuran}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RekapAnggota;