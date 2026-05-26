import React from "react";

const DeleteBalancingModal = ({
  showDeleteBalancing,
  setShowDeleteBalancing,
  handleDelete,
  resetUntukBulan,
  setResetUntukBulan,
  loader,
  progress,
}) => {
  if (!showDeleteBalancing) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black opacity-50 z-40"
        onClick={() => setShowDeleteBalancing(false)}
      ></div>

      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white shadow-lg rounded-lg p-6 w-11/12 md:w-1/2 relative">
          <button
            className="absolute top-2 right-2 text-gray-500"
            onClick={() => setShowDeleteBalancing(false)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-xl font-bold mb-4">Hapus Data</h2>

          <form onSubmit={handleDelete}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Hapus Untuk Bulan:
              </label>

              <input
                type="date"
                name="resetUntukBulan"
                value={resetUntukBulan}
                onChange={(e) => setResetUntukBulan(e.target.value)}
                className="form-input block w-full mt-1 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteBalancing(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-2"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded-lg"
                disabled={loader}
              >
                {loader ? `Deleting... ${progress}%` : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DeleteBalancingModal;