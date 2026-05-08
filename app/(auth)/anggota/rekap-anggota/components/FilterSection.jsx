import React from "react";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";

const FilterSection = ({
  isAdmin,
  selectedCabang,
  handleCabangClick,
  cabangRef,
  showCabangDropdown,
  searchCabang,
  handleCabangSearch,
  handleSelectCabang,
  filteredCabangList,
  unitKerjaRef,
  unitKerjaInput,
  handleUnitKerjaChange,
  handleUnitKerjaFocus,
  handleUnitKerjaClick,
  showUnitKerjaDropdown,
  searchUnitKerja,
  handleUnitKerjaSearch,
  handleUnitKerjaSelect,
  filteredUnitKerja,
  namaAnggotaInput,
  handleNamaAnggotaInputChange,
  handleSearchClick
}) => {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col relative w-64" ref={cabangRef}>
        <p>Cabang</p>
        <Input
          type="text"
          value={selectedCabang}
          readOnly
          onClick={!isAdmin ? handleCabangClick : undefined}
          className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${
            isAdmin ? "bg-gray-100" : ""
          }`}
          placeholder="Pilih Cabang"
          disabled={isAdmin}
        />
        {!isAdmin && showCabangDropdown && (
          <div className="absolute z-50 border rounded-lg bg-white shadow-sm mt-16 w-full">
            <ul className="max-h-44 overflow-y-auto">
              <li className="py-2 px-2">
                <Input
                  type="text"
                  value={searchCabang}
                  onChange={(e) => handleCabangSearch(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                  placeholder="Cari Cabang..."
                  autoFocus
                />
              </li>
              <li
                onClick={() => handleSelectCabang({ kecamatan: "" })}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                Pilih Cabang
              </li>
              {filteredCabangList.map((cabang) => (
                <li
                  key={cabang.id}
                  onClick={() => handleSelectCabang(cabang)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {cabang.kecamatan}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
        <p>Unit Kerja</p>
        <Input
          type="text"
          value={unitKerjaInput}
          onChange={handleUnitKerjaChange}
          onFocus={handleUnitKerjaFocus}
          placeholder="Pilih Unit Kerja"
          className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
          disabled={!selectedCabang}
          onClick={handleUnitKerjaClick}
        />
        {showUnitKerjaDropdown && (
          <div className="absolute z-50 border rounded-lg bg-white shadow-sm mt-16 w-full">
            <ul className="max-h-44 overflow-y-auto">
              <li className="py-2 px-2">
                <Input
                  type="text"
                  value={searchUnitKerja}
                  onChange={(e) =>
                    handleUnitKerjaSearch(e.target.value)
                  }
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                  placeholder="Cari Unit Kerja..."
                  autoFocus
                />
              </li>
              <li
                onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                Pilih Unit Kerja
              </li>
              {filteredUnitKerja.map((unitKerja) => (
                <li
                  key={unitKerja.id}
                  onClick={() => handleUnitKerjaSelect(unitKerja)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  {unitKerja.unitKerja}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-col relative w-64">
        <div className="relative">
          <p>Nama Anggota</p>
          <Input
            type="text"
            value={namaAnggotaInput}
            onChange={handleNamaAnggotaInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border pr-10"
            placeholder="Nama anggota..."
          />
          <button
            onClick={handleSearchClick}
            className="absolute right-2 top-12 transform -translate-y-1/2 text-teal-600 hover:text-teal-800"
          >
            <FaSearch />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
