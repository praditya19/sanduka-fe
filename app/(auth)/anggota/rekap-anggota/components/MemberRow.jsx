import React from "react";
import { FaEdit, FaPrint, FaFileInvoiceDollar } from "react-icons/fa";

const MemberRow = React.memo(({
  member,
  rowIndex,
  lastUpdatedMemberNip,
  lastUpdatedMemberRef,
  filesDataMap,
  formatTanggal,
  handleMemberClick,
  handlePrintClick,
  handleTagihanClick
}) => {
  return (
    <tr
      key={`${member.unitKerja}-${member.npaPgri}-${member.namaAnggota}`}
      className={`flex flex-col md:table-row mb-4 md:mb-0 border md:border-0 rounded-lg md:rounded-none overflow-hidden shadow-sm md:shadow-none ${rowIndex % 2 === 0 ? "bg-white" : "bg-teal-50"}`}
      ref={member.nip === lastUpdatedMemberNip ? lastUpdatedMemberRef : null}
    >
      <td className="p-3 md:border-b text-left md:text-center flex justify-between items-center md:table-cell">
        <span className="md:hidden font-bold text-teal-600 uppercase text-xs">No</span>
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-semibold text-xs">
          {rowIndex + 1}
        </div>
      </td>
      <td className="p-3 md:border-b flex justify-between items-center md:table-cell border-b md:border-b-0 border-teal-50">
        <span className="md:hidden font-bold text-teal-600 uppercase text-xs">Cabang</span>
        <span className="text-sm">{member.cabang}</span>
      </td>
      <td className="p-3 md:border-b flex justify-between items-center md:table-cell border-b md:border-b-0 border-teal-50">
        <span className="md:hidden font-bold text-teal-600 uppercase text-xs">Unit Kerja</span>
        <span className="text-sm font-medium">{member.unitKerja}</span>
      </td>
      <td className="p-3 md:border-b flex flex-col md:table-cell border-b md:border-b-0 border-teal-50">
        <span className="md:hidden font-bold text-teal-600 uppercase text-xs mb-1">Nama Anggota</span>
        <div className="font-medium text-sm">{member.namaAnggota}</div>
        <div className="text-xs text-gray-600">{member.nip}</div>
        <div className="text-xs text-gray-600">{member.nomorRekening}</div>
        <div className="text-xs text-gray-600 italic mt-1">
          Update: {formatTanggal(member.lastUpdatedAtIuran, "DMY")}
        </div>
      </td>
      <td className="p-3 md:border-b flex justify-between items-center md:table-cell border-b md:border-b-0 border-teal-50">
        <span className="md:hidden font-bold text-teal-600 uppercase text-xs">PGRI</span>
        <span className="text-sm md:text-right block w-full md:w-auto">
          Rp. {parseInt(member.pgri || 0).toLocaleString("id-ID")}
        </span>
      </td>
      <td className="p-3 md:border-b flex justify-between items-center md:table-cell border-b md:border-b-0 border-teal-50">
        <span className="md:hidden font-bold text-teal-600 uppercase text-xs">Sanduka</span>
        <span className="text-sm md:text-right block w-full md:w-auto">
          Rp. {parseInt(member.sanduka || 0).toLocaleString("id-ID")}
        </span>
      </td>
      <td className="p-3 md:border-b flex justify-between items-start md:table-cell border-b md:border-b-0 border-teal-50">
        <span className="md:hidden font-bold text-teal-600 uppercase text-xs mt-1">Daspen</span>
        <div className="text-sm md:text-right w-full md:w-auto flex flex-col items-end">
          <div>
            {parseInt(member.daspen || 0) === 0 ? (
              <span className="bg-red-100 text-red-800 py-0.5 px-2 rounded text-[10px] font-bold">
                Belum Input
              </span>
            ) : (
              `Rp. ${parseInt(member.daspen || 0).toLocaleString("id-ID")}`
            )}
          </div>
          <div className="text-[10px] text-blue-500 mt-0.5">
            {member.nip
              ? filesDataMap[member.nip]
                ? `Prov: Rp. ${parseInt(filesDataMap[member.nip]).toLocaleString("id-ID")}`
                : "-"
              : "-"}
          </div>
        </div>
      </td>
      <td className="p-3 md:border-b flex justify-between items-center md:table-cell border-b md:border-b-0 border-teal-50">
        <span className="md:hidden font-bold text-teal-600 uppercase text-xs">Derap</span>
        <span className="text-sm md:text-right block w-full md:w-auto">
          Rp. {parseInt(member.derap || 0).toLocaleString("id-ID")}
        </span>
      </td>
      <td className="p-3 md:border-b flex justify-between items-center md:table-cell border-b md:border-b-0 border-teal-50">
        <span className="md:hidden font-bold text-teal-600 uppercase text-xs">Kalender</span>
        <span className="text-sm md:text-right block w-full md:w-auto">
          Rp. {parseInt(member.kalender || 0).toLocaleString("id-ID")}
        </span>
      </td>
      <td className="p-3 md:border-b flex flex-col md:table-cell border-b md:border-b-0 border-teal-50">
        <span className="md:hidden font-bold text-teal-600 uppercase text-xs mb-1">Lain-Lain</span>
        {member.detailSumbangan && member.detailSumbangan.filter(d => parseInt(d.jumlah || 0) > 0).length > 0 ? (
          <div className="text-left md:text-right">
            {member.detailSumbangan
              .filter(detail => parseInt(detail.jumlah || 0) > 0)
              .map((detail, idx) => (
                <div key={idx} className="mb-1 pb-1 border-b md:border-0 last:border-b-0">
                  <div className="font-medium text-[10px]">{detail.namaSumbangan}</div>
                  <div className="text-xs text-gray-700">
                    Rp. {parseInt(detail.jumlah || 0).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-sm md:text-right">
            Rp. {parseInt(member.sumbangan || 0).toLocaleString("id-ID")}
          </div>
        )}
      </td>
      <td className="p-3 md:border-b flex justify-between items-center md:table-cell border-b md:border-b-0 border-teal-50 bg-teal-100 md:bg-transparent">
        <span className="md:hidden font-bold text-teal-800 uppercase text-xs">Total</span>
        <span className="text-sm md:text-right block w-full md:w-auto text-teal-800 font-bold">
          Rp. {parseInt(member.totalIuran || 0).toLocaleString("id-ID")}
        </span>
      </td>
      <td className="p-3 md:border-b flex justify-center items-center md:table-cell bg-gray-50 md:bg-transparent">
        <div className="flex justify-center gap-4 md:gap-2">
          <button
            className="text-teal-600 hover:text-teal-800 text-xl md:text-lg p-2 md:p-1 hover:bg-teal-50 rounded-full md:rounded transition-colors border md:border-0"
            onClick={() => handleMemberClick(member)}
            title="Edit Iuran"
          >
            <FaEdit />
          </button>
          <button
            className="text-teal-600 hover:text-teal-800 text-xl md:text-lg p-2 md:p-1 hover:bg-teal-50 rounded-full md:rounded transition-colors border md:border-0"
            onClick={() => handlePrintClick(member)}
            title="Cetak Kartu Iuran"
          >
            <FaPrint />
          </button>
          <button
            className="text-teal-600 hover:text-teal-800 text-xl md:text-lg p-2 md:p-1 hover:bg-teal-50 rounded-full md:rounded transition-colors border md:border-0"
            onClick={() => handleTagihanClick(member)}
            title="Lihat Tagihan"
          >
            <FaFileInvoiceDollar />
          </button>
        </div>
      </td>
    </tr>
  );
});

MemberRow.displayName = "MemberRow";

export default MemberRow;
