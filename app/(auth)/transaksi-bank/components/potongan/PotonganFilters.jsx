import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const PotonganFilters = ({
  month,
  setMonth,
  year,
  setYear,
  searchQuery,
  setSearchQuery,
  bulanList,
  tahunList,
}) => {
  return (
    <div className="p-6 bg-gray-50 border-b border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bulan
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
            Tahun
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
            Cari Anggota/Rekening
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full h-10 text-base px-4 pr-12 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
              placeholder="Ketik nama atau rekening"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PotonganFilters;