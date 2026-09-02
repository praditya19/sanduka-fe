import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FaEdit, FaTrash, FaFileInvoiceDollar, FaCheckCircle } from "react-icons/fa";

const BalancingTable = ({
  loadingBalancing,
  sortedData,
  dataBalancing,
  sortConfig,
  handleSort,
  cekRole,
  updatedId,
  updatedRowRef,
  formatRupiah,
  setSelectedId,
  setShowDeletePopup,
  handleEditClick,
  handleLunasClick,
  month,
  year,
  setSelectedNpa,
  setSelectedBulan,
  setSelectedTahun,
  setShowTagihanModal,
  posLainLainName,
}) => {
  const [startIndex, setStartIndex] = useState(0);

  const rowHeight = 60;
  const visibleCount = 30;
  const visibleData = useMemo(() => {
    return sortedData.slice(startIndex, startIndex + visibleCount);
  }, [sortedData, startIndex]);
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const newStartIndex = Math.floor(scrollTop / rowHeight);

    if (newStartIndex !== startIndex) {
      setStartIndex(newStartIndex);
    }
  };
  return (
    <div>
      {loadingBalancing ? (
        <div className="w-full bg-white rounded-2xl border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-3 w-3 bg-teal-500 rounded-full animate-bounce"></div>
              <div className="h-3 w-3 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="h-3 w-3 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <p className="text-gray-700 font-semibold text-base">
              Memuat Data...
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Silakan tunggu, data sedang diproses
            </p>
          </div>
        </div>
      ) : (
        <div
          className="bg-white rounded-2xl border border-gray-200"
          style={{ height: "500px", overflowY: "auto" }}
          onScroll={handleScroll}
        >
          <div
            style={{
              height: sortedData.length * rowHeight,
              position: "relative",
            }}
          >
            <table
              className="text-sm absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${startIndex * rowHeight}px)`,
              }}
            >
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                    No
                  </th>

                  {[
                    { key: "cabang", label: "Cabang" },
                    { key: "unitKerja", label: "Unit Kerja" },
                    { key: "nama", label: "Nama" },
                    { key: "rekening", label: "Rekening" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors duration-150 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {sortConfig.key === key && (
                          <span className="text-teal-300">
                            {sortConfig.direction === "desc" ? "▼" : "▲"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>

                  {[
                    { key: "totalIuranAnggota", label: "Iuran PGRI" },
                    { key: "totalIuranSanduka", label: "Sanduka" },
                    { key: "totalIuranDaspen", label: "Daspen" },
                    { key: "totalIuranDerap", label: "Derap" },
                    { key: "totalIuranKalender", label: "Kalender" },
                    {
                      key: "totalIuranSumbangan",
                      label: posLainLainName ? `Lain-Lain (${posLainLainName})` : "Lain-Lain",
                    },
                    { key: "totalIuran", label: "Total Keuangan" },
                    { key: "potongan", label: "Potongan" },
                    { key: "selisih", label: "Selisih" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors duration-150 whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end gap-1">
                        {label}
                        {sortConfig.key === key && (
                          <span className="text-teal-300">
                            {sortConfig.direction === "desc" ? "▼" : "▲"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                    Keterangan
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {sortedData.length > 0 ? (
                  visibleData.map((item, index) => (
                    <tr
                      key={item.id}
                      ref={item.id === updatedId ? updatedRowRef : null}
                      className={`transition-colors duration-150 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-teal-50/50`}
                    >
                      <td className="px-4 py-3 text-center text-gray-500 text-xs whitespace-nowrap">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3 text-left font-medium text-gray-900 whitespace-nowrap">
                        {item.cabang || "-"}
                      </td>
                      <td className="px-4 py-3 text-left text-gray-700 whitespace-nowrap">
                        {item.unitKerja || "-"}
                      </td>
                      <td className="px-4 py-3 text-left text-gray-700 whitespace-nowrap">
                        {item.nama || "-"}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-sm whitespace-nowrap">
                        {item.rekening || "-"}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.statusPegawai === "Aktif"
                              ? "bg-green-100 text-green-800"
                              : item.statusPegawai === "Nonaktif"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.statusPegawai || "-"}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right font-mono text-sm whitespace-nowrap">
                        {formatRupiah(item.totalIuranAnggota)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm whitespace-nowrap">
                        {formatRupiah(item.totalIuranSanduka)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm whitespace-nowrap">
                        {formatRupiah(item.totalIuranDaspen)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm whitespace-nowrap">
                        {formatRupiah(item.totalIuranDerap)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm whitespace-nowrap">
                        {formatRupiah(item.totalIuranKalender)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm whitespace-nowrap">
                        {formatRupiah(item.totalIuranSumbangan)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm font-semibold text-teal-700 whitespace-nowrap">
                        {formatRupiah(item.totalIuran)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-red-600 whitespace-nowrap">
                        {formatRupiah(item.potongan)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm font-semibold whitespace-nowrap">
                        {formatRupiah(item.selisih)}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {item.statusPembayaran === "LUNAS" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ LUNAS
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.keterangan === "Sukses"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.keterangan === "Tunai"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.keterangan || "-"}
                          </span>
                        </div>
                      </td>

                      {(cekRole === "SUPERADMIN" || cekRole === "ADMIN") && (
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {/* Tombol Set Lunas (Tampil jika belum lunas) */}
                            {item.statusPembayaran !== "LUNAS" && (
                              <button
                                onClick={() => handleLunasClick?.(item)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                                title="Tandai Lunas"
                              >
                                <FaCheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Khusus SUPERADMIN */}
                            {cekRole === "SUPERADMIN" && (
                              <>
                                <button
                                  onClick={() => handleEditClick(item.id)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                  title="Edit"
                                >
                                  <FaEdit className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedId(item.id);
                                    setShowDeletePopup(true);
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                                  title="Hapus"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {/* SUPERADMIN & ADMIN */}
                            <button
                              onClick={() => {
                                setSelectedNpa(item.npa);
                                setSelectedBulan(month);
                                setSelectedTahun(year);
                                setShowTagihanModal(true);
                              }}
                              className="text-teal-600 hover:text-teal-800 text-xl md:text-lg p-2 md:p-1 hover:bg-teal-50 rounded-full md:rounded transition-colors border md:border-0"
                              title="Tagihan"
                            >
                              <FaFileInvoiceDollar />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={cekRole === "SUPERADMIN" ? 16 : 15}
                      className="px-4 py-12 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="text-gray-300 text-4xl mb-3"
                        />
                        <p className="text-gray-500 font-medium">
                          Tidak ada data
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Silakan coba filter yang lain
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

              {sortedData.length > 0 && (
                <tfoot className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-3 text-center font-semibold text-sm whitespace-nowrap"
                    >
                      Total Keseluruhan
                    </td>

                    {[
                      "totalIuranAnggota",
                      "totalIuranSanduka",
                      "totalIuranDaspen",
                      "totalIuranDerap",
                      "totalIuranKalender",
                      "totalIuranSumbangan",
                      "totalIuran",
                      "potongan",
                      "selisih",
                    ].map((key) => (
                      <td
                        key={key}
                        className="px-3 py-3 text-right font-mono text-sm font-semibold whitespace-nowrap"
                      >
                        {formatRupiah(
                          (dataBalancing || []).reduce(
                            (sum, item) => sum + (item[key] || 0),
                            0,
                          ),
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3"></td>

                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalancingTable;
