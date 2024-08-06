import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faHospital,
  faTooth,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const Card = () => {
  const cardsData = [
    {
      name: "HABIB NOR HAQIQI",
      status: "AKTIF",
      id: "0001146804614",
      relation: "Peserta (PEGAWAI SWASTA)",
      birthdate: "10-03-1982",
      doctor: "dr. Putri Mulyaningtyas",
      dentist: "drg. Muntaha Anggiasari",
      classType: "Kelas 2",
    },
    {
      name: "MUHAMMAD ALFARIZA HAQIQI",
      status: "AKTIF",
      id: "0001190472939",
      relation: "Anak (PEGAWAI SWASTA)",
      birthdate: "16-09-2010",
      doctor: "dr. Putri Mulyaningtyas",
      dentist: "drg. Muntaha Anggiasari",
      classType: "Kelas 2",
    },
    {
      name: "SHAKILA NAHDA HAQIQI",
      status: "AKTIF",
      id: "0001908279055",
      relation: "Anak (PEGAWAI SWASTA)",
      birthdate: "30-05-2015",
      doctor: "dr. Putri Mulyaningtyas",
      dentist: "drg. Muntaha Anggiasari",
      classType: "Kelas 2",
    },
    {
      name: "GHANIA DINARA HAQIQI",
      status: "AKTIF",
      id: "0003067113159",
      relation: "Anak (PEGAWAI SWASTA)",
      birthdate: "16-09-2020",
      doctor: "dr. Putri Mulyaningtyas",
      dentist: "drg. Muntaha Anggiasari",
      classType: "Kelas 2",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-8 px-4">
      {cardsData.map((data, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col items-center w-full max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center mb-4">
            <FontAwesomeIcon
              icon={faUser}
              size="2x"
              className="text-indigo-600"
            />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{data.name}</h2>
                <span className="text-green-600 font-semibold">
                  {data.status}
                </span>
              </div>
              <div className="bg-blue-600 text-white rounded-full px-3 py-1 text-sm">
                {data.classType}
              </div>
            </div>
            <p className="text-gray-600 mb-1">{data.id}</p>
            <p className="text-gray-600 mb-3">{data.relation}</p>
            <div className="flex items-center mb-2 text-gray-700">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="text-gray-500 mr-2"
              />
              <span>{data.birthdate}</span>
            </div>
            <div className="flex items-center mb-2 text-gray-700">
              <FontAwesomeIcon
                icon={faHospital}
                className="text-gray-500 mr-2"
              />
              <span>{data.doctor}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <FontAwesomeIcon icon={faTooth} className="text-gray-500 mr-2" />
              <span>{data.dentist}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card;
