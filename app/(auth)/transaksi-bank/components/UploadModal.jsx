import React from "react";

const UploadModal = ({
  showUploadModal,
  handleCloseModal,
  handleSubmitUpload,
  handleInputChange,
  loader,
  progress,
}) => {
  if (!showUploadModal) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black opacity-50 z-40"
        onClick={handleCloseModal}
      ></div>

      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white shadow-lg rounded-lg p-6 w-11/12 md:w-1/2 relative">
          <button
            className="absolute top-2 right-2 text-gray-500"
            onClick={handleCloseModal}
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

          <h2 className="text-xl font-bold mb-4">Upload Data</h2>

          <form onSubmit={handleSubmitUpload}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload File
              </label>
              <input
                type="file"
                name="file"
                onChange={handleInputChange}
                className="block w-full mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nama File
              </label>
              <input
                type="text"
                name="namaFile"
                onChange={handleInputChange}
                className="form-input w-full mt-1 py-2 px-3 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tanggal Untuk
              </label>
              <input
                type="date"
                name="tanggalUntuk"
                onChange={handleInputChange}
                className="form-input w-full mt-1 py-2 px-3 border rounded-md"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg mr-2"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 rounded-lg"
                disabled={loader}
              >
                {loader ? `Uploading... ${progress}%` : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UploadModal;