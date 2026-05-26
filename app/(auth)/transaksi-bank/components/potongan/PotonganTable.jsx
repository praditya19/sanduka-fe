import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const PotonganTable = ({
  data,
  loadingFilter,
  currentPage,
  displayCount,
  formatRupiah,
  formatTanggal,
}) => {
  return (
    <table className="min-w-full">
      <thead className="sticky top-0 z-10">
        <tr className="bg-gradient-to-r from-[#0B131E] via-[#0B131E] to-[#0B131E] shadow-md">
          <th className="px-6 py-3 text-center text-[11px] font-semibold text-white">
            No
          </th>
          <th className="px-6 py-3 text-center text-[11px] font-semibold text-white">
            Rekening
          </th>
          <th className="px-6 py-3 text-center text-[11px] font-semibold text-white">
            Nama Anggota
          </th>
          <th className="px-6 py-3 text-center text-[11px] font-semibold text-white">
            Rekening Kabupaten
          </th>
          <th className="px-6 py-3 text-center text-[11px] font-semibold text-white">
            Potongan
          </th>
          <th className="px-6 py-3 text-center text-[11px] font-semibold text-white">
            Tgl. Potongan
          </th>
          <th className="px-6 py-3 text-center text-[11px] font-semibold text-white">
            Transaksi
          </th>
        </tr>
      </thead>

      <tbody>
        {loadingFilter ? (
          <>
            <tr>
              <td colSpan="7" className="p-6 text-center">
                <p>Data sedang diproses...</p>
              </td>
            </tr>

            {Array.from({ length: 4 }).map((_, idx) => (
              <tr key={idx}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <td key={i} className="p-3 border-b">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </>
        ) : data.length > 0 ? (
          data.map((item, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
            >
              <td className="px-6 py-4 text-center text-sm">
                {(currentPage - 1) * displayCount + index + 1}
              </td>
              <td className="px-6 py-4 text-center text-sm">
                {item.rekening}
              </td>
              <td className="px-6 py-4 text-sm">{item.namaAnggota}</td>
              <td className="px-6 py-4 text-center text-sm">
                {item.rekeningKabupaten}
              </td>
              <td className="px-6 py-4 text-center text-sm">
                {formatRupiah(item.potongan)}
              </td>
              <td className="px-6 py-4 text-center text-sm">
                {formatTanggal(item.tanggalPemotongan)}
              </td>
              <td className="px-6 py-4 text-center text-sm">
                {item.transaksi}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
              <FontAwesomeIcon icon={faSearch} className="text-3xl mb-2" />
              <p>Tidak ada data</p>
            </td>
          </tr>
        )}
      </tbody>

      <tfoot>
        <tr className="bg-[#0B131E] text-white font-semibold">
          <td colSpan={4} className="text-center py-4">
            Total
          </td>
          <td className="text-center">
            {formatRupiah(
              data.reduce((sum, item) => sum + item.potongan, 0)
            )}
          </td>
          <td></td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  );
};

export default PotonganTable;