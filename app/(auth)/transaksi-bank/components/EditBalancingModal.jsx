import React from "react";

const EditBalancingModal = ({ editData, setEditData, onClose, onSave }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-[600px] max-w-full p-6 overflow-y-auto max-h-[90vh] mt-16">
        <button
          onClick={() => setShowEditModal(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <FaTimesCircle className="w-5 h-5 hover:text-red-500" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Data Balancing</h2>

        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg mb-6 border">
          <div>
            <p className="text-xs text-gray-500">Nama Anggota</p>
            <p>{editData.namaAnggota}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">NPA</p>
            <p>{editData.npa}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">NIP</p>
            <p>{editData.nip}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Nomor Rekening</p>
            <p>{editData.nomorRekening}</p>
          </div>

          <div className="relative">
            <label className="block text-xs text-gray-500 mb-1">Cabang</label>

            <button
              type="button"
              className="w-full border px-3 py-2 rounded text-left bg-white"
              onClick={() => setOpenCabang(!openCabang)}
            >
              {editData.cabang || "-- Pilih Cabang --"}
            </button>

            {openCabang && (
              <div className="absolute z-50 w-full bg-white border rounded mt-1 shadow-lg">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Cari cabang..."
                    className="w-full border px-2 py-1 rounded text-sm"
                    value={searchDropCabang}
                    onChange={(e) => setSearchDropCabang(e.target.value)}
                  />
                </div>

                <ul className="max-h-48 overflow-y-auto text-sm">
                  <li
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                    onClick={() => {
                      setEditData({
                        ...editData,
                        cabang: "",
                        unitKerja: "",
                      });
                      setOpenCabang(false);
                    }}
                  >
                    -- Pilih Cabang --
                  </li>

                  {filteredCabang.length === 0 && (
                    <li className="px-3 py-2 text-gray-400">
                      Cabang tidak ditemukan
                    </li>
                  )}

                  {filteredCabang
                    .sort((a, b) =>
                      a.kecamatan.localeCompare(b.kecamatan, "id"),
                    )
                    .map((item, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setEditData({
                            ...editData,
                            cabang: item.kecamatan,
                            unitKerja: "",
                          });

                          fetchUnitKerja(item.kecamatan);
                          setOpenCabang(false);
                          setSearchDropCabang("");
                        }}
                      >
                        {item.kecamatan}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-xs text-gray-500 mb-1">
              Unit Kerja
            </label>

            <button
              type="button"
              disabled={!editData.cabang}
              className="w-full border px-3 py-2 rounded text-left bg-white disabled:bg-gray-100"
              onClick={() => setOpenUnit(!openUnit)}
            >
              {editData.unitKerja || "-- Pilih Unit Kerja --"}
            </button>

            {openUnit && (
              <div className="absolute z-50 w-full bg-white border rounded mt-1 shadow-lg">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Cari unit kerja..."
                    className="w-full border px-2 py-1 rounded text-sm"
                    value={searchDropUnit}
                    onChange={(e) => setSearchDropUnit(e.target.value)}
                  />
                </div>

                <ul className="max-h-48 overflow-y-auto text-sm">
                  {loadingUnitKerja && (
                    <li className="px-3 py-2 text-gray-400">
                      Memuat unit kerja...
                    </li>
                  )}

                  {!loadingUnitKerja && filterUnitKerja.length === 0 && (
                    <li className="px-3 py-2 text-gray-400">
                      Unit kerja tidak ditemukan
                    </li>
                  )}

                  {filterUnitKerja
                    .sort((a, b) =>
                      a.unitKerja.localeCompare(b.unitKerja, "id"),
                    )
                    .map((item, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setEditData({
                            ...editData,
                            unitKerja: item.unitKerja,
                          });
                          setOpenUnit(false);
                          setSearchDropUnit("");
                        }}
                      >
                        {item.unitKerja}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium">Iuran Anggota</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.defaultPgri || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  defaultPgri: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Manual Iuran Anggota
            </label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.manualPgri || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  manualPgri: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Iuran Sanduka</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.defaultSanduka || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  defaultSanduka: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Manual Iuran Sanduka
            </label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.manualSanduka || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  manualSanduka: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Iuran Daspen</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.defaultDaspen || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  defaultDaspen: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Manual Iuran Daspen
            </label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.manualDaspen || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  manualDaspen: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Iuran Derap</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.defaultDerap || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  defaultDerap: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Manual Iuran Derap
            </label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.manualDerap || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  manualDerap: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Iuran Kalender</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.defaultKalender || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  defaultKalender: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Manual Iuran Kalender
            </label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.manualKalender || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  manualKalender: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Iuran Sumbangan</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.defaultLainLain || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  defaultLainLain: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Manual Iuran Sumbangan
            </label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editData.manualLainLain || 0}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  manualLainLain: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Batal
          </button>

          <button
            className="px-4 py-2 bg-[#0B131E] text-white rounded hover:bg-[#101c2c] flex items-center"
            onClick={handleSaveEdit}
          >
            <FaSave className="mr-2" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBalancingModal;
