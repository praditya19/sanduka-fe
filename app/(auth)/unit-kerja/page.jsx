import React from "react";
import Link from "next/link";

const AddUnitForm = () => {
  return (
    
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold">Master Data</h1>
          <nav className="mt-4">
            <ul className="flex flex-wrap space-x-4 md:space-x-6">
              <li className="cursor-pointer">
                <Link href="/user">User</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/tambah">Tambah Cabang</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/unit-kerja">Tambah Unit Kerja</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <div className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-6">

      
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
