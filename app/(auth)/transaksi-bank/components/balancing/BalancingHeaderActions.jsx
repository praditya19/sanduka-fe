import React from "react";

const BalancingHeaderActions = ({
  isLoading,
  onExport,
  role,
  onDeleteBalancing,
  onImportBalancing,
}) => {
  return (
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Balancing Potongan
          </h2>
          <p className="text-gray-600 mt-1">
            Rekonsiliasi iuran anggota dengan data potongan bank.
          </p>
        </div>

        <div className="flex gap-3">
          <button
  className={`
    px-5 py-2.5 rounded-lg font-medium text-sm
    border-2 border-teal-500 text-teal-600
    bg-white hover:bg-teal-500 hover:text-white
    transition-all duration-300 ease-out
    flex items-center gap-2
    focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2
    ${isLoading ? "opacity-60 cursor-not-allowed border-teal-300" : ""}
  `}
  onClick={onExport}
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>Memproses...</span>
    </>
  ) : (
    <>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      <span>Cetak</span>
    </>
  )}
</button>

          {/* SUPERADMIN ACTION */}
          {role === "SUPERADMIN" && (
            <div className="flex gap-2 ml-auto">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
                onClick={onDeleteBalancing}
              >
                Delete Balancing
              </button>

              <button
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-500 transition"
                onClick={onImportBalancing}
              >
                Import Balancing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalancingHeaderActions;