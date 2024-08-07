import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faCalendarAlt,
  faMapMarkerAlt,
  faUserTie,
  faHome,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

const TemanUnitKerja = () => {
  const cardsData = [
    {
      foto: "/sanduka.png",
      name: "HABIB NOR HAQIQI",
      npaNip: "0001146804614",
      cabang: "BANGSRI",
      unit: "SMAN 1 Jepara",
      tanggalLahir: "01-01-2000",
      jabatan: "Guru",
      alamatRumah: "Jl. Mawar No. 1",
      sandukaData: "Yes",
      ktaDigitalData: "Yes",
      daspenData: "Yes",
      status: "Aktif",
    },
    {
      foto: "/sanduka.png",
      name: "MUHAMMAD ALFARIZA HAQIQI",
      npaNip: "0001190472939",
      cabang: "BANGSRI",
      unit: "SMAN 2 Jepara",
      tanggalLahir: "02-02-2001",
      jabatan: "Guru",
      alamatRumah: "Jl. Melati No. 2",
      sandukaData: "Yes",
      ktaDigitalData: "Yes",
      daspenData: "Yes",
      status: "Aktif",
    },
    {
      foto: "/sanduka.png",
      name: "SHAKILA NAHDA HAQIQI",
      npaNip: "0001908279055",
      cabang: "BANGSRI",
      unit: "SMAN 3 Jepara",
      tanggalLahir: "03-03-2002",
      jabatan: "Guru",
      alamatRumah: "Jl. Kenanga No. 3",
      sandukaData: "Yes",
      ktaDigitalData: "Yes",
      daspenData: "Yes",
      status: "Aktif",
    },
    {
      foto: "/sanduka.png",
      name: "GHANIA DINARA HAQIQI",
      npaNip: "0003067113159",
      cabang: "BANGSRI",
      unit: "SMAN 4 Jepara",
      tanggalLahir: "04-04-2003",
      jabatan: "Guru",
      alamatRumah: "Jl. Dahlia No. 4",
      sandukaData: "Yes",
      ktaDigitalData: "Yes",
      daspenData: "Yes",
      status: "Aktif",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-8 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {cardsData.map((data, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-start transition-transform transform hover:scale-105 hover:shadow-2xl border border-gray-200"
          >
            <div className="w-full flex flex-col items-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center border-4 border-blue-500 overflow-hidden">
                <Image
                  src={data.foto}
                  width={60}
                  height={60}
                  alt="Anggota Foto"
                  className="rounded-full"
                />
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold text-gray-800 truncate">
                  {data.name}
                </h2>
                <p className="text-gray-600 text-sm truncate">{data.npaNip}</p>
                <p className="text-gray-600 text-sm truncate">{data.unit}</p>
                <p
                  className={`text-sm mt-2 font-medium ${
                    data.status === "Aktif" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {data.status}
                </p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mt-4 w-full border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Detail Anggota
              </h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-gray-800 text-sm">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-gray-600 mr-2"
                  />
                  <span className="font-medium text-gray-700">
                    Tanggal Lahir:
                  </span>
                  <span className="ml-2">{data.tanggalLahir}</span>
                </div>
                <div className="flex items-center text-gray-800 text-sm">
                  <FontAwesomeIcon
                    icon={faUserTie}
                    className="text-gray-600 mr-2"
                  />
                  <span className="font-medium text-gray-700">Jabatan:</span>
                  <span className="ml-2">{data.jabatan}</span>
                </div>
                <div className="flex items-center text-gray-800 text-sm">
                  <FontAwesomeIcon
                    icon={faHome}
                    className="text-gray-600 mr-2"
                  />
                  <span className="font-medium text-gray-700">
                    Alamat Rumah:
                  </span>
                  <span className="ml-2">{data.alamatRumah}</span>
                </div>
                <div className="flex items-center text-gray-800 text-sm">
                  <FontAwesomeIcon
                    icon={faIdCard}
                    className="text-gray-600 mr-2"
                  />
                  <span className="font-medium text-gray-700">
                    KTA Digital:
                  </span>
                  <span className="ml-2">{data.ktaDigitalData}</span>
                </div>
                <div className="flex items-center text-gray-800 text-sm">
                  <FontAwesomeIcon
                    icon={faDatabase}
                    className="text-gray-600 mr-2"
                  />
                  <span className="font-medium text-gray-700">Daspen:</span>
                  <span className="ml-2">{data.daspenData}</span>
                </div>
                <div className="flex items-center text-gray-800 text-sm">
                  <FontAwesomeIcon
                    icon={faDatabase}
                    className="text-gray-600 mr-2"
                  />
                  <span className="font-medium text-gray-700">
                    Sanduka Data:
                  </span>
                  <span className="ml-2">{data.sandukaData}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemanUnitKerja;
