import axios from "axios";
import { ReceiptEuro } from "lucide-react";

const axiosClient = axios.create({
 baseURL: "http://localhost:8080",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

// Konversi Gambar Dalam Format Base64
const base64ToBlob = (base64, mime) => {
  const byteChars = atob(base64);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new Blob([byteNumbers], { type: mime });
};

// Auth
const registerUser = async (userData) => {
  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(userData)) {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else if (key === "foto" && value) {
        const blob = base64ToBlob(value, "image/jpeg");
        formData.append(key, blob, "foto.jpg");
      } else {
        formData.append(key, value);
      }
    }

    const response = await axiosClient.post(
      "/api/auth/register-user",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

const login = async (loginData) => {
  try {
    const response = await axiosClient.post(
      "/api/auth/login-tanggal-lahir",
      loginData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada server");
    }
  }
};

const loginAdmin = async (npaPgri, password) => {
  try {
    const response = await axiosClient.post(
      "/api/auth/login-password",
      {
        npaPgri,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response login:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error saat login:", error);
    throw error.response?.data || error.message;
  }
};

// General
const getCabang = () => axiosClient.get("/api/daftarCabang");
const getJabatan = () => axiosClient.get("/api/daftarJabatan");
const getGolonganJabatan = () => axiosClient.get("/api/daftarGolongan");
const getUnitKerja = () => axiosClient.get("/api/unit-kerja/all");
const getBulan = () => axiosClient.get("/api/bulan");
const searchUsersByName = (namaLengkap) => {
  return axiosClient.get(
    `/api/auth/search-users?namaLengkap=${encodeURIComponent(namaLengkap)}`
  );
};

// Anggota
const getAllAnggota = (page = 0, size = 10) => {
  return axiosClient.get(`/api/auth/users?page=${page}&size=${size}`);
};
const getUserById = async (userId) => {
  try {
    const response = await axiosClient.get(`/api/auth/user/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const getFileByNip = async (nip) => {
  try {
    const response = await axiosClient.get(`/api/files/nip/${nip}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
}
// Update DATA
const updateUserById = async (userId, formData) => {
  try {
    const response = await axiosClient.put(
      `/api/auth/user/${userId}`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Cek NIP
const getByNIP = async (nip) => {
  try {
    const response = await axiosClient.get(`api/files/nip/${nip}`);
    return response.data;
  } catch (error) {
    console.error("Error mendapat data by NIP:", error);
    throw error;
  }
};

const updateRegisUser = async (userId, data) => {
  try {
    const response = await axiosClient.post(
      `/api/files/updateRegisterUser/${userId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating register user:", error);
    throw error;
  }
};

// Keanggotaan
const updateVerified = async (userId) => {
  try {
    const response = await axios.post(`/api/auth/user/5279/verify`);
    return response.data;
  } catch (error) {
    console.error("Error updateVerfied user:", error);
    throw error;
  }
};

// Verifikasi Anggota
const getUnverifiedUsers = (
  page = 0,
  size = 10,
  cabang = null,
  unitKerja = null
) => {
  const params = new URLSearchParams({ page, size });

  if (cabang) params.append("cabang", cabang);
  if (unitKerja) params.append("unitKerja", unitKerja);

  return axiosClient.get(`/api/auth/unverified-users?${params.toString()}`);
};
const verifyUser = async (userId) => {
  try {
    const response = await axiosClient.put(`/api/auth/user/${userId}/verify`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};
const RejectUser = async (userId) => {
  try {
    const response = await axiosClient.delete(`/api/auth/user/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

// Pengaturan
const addUnitKerja = async (payload) => {
  try {
    const response = await axiosClient.post("/api/unit-kerja/create", payload);
    return response.data;
  } catch (error) {
    console.error("Error adding unit kerja:", error);
    throw error;
  }
};
const addCabang = async (payload) => {
  try {
    const response = await axiosClient.post("/api/daftarCabang", payload);
    return response.data;
  } catch (error) {
    console.error("Error adding unit kerja:", error);
    throw error;
  }
};
const deleteCabang = async (idCabang) => {
  try {
    const response = await axiosClient.delete(`/api/daftarCabang/${idCabang}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const cekNpa = async (npa) => {
  try {
    const response = await axiosClient.get(`/api/auth/npa/${npa}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};
const getAllAdmin = (page = 0, size = 10, nama = "", email = "") => {
  let query = `?page=${page}&size=${size}`;
  if (nama) {
    query += `&nama=${encodeURIComponent(nama)}`;
  }
  if (email) {
    query += `&email=${encodeURIComponent(email)}`;
  }
  return axiosClient.get(`/api/register-admin/all${query}`);
};
const createAdmin = async (adminData) => {
  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(adminData)) {
      if (key === "foto" && value) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    }

    const response = await axiosClient.post(
      "/api/register-admin/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};
const deleteAdmin = async (idAdmin) => {
  try {
    const response = await axiosClient.delete(`/api/register-admin/${idAdmin}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

// LAPOR
// Search users by name LAPOR
const searchUsers = (name) => {
  return axiosClient.get(
    `api/auth/users/name-and-ids?name=${encodeURIComponent(name)}`
  );
};

// submit lapor
const submitReport = async (reportData) => {
  try {
    const response = await axiosClient.post("/api/laporan/create", reportData);
    return response.data;
  } catch (error) {
    console.error(
      "Error submitting report:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const getRekapAnggota = async (cabang) => {
  try {
    const response = await axiosClient.get(
      `/api/rekap-anggota/by-cabang?cabang=${cabang}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching rekap anggota:", error);
    throw error;
  }
};

// REKAP MENINGGAL
const getRekapMeninggal = async () => {
  try {
    const response = await axiosClient.get("/api/rekap/meninggal"); // Ganti dengan endpoint yang sesuai
    return response.data;
  } catch (error) {
    console.error("Error fetching rekap meninggal:", error);
    throw error;
  }
};

const getAllDataLapor = async () => {
  try {
    const response = await axiosClient.get("/api/laporan/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching all data:", error);
    throw error;
  }
};

const getRekapById = async (userId) => {
  try {
    const response = await axiosClient.get(`/api/laporan/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

// History Data
const getHistoryData = async (page = 0, size = 10) => {
  try {
    const response = await axiosClient.get(`/api/history`, {
      params: {
        page: page,
        size: size,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching history data:", error);
    throw error;
  }
};

const getHistoryDataById = async (userId) => {
  try {
    // Ambil data login berdasarkan userId
    const loginHistoryResponse = await axiosClient.get(
      `/api/history/user/${userId}/login`
    );
    const loginHistory = loginHistoryResponse.data;

    // Ambil data mutasi cabang/unit kerja berdasarkan userId
    const mutasiHistoryResponse = await axiosClient.get(
      `/api/history/user/${userId}/mutasi`
    );
    const mutasiHistory = mutasiHistoryResponse.data;

    // Gabungkan kedua data menjadi satu histori
    const combinedHistory = [
      ...loginHistory.map((item) => ({
        ...item,
        type: "Login", // Tambahkan tipe data untuk membedakan
      })),
      ...mutasiHistory.map((item) => ({
        ...item,
        type: "Mutasi", // Tambahkan tipe data untuk membedakan
      })),
    ];

    // Sortir data berdasarkan timestamp (jika ada)
    combinedHistory.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    return combinedHistory;
  } catch (error) {
    console.error("Error fetching history data:", error);
    throw error;
  }
};

const cekNpaList = async (npaList) => {
  try {
    const response = await axiosClient.get(
      `/api/auth/getByNpa?npaList=${npaList.join(",")}`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const getHistoryByNpa = async (npa) => {
  try {
    const response = await axiosClient.get(`/api/history/npa/${npa}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching history for NPA ${npa}:`, error);
    throw error;
  }
};

// Bantuan
const getAdminBantuan = () =>
  axiosClient.get("/api/register-admin/admins-per-cabang");

// Teman Unit Kerja
const getTemanUnitKerja = async (unitKerja, page = 0, size = 50) => {
  try {
    const response = await axiosClient.get("/api/auth/teman-unit-kerja", {
      params: {
        unitKerja: unitKerja,
        page: page,
        size: size,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching teman unit kerja:", error);
    throw error;
  }
};

// STATISTIK
const getCalculateSanduka = async (bulan, tahun, cabang) => {
  try {
    const response = await axiosClient.get("/api/calculate-sanduka", {
      params: { bulan, tahun, cabang },
    });
    if (response.data) {
      return response.data;
    } else {
      throw new Error("Invalid response data");
    }
  } catch (error) {
    if (error.response && error.response.status === 500) {
      console.warn(
        "Server returned status 500 but with data:",
        error.response.data
      );
      return error.response.data;
    }
    console.error("Error fetching calculate-sanduka data:", error);
    throw error;
  }
};

const getCalculateSandukaBaru = async (month, year, cabang) => {
  try {
    const respons = await axiosClient.get("/api/calculate-sanduka/baru", {
      params: {
        cabang: cabang || null,
        year: year,
        month: month,
      },
    });
    return respons.data;
  } catch (error) {
    console.error("Error fetching calculate-sanduka data:", error);
    throw error;
  }
};

const getCalculateSandukaMeninggal = async (month, year, cabang) => {
  try {
    const respons = await axiosClient.get("/api/calculate-sanduka/meninggal", {
      params: {
        cabang: cabang || null,
        year: year,
        month: month,
      },
    });
    return respons.data;
  } catch (error) {
    console.error("Error fetching calculate-sanduka data:", error);
    throw error;
  }
};

const getCalculateSandukaPensiun = async (month, year, cabang) => {
  try {
    const respons = await axiosClient.get("/api/calculate-sanduka/pensiun", {
      params: {
        cabang: cabang || null,
        year: year,
        month: month,
      },
    });
    return respons.data;
  } catch (error) {
    console.error("Error fetching calculate-sanduka data:", error);
    throw error;
  }
};

const getCalculateSandukaKeluar = async (month, year, cabang) => {
  try {
    const respons = await axiosClient.get(
      "/api/calculate-sanduka/keluar-anggota",
      {
        params: {
          cabang: cabang || null,
          year: year,
          month: month,
        },
      }
    );
    return respons.data;
  } catch (error) {
    console.error("Error fetching calculate-sanduka data:", error);
    throw error;
  }
};

const getTotalAnggotaStatistik = async () => {
  try {
    const respons = await axiosClient.get("/api/iuran/total-anggota");
    return respons.data;
  } catch (error) {
    console.error("Error fetching total anggota:", error);
    throw error;
  }
};

// Sinkronisasi
const uploadFile = async (formData) => {
  try {
    const response = await axiosClient.post("/api/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

const getAllFiles = async () => {
  try {
    const response = await axiosClient.get("/api/files/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};

const getCalculateSandukaAll = async (bulan, tahun) => {
  try {
    const today = new Date();
    const currentMonth = today.toLocaleString("default", { month: "long" });
    const currentYear = today.getFullYear();

    const xbulan = bulan || currentMonth;
    const xtahun = tahun || currentYear;

    const response = await axiosClient.get(
      "/api/calculate-sanduka/cabang-all",
      {
        params: {
          xbulan: xbulan,
          xtahun: xtahun,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching calculate sanduka cabang all:", error);
    throw error;
  }
};

// KEUANGAN
// Home start
const getTableIuran = async (bulan, tahun, cabang) => {
  try {
    const response = await axiosClient.get(
      `/api/iuran/total-sumbangan?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total sumbangan:", error);
    throw error;
  }
};

const getSaldoSanduka = async () => {
  try {
    const response = await axiosClient.get("/api/sanduka/saldo-sanduka");
    return response.data;
  } catch (error) {
    console.error("Error fetching saldo sanduka:", error);
    throw error;
  }
};

const getSaldoOrganisasi = async () => {
  try {
    const response = await axiosClient.get("/api/sanduka/saldo-organisasi");
    return response.data;
  } catch (error) {
    console.error("Error fetching saldo organisasi:", error);
    throw error;
  }
};

const editPemasukanUangMasuk = async (noBukti) => {
  try {
    const response = await axiosClient.get(
      `/api/uang-masuk-keluar/by-no-bukti`,
      {
        params: { noBukti },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fatching data by noBukti", error);
    throw error;
  }
};
// end
// START IURAN PGRI
const getTotalAnggota = async () => {
  try {
    const response = await axiosClient.get("/api/iuran/total-anggota");
    return response.data;
  } catch (error) {
    console.error("Error fetching total anggota:", error);
    throw error;
  }
};
const getIuranByFilter = async (iuran) => {
  try {
    const response = await axiosClient.get(
      `/api/defaultIuran/filter?iuran=${iuran}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching iuran by filter:", error);
    throw error;
  }
};

const createIuranData = async (payload) => {
  try {
    const response = await axiosClient.post("/api/iuran", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating iuran data:", error);
    throw error;
  }
};

const createTargetIuaran = async (payload) => {
  try {
    const response = await axiosClient.post("/api/target-sanduka", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating target iuran data:", error);
    throw error;
  }
};

const getTotalAnggotaByCabang = async (cabang) => {
  try {
    const response = await axiosClient.get(
      `/api/iuran/total-anggota-by-cabang?cabang=${cabang}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total anggota by cabang:", error);
    throw error;
  }
};
// END
// DASPEN start (Sumbangan Daspen)
const createDaspenData = async (payload) => {
  try {
    const response = await axiosClient.post("/api/tabel-daspen", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating daspen data:", error);
    throw error;
  }
};
// (Target Daspen)
const createTargetDaspen = async (payload) => {
  try {
    const response = await axiosClient.post("/api/target-daspen", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating data target daspen :", error);
    throw error;
  }
};
// Table Daspen
const getTableDaspen = async (bulan, tahun, cabang) => {
  try {
    const response = await axiosClient.get(
      `/api/target-daspen/summary?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total sumbangan:", error);
    throw error;
  }
};
// end
// Star Derap
const createDerapData = async (payload) => {
  try {
    const response = await axiosClient.post("/api/derap", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating derap data:", error);
    throw error;
  }
};
const createTargetDerap = async (payload) => {
  try {
    const response = await axiosClient.post("/api/target-derap", payload);

    return response.data;
  } catch (error) {
    console.error("Error creating target derap data:", error);
    throw error;
  }
};
const getTableDerap = async (bulan, tahun, cabang) => {
  try {
    const response = await axiosClient.get(
      `/api/target-derap/tabel?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total sumbangan:", error);
    throw error;
  }
};
// End
// Start Kalender
const createKalenderData = async (payload) => {
  try {
    const response = await axiosClient.post("/api/kalender", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating derap data:", error);
    throw error;
  }
};
const createTargetKalender = async (payload) => {
  try {
    const response = await axiosClient.post("/api/target-kalender", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating target derap data:", error);
    throw error;
  }
};
const getTableKalender = async (bulan, tahun, cabang) => {
  try {
    const response = await axiosClient.get(
      `/api/target-kalender/tabel?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total Kalender:", error);
    throw error;
  }
};
// END

// Sanduka
// Pemasukan & Pengeluaran Sanduka
const sendSesuaiJumlahTarget = async (data) => {
  try {
    const response = await axiosClient.post(
      "/api/uang-masuk-keluar/sesuai-jumlah-target",
      data
    );

    return response.data;
  } catch (error) {
    console.error("Error sending sesuai jumlah target:", error);
    throw error;
  }
};
const getNoBukti = async () => {
  try {
    const response = await axiosClient.get(`/api/bukti/generate`);
    return response.data;
  } catch (error) {
    console.error("Error generating bukti:", error);
    throw error;
  }
};
const getTablePemasukanSanduka = async (month, year) => {
  try {
    const response = await axiosClient.get(
      `/api/uang-masuk-keluar/tabel?month=${month}&year=${year}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Uang Masuk Keluar:", error);
    throw error;
  }
};
const createPembayaranSanduka = async (payload) => {
  try {
    const response = await axiosClient.post("/api/uang-masuk-keluar", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating pembayaran sanduka data:", error);
    throw error;
  }
};
// Rekap Lapor Sanduka
const getRekapLaporDiterima = async () => {
  try {
    const response = await axiosClient.get("/api/rekap-lapor-sanduka/diterima");
    return response.data;
  } catch (error) {
    console.error("Error fetching Data Lapor:", error);
    throw error;
  }
};
const getRekapLaporBelom = async () => {
  try {
    const response = await axiosClient.get(
      "/api/rekap-lapor-sanduka/belom-diterima"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Data Lapor:", error);
    throw error;
  }
};
// end
// Data Lapor
const getDataLapor = async () => {
  try {
    const response = await axiosClient.get("/api/notifikasi/data-terlapor");
    return response.data;
  } catch (error) {
    console.error("Error fetching Data Lapor:", error);
    throw error;
  }
};
// end

// Laporan Sanduka (TARGET DAN REALISASI)
const getTableTargetRealisasi = async (
  tahun,
  bulan,
  inputKecamatan,
  bulanuangmasuk
) => {
  try {
    const response = await axiosClient.get(
      `/api/laporan-target-realisasi?bulan=${bulan}&tahun=${tahun}&inputKecamatan=${inputKecamatan}&bulanuangmasuk=${bulanuangmasuk}`
      // Pastikan '=' ditambahkan di sini
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total Target Realisasi:", error);
    throw error;
  }
};
// (Laporan Pemasukan SANDUKA)
const getLaporanPemasukan = async (bulan) => {
  try {
    const response = await axiosClient.get(
      `/api/laporan-pemasukan-sanduka?bulan=${bulan}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan pemasukan sanduka:", error);
    throw error;
  }
};

// (Laporan Pengeluaran SANDUKA)
const getLaporanPengeluaran = async (tanggal) => {
  try {
    const response = await axiosClient.get(
      `/api/laporan-pengeluaran-sanduka?tanggal=${tanggal}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan pengeluaran sanduka:", error);
    throw error;
  }
};
// Create Kwitansi
const createKwitansiByIdAndNpa = async (id, npaPgri, formData) => {
  try {
    const response = await axiosClient.post(
      `/api/kwitansi/${id}/${npaPgri}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Mengembalikan data dari respons API
    return response.data;
  } catch (error) {
    console.error("Error uploading kwitansi data:", error);
    throw error;
  }
};

// Get Kwitansi
const getKwitansiByIdAndNpa = async (id, npaPgri) => {
  try {
    // Menambahkan responseType sebagai "blob"
    const response = await axiosClient.get(`/api/kwitansi/${id}/${npaPgri}`, {
      responseType: "blob",
    });
    return response; // Mengembalikan seluruh respons, bukan hanya data
  } catch (error) {
    console.error("Error fetching kwitansi data:", error);
    throw error;
  }
};

// (Laporan Pemasukan Tahunan)
const getLaporanPemasukanTahunan = async (tahun) => {
  try {
    const response = await axiosClient.get(
      `api/laporan-pemasukan-tahunan?tahun=${tahun}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan pemasukan tahunan:", error);
    throw error;
  }
};
// (Laporan Pengeluaran Tahunan)
const getLaporanPengeluaranTahunan = async (year) => {
  try {
    const response = await axiosClient.get(
      `/api/laporan-pengeluaran-tahunan?year=${year}`
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching laporan pengeluaran tahunan:", error);
    throw error;
  }
};
// END
// Saldo Akhir Sanduka
const getSaldoAkhir = async (month, year) => {
  try {
    const response = await axiosClient.get(`/api/laporan-akhir`, {
      params: { month, year },
    });
    return response.data;
  } catch (error) {
    console.error("Error fatching saldo akhir:", error);
    throw error;
  }
};

// REKAP ANGGOTA
// start
const getRekapAnggotaByCabang = async (cabang) => {
  try {
    const response = await axiosClient.get(`/api/by-nominal/${cabang}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rekap anggota:", error);
    throw error;
  }
};
// end

//Start Pensiun
const getAllPensiun = (page = 0, size = 10) => {
  return axiosClient.get(`/api/pensiun?page=${page}&size=${size}`);
};
// ENd

//Notifikasi
const getNotifikasi = async (count) => {
  try {
    const response = await axiosClient.get("/api/notifikasi/count");
    return response.data;
  } catch (error) {
    console.error("Error creating notifikasi data:", error);
    throw error;
  }
};

const getAnggotaMeninggal = async () => {
  try {
    const response = await axiosClient.get("/api/notifikasi/data-terlapor");
    return response.data;
  } catch (error) {
    console.error("Error fetching anggota meninggal data:", error);
    throw error;
  }
};

// Mutasi
const keluarAnggota = async (anggotaId) => {
  try {
    const response = await axiosClient.put(
      `api/mutasi-anggota/${anggotaId}/keluar`
    );
    return response.data;
  } catch (error) {
    console.error("Error saat mengeluarkan anggota: ", error);
    throw error;
  }
};

const pensiunAnggota = async (anggotaId) => {
  try {
    const response = await axiosClient.put(
      `api/mutasi-anggota/${anggotaId}/pensiun`
    );
    return response.data;
  } catch (error) {
    console.error("Error saat mengeluarkan anggota: ", error);
    throw error;
  }
};

const mutasiCabangUnitKerja = async (idAnggota, cabang, unitKerja) => {
  try {
    const url = `/api/mutasi-anggota/${idAnggota}/update-cabang-unitkerja?cabang=${encodeURIComponent(
      cabang
    )}&unitKerja=${encodeURIComponent(unitKerja)}`;
    const response = await axiosClient.put(url);
    return response.data; // Kembalikan data response
  } catch (error) {
    console.error("Error saat memutasikan anggota:", error);
    console.error("Response data:", error.response?.data); // Log response data jika ada error
    throw error; // Lempar kembali error untuk ditangani di tempat lain
  }
};

// AKSI Pelaporan Anggota
const batalLaporanById = async (id) => {
  try {
    const response = await axiosClient.put(`/api/laporan/${id}/batal`);

    return response.data;
  } catch (error) {
    console.error("Error saat membatalkan laporan:", error);
    throw error.response?.data || error.message;
  }
};

const verifikasiLaporanById = async (id, data) => {
  try {
    const response = await axiosClient.put(
      `/api/laporan/${id}/tanggal-santunan`,
      data
    );

    return response.data;
  } catch (error) {
    console.error("Error saat memperbarui tanggal santunan:", error);
    throw error.response?.data || error.message;
  }
};

// Delete USER
const deleteUser = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/auth/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data: ", error);
    throw error;
  }
};

// Export all functions
export default {
  registerUser,
  login,
  getAllAnggota,
  getUnverifiedUsers,
  verifyUser,
  RejectUser,
  getCabang,
  getJabatan,
  getGolonganJabatan,
  getUnitKerja,
  addUnitKerja,
  addCabang,
  deleteCabang,
  cekNpa,
  searchUsers,
  getUserById,
  getAllAdmin,
  createAdmin,
  deleteAdmin,
  submitReport,
  getRekapAnggota,
  getRekapMeninggal,
  getRekapById,
  getAllDataLapor,
  getHistoryData,
  cekNpaList,
  getAdminBantuan,
  getTemanUnitKerja,
  getBulan,
  getCalculateSanduka,
  getCalculateSandukaAll,
  getSaldoSanduka,
  getSaldoOrganisasi,
  getRekapAnggotaByCabang,
  getHistoryByNpa,
  createIuranData,
  createDaspenData,
  getAllPensiun,
  getIuranByFilter,
  createTargetDaspen,
  createDerapData,
  createTargetDerap,
  createTargetIuaran,
  getTableIuran,
  getTableDaspen,
  getTableDerap,
  getTableKalender,
  createKalenderData,
  createTargetKalender,
  getTotalAnggota,
  getTablePemasukanSanduka,
  createPembayaranSanduka,
  getDataLapor,
  getRekapLaporDiterima,
  getRekapLaporBelom,
  getTableTargetRealisasi,
  getLaporanPemasukanTahunan,
  getLaporanPengeluaranTahunan,
  getLaporanPemasukan,
  getLaporanPengeluaran,
  getNotifikasi,
  getAnggotaMeninggal,
  uploadFile,
  getAllFiles,
  updateUserById,
  updateVerified,
  getSaldoAkhir,
  keluarAnggota,
  pensiunAnggota,
  mutasiCabangUnitKerja,
  getByNIP,
  updateRegisUser,
  getNoBukti,
  sendSesuaiJumlahTarget,
  loginAdmin,
  editPemasukanUangMasuk,
  batalLaporanById,
  verifikasiLaporanById,
  createKwitansiByIdAndNpa,
  getKwitansiByIdAndNpa,
  searchUsersByName,
  deleteUser,
  getHistoryDataById,
  getCalculateSandukaBaru,
  getCalculateSandukaMeninggal,
  getCalculateSandukaPensiun,
  getCalculateSandukaKeluar,
  getTotalAnggotaStatistik,
  getTotalAnggotaByCabang,
  getFileByNip,
};
