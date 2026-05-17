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
          {/* EXPORT */}
          <button
            className={`px-4 py-2 rounded border border-black hover:bg-teal-500 hover:text-white transition flex items-center gap-2 text-sm ${
              isLoading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            onClick={onExport}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-black"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Memproses...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                  <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5z" />
                </svg>
                Cetak
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