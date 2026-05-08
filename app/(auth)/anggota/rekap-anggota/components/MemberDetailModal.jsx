import React from "react";
import Image from "next/image";

const MemberDetailModal = ({
  isModalOpen,
  closeModal,
  selectedMember,
  dataIuran,
  fotoBase64,
  profileImageUrl
}) => {
  if (!isModalOpen || !selectedMember || !dataIuran) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl relative shadow-lg mx-4">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-teal-600 text-xl"
          onClick={closeModal}
        >
          ✕
        </button>

        <div className="bg-blue-100 p-5 rounded-lg">
          <h2 className="text-center text-blue-900 font-bold text-xl mb-3">
            Data KEUANGAN ANGGOTA
          </h2>

          <div className="flex flex-col md:flex-row gap-4">
            <Image
              src={fotoBase64 ? `data:image/jpeg;base64,${fotoBase64}` : profileImageUrl}
              width={100}
              height={100}
              alt="Foto User"
              className="w-24 h-28 object-cover rounded-lg border mx-auto md:mx-0"
              unoptimized={true}
            />
            <div className="flex-1 text-sm space-y-1 text-center md:text-left">
              <p>
                <span className="font-bold text-green-800 text-lg uppercase">
                  {dataIuran.namaAnggota}
                </span>
              </p>
              <p>Tempat, Tanggal Lahir: {dataIuran.tempatTanggalLahir}</p>
              <p>Nomor Anggota PGRI: <strong>{dataIuran.npa}</strong></p>
              <p>Nomor Induk Pegawai: <em>{dataIuran.nip}</em></p>
              <p>Nomor Induk Kependudukan: <em>{dataIuran.nik}</em></p>
            </div>
            <div className="text-sm text-center md:text-left">
              <p><strong>{dataIuran.cabang}</strong></p>
              <p>{dataIuran.jabatan}</p>
              <p>{dataIuran.unitKerja}</p>
            </div>
          </div>

          <div className="mt-5 text-sm space-y-1">
            <p>Nomor Rekening: <em>{dataIuran.nomorRekening}</em></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <p><span className="inline-block min-w-[140px]">Iuran Anggota</span>: Rp. {(dataIuran.totalIuranAnggota || 0).toLocaleString("id-ID")}</p>
              <p><span className="inline-block min-w-[140px]">Sanduka</span>: Rp. {(dataIuran.totalIuranSanduka || 0).toLocaleString("id-ID")}</p>
              <p><span className="inline-block min-w-[140px]">Daspen</span>: Rp. {(dataIuran.totalIuranDaspen || 0).toLocaleString("id-ID")}</p>
              <p><span className="inline-block min-w-[140px]">Derap</span>: Rp. {(dataIuran.totalIuranDerap || 0).toLocaleString("id-ID")}</p>
              <p><span className="inline-block min-w-[140px]">Kalender</span>: Rp. {(dataIuran.totalIuranKalender || 0).toLocaleString("id-ID")}</p>
              <p><span className="inline-block min-w-[140px]">Lain-Lain</span>: Rp. {(dataIuran.totalLainLain || 0).toLocaleString("id-ID")}</p>
            </div>
            <div className="mt-3 p-2 bg-white rounded border border-blue-200 text-center font-bold text-blue-800 text-base">
              Total Iuran: Rp. {(dataIuran.totalIuran || 0).toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors" onClick={closeModal}>Tutup</button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailModal;
