"use client"
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Page = () => {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
  };

  return (
    <div className="container mx-auto p-6">
  <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
    <h2 className="bg-blue-500 text-2xl text-white font-bold py-2 px-4 rounded mb-6 text-center">
      KURANG SETOR CABANG
    </h2>

    <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
        <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5 w-full sm:w-auto">
          <select className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
            <option>-- Cabang --</option>
            <option>Bangsri</option>
            <option>Welahan</option>
          </select>
          <select className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
            <option>Januari</option>
            <option>Agustus</option>
            <option>September</option>
          </select>
          <select className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
            <option>2023</option>
            <option>2024</option>
            <option>2025</option>
          </select>
        </div>
        <div className="flex-1 flex justify-center items-center mt-4 sm:mt-3">
          <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0 text-center">
            Transaksi Juli 2024
          </h1>
        </div>
        <div className="flex flex-wrap justify-center space-x-4 mt-4 sm:mt-3 mr-0 sm:mr-10 w-full sm:w-auto">
          <select className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
            <option>Tampil Semua</option>
            <option>Iuran/Sanduka</option>
            <option>DASPEN</option>
          </select>
          <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 sm:mt-0 mt-3 px-4 rounded transition duration-300">
            Cetak
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};

export default Page;
