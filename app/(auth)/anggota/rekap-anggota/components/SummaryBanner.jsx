import React from "react";

const SummaryBanner = ({ totalAnggota, unitKerjaCount }) => {
  return (
    <div className="bg-teal-700 p-4 rounded-t-lg mt-2">
      <div className="flex items-start justify-between w-full">
        <div>
          <h2 className="text-white text-xl font-semibold">Laporan Tagihan</h2>
          <p className="text-teal-100 text-sm">Daftar iuran anggota per unit kerja</p>
        </div>
        <div className="text-right text-white font-semibold">
          Total anggota: {totalAnggota}
        </div>
      </div>
    </div>
  );
};

export default SummaryBanner;
