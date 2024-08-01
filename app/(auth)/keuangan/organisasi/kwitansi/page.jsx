"use client";

function Kwitansi() {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6">
          <div className="flex flex-col space-y-2 w-full lg:w-auto">
            <select className="border border-gray-300 rounded p-2 w-full lg:w-auto">
              <option>-- Cabang --</option>
              {/* Add other options as needed */}
            </select>
            <select className="border border-gray-300 rounded p-2 w-full lg:w-auto">
              <option>Januari</option>
              {/* Add other months as needed */}
            </select>
            <select className="border border-gray-300 rounded p-2 w-full lg:w-auto">
              <option>2021</option>
              {/* Add other years as needed */}
            </select>
            <select className="border border-gray-300 rounded p-2 w-full lg:w-auto">
              <option>IURAN PGRI</option>
              <option>DERAP</option>
              <option>DASPEN</option>
              <option>KALENDER</option>
              {/* Add other options as needed */}
            </select>
          </div>
          <div className="flex flex-col items-center mt-6 lg:mt-0">
            <img src="path_to_logo.png" alt="Logo" className="w-24 h-24 mb-4" />
            <div className="text-center">
              <p>Persatuan Guru Republik Indonesia (PGRI)</p>
              <p>Kabupaten Jepara</p>
              <p>Jl. Bata Putih, Demaan VI, Demaan,</p>
              <p>Kec. Jepara, Kabupaten Jepara, Jawa Tengah 59419</p>
              <p>Telp. 0291 592 479 email: pgrijepara@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-300 pt-4">
          <p>Date transaksi :</p>
          <p>No. Kwitansi :</p>
          <p>Pembayaran</p>
          <p>1.</p>
        </div>
      </div>
    </div>
  );
}

export default Kwitansi;
