import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const RekapTable = ({ dataRekapitulasi, formatRupiah }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-[#0B131E] via-[#0B131E] to-[#0B131E] shadow-md">
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              No
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Cabang
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Unit Kerja
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Iuran
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Sanduka
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Daspen
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Derap
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Kalender
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Lain-lain
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Total Keuangan
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Potongan Bank
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Selisih
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
              Juml. Anggota
            </th>
          </tr>
        </thead>
        <tbody>
          {dataRekapitulasi.length > 0 ? (
            dataRekapitulasi.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 border-b">
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-center">
                  {index + 1}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                  {item.cabang}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                  {item.unitKerja}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                  {formatRupiah(item.iuran)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                  {formatRupiah(item.sanduka)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                  {formatRupiah(item.daspen)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                  {formatRupiah(item.derap)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                  {formatRupiah(item.kalender)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                  {formatRupiah(item.lainLain)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-900 text-right bg-blue-50">
                  {formatRupiah(item.totalIuran)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                  {formatRupiah(item.potonganBank)}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap text-xs font-semibold text-right ${
                    item.selisih >= 0
                      ? "text-green-600 bg-green-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {formatRupiah(item.selisih)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-center">
                  {item.jumlahAnggota}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={13}
                className="px-6 py-8 text-center text-sm text-gray-500 border-b"
              >
                <div className="flex flex-col items-center justify-center">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-gray-300 text-4xl mb-3"
                  />
                  <p>
                    Tidak ada data rekapitulasi yang cocok dengan filter Anda.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RekapTable;
