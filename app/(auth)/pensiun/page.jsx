import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-teal-700 text-white p-4 md:p-6 rounded-lg shadow-md mb-4">
        <div className="container mx-auto flex justify-center items-center">
          <h1 className="text-2xl md:text-3xl font-bold">PENSIUN</h1>
        </div>
      </header>
      <div className="bg-teal-700 p-4 rounded-lg mb-4 flex flex-wrap justify-between items-center space-y-4 md:space-y-0 md:flex-nowrap">
        <select className="bg-white p-2 rounded border w-full md:w-auto">
          <option>Tampil Semua</option>
        </select>
        <select className="bg-white p-2 rounded border w-full md:w-auto">
          <option>-- Bulan --</option>
        </select>
        <select className="bg-white p-2 rounded border w-full md:w-auto">
          <option>-- Tahun --</option>
        </select>
        <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 w-full md:w-auto">
          Cetak
        </Button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between mb-4">
          <span>Cabang: Tampil Semua</span>
          <span>Jumlah Anggota: 0 Orang</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-teal-700 text-white">
              <tr>
                <th className="py-2 px-3 text-center">No.</th>
                <th className="py-2 px-3 text-center">Foto</th>
                <th className="py-2 px-3 text-center">Prediksi Pensiun</th>
                <th className="py-2 px-3 text-center">Data Anggota</th>
                <th className="py-2 px-3 text-center">Keanggotaan</th>
                <th className="py-2 px-3 text-center">Cabang</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2 px-3 text-center">1</td>
                <td className="py-2 px-3 text-center">Foto</td>
                <td className="py-2 px-3 text-center">Prediksi Pensiun</td>
                <td className="py-2 px-3 text-center">Data Anggota</td>
                <td className="py-2 px-3 text-center">Keanggotaan</td>
                <td className="py-2 px-3 text-center">Cabang</td>
                <td className="py-2 px-3 text-center">Status</td>
                <td className="py-2 px-3 text-center">Action</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
