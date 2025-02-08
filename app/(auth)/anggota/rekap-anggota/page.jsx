"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";

function RekapAnggota() {
  const [data, setData] = useState([]);
  const { token } = useAuth();
  const router = useRouter();
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [originalRekapData, setOriginalRekapData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [totals, setTotals] = useState({
    jumlah: 0,
    pgri: 0,
    sanduka: 0,
    daspen: 0,
    iuran: 0
  });
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setOriginalCabangList(response.data);
        setFilteredCabangList(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };
    fetchCabangData();
  }, [unitKerjaList]);

  useEffect(() => {
    const fetchUnitKerjaData = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaList(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };
    fetchUnitKerjaData();
  }, []);

  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      setShowUnitKerjaDropdown(true);
    }
  };

  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
  };

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);
    setSelectedUnitKerja(input);

    if (!selectedCabang) return;

    const filteredList = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang?.toLowerCase() === selectedCabang.toLowerCase() &&
        unitKerja.unitKerja.toLowerCase().includes(input.toLowerCase())
    );

    setShowUnitKerjaDropdown(true);
    setFilteredUnitKerja(filteredList);

    if (input === "") {
      const processed = processData(originalRekapData);
      setGroupedData(processed);
      setData(originalRekapData);
      calculateTotals(originalRekapData);
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          item.unitKerja?.toLowerCase().includes(input.toLowerCase())
      );
      const processed = processData(filteredData);
      setGroupedData(processed);
      setData(filteredData);
      calculateTotals(filteredData);
    }
  };

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handleSelectCabang = async (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);
    setSelectedUnitKerja("");
    setUnitKerjaInput("");

    try {
      const response = await GlobalApi.getNominalAggregatedData(cabang.kecamatan || "");

      const totalRow = response.find(item => item.cabang === "Total" && !item.unitKerja);
      const regularData = response.filter(item => !(item.cabang === "Total" && !item.unitKerja));

      if (totalRow) {
        setGrandTotals({
          jumlah: parseInt(totalRow.jumlah) || 0,
          pgri: parseFloat(totalRow.pgri) || 0,
          sanduka: parseFloat(totalRow.sanduka) || 0,
          daspen: parseFloat(totalRow.daspen) || 0,
          totalIuran: parseFloat(totalRow.totalIuran) || 0
        });
      }

      setData(regularData);
      setOriginalRekapData(regularData);

      const processed = processData(regularData);
      setGroupedData(processed);

      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.cabang &&
          unitKerja.cabang.toLowerCase() === (cabang.kecamatan || "").toLowerCase()
      );
      setFilteredUnitKerja(filtered);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
    }
  };

  const handleUnitKerjaSearch = (searchTerm) => {
    if (searchTerm === "") {
      const allFiltered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(allFiltered);
    } else {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.unitKerja
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(filtered);
    }

    setShowUnitKerjaDropdown(true);
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    const selectedValue = unitKerja.unitKerja;
    setSelectedUnitKerja(selectedValue);
    setUnitKerjaInput(selectedValue);
    setShowUnitKerjaDropdown(false);

    if (!selectedValue) {
      const processed = processData(originalRekapData);
      setGroupedData(processed);
      setData(originalRekapData);
      calculateTotals(originalRekapData);
    } else {
      const filteredData = originalRekapData.filter(
        item => item.unitKerja?.toLowerCase() === selectedValue.toLowerCase()
      );
      const processed = processData(filteredData);
      setGroupedData(processed);
      setData(filteredData);
      calculateTotals(filteredData);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
      }
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const processData = (rawData) => {
    const grouped = rawData.reduce((acc, item) => {
      const unitKey = item.unitKerja || 'Tidak Ada Unit Kerja';
      const cabangKey = item.cabang || 'Tidak Ada Cabang';

      if (!acc[unitKey]) {
        acc[unitKey] = {
          unitKerja: unitKey,
          cabang: cabangKey,
          namaAnggota: [],
          jumlah: 0,
          pgri: 0,
          sanduka: 0,
          daspen: 0,
          totalIuran: 0
        };
      }
      acc[unitKey].namaAnggota.push(item.namaAnggota);
      acc[unitKey].jumlah += parseInt(item.jumlah) || 0;
      acc[unitKey].pgri += parseFloat(item.pgri) || 0;
      acc[unitKey].sanduka += parseFloat(item.sanduka) || 0;
      acc[unitKey].daspen += parseFloat(item.daspen) || 0;
      acc[unitKey].totalIuran += parseFloat(item.totalIuran) || 0;
      return acc;
    }, {});
    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const storedRole = sessionStorage.getItem("role");
        const storedCabang = sessionStorage.getItem("cabang");

        if (storedRole === "ADMIN" && storedCabang) {
          setIsAdmin(true);
          setSelectedCabang(storedCabang);
          const response = await GlobalApi.getNominalAggregatedData(storedCabang);

          const totalRow = response.find(item => item.cabang === "Total" && !item.unitKerja);
          const regularData = response.filter(item => !(item.cabang === "Total" && !item.unitKerja));

          if (totalRow) {
            setGrandTotals({
              jumlah: parseInt(totalRow.jumlah) || 0,
              pgri: parseFloat(totalRow.pgri) || 0,
              sanduka: parseFloat(totalRow.sanduka) || 0,
              daspen: parseFloat(totalRow.daspen) || 0,
              totalIuran: parseFloat(totalRow.totalIuran) || 0
            });
          }

          const processed = processData(regularData);
          setGroupedData(processed);
          setData(regularData);
          setOriginalRekapData(regularData);

        } else {
          const response = await GlobalApi.getNominalAggregatedData("");

          const totalRow = response.find(item => item.cabang === "Total" && !item.unitKerja);
          const regularData = response.filter(item => !(item.cabang === "Total" && !item.unitKerja));

          if (totalRow) {
            setGrandTotals({
              jumlah: parseInt(totalRow.jumlah) || 0,
              pgri: parseFloat(totalRow.pgri) || 0,
              sanduka: parseFloat(totalRow.sanduka) || 0,
              daspen: parseFloat(totalRow.daspen) || 0,
              totalIuran: parseFloat(totalRow.totalIuran) || 0
            });
          }

          const processed = processData(regularData);
          setGroupedData(processed);
          setData(regularData);
          setOriginalRekapData(regularData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [unitKerjaList]);

  const toggleExpand = (unitKerja) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitKerja)) {
        newSet.delete(unitKerja);
      } else {
        newSet.add(unitKerja);
      }
      return newSet;
    });
  };

  const calculateTotals = (dataArray) => {
    const newTotals = dataArray.reduce((acc, item) => ({
      jumlah: acc.jumlah + (parseInt(item.jumlah) || 0),
      pgri: acc.pgri + (parseFloat(item.pgri) || 0),
      sanduka: acc.sanduka + (parseFloat(item.sanduka) || 0),
      daspen: acc.daspen + (parseFloat(item.daspen) || 0),
      iuran: acc.iuran + (parseFloat(item.totalIuran) || 0)
    }), {
      jumlah: 0,
      pgri: 0,
      sanduka: 0,
      daspen: 0,
      iuran: 0
    });
    setTotals(newTotals);
  };

  const [grandTotals, setGrandTotals] = useState({
    jumlah: 0,
    pgri: 0,
    sanduka: 0,
    daspen: 0,
    totalIuran: 0
  });

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderCabangInput = () => {
    return (
      <div className="flex flex-col relative w-64" ref={cabangRef}>
        <Input
          type="text"
          value={selectedCabang}
          readOnly
          onClick={!isAdmin ? handleCabangClick : undefined}
          className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${isAdmin ? 'bg-gray-100' : ''
            }`}
          placeholder="Pilih Cabang"
          disabled={isAdmin}
        />
        {!isAdmin && showCabangDropdown && (
          <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
            <ul className="max-h-44 overflow-y-auto">
              <li className="py-2 px-2">
                <Input
                  type="text"
                  onChange={(e) => handleCabangSearch(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                  placeholder="Cari ketik Cabang..."
                  autoFocus
                />
              </li>
              <li
                onClick={() => handleSelectCabang({ kecamatan: "" })}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                Pilih Cabang
              </li>
              {filteredCabangList.map((cabang) => (
                <li
                  key={cabang.id}
                  onClick={() => handleSelectCabang(cabang)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {cabang.kecamatan}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderUnitKerjaInput = () => (
    <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
      <Input
        type="text"
        value={unitKerjaInput}
        onChange={handleUnitKerjaChange}
        onFocus={handleUnitKerjaFocus}
        placeholder="Pilih Unit Kerja"
        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
        disabled={!selectedCabang}
      />
      {showUnitKerjaDropdown && (
        <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
          <ul className="max-h-44 overflow-y-auto">
            <li
              onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
            >
              Pilih Unit Kerja
            </li>
            {filteredUnitKerja.map((unitKerja) => (
              <li
                key={unitKerja.id}
                onClick={() => handleUnitKerjaSelect(unitKerja)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                {unitKerja.unitKerja}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const FilterSection = ({
    renderCabangInput,
    renderUnitKerjaInput,
    isMobile
  }) => {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block mb-2 text-sm">Cabang</label>
              {renderCabangInput()}
            </div>
            <div>
              <label className="block mb-2 text-sm">Unit Kerja</label>
              {renderUnitKerjaInput()}
            </div>
          </div>
          {isMobile && (
            <Button
              onClick={() => window.print()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8"
            >
              Cetak
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ClipLoader color="#3498db" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}
        >
          <div className="mb-4 mx-12">
            <div className="flex flex-wrap items-start mt-14 justify-between">
              <div className="flex flex-wrap items-center space-x-2">
                <FilterSection
                  renderCabangInput={renderCabangInput}
                  renderUnitKerjaInput={renderUnitKerjaInput}
                  isMobile={isMobile}
                />
              </div>
              {!isMobile && (
                <div className="flex items-end mt-2 md:mt-0">
                  <button
                    onClick={() => window.print()}
                    className="p-2 px-4 bg-blue-500 text-white rounded w-full md:w-auto"
                  >
                    Cetak
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="container w-full table-auto mb-8">
              <thead>
                <tr>
                  <th className="p-2 md:p-3 border text-white bg-teal-700" rowSpan="2">
                    No
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700" rowSpan="2">
                    Cabang
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700" rowSpan="2">
                    Unit Kerja
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700" rowSpan="2">
                    Nama Anggota
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 hidden lg:table-cell" rowSpan="2">
                    Jumlah Anggota
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 hidden lg:table-cell" colSpan="3">
                    Jumlah
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700" rowSpan="2">
                    Total
                  </th>
                </tr>
                <tr>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 hidden lg:table-cell">
                    PGRI
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 hidden lg:table-cell">
                    Sanduka
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 hidden lg:table-cell">
                    Daspen
                  </th>
                </tr>
              </thead>

              <tbody>
                {groupedData.map((group, index) => (
                  <React.Fragment key={group.unitKerja}>
                    <tr>
                      <td className="p-2 md:p-3 border text-center">
                        <div className="inline-flex items-center">
                          {index + 1}
                          {isMobile && (
                            <Button
                              className="text-blue-500 bg-transparent hover:bg-transparent"
                              onClick={() => toggleExpand(group.unitKerja)}
                            >
                              {expandedRows.has(group.unitKerja) ? (
                                <FaMinusCircle />
                              ) : (
                                <FaPlusCircle />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 border">{group.cabang}</td>
                      <td className="p-2 md:p-3 border">{group.unitKerja}</td>
                      <td className="p-2 md:p-3 border text-center">
                        <div className={`flex ${isMobile ? "flex-col gap-1" : "justify-center items-center"}`}>
                          {isMobile && <span className="font-bold">{group.jumlah || 0} Anggota</span>}
                          <Button
                            className="text-blue-500 bg-transparent hover:bg-transparent"
                            onClick={() => toggleExpand(group.unitKerja + '_members')}
                          >
                            {expandedRows.has(group.unitKerja + '_members') ? (
                              <FaMinusCircle />
                            ) : (
                              <FaPlusCircle />
                            )}
                          </Button>
                        </div>
                        {expandedRows.has(group.unitKerja + '_members') && (
                          <div className="pl-4 text-left">
                            {group.namaAnggota.map((nama, idx) => (
                              <div key={idx} className="py-1">
                                {idx + 1}. {nama}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-2 md:p-3 border text-center hidden lg:table-cell">{group.jumlah || 0}</td>
                      <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                        Rp. {parseInt(group.pgri).toLocaleString("id-ID")}
                      </td>
                      <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                        Rp. {parseInt(group.sanduka).toLocaleString("id-ID")}
                      </td>
                      <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                        Rp. {parseInt(group.daspen).toLocaleString("id-ID")}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        Rp. {parseInt(group.totalIuran).toLocaleString("id-ID")}
                      </td>
                    </tr>
                    {isMobile && expandedRows.has(group.unitKerja) && (
                      <tr>
                        <td colSpan="7" className="p-2 md:p-3 border">
                          <div className="grid grid-cols-2 gap-2">
                            <div>PGRI: Rp. {parseInt(group.pgri).toLocaleString("id-ID")}</div>
                            <div>Sanduka: Rp. {parseInt(group.sanduka).toLocaleString("id-ID")}</div>
                            <div>Daspen: Rp. {parseInt(group.daspen).toLocaleString("id-ID")}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={isMobile ? 3 : 4} className="p-2 md:p-3 border text-center">
                    Total :
                  </td>
                  <td className="p-2 md:p-3 border text-center">
                    {grandTotals.jumlah}
                  </td>
                  {!isMobile && (
                    <>
                      <td className="p-2 md:p-3 border text-center">
                        Rp. {parseInt(grandTotals.pgri).toLocaleString("id-ID")}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        Rp. {parseInt(grandTotals.sanduka).toLocaleString("id-ID")}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        Rp. {parseInt(grandTotals.daspen).toLocaleString("id-ID")}
                      </td>
                    </>
                  )}
                  <td className="p-2 md:p-3 border text-center">
                    Rp. {parseInt(grandTotals.totalIuran).toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RekapAnggota;