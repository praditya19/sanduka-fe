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
      className={rowIndex % 2 === 0 ? "bg-white" : "bg-teal-50"}
      ref={member.nip === lastUpdatedMemberNip ? lastUpdatedMemberRef : null}
    >
      <td className="p-3 border-b text-center">
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-semibold text-xs">
          {rowIndex + 1}
        </div>
      </td>
      <td className="p-3 border-b">{member.cabang}</td>
      <td className="p-3 border-b font-medium">{member.unitKerja}</td>
      <td className="p-3 border-b text-sm">
        <div className="font-medium">{member.namaAnggota}</div>
        <div className="text-xs text-gray-600">{member.nip}</div>
        <div className="text-xs text-gray-600">{member.nomorRekening}</div>
        <div className="text-xs text-gray-600">
          Update iuran: {formatTanggal(member.lastUpdatedAtIuran, "DMY")}
        </div>
      </td>
      <td className="p-3 border-b text-right text-sm">
        Rp. {parseInt(member.pgri || 0).toLocaleString("id-ID")}
      </td>
      <td className="p-3 border-b text-right text-sm">
        Rp. {parseInt(member.sanduka || 0).toLocaleString("id-ID")}
      </td>
      <td className="p-3 border-b text-right text-sm">
        <div>
          {parseInt(member.daspen || 0) === 0 ? (
            <span className=" text-red-800 py-1 px-2 rounded text-xs font-medium">
              Belum Input
            </span>
          ) : (
            `Rp. ${parseInt(member.daspen || 0).toLocaleString("id-ID")}`
          )}
        </div>
        <div className="text-xs text-blue-500 mt-1">
          {member.nip
            ? filesDataMap[member.nip]
              ? `Daspen prov: Rp. ${parseInt(filesDataMap[member.nip]).toLocaleString("id-ID")}`
              : "-"
            : "-"}
        </div>
      </td>
      <td className="p-3 border-b text-right text-sm">
        Rp. {parseInt(member.derap || 0).toLocaleString("id-ID")}
      </td>
      <td className="p-3 border-b text-right text-sm">
        Rp. {parseInt(member.kalender || 0).toLocaleString("id-ID")}
      </td>
      <td className="p-3 border-b text-right text-sm">
        {member.detailSumbangan && member.detailSumbangan.length > 0 ? (
          <div className="text-left">
            {member.detailSumbangan.map((detail, idx) => (
              <div key={idx} className="mb-2 pb-2 border-b last:border-b-0">
                <div className="font-medium text-xs">{detail.namaSumbangan}</div>
                <div className="text-xs text-gray-700">
                  Rp. {parseInt(detail.jumlah || 0).toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          `Rp. ${parseInt(member.sumbangan || 0).toLocaleString("id-ID")}`
        )}
      </td>
      <td className="p-3 border-b text-right text-sm text-teal-800 font-semibold">
        Rp. {parseInt(member.totalIuran || 0).toLocaleString("id-ID")}
      </td>
      <td className="p-3 border-b text-center">
        <div className="flex justify-center gap-2">
          <button
            className="text-teal-600 hover:text-teal-800 text-lg p-1 hover:bg-teal-50 rounded transition-colors"
            onClick={() => handleMemberClick(member)}
            title="Edit Iuran"
          >
            <FaEdit />
          </button>
          <button
            className="text-teal-600 hover:text-teal-800 text-lg p-1 hover:bg-teal-50 rounded transition-colors"
            onClick={() => handlePrintClick(member)}
            title="Cetak Kartu Iuran"
          >
            <FaPrint />
          </button>
          <button
            className="text-teal-600 hover:text-teal-800 text-lg p-1 hover:bg-teal-50 rounded transition-colors"
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
