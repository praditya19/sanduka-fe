import React from "react";

const ImportBalancingModal = ({
  showImportBalancing,
  setShowImportBalancing,
  setFileImport,
  tagihanUntukBulan,
  setTagihanUntukBulan,
  handleImportBalancing,
}) => {
  if (!showImportBalancing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Import Balancing</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">File Excel</label>
            <input
              type="file"
              className="w-full border rounded px-3 py-2"
              onChange={(e) => setFileImport(e.target.files[0])}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Tagihan Untuk Bulan
            </label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={tagihanUntukBulan}
              onChange={(e) => setTagihanUntukBulan(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 border rounded"
            onClick={() => setShowImportBalancing(false)}
          >
            Batal
          </button>

          <button
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-500"
            onClick={handleImportBalancing}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportBalancingModal;