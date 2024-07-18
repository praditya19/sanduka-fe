"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

const PROVINSI_PERCENTAGE = 0.895;
const CABANG_PERCENTAGE = 0.065;
const KABUPATEN_PERCENTAGE = 0.04;

export default function Daspen() {
  const [kuota, setKuota] = useState(700);
  const [katagori1, setKatagori1] = useState(0);
  const [katagori2, setKatagori2] = useState(0);
  const [katagori3, setKatagori3] = useState(0);
  const [katagori1Lainnya, setKatagori1Lainnya] = useState(0);
  const [katagori2Lainnya, setKatagori2Lainnya] = useState(0);
  const [katagori3Lainnya, setKatagori3Lainnya] = useState(0);
  const [kat1, setKat1] = useState(0);
  const [kat2, setKat2] = useState(0);
  const [kat3, setKat3] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [perolehanCabang, setPerolehanCabang] = useState(0);
  const [perolehanKabupaten, setPerolehanKabupaten] = useState(0);
  const [perolehanProvinsi, setPerolehanProvinsi] = useState(0);

  useEffect(() => {
    setKatagori1(kuota * katagori1Lainnya);
    setKatagori2(kuota * katagori2Lainnya);
    setKatagori3(kuota * katagori3Lainnya);
  }, [kuota, katagori1Lainnya, katagori2Lainnya, katagori3Lainnya]);

  useEffect(() => {
    const total = katagori1 * kat1 + katagori2 * kat2 + katagori3 * kat3;
    setTotalTarget(total);

    const provinsi = total * PROVINSI_PERCENTAGE;
    setPerolehanProvinsi(provinsi);

    const cabang = total * CABANG_PERCENTAGE;
    setPerolehanCabang(cabang);

    const kabupaten = total * KABUPATEN_PERCENTAGE;
    setPerolehanKabupaten(kabupaten);
  }, [kat1, kat2, kat3, katagori1, katagori2, katagori3]);

  const handleSubmit = () => {};

  const handleReset = () => {
    setKuota(700);
    setKatagori1(0);
    setKatagori2(0);
    setKatagori3(0);
    setKatagori1Lainnya(0);
    setKatagori2Lainnya(0);
    setKatagori3Lainnya(0);
    setKat1(0);
    setKat2(0);
    setKat3(0);
    setTotalTarget(0);
    setPerolehanCabang(0);
    setPerolehanKabupaten(0);
    setPerolehanProvinsi(0);
  };
  console.log(katagori1);
  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-blue-500 mb-4">
            Besaran Sumbangan Daspen
          </h2>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="kuota"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Kuota
              </Label>
              <Input
                type="number"
                id="kuota"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                value={kuota}
                onChange={(e) => setKuota(parseInt(e.target.value))}
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex flex-col w-1/2">
                <Label
                  htmlFor="katagori1"
                  className="text-gray-700 text-sm font-semibold mb-2"
                >
                  Katagori I
                </Label>
                <Input
                  type="text"
                  id="katagori1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                  value={`Rp ${katagori1.toLocaleString("id-ID")}`}
                  readOnly
                />
              </div>
              <div className="flex flex-col w-1/2 mt-7">
                <Input
                  type="number"
                  id="katagori1-2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  value={katagori1Lainnya}
                  onChange={(e) =>
                    setKatagori1Lainnya(parseInt(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex flex-col w-1/2">
                <Label
                  htmlFor="katagori2"
                  className="text-gray-700 text-sm font-semibold mb-2"
                >
                  Katagori II
                </Label>
                <Input
                  type="text"
                  id="katagori2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                  value={`Rp ${katagori2.toLocaleString("id-ID")}`}
                  readOnly
                />
              </div>
              <div className="flex flex-col w-1/2 mt-7">
                <Input
                  type="number"
                  id="katagori2-2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  value={katagori2Lainnya}
                  onChange={(e) =>
                    setKatagori2Lainnya(parseInt(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex flex-col w-1/2">
                <Label
                  htmlFor="katagori3"
                  className="text-gray-700 text-sm font-semibold mb-2"
                >
                  Katagori III
                </Label>
                <Input
                  type="text"
                  id="katagori3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                  value={`Rp ${katagori3.toLocaleString("id-ID")}`}
                  readOnly
                />
              </div>
              <div className="flex flex-col w-1/2 mt-7">
                <Input
                  type="number"
                  id="katagori3-2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  value={katagori3Lainnya}
                  onChange={(e) =>
                    setKatagori3Lainnya(parseInt(e.target.value))
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-blue-500 mb-4">
            Inputan Manual Target Daspen
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <Label
                  htmlFor="bulan"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Bulan
                </Label>
                <select
                  id="bulan"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                >
                  <option value="Juli">Juli</option>
                  <option value="Agustus">Agustus</option>
                  <option value="September">September</option>
                </select>
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="tahun"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Tahun
                </Label>
                <select
                  id="tahun"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <Label
                  htmlFor="cabang"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Cabang
                </Label>
                <select
                  id="cabang"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                >
                  <option value="Cabang 1">Cabang 1</option>
                  <option value="Cabang 2">Cabang 2</option>
                </select>
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="kat1"
                  className="text-gray-700 text-sm font-semibold mb-2"
                >
                  Kat I
                </Label>
                <Input
                  type="number"
                  id="kat1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  value={kat1}
                  onChange={(e) => setKat1(parseInt(e.target.value))}
                />
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="kat2"
                  className="text-gray-700 text-sm font-semibold mb-2"
                >
                  Kat II
                </Label>
                <Input
                  type="number"
                  id="kat2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  value={kat2}
                  onChange={(e) => setKat2(parseInt(e.target.value))}
                />
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="kat3"
                  className="text-gray-700 text-sm font-semibold mb-2"
                >
                  Kat III
                </Label>
                <Input
                  type="number"
                  id="kat3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  value={kat3}
                  onChange={(e) => setKat3(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <Label
                  htmlFor="totalTarget"
                  className="text-gray-700 text-sm font-semibold mb-2 mt-5"
                >
                  Total Target
                </Label>
                <Input
                  type="text"
                  id="totalTarget"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                  value={`Rp ${totalTarget.toLocaleString("id-ID")}`}
                  readOnly
                />
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="perolehanProvinsi"
                  className="text-gray-700 text-sm font-semibold mb-2"
                >
                  Perolehan Provinsi (89,5%)
                </Label>
                <Input
                  type="text"
                  id="perolehanProvinsi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                  value={`Rp ${perolehanProvinsi.toLocaleString("id-ID")}`}
                  readOnly
                />
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="perolehanCabang"
                  className="text-gray-700 text-sm font-semibold mb-2"
                >
                  Perolehan Cabang (6,5%)
                </Label>
                <Input
                  type="text"
                  id="perolehanCabang"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                  value={`Rp ${perolehanCabang.toLocaleString("id-ID")}`}
                  readOnly
                />
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="perolehanKabupaten"
                  className="text-gray-700 text-sm font-semibold mb-2"
                >
                  Perolehan Kabupaten (4%)
                </Label>
                <Input
                  type="text"
                  id="perolehanKabupaten"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                  value={`Rp ${perolehanKabupaten.toLocaleString("id-ID")}`}
                  readOnly
                />
              </div>
            </div>
            <div className="mt-8 flex justify-center space-x-4">
              <Button
                className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-150 ease-in-out"
                onClick={handleSubmit}
              >
                Submit
              </Button>
              <Button
                className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-600 transition duration-150 ease-in-out"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
