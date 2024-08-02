"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";

const TableData = [
  {
    IuranPGRI: 6000,
    PBPGRI: 600,
    Provinsi: 1200,
    Kabupaten: 1800,
    CabangRanting: 2400,
    Sanduka: 3000,
  },
  {
    No: 1,
    CabangKhusus: "BANGSRI",
    JumlahAnggota: 439,
    IuranPGRI: 2634000,
    PBPGRI: 263400,
    Provinsi: 526800,
    Kabupaten: 790200,
    CabangRanting: 1053600,
    Sanduka: 1317000,
    TotalSumbangang: 3951000,
  },
  {
    No: 2,
    CabangKhusus: "BATEALIT",
    JumlahAnggota: 467,
    IuranPGRI: 2802000,
    PBPGRI: 280200,
    Provinsi: 560400,
    Kabupaten: 840600,
    CabangRanting: 1120800,
    Sanduka: 1401000,
    TotalSumbangang: 4203000,
  },
  {
    No: 3,
    CabangKhusus: "CABSUS DINAS PENDIDIKAN",
    JumlahAnggota: 182,
    IuranPGRI: 1092000,
    PBPGRI: 109200,
    Provinsi: 218400,
    Kabupaten: 327600,
    CabangRanting: 436800,
    Sanduka: 546000,
    TotalSumbangang: 1638000,
  },
  {
    No: 4,
    CabangKhusus: "CABSUS IGTKI",
    JumlahAnggota: 672,
    IuranPGRI: 4032000,
    PBPGRI: 403200,
    Provinsi: 806400,
    Kabupaten: 1209600,
    CabangRanting: 1612800,
    Sanduka: 2016000,
    TotalSumbangang: 6048000,
  },
  {
    No: 5,
    CabangKhusus: "DONOROJO",
    JumlahAnggota: 336,
    IuranPGRI: 2016000,
    PBPGRI: 201600,
    Provinsi: 403200,
    Kabupaten: 604800,
    CabangRanting: 806400,
    Sanduka: 1008000,
    TotalSumbangang: 3024000,
  },
  {
    No: 6,
    CabangKhusus: "JEPARA",
    JumlahAnggota: 848,
    IuranPGRI: 5088000,
    PBPGRI: 508800,
    Provinsi: 1017600,
    Kabupaten: 1526400,
    CabangRanting: 2035200,
    Sanduka: 2544000,
    TotalSumbangang: 7632000,
  },
  {
    No: 7,
    CabangKhusus: "KALINYAMATAN",
    JumlahAnggota: 377,
    IuranPGRI: 2262000,
    PBPGRI: 226200,
    Provinsi: 452400,
    Kabupaten: 678600,
    CabangRanting: 904800,
    Sanduka: 1131000,
    TotalSumbangang: 3393000,
  },
  {
    No: 8,
    CabangKhusus: "KARIMUNJAWA",
    JumlahAnggota: 127,
    IuranPGRI: 762000,
    PBPGRI: 76200,
    Provinsi: 152400,
    Kabupaten: 228600,
    CabangRanting: 304800,
    Sanduka: 381000,
    TotalSumbangang: 1143000,
  },
  {
    No: 9,
    CabangKhusus: "KEDUNG",
    JumlahAnggota: 330,
    IuranPGRI: 1980000,
    PBPGRI: 198000,
    Provinsi: 396000,
    Kabupaten: 594000,
    CabangRanting: 792000,
    Sanduka: 990000,
    TotalSumbangang: 2970000,
  },
  {
    No: 10,
    CabangKhusus: "KELING",
    JumlahAnggota: 269,
    IuranPGRI: 1614000,
    PBPGRI: 161400,
    Provinsi: 322800,
    Kabupaten: 484200,
    CabangRanting: 645600,
    Sanduka: 807000,
    TotalSumbangang: 2421000,
  },
  {
    No: 11,
    CabangKhusus: "KEMBANG",
    JumlahAnggota: 440,
    IuranPGRI: 2640000,
    PBPGRI: 264000,
    Provinsi: 528000,
    Kabupaten: 792000,
    CabangRanting: 1056000,
    Sanduka: 1320000,
    TotalSumbangang: 3960000,
  },
  {
    No: 12,
    CabangKhusus: "MAYONG",
    JumlahAnggota: 325,
    IuranPGRI: 1950000,
    PBPGRI: 195000,
    Provinsi: 390000,
    Kabupaten: 585000,
    CabangRanting: 780000,
    Sanduka: 975000,
    TotalSumbangang: 2925000,
  },
  {
    No: 13,
    CabangKhusus: "MLONGGO",
    JumlahAnggota: 273,
    IuranPGRI: 1638000,
    PBPGRI: 163800,
    Provinsi: 327600,
    Kabupaten: 491400,
    CabangRanting: 655200,
    Sanduka: 819000,
    TotalSumbangang: 2457000,
  },
  {
    No: 14,
    CabangKhusus: "NALUMSARI",
    JumlahAnggota: 402,
    IuranPGRI: 2412000,
    PBPGRI: 241200,
    Provinsi: 482400,
    Kabupaten: 723600,
    CabangRanting: 964800,
    Sanduka: 1206000,
    TotalSumbangang: 3618000,
  },
  {
    No: 15,
    CabangKhusus: "PAKIS AJI",
    JumlahAnggota: 268,
    IuranPGRI: 1608000,
    PBPGRI: 160800,
    Provinsi: 321600,
    Kabupaten: 482400,
    CabangRanting: 643200,
    Sanduka: 804000,
    TotalSumbangang: 2412000,
  },
  {
    No: 16,
    CabangKhusus: "PECANGAAN",
    JumlahAnggota: 333,
    IuranPGRI: 1998000,
    PBPGRI: 199800,
    Provinsi: 399600,
    Kabupaten: 599400,
    CabangRanting: 799200,
    Sanduka: 999000,
    TotalSumbangang: 2997000,
  },
  {
    No: 17,
    CabangKhusus: "TAHUNAN",
    JumlahAnggota: 380,
    IuranPGRI: 2280000,
    PBPGRI: 228000,
    Provinsi: 456000,
    Kabupaten: 684000,
    CabangRanting: 912000,
    Sanduka: 1140000,
    TotalSumbangang: 3420000,
  },
  {
    No: 18,
    CabangKhusus: "WELAHAN",
    JumlahAnggota: 482,
    IuranPGRI: 2892000,
    PBPGRI: 289200,
    Provinsi: 578400,
    Kabupaten: 867600,
    CabangRanting: 1156800,
    Sanduka: 1446000,
    TotalSumbangang: 4338000,
  },
  {
    No: "",
    CabangKhusus: "JUMLAH",
    JumlahAnggota: 6950,
    IuranPGRI: 41700000,
    PBPGRI: 4170000,
    Provinsi: 8340000,
    Kabupaten: 12510000,
    CabangRanting: 16680000,
    Sanduka: 20850000,
    TotalSumbangang: 62550000,
  },
];

export default function Iuran() {
  const [iuranPB, setIuranPB] = useState(600);
  const [iuranProvinsi, setIuranProvinsi] = useState(1200);
  const [iuranKabupaten, setIuranKabupaten] = useState(1800);
  const [iuranCabang, setIuranCabang] = useState(2400);
  const [sumbanganSanduka, setSumbanganSanduka] = useState(3000);
  const [totalIuran, setTotalIuran] = useState(6000);
  const [totalSumbangan, setTotalSumbangan] = useState(9000);
  const [filteredData, setFilteredData] = useState(TableData);

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

  const handlePrint = () => {
    const filteredDataForPrint = filteredData.filter((item) => item.No);
    const totals = filteredDataForPrint.reduce(
      (acc, item) => {
        acc.IuranPGRI += item.IuranPGRI || 0;
        acc.Sanduka += item.Sanduka || 0;
        acc.TotalSumbangang += item.TotalSumbangang || 0;
        return acc;
      },
      {
        IuranPGRI: 0,
        Sanduka: 0,
        TotalSumbangang: 0,
      }
    );

    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Rekapitulasi Target Sumbangan</title>
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
          .period {
            text-align: center;
            font-size: 18px;
            font-weight: normal;
            color: #333;
            margin-bottom: 20px;
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
          <div class="title">Rekapitulasi Target Sumbangan</div>
          <div class="subtitle">ANGGOTA PGRI DAN SANDUKA</div>
          <div class="period">Kabupaten Jepara<br>Bulan Target: Juli 2024</div>
          <table>
            <thead>
              <tr class="header-row">
                <th rowspan="2">No</th>
                <th rowspan="2">Kecamatan / Unit Khusus</th>
                <th colspan="2">Sumbangan</th>
                <th rowspan="2">Jumlah</th>
              </tr>
              <tr class="header-row">
                <th>PGRI</th>
                <th>Sanduka</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDataForPrint
                .map(
                  (item) => `
                  <tr>
                    <td>${item.No || ""}</td>
                    <td>${item.CabangKhusus || ""}</td>
                    <td>${formatRupiah(item.IuranPGRI) || ""}</td>
                    <td>${formatRupiah(item.Sanduka) || ""}</td>
                    <td>${formatRupiah(item.TotalSumbangang) || ""}</td>
                  </tr>
                `
                )
                .join("")}
              <tr class="total-row">
                <td colspan="2">JUMLAH</td>
                <td>${formatRupiah(totals.IuranPGRI)}</td>
                <td>${formatRupiah(totals.Sanduka)}</td>
                <td>${formatRupiah(totals.TotalSumbangang)}</td>
              </tr>
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

  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-5 text-center">
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
            <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-1 text-center">
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
              <select className="shadow appearance-none border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>-- Cabang --</option>
              </select>
              <select className="shadow appearance-none border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>-- Bulan --</option>
              </select>
              <select className="shadow appearance-none border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
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

      <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
          <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5">
            <select className="shadow-lg border rounded w-1/2 sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
              <option>Tampil Semua</option>
            </select>
            <select className="shadow-lg border rounded w-1/2 sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
              <option>Juli</option>
              <option>Agustus</option>
              <option>September</option>
            </select>
            <select className="shadow-lg border rounded w-1/2 sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
              <option>2023</option>
              <option>2024</option>
              <option>2025</option>
            </select>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0 mt-4">
            Transaksi Juli 2024
          </h1>
          <Button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded transition duration-300 ease-in-out mt-3 mr-6 w-24"
            onClick={handlePrint}
          >
            Cetak
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto border-collapse border border-gray-300 bg-white rounded-lg shadow-lg">
          <thead className="text-sm text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="border px-6 py-3">No</th>
              <th className="border px-6 py-3">Cabang/Khusus</th>
              <th className="border px-6 py-3">Jumlah Anggota</th>
              <th className="border px-6 py-3">Iuran PGRI</th>
              <th className="border px-6 py-3">PB. PGRI</th>
              <th className="border px-6 py-3">Provinsi</th>
              <th className="border px-6 py-3">Kabupaten</th>
              <th className="border px-6 py-3">Cabang/Ranting</th>
              <th className="border px-6 py-3">Sanduka</th>
              <th className="border px-6 py-3">Total Sumbangan</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={`${item.No}`}
                className={`transition duration-200 ease-in-out ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } ${item.CabangKhusus === "JUMLAH" ? "font-bold" : ""}`}
              >
                <td className="border px-6 py-4">{item.No}</td>
                <td className="border px-6 py-4">{item.CabangKhusus}</td>
                <td className="border px-6 py-4">{item.JumlahAnggota}</td>
                <td className="border px-6 py-4">
                  {formatRupiah(item.IuranPGRI)}
                </td>
                <td className="border px-6 py-4">
                  {formatRupiah(item.PBPGRI)}
                </td>
                <td className="border px-6 py-4">
                  {formatRupiah(item.Provinsi)}
                </td>
                <td className="border px-6 py-4">
                  {formatRupiah(item.Kabupaten)}
                </td>
                <td className="border px-6 py-4">
                  {formatRupiah(item.CabangRanting)}
                </td>
                <td className="border px-6 py-4">
                  {formatRupiah(item.Sanduka)}
                </td>
                <td className="border px-6 py-4">
                  {item.TotalSumbangang
                    ? formatRupiah(item.TotalSumbangang)
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
