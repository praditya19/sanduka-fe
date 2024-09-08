"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";

const data = [
  {
    dateLapor: "10:53:01am, Selasa, 09/07/2024",
    data: "Nurul Huda 33201222192 Jepara, 22-12-1998 Guru SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "TAHUNAN",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:12:16am, Selasa, 15/07/2024",
    data: "REDZA ABIDURAHMAN 33200310649 JEPARA, 10-02-1997 Guru SDN KALIPUCANGWETAN 1 27 Tahun",
    cabang: "KALINYAMATAN",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "10:29:20am, Selasa, 15/07/2024",
    data: "MARIA ULFA 33200410494 Jepara, 10-09-1992 Guru SDN MAYONGLOR 5 32 Tahun",
    cabang: "DONOROJO",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "NINA ERVIANA 33200307436 KUDUS, 07-12-1997 Guru SDN BUGO 3 27 Tahun",
    cabang: "PECANGAAN",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "REDZA ABIDURAHMAN 33200310649 JEPARA, 10-02-1997 Guru SDN KALIPUCANGWETAN 1 27 Tahun",
    cabang: "BANGSRI",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "10:53:01am, Selasa, 09/07/2024",
    data: "Nurul Huda 33201222192 Jepara, 22-12-1998 Guru SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "TAHUNAN",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:12:16am, Selasa, 15/07/2024",
    data: "REDZA ABIDURAHMAN 33200310649 JEPARA, 10-02-1997 Guru SDN KALIPUCANGWETAN 1 27 Tahun",
    cabang: "KALINYAMATAN",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "10:29:20am, Selasa, 15/07/2024",
    data: "MARIA ULFA 33200410494 Jepara, 10-09-1992 Guru SDN MAYONGLOR 5 32 Tahun",
    cabang: "DONOROJO",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "NINA ERVIANA 33200307436 KUDUS, 07-12-1997 Guru SDN BUGO 3 27 Tahun",
    cabang: "PECANGAAN",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "REDZA ABIDURAHMAN 33200310649 JEPARA, 10-02-1997 Guru SDN KALIPUCANGWETAN 1 27 Tahun",
    cabang: "BANGSRI",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "10:53:01am, Selasa, 09/07/2024",
    data: "Nurul Huda 33201222192 Jepara, 22-12-1998 Guru SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "TAHUNAN",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:12:16am, Selasa, 15/07/2024",
    data: "REDZA ABIDURAHMAN 33200310649 JEPARA, 10-02-1997 Guru SDN KALIPUCANGWETAN 1 27 Tahun",
    cabang: "KALINYAMATAN",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "10:29:20am, Selasa, 15/07/2024",
    data: "MARIA ULFA 33200410494 Jepara, 10-09-1992 Guru SDN MAYONGLOR 5 32 Tahun",
    cabang: "DONOROJO",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "NINA ERVIANA 33200307436 KUDUS, 07-12-1997 Guru SDN BUGO 3 27 Tahun",
    cabang: "PECANGAAN",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "REDZA ABIDURAHMAN 33200310649 JEPARA, 10-02-1997 Guru SDN KALIPUCANGWETAN 1 27 Tahun",
    cabang: "BANGSRI",
    detail: "Menjadi Anggota Baru",
    diterimakan: "Sebesar Rp.2.500.000",
  },
];

const Page = () => {
  const [filter, setFilter] = useState("");

  const filteredData = data.filter(
    (item) =>
      item.data.toLowerCase().includes(filter.toLowerCase()) ||
      item.cabang.toLowerCase().includes(filter.toLowerCase())
  );

  const handleEdit = (item) => {
    // Replace with your actual edit logic
    alert(`Editing: ${item.data}`);
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const { token } = useAuth();
  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

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
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? (
       <HeaderMobile />
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
          <div className="w-full p-4 container shadow-lg rounded-lg mt-12">
            <div className="rounded-md flex flex-col py-4">
              <div className="container px-2">
                <div className="w-full flex mb-4 relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 pl-10 border rounded max-w-sm w-full"
                  />
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
                  />
                </div>
                <Table className="w-full table-auto mb-8">
                  <TableHeader className="p-2 md:p-3 border bg-green-300">
                    <TableRow>
                      <TableHead
                        rowspan="2"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        No
                      </TableHead>
                      <TableHead
                        rowspan="2"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        Date
                      </TableHead>
                      <TableHead
                        rowspan="2"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        Data
                      </TableHead>
                      <TableHead
                        rowspan="2"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        Cabang
                      </TableHead>
                      <TableHead
                        rowspan="2"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        Detail
                      </TableHead>
                      <TableHead
                        rowspan="2"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                      >
                        <TableCell className="text-center border">
                          {index + 1}
                        </TableCell>
                        <TableCell className="border">
                          {item.dateLapor}
                        </TableCell>
                        <TableCell className="border">{item.data}</TableCell>
                        <TableCell className="text-center border">
                          {item.cabang}
                        </TableCell>
                        <TableCell className="border">{item.detail}</TableCell>
                        <TableCell className="text-center border">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;