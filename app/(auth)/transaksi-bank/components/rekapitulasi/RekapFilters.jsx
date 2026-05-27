import React from "react";
import { Input } from "@/components/ui/input";

const RekapFilters = ({
  selectedCabang,
  handleCabangClick,
  showCabangDropdown,
  handleSelectCabang,
  filteredCabangList,
  cabangRef,
  handleCabangSearch,
  role,
  bulanList,
  month,
  setMonth,
  tahunList,
  year,
  setYear,
  paymentNote,
  setPaymentNote,
  Input: InputComponent,
}) => {
  return (
    <div className="p-6 bg-gray-50 border-b border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cabang
          </label>
          <div className="flex items-center relative" ref={cabangRef}>
            <Input
              type="text"
              value={selectedCabang}
              readOnly
              disabled={role === "ADMIN"}
              onClick={handleCabangClick}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
              placeholder="Pilih Cabang"
            />
            {showCabangDropdown && (
              <div
                className="absolute z-50 border rounded-lg bg-white shadow-sm mt-1 w-full"
                style={{ top: "100%", left: 0 }}
              >
                <ul className="max-h-44 overflow-y-auto">
                  <li className="py-2 px-2">
                    <Input
                      type="text"
                      onChange={(e) => handleCabangSearch(e.target.value)}
                      className="block w-full px-4 py-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                      placeholder="Cari atau ketik Cabang..."
                      autoFocus
                    />
                  </li>
                  <li
                    onClick={() => handleSelectCabang({ kecamatan: "" })}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                  >
                    Pilih Cabang
                  </li>
                  {[...filteredCabangList]
                    .sort((a, b) =>
                      a.kecamatan.localeCompare(b.kecamatan, "id"),
                    )
                    .map((cabang) => (
                      <li
                        key={cabang.id}
                        onClick={() => handleSelectCabang(cabang)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      >
                        {cabang.kecamatan}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bulan Transaksi
          </label>
          <select
            className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {bulanList.map((bulan) => (
              <option key={bulan.value} value={bulan.value}>
                {bulan.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tahun Transaksi
          </label>
          <select
            className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {tahunList.map((tahun) => (
              <option key={tahun.value} value={tahun.value}>
                {tahun.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ket. Pembayaran
          </label>
          <select
            className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
          >
            <option value="">Pilih Keterangan</option>
            <option value="Sukses">Sukses</option>
            <option value="Gagal">Gagal</option>
            <option value="Tunai">Tunai</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RekapFilters;
