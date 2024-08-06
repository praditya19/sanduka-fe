import React from "react";

const SyncData = () => {
  const data = [
    {
      id: 1,
      branch: "001",
      cabang: "BANGSRI",
      unit: "SMAN 2 Jepara",
      name: "John Doe",
      npa_nip: "123456",
      dataSanduka: "Yes",
      dataKTA: "Pending",
      dataDaspen: "No",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-teal-600 mb-6 text-center">
          Singkronisasi Data
        </h1>
        <div className="flex flex-col md:flex-row justify-center md:space-x-4 mb-6">
          <button className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 mb-2 md:mb-0">
            Rekap Hasil Upload
          </button>
          <button className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 mb-2 md:mb-0">
            Upload Data
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
            Cetak
          </button>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Cabang
          </label>
          <select className="form-select block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent">
            <option>-- Pilih Cabang --</option>
            <option>BANGSRI</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Unit Kerja
          </label>
          <select className="form-select block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent">
            <option>-- Pilih Unit Kerja --</option>
            <option>SMAN 2 Jepara</option>
            <option>SDN 3 Jepara</option>
          </select>
        </div>
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-white uppercase bg-teal-700 text-center">
              <tr>
                <th scope="col" className="py-3 px-6">
                  No
                </th>
                <th scope="col" className="py-3 px-6">
                  Cabang
                </th>
                <th scope="col" className="py-3 px-6">
                  Unit Kerja
                </th>
                <th scope="col" className="py-3 px-6">
                  Nama
                </th>
                <th scope="col" className="py-3 px-6">
                  NPA/NIP
                </th>
                <th scope="col" className="py-3 px-6">
                  Data Sanduka
                </th>
                <th scope="col" className="py-3 px-6">
                  Data KTA Digital
                </th>
                <th scope="col" className="py-3 px-6">
                  Data Daspen
                </th>
              </tr>
            </thead>
            <tbody className="text-center">
              {data.map((item, index) => (
                <tr
                  key={item.id}
                  className={`bg-white border-b ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-200 transition duration-150`}
                >
                  <td className="py-4 px-6">{item.branch}</td>
                  <td className="py-4 px-6">{item.cabang}</td>
                  <td className="py-4 px-6">{item.unit}</td>
                  <td className="py-4 px-6">{item.name}</td>
                  <td className="py-4 px-6">{item.npa_nip}</td>
                  <td className="py-4 px-6">{item.dataSanduka}</td>
                  <td className="py-4 px-6">{item.dataKTA}</td>
                  <td className="py-4 px-6">{item.dataDaspen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SyncData;
