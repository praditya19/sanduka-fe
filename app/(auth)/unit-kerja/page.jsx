import React from "react";

const AddUnitForm = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center text-teal-600">
          TAMBAH UNIT KERJA
        </h2>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="branch"
          >
            Cabang
          </label>
          <select
            id="branch"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option>-- Nama Cabang --</option>
            {/* Add options here */}
          </select>
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="unit"
          >
            Isi Unit Kerja Tambahan
          </label>
          <input
            id="unit"
            type="text"
            placeholder="Tambah Unit kerja"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-center">
          <button
            className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            TAMBAH UNIT KERJA
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUnitForm;
