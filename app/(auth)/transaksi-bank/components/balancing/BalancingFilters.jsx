import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const BalancingFilters = ({
  cabangRef,
  selectedCabang,
  role,
  showCabangDropdown,
  handleCabangClick,
  handleCabangSearch,
  handleSelectCabang,
  filteredCabangList,
  unitKerjaRef,
  unitKerjaInput,
  handleUnitKerjaChange,
  handleUnitKerjaClick,
  showUnitKerjaDropdown,
  searchUnitKerja,
  handleUnitKerjaSearch,
  handleUnitKerjaSelect,
  filteredUnitKerja,
 loadingUnitKerja,
  selectedCabangValue,
  month,
  setMonth,
  bulanList,
  year,
  setYear,
  tahunList,
  searchBalancing,
  setSearchBalancing,
  paymentNote,
  setPaymentNote,
  Input,
}) => {
  const handleMonthChange = (e) => {
  const value = e.target.value;
  setMonth(value);
  };
  const handleYearChange = (e) => {
  const value = e.target.value;
  setYear(value);
};
  return (
    <div className="p-6 bg-gray-50 border-b border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* CABANG */}
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
              className="block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Pilih Cabang"
            />

            {showCabangDropdown && (
              <div className="absolute z-50 border rounded-lg bg-white shadow-sm mt-1 w-full">
                <ul className="max-h-44 overflow-y-auto">
                  <li className="py-2 px-2">
                    <Input
                      type="text"
                      onChange={(e) => handleCabangSearch(e.target.value)}
                      className="block w-full px-4 py-2 border-gray-300 rounded-md"
                      placeholder="Cari Cabang..."
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

        {/* UNIT KERJA */}
        <div className="relative" ref={unitKerjaRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Kerja
          </label>

          <Input
            type="text"
            value={unitKerjaInput}
            readOnly
            placeholder="Pilih Unit Kerja"
            disabled={!selectedCabang}
            onClick={handleUnitKerjaClick}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
          />

          {showUnitKerjaDropdown && (
  <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-1 w-full">
    <ul className="max-h-44 overflow-y-auto">
      
      {/* SEARCH */}
      <li className="py-2 px-2">
        <Input
          type="text"
          value={searchUnitKerja}
          onChange={(e) => handleUnitKerjaSearch(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md"
          placeholder="Cari Unit Kerja..."
          autoFocus
        />
      </li>

      {/* LOADING */}
      {loadingUnitKerja ? (
        <li className="px-4 py-2 text-gray-400 text-sm">
          Memuat data...
        </li>
      ) : (
        <>
          <li
            onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
          >
            Pilih Unit Kerja
          </li>

          {filteredUnitKerja.length > 0 ? (
            filteredUnitKerja
              .sort((a, b) =>
                a.unitKerja.localeCompare(b.unitKerja, "id")
              )
              .map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleUnitKerjaSelect(item)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  {item.unitKerja}
                </li>
              ))
          ) : (
            <li className="px-4 py-2 text-gray-400 text-sm">
              Tidak ada data
            </li>
          )}
        </>
      )}
    </ul>
  </div>
)}
        </div>

        {/* BULAN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bulan
          </label>
          <select
            className="w-full h-10 px-4 rounded-lg border border-gray-300"
            value={month}
  onChange={handleMonthChange}
          >
            {bulanList.map((bulan) => (
              <option key={bulan.value} value={bulan.value}>
                {bulan.label}
              </option>
            ))}
          </select>
        </div>

        {/* TAHUN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tahun
          </label>
          <select
            className="w-full h-10 px-4 rounded-lg border border-gray-300"
             value={year}
  onChange={handleYearChange}
          >
            {tahunList.map((tahun) => (
              <option key={tahun.value} value={tahun.value}>
                {tahun.label}
              </option>
            ))}
          </select>
        </div>

        {/* SEARCH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cari
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchBalancing}
              onChange={(e) => setSearchBalancing(e.target.value)}
              className="w-full h-10 px-4 pr-12 rounded-lg border border-gray-300"
              placeholder="Nama / Rekening"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
        </div>

        {/* KETERANGAN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keterangan
          </label>
          <select
            className="w-full h-10 px-4 rounded-lg border border-gray-300"
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
          >
            <option value="">Pilih</option>
            <option value="Sukses">Sukses</option>
            <option value="Gagal">Gagal</option>
            <option value="Tunai">Tunai</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BalancingFilters;
