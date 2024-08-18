"use client";
import React, { useState, useEffect } from "react";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";

const SyncData = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    file: null,
    category: "",
  });

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
      nomorWa: "+621325754589",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log(formData);
    setIsModalOpen(false); // Close the modal after submission
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Rekap Meninggal</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen flex-grow bg-gray-50 py-10 pt-16">
            <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
              <div className="flex flex-col md:flex-row justify-center md:space-x-4 mb-6">
                <Button className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 mb-2 md:mb-0">
                  Rekap Hasil Upload
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 mb-2 md:mb-0"
                  onClick={() => setIsModalOpen(true)}
                >
                  Upload Data
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                  Cetak
                </Button>
              </div>

              {/* Modal */}
              {isModalOpen && (
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
                          xmlns="http://www.w3.org/2000/svg"
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
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Nama
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                          />
                        </div>
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
                            Kategori
                          </label>
                          <select className="form-select block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent">
                            <option>-- Pilih Kategori --</option>
                          </select>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={handleCloseModal}
                            className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-2"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            onClick={handleSubmit}
                            className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded-lg"
                          >
                            Submit
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </>
              )}

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
                      <th scope="col" className="py-3 px-6">
                        Wa
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
                        <td className="py-4 px-6">
                          <Button
                            onClick={() =>
                              window.open(
                                `https://wa.me/${item.nomorWa}`,
                                "_blank"
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full flex items-center justify-center"
                          >
                            <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncData;
