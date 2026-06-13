import axios from "axios";
import { ReceiptEuro } from "lucide-react";

export const BASE_URL = "https://sb.pgrikabupatenjepara.com";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
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
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

const loginAdmin = async (loginData) => {
  try {
    const response = await axiosClient.post(
      "/api/auth/login-email-password",
      loginData,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    const errorObj = new Error(
      error.response?.data?.message || "Terjadi kesalahan pada server",
    );
    errorObj.statusCode = error.response?.status;
    throw errorObj;
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
      },
    );

    return response.data;
  } catch (error) {
    const errorObj = new Error(
      error.response?.data?.message || "Terjadi kesalahan pada server",
    );
    errorObj.statusCode = error.response?.status;
    throw errorObj;
  }
};

// General
const getCabang = () => axiosClient.get("/api/daftarCabang");
const getJabatan = () => axiosClient.get("/api/daftarJabatan");
const getGolonganJabatan = () => axiosClient.get("/api/daftarGolongan");
const getUnitKerja = () => axiosClient.get("/api/unit-kerja");
const getUnitKerjaByCabang = async (cabang) => {
  try {
    const response = await axiosClient.get(
      `/api/unit-kerja?cabang=${encodeURIComponent(cabang)}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getBulan = () => axiosClient.get("/api/bulan");
const getJumlahSantunan = async () => {
  try {
    const response = await axiosClient.get(`/api/auth/jumlah-santunan`);
    return response.data;
  } catch (error) {
    console.error("Error fetching jumlah santunan:", error);
    throw error;
  }
};
const getSantunanDiberikan = async () => {
  try {
    const response = await axiosClient.get(
      `/api/pengeluaran-sanduka/count-santunan-diberikan`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching jumlah santunan:", error);
    throw error;
  }
};
const getTotalSantunan = async () => {
  try {
    const response = await axiosClient.get(
      `/api/pengeluaran-sanduka/count-santunan-duka`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching jumlah santunan:", error);
    throw error;
  }
};
const searchUsersByName = (namaLengkap) => {
  return axiosClient.get(
    `/api/auth/search-users?namaLengkap=${encodeURIComponent(namaLengkap)}`,
  );
};

const getAllAnggota = async (
  page = 0,
  size = 10,
  cabang = null,
  unitKerja = null,
  keyword = null,
  statusKeanggotaan = null,
  tingkatSekolah = null,
  statusPegawai = null,
) => {
  try {
    const params = new URLSearchParams({
      page,
      size,
    });

    if (cabang) params.append("cabang", cabang);
    if (unitKerja) params.append("unitKerja", unitKerja);
    if (keyword) params.append("keyword", keyword);
    if (statusKeanggotaan)
      params.append("statusKeanggotaan", statusKeanggotaan);
    if (tingkatSekolah) params.append("tingkatSekolah", tingkatSekolah);
    if (statusPegawai) params.append("statusPegawai", statusPegawai);

    const response = await axiosClient.get(
      `/api/auth/users?${params.toString()}`,
    );

    return {
      content: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching anggota data:", error);
    throw error;
  }
};

const getAdminById = async (adminId) => {
  try {
    const response = await axiosClient.get(`/api/register-admin/${adminId}`);
    const data = response.data;

    if (data.foto) {
      data.foto = data.foto.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    }

    return data;
  } catch (error) {
    console.error("Error get admin:", error);
    throw error;
  }
};

const updateAdminById = async (adminId, formData) => {
  try {
    const response = await axiosClient.put(
      `/api/register-admin/${adminId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const response = await axiosClient.get(`/api/auth/user/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response);
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      console.error("Error Request:", error);
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const getUserByNpa = async (npa) => {
  try {
    const response = await axiosClient.get(`/api/auth/npa/${npa}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response);
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      console.error("Error Request:", error);
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const getFileByNip = async (nip) => {
  try {
    const response = await axiosClient.get(`/api/files/nip/${nip}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllDuplicates = async () => {
  try {
    const response = await axiosClient.get("/api/files/all-duplicates");
    return response.data;
  } catch (error) {
    return [];
  }
};

const deleteDuplicates = async () => {
  try {
    const response = await axiosClient.delete("/api/files/delete-duplicates");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update DATA
const updateUserById = async (userId, formData) => {
  try {
    const response = await axiosClient.put(
      `/api/auth/user/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Cek NIP
const getByNIP = async (nip) => {
  try {
    const response = await axiosClient.get(`/api/files/nip/${nip}`);
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
      },
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
  unitKerja = null,
  keyword = null,
) => {
  const params = new URLSearchParams({ page, size });

  if (cabang) params.append("cabang", cabang);
  if (unitKerja) params.append("unitKerja", unitKerja);
  if (keyword) params.append("keyword", keyword);

  return axiosClient.get(`/api/auth/unverified-users?${params.toString()}`);
};

const verifyUser = async (userId) => {
  try {
    const response = await axiosClient.put(`/api/auth/user/${userId}/verify`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
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
        error.response.data.message || "Terjadi kesalahan pada server",
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
        error.response.data.message || "Terjadi kesalahan pada server",
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
        error.response.data.message || "Terjadi kesalahan pada server",
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
      },
    );

    return response.data;
  } catch (error) {
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
        error.response.data.message || "Terjadi kesalahan pada server",
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
    `api/auth/users/name-and-ids?name=${encodeURIComponent(name)}`,
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
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
};

const getRekapAnggota = async (cabang) => {
  try {
    const response = await axiosClient.get(
      `/api/rekap-anggota/by-cabang?cabang=${cabang}`,
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
    const response = await axiosClient.get("/api/rekap/meninggal");
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
        error.response.data.message || "Terjadi kesalahan pada server",
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
        page,
        size,
      },
    });
    return response.data || { content: [], totalElements: 0 };
  } catch (error) {
    console.error("Error fetching history data:", error);
    return { content: [], totalElements: 0 };
  }
};

const cekNpaList = async (npaList) => {
  try {
    if (!Array.isArray(npaList) || npaList.length === 0) {
      return [];
    }

    const validNpaList = npaList.filter((npa) => npa && npa.trim());

    if (validNpaList.length === 0) {
      return [];
    }

    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < validNpaList.length; i += chunkSize) {
      chunks.push(validNpaList.slice(i, i + chunkSize));
    }

    const results = [];
    for (const chunk of chunks) {
      try {
        const response = await axiosClient.get(
          `/api/auth/getByNpa?npaList=${chunk.join(",")}`,
        );
        if (response.data) {
          results.push(
            ...(Array.isArray(response.data) ? response.data : [response.data]),
          );
        }
      } catch (chunkError) {
        console.warn(
          `Error fetching chunk of NPAs: ${chunk.join(",")}`,
          chunkError,
        );
        continue;
      }
    }

    return results;
  } catch (error) {
    console.error("Error in cekNpaList:", error);
    return [];
  }
};

const getHistoryByNpa = async (npa) => {
  try {
    if (!npa) {
      return [];
    }
    const response = await axiosClient.get(`/api/history/npa/${npa}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching history for NPA ${npa}:`, error);
    return [];
  }
};

// Bantuan
const getAdminBantuan = () =>
  axiosClient.get("/api/register-admin/admins-per-cabang");

// Teman Unit Kerja
const getTemanUnitKerja = async (unitKerja, cabang = null, page = 0, size = 50) => {
  try {
    const response = await axiosClient.get("/api/auth/teman-unit-kerja", {
      params: {
        unitKerja: unitKerja,
        cabang: cabang,
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
        error.response.data,
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
      },
    );
    return respons.data;
  } catch (error) {
    console.error("Error fetching calculate-sanduka data:", error);
    throw error;
  }
};

const getCalculateSandukaPindahCabang = async (month, year, cabang) => {
  try {
    const respons = await axiosClient.get(
      "/api/calculate-sanduka/pindah-cabang",
      {
        params: {
          cabang: cabang || null,
          year: year,
          month: month,
        },
      },
    );
    return respons.data;
  } catch (error) {
    console.error("Error fetching pindah cabang data:", error);
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

const updateIuranById = async (id, payload) => {
  try {
    const response = await axiosClient.put(`/api/iuran/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
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

const getAllFiles = async (query = null, statusKeanggotaan = null) => {
  try {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (statusKeanggotaan)
      params.append("statusKeanggotaan", statusKeanggotaan);

    const url = `/api/files/all?${params.toString()}`;
    const response = await axiosClient.get(url);
    return response.data;
  } catch (error) {
    console.error(
      "Gagal mengambil data file:",
      error?.response?.data || error.message,
    );
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
      },
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
      `/api/iuran/total-sumbangan?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`,
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

const getPemasukanUangMasukById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/uang-masuk-keluar/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data by id:", error);
    throw error;
  }
};

const editPemasukanUangMasuk = async (id, updatedFormValues) => {
  try {
    const response = await axiosClient.put(
      `/api/uang-masuk-keluar/${id}`,
      updatedFormValues,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data by id:", error);
    throw error;
  }
};

const hapusPemasukanUangMasuk = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/uang-masuk-keluar/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error delete data by id", error);
    throw error;
  }
};

const getDefaultIuranById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/defaultIuran/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching default iuaran", error);
    throw error;
  }
};
const updateIuranData = async (id, payload) => {
  try {
    const response = await axiosClient.put(`/api/defaultIuran/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
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
      `/api/defaultIuran/filter?iuran=${iuran}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching iuran by filter:", error);
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
      `/api/iuran/total-anggota-by-cabang?cabang=${cabang}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total anggota by cabang:", error);
    throw error;
  }
};
// END
// DASPEN start (Data Utama)
const createDaspenData = async (payload) => {
  try {
    const response = await axiosClient.post("/api/tabel-daspen", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating daspen data:", error);
    throw error;
  }
};
const createTargetDaspen = async (payload) => {
  try {
    const response = await axiosClient.post("/api/target-daspen", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating data target daspen :", error);
    throw error;
  }
};
const getAllTargetDaspen = async () => {
  try {
    const response = await axiosClient.get(`/api/target-daspen`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all target:", error);
    throw error;
  }
};
const getTableDaspen = async (bulan, tahun, cabang) => {
  try {
    const response = await axiosClient.get(
      `/api/target-daspen/summary?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total sumbangan:", error);
    throw error;
  }
};
const deleteTargetDaspen = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/target-daspen/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching derap data: ", error);
    throw error;
  }
};
const updateTargetDaspen = async (id, updatedData) => {
  try {
    const response = await axiosClient.put(
      `/api/target-daspen/${id}`,
      updatedData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating derap data: ", error);
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
      `/api/target-derap/tabel?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total sumbangan:", error);
    throw error;
  }
};
const deleteDerap = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/target-derap/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching derap data: ", error);
    throw error;
  }
};
const updateDerap = async (id, updatedData) => {
  try {
    const response = await axiosClient.put(
      `/api/target-derap/${id}`,
      updatedData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating derap data: ", error);
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
      `/api/target-kalender/tabel?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total Kalender:", error);
    throw error;
  }
};
const deleteKalender = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/target-kalender/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching derap data: ", error);
    throw error;
  }
};
const updateKalender = async (id, updatedData) => {
  try {
    const response = await axiosClient.put(
      `/api/target-kalender/${id}`,
      updatedData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating derap data: ", error);
    throw error;
  }
};
// END
// lain lain
const postLainlain = async (payload) => {
  try {
    const response = await axiosClient.post("/api/tabel-lain-lain", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating lain lain data:", error);
    throw error;
  }
};

const getLainlain = async () => {
  try {
    const response = await axiosClient.get(`/api/tabel-lain-lain`);
    return response.data;
  } catch (error) {
    console.error("Error get data Lain Lain:", error);
    throw error;
  }
};

const getKeteranganLainlain = async () => {
  try {
    const response = await axiosClient.get(`/api/tabel-lain-lain/keterangan`);
    return response.data;
  } catch (error) {
    console.error("Error get Keterangan Lain Lain:", error);
    throw error;
  }
};

const updateLainlain = async (id, updatedData) => {
  try {
    const response = await axiosClient.put(
      `/api/tabel-lain-lain/${id}`,
      updatedData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating derap data: ", error);
    throw error;
  }
};

const deleteLainlain = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/tabel-lain-lain/${id}`);
    return response;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};
// Target Lain-Lain
const createTargetLainLain = async (payload) => {
  try {
    const response = await axiosClient.post("/api/target-lain-lain", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating target lain-lain data:", error);
    throw error;
  }
};

const getTableTargetLainLain = async (bulan, tahun, cabang) => {
  try {
    const response = await axiosClient.get(
      `/api/target-lain-lain/tabel?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching target lain-lain table:", error);
    throw error;
  }
};

const updateTargetLainLain = async (id, updatedData) => {
  try {
    const response = await axiosClient.put(
      `/api/target-lain-lain/${id}`,
      updatedData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating target lain-lain data:", error);
    throw error;
  }
};

const deleteTargetLainLain = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/target-lain-lain/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting target lain-lain data:", error);
    throw error;
  }
};
// END

// Pos Lain-Lain
const postPosLainLain = async (payload) => {
  try {
    const response = await axiosClient.post("/api/pos-lain-lain", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating pos lain-lain:", error);
    throw error;
  }
};

const getPosLainLain = async () => {
  try {
    const response = await axiosClient.get("/api/pos-lain-lain");
    return response.data;
  } catch (error) {
    console.error("Error fetching pos lain-lain:", error);
    throw error;
  }
};

const getPosLainLainNames = async () => {
  try {
    const response = await axiosClient.get("/api/pos-lain-lain/names");
    return response.data;
  } catch (error) {
    console.error("Error fetching pos lain-lain names:", error);
    throw error;
  }
};

const updatePosLainLain = async (id, updatedData) => {
  try {
    const response = await axiosClient.put(`/api/pos-lain-lain/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating pos lain-lain:", error);
    throw error;
  }
};

const deletePosLainLain = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/pos-lain-lain/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting pos lain-lain:", error);
    throw error;
  }
};
// END

// Transaksi Bank (data utama)
const getTransaksiBank = async (
  bulan = null,
  tahun = null,
  query = null,
  size = 10,
  page = 0,
) => {
  try {
    const params = new URLSearchParams({ page, size });

    if (bulan) params.append("bulan", bulan);
    if (tahun) params.append("tahun", tahun);
    if (query) params.append("query", query);

    const response = await axiosClient.get(
      `/api/potongan-gaji?${params.toString()}`,
    );

    return {
      content: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching transaksi bank:", error);
    throw error;
  }
};

const getTransaksiBankBalancing = async (
  cabang = null,
  unitKerja = null,
  tahun = null,
  bulan = null,
  keterangan = null,
  search = null,
) => {
  try {
    const params = new URLSearchParams();

    if (cabang) params.append("cabang", cabang);
    if (unitKerja) params.append("unitKerja", unitKerja);
    if (tahun) params.append("tahun", tahun);
    if (bulan) params.append("bulan", bulan);
    if (keterangan) params.append("keterangan", keterangan);
    if (search) params.append("search", search);

    const url = `/api/potongan-gaji/balancing?${params.toString()}`;
    const response = await axiosClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching transaksi bank balancing:", error);
    throw error;
  }
};

const getCountAnggotaPotonganBank = async (bulan, tahun) => {
  const params = new URLSearchParams();
  params.append("bulan", bulan);
  params.append("tahun", tahun);

  try {
    const response = await axiosClient.get(
      `/api/potongan-gaji/count-anggota-potongan-bank?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Potongan Gaji Summary:", error);
    throw error;
  }
};

const getCountAnggotaSetorTunai = async ({
  cabang,
  unitKerja,
  bulan,
  tahun,
  search,
}) => {
  const params = new URLSearchParams();

  if (cabang) params.append("cabang", cabang);
  if (unitKerja) params.append("unitKerja", unitKerja);

  const now = new Date();
  params.append("bulan", bulan || now.getMonth() + 1);
  params.append("tahun", tahun || now.getFullYear());

  if (search) params.append("search", search);

  try {
    const response = await axiosClient.get(
      `/api/potongan-gaji/count-anggota-setor-tunai?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Setor Tunai Summary:", error);
    throw error;
  }
};

const getCountAnggotaTerfilter = async ({
  cabang,
  unitKerja,
  bulan,
  tahun,
  search,
}) => {
  const params = new URLSearchParams();

  if (cabang) params.append("cabang", cabang);
  if (unitKerja) params.append("unitKerja", unitKerja);

  const now = new Date();
  params.append("bulan", bulan || now.getMonth() + 1);
  params.append("tahun", tahun || now.getFullYear());

  if (search) params.append("search", search);

  try {
    const response = await axiosClient.get(
      `/api/potongan-gaji/count-total-anggota-terfilter?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Setor Tunai Summary:", error);
    throw error;
  }
};

const getBalancingById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/target-iuran-anggota/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data by id:", error);
    throw error;
  }
};

const updateBalancing = async (id, payload) => {
  try {
    const response = await axiosClient.put(
      `/api/target-iuran-anggota/${id}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error saat update anggota: ", error);
    throw error;
  }
};

const deleteBalancingById = async (id) => {
  try {
    const response = await axiosClient.delete(
      `/api/target-iuran-anggota/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error delete balancing data: ", error);
    throw error;
  }
};

const deleteBalancing = (tagihanUntukBulan) => {
  return axiosClient.delete(
    `/api/target-iuran-anggota/by-bulan?tagihanUntukBulan=${tagihanUntukBulan}`,
  );
};

const deleteTransaksiBank = async (tanggal) => {
  try {
    const response = await axiosClient.delete(
      `/api/potongan-gaji/delete-by-tanggal`,
      {
        params: { tanggal },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error delete iuran data: ", error);
    throw error;
  }
};

const importExcelTargetIuran = async (file, tagihanUntukBulan) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tagihanUntukBulan", tagihanUntukBulan);

    const response = await axiosClient.post(
      "/api/target-iuran-anggota/upload-excel",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error upload excel:", error);
    throw error;
  }
};
// End
// Sanduka
// Pemasukan & Pengeluaran Sanduka
const sendSesuaiJumlahTarget = async (data) => {
  try {
    const response = await axiosClient.post(
      "/api/uang-masuk-keluar/sesuai-jumlah-target",
      data,
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
const getTablePemasukanSanduka = async (month, year, jenisPembayaran) => {
  try {
    const response = await axiosClient.get(
      `/api/uang-masuk-keluar/tabel?month=${month}&year=${year}&jenisPembayaran=${jenisPembayaran}`,
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

const createSaldoAwal = async (saldoAwalRequest) => {
  try {
    const response = await axiosClient.post(
      "/api/uang-masuk-keluar/create-saldo-awal",
      saldoAwalRequest,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating saldo awal sanduka data:", error);
    throw error;
  }
};
// Rekap Lapor Sanduka
const getRekapLaporDiterima = async (bulan, tahun, cabang) => {
  try {
    const response = await axiosClient.get(
      "/api/rekap-lapor-sanduka/diterima",
      {
        params: {
          cabang: cabang,
          bulanTransaksi: bulan,
          tahunTransaksi: tahun,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Data Lapor:", error);
    throw error;
  }
};

const getRekapLaporBelom = async () => {
  try {
    const response = await axiosClient.get(
      "/api/rekap-lapor-sanduka/belom-diterima",
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
  bulanuangmasuk,
) => {
  try {
    const response = await axiosClient.get(
      `/api/laporan-target-realisasi?bulan=${bulan}&tahun=${tahun}&inputKecamatan=${inputKecamatan}&bulanuangmasuk=${bulanuangmasuk}`,
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
      `/api/laporan-pemasukan-sanduka?bulan=${bulan}`,
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
      `/api/laporan-pengeluaran-sanduka?tanggal=${tanggal}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan pengeluaran sanduka:", error);
    throw error;
  }
};
// Get anggota meninggal
const getNamaKwitansi = async (year, month) => {
  try {
    const response = await axiosClient.get(`/api/auth/users-deceased`, {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users deceased:", error);
    throw error;
  }
};
// Generate Kwitansi
const generateKwitansi = async (data) => {
  try {
    const response = await axiosClient.post(`/api/kwitansi/generate`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "blob",
    });

    return response;
  } catch (error) {
    console.error("Error generating kwitansi:", error);
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
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error uploading kwitansi data:", error);
    throw error;
  }
};

// Get Kwitansi
const getKwitansiByIdAndNpa = async (id, npaPgri) => {
  try {
    const response = await axiosClient.get(`/api/kwitansi/${id}/${npaPgri}`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error fetching kwitansi data:", error);
    throw error;
  }
};

// (Laporan Pemasukan Tahunan)
const getLaporanPemasukanTahunan = async (tahun) => {
  try {
    const response = await axiosClient.get(
      `api/laporan-pemasukan-tahunan?tahun=${tahun}`,
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
      `/api/laporan-pengeluaran-tahunan?year=${year}`,
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
    console.error("Error fetching saldo akhir:", error);
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

const getNominalAggregatedData = async (
  cabang,
  unitKerja,
  namaAnggota,
  bulan,
  tahun,
) => {
  try {
    const params = new URLSearchParams();
    if (cabang) params.append("cabang", cabang);
    if (unitKerja) params.append("unitKerja", unitKerja);
    if (namaAnggota) params.append("namaAnggota", namaAnggota);
    if (bulan) params.append("bulan", bulan);
    if (tahun) params.append("tahun", tahun);

    const response = await axiosClient.get(
      `/api/by-nominal/aggregated?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching aggregated data:", error);
    throw error;
  }
};

const uploadSinkronBank = async (formData) => {
  try {
    const response = await axiosClient.post(
      "/api/potongan-gaji/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

const postToBackup = async (tagihanUntukBulan) => {
  try {
    const response = await axiosClient.post(
      `/api/by-nominal/backup?tagihanUntukBulan=${tagihanUntukBulan}`,
      {},
    );
    return response.data;
  } catch (error) {
    console.error("Error posting to backup API:", error);
    throw error;
  }
};

const postToBackupNew = async (tagihanUntukBulan = null) => {
  try {
    const params = new URLSearchParams();
    if (tagihanUntukBulan) {
      params.append("tagihanUntukBulan", tagihanUntukBulan);
    }

    const query = params.toString();
    const response = await axiosClient.post(
      `/api/by-nominal-new/create-from-by-nominal${query ? `?${query}` : ""}`,
      {},
    );
    return response.data;
  } catch (error) {
    console.error("Error posting to new backup API:", error);
    throw error;
  }
};

const postToBackupByNominal = async (tahun, bulan) => {
  try {
    const response = await axiosClient.post(
      `/api/by-nominal/backup-bynominal?tahun=${encodeURIComponent(tahun)}&bulan=${encodeURIComponent(bulan)}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error posting to backup-bynominal API:", error);
    throw error;
  }
};

const postIuranAnggota = async (data) => {
  try {
    const response = await axiosClient.post("/api/iuran-anggota", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating iuran anggota:", error);
    throw error;
  }
};

const getIuranAnggotaAll = async (bulan, tahun) => {
  try {
    const response = await axiosClient.get(`/api/iuran-anggota`, {
      params: {
        bulan: bulan,
        tahun: tahun,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getIuranAnggota = async (npa) => {
  try {
    const response = await axiosClient.get(`/api/iuran-anggota/npa/${npa}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const putIuranAnggota = async (id, payload) => {
  try {
    const response = await axiosClient.put(`/api/iuran-anggota/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saat update anggota: ", error);
    throw error;
  }
};

const deleteIuranAnggota = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/iuran-anggota/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error delete iuran data: ", error);
    throw error;
  }
};

const getNoRekening = async () => {
  try {
    const response = await axiosClient.get(
      `/api/iuran-anggota/all-nomor-rekening`,
    );
    return response.data;
  } catch (error) {
    console.error("Error ambil data no rekening:", error);
    throw error;
  }
};

const getAllPensiun = (
  page = 0,
  size = 10,
  cabang = null,
  bulan = null,
  tahun = null,
  keyword = null,
  status = null,
) => {
  const params = new URLSearchParams({ page, size });

  if (cabang) params.append("cabang", cabang);
  if (bulan) params.append("bulan", bulan);
  if (tahun) params.append("tahun", tahun);
  if (keyword) params.append("keyword", keyword);
  if (status) params.append("status", status);

  return axiosClient.get(`/api/pensiun?${params.toString()}`);
};

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

const getAnggotaMeninggal = async (year, month) => {
  try {
    const response = await axiosClient.get("/api/auth/users-deceased", {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users deceased:", error);
    throw error;
  }
};

// Mutasi
const keluarAnggota = async (anggotaId, keterangan) => {
  try {
    const response = await axiosClient.put(
      `api/mutasi-anggota/${anggotaId}/keluar`,
      {
        keterangan: keterangan,
      },
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
      `api/mutasi-anggota/${anggotaId}/pensiun`,
    );
    return response.data;
  } catch (error) {
    console.error("Error saat mengeluarkan anggota: ", error);
    throw error;
  }
};

const mutasiCabangUnitKerja = async (
  idAnggota,
  cabang,
  unitKerja,
  keterangan,
) => {
  try {
    const url = `/api/mutasi-anggota/${idAnggota}/update-cabang-unitkerja?cabang=${encodeURIComponent(
      cabang,
    )}&unitKerja=${encodeURIComponent(
      unitKerja,
    )}&keterangan=${encodeURIComponent(keterangan || "")}`;

    const response = await axiosClient.put(url);
    return response.data;
  } catch (error) {
    console.error("Error saat memutasikan anggota:", error);
    console.error("Response data:", error.response?.data);
    throw error;
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
      data,
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

const createHistoryData = async (historyData) => {
  try {
    const response = await axiosClient.post("/api/history", historyData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating history data:", error);
    throw error;
  }
};

const getAllHistoryData = async (page = 0, size = 10) => {
  try {
    const response = await axiosClient.get(`/api/history`, {
      params: {
        page: page,
        size: size,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all history data:", error);
    throw error;
  }
};

const getJumlahDataUpload = async () => {
  try {
    const response = await axiosClient.get("/api/files/total");
    return response.data;
  } catch (error) {
    console.error("Error creating jumlah data terupload:", error);
    throw error;
  }
};

const deleteFiles = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/files/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching files data: ", error);
    throw error;
  }
};

const getRantingSummary = async (
  cabang = "",
  unitKerja = "",
  namaRanting = "",
) => {
  try {
    const params = {};

    if (cabang && cabang.trim() !== "") {
      params.cabang = cabang;
    }

    if (unitKerja && unitKerja.trim() !== "") {
      params.unitKerja = unitKerja;
    }

    if (typeof namaRanting === "string" && namaRanting.trim() !== "") {
      params.namaRanting = encodeURIComponent(namaRanting);
    }

    const response = await axiosClient.get("/api/ranting", { params });
    const data = response.data;

    if (Array.isArray(data)) {
      return {
        content: data.map((dataItem) => {
          return {
            cabang: dataItem.cabang,
            namaRanting: dataItem.namaRanting,
            unitKerja: dataItem.unitKerja,
            namaAnggota: processNamaAnggota(dataItem.namaAnggota),
            anggotaUnitKerja: dataItem.jumlahAnggota,
            jumlahRanting: dataItem.jumlahUnitKerja,
            jumlahAnggotaRanting: dataItem.jumlahAnggotaRanting,
            totalUnitKerja: dataItem.totalUnitKerja,
          };
        }),
      };
    }

    return { content: [] };
  } catch (error) {
    console.error("Error fetching ranting summary:", error);
    throw error;
  }
};

const getNamaranting = async () => {
  try {
    const response = await axiosClient.get("/api/ranting/all-nama-ranting");
    return response.data;
  } catch (error) {
    throw error;
  }
};

const processNamaAnggota = (namaAnggotaArray) => {
  if (!namaAnggotaArray || !Array.isArray(namaAnggotaArray)) return "";

  const filteredArray = namaAnggotaArray.filter((nama) => nama && nama.trim());

  if (filteredArray.length === 0) return "";

  const processedNames = filteredArray.map((nama) => {
    const namaParts = nama.trim().split(/\s+/);
    let processedNama = [];
    let currentPart = "";

    namaParts.forEach((part) => {
      if (
        part.match(
          /.*(S\.Pd\.I|M\.Pd\.I|S\.Ag|M\.Pd|S\.Pd|S\.PDi|S\.M\.|M\.Pd\.I|S\.Si|S\.Sos|S\.Kom|S\.Ak|S\.Or|S\.Fil\.I|S\.Ps\.I|M\.Kom|A\.Md|Gr|SPd\.SD|S\.Ps|S\.Pust).*/i,
        )
      ) {
        currentPart = currentPart ? `${currentPart} ${part}` : part;
        processedNama.push(currentPart);
        currentPart = "";
      } else {
        currentPart = currentPart ? `${currentPart} ${part}` : part;
      }
    });

    if (currentPart) {
      processedNama.push(currentPart);
    }

    return processedNama.join(" ");
  });

  return processedNames.join("\n");
};

const createRanting = async (rantingData) => {
  try {
    const response = await axiosClient.post("/api/ranting", rantingData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating ranting:", error);
    throw error;
  }
};

const getGroupedNamaRantingWithCabang = async () => {
  try {
    const response = await axiosClient.get("/api/ranting/grouped-nama-ranting");
    return response.data;
  } catch (error) {
    console.error("Error fetching grouped ranting:", error);
    throw error;
  }
};

const deleteRanting = async (namaRanting) => {
  try {
    const response = await axiosClient.delete(
      `/api/ranting/deleteByNamaRanting?namaRanting=${encodeURIComponent(
        namaRanting,
      )}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching files data: ", error);
    throw error;
  }
};

const getDetailKeuangan = async ({
  bulan1,
  bulan2,
  bulan3,
  namaBulan1,
  namaBulan2,
  namaBulan3,
  tahun,
  cabang,
}) => {
  try {
    const params = {
      bulan1,
      bulan2,
      bulan3,
      namaBulan1,
      namaBulan2,
      namaBulan3,
      tahun,
      cabang,
    };

    const response = await axiosClient.get("/api/setor/data", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const getUnverifiedUsersCountByCabang = async (cabang = "") => {
  try {
    const params = cabang ? { cabang } : {};
    const url = `/api/auth/unverified-users-count?${new URLSearchParams(
      params,
    ).toString()}`;
    const response = await axiosClient.get(encodeURI(url));
    return response;
  } catch (error) {
    throw error;
  }
};

const getAllUnitKerja = async (
  page = 0,
  size = 10,
  cabang = "",
  unitKerja = "",
) => {
  try {
    const params = {
      page,
      size,
      ...(cabang && { cabang: cabang }),
      ...(unitKerja && { unitKerja: unitKerja }),
    };
    const response = await axiosClient.get(`/api/unit-kerja/all`, { params });

    return response.data;
  } catch (error) {
    console.error("Error fetching all unit kerja data:", error);
    throw error;
  }
};

const deleteUnitKerja = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/unit-kerja/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching files data: ", error);
    throw error;
  }
};

const getUnverifiedUsersCountSuperAdmin = async () => {
  try {
    const response = await axiosClient.get(
      "/api/auth/unverified-users-count-super-admin",
    );
    return response.data;
  } catch (error) {
    console.error("Error creating jumlah data terupload:", error);
    throw error;
  }
};

const activasiUser = async (userId) => {
  try {
    const response = await axiosClient.put(`/api/auth/activate/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const getAllTotalData = async () => {
  try {
    const response = await axiosClient.get("/api/files/total-category");
    return response.data;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};

const getProgressFile = async () => {
  try {
    const response = await axiosClient.get("/api/files/progress");
    return response.data;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};

const getBackupDatabaseFile = async () => {
  try {
    const response = await axiosClient.get("/api/backup-all", {
      responseType: "arraybuffer",
    });
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString("id-ID", { month: "long" });
    const year = today.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;

    const contentDisposition = response.headers["content-disposition"];
    const fileName = contentDisposition
      ? contentDisposition.split("filename=")[1].replace(/"/g, "")
      : `backup-sanduka-${formattedDate}.xlsx`;

    const file = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = fileName;
    link.click();
  } catch (error) {
    console.error("Error fetching files:", error);
  }
};

const getBackupHistoryFile = async (
  page = 0,
  size = 10,
  searchFileName = null,
) => {
  try {
    const params = {
      page,
      size,
      ...(searchFileName && { searchFileName: searchFileName }),
    };
    const response = await axiosClient.get(`/api/backup-history`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};

const getCekHistoryData = async (
  page = 0,
  size = 10,
  cabang = null,
  unitKerja = null,
  search = null,
) => {
  try {
    const response = await axiosClient.get(`/api/history/cekData`, {
      params: {
        page: page,
        size: size,
        ...(cabang && { cabang: encodeURIComponent(cabang) }),
        ...(unitKerja && { unitKerja: unitKerja }),
        ...(search && { search: search }),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all history data:", error);
    throw error;
  }
};

//Gallery and Event
const createSidebarGallery = async (data) => {
  try {
    const formData = new FormData();
    formData.append("category", data.category);
    formData.append("deskripsi", data.deskripsi);
    formData.append("namaEvent", data.namaEvent);
    if (data.photo) {
      formData.append("photo", data.photo);
    }
    const response = await axiosClient.post("/api/sidebar-gallery", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateSidebarGallery = async (id, data) => {
  try {
    const formData = new FormData();
    formData.append("category", data.category);
    formData.append("deskripsi", data.deskripsi);
    formData.append("namaEvent", data.namaEvent);
    if (data.photo) {
      formData.append("photo", data.photo);
    }
    const response = await axiosClient.put(
      `/api/sidebar-gallery/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getAllSidebarGallery = async () => {
  try {
    const response = await axiosClient.get("/api/sidebar-gallery");
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getSidebarGalleryById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/sidebar-gallery/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getSidebarGalleryByCategory = async (category) => {
  try {
    const response = await axiosClient.get(
      `/api/sidebar-gallery/category/${category}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const deleteSidebarGallery = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/sidebar-gallery/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createNamaRanting = async (namaRanting) => {
  try {
    const response = await axiosClient.post("/api/nama-ranting", namaRanting);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating nama ranting:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Gagal membuat nama ranting",
    );
  }
};

const getNamaRantingCabang = () => axiosClient.get("/api/nama-ranting");
const getNamaRantingByCabang = (cabang) => {
  return axiosClient.get(`/api/ranting/by-cabang/${cabang}`);
};

const uploadFileRegister = async (formData) => {
  try {
    const response = await axiosClient.post("/api/auth/upload", formData, {
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

const deleteUnitKerjaRanting = async (unitKerjaIds) => {
  try {
    const response = await axiosClient.delete(
      "/api/ranting/deleteByUnitKerja",
      {
        params: { unitKerjaIds },
        paramsSerializer: (params) => {
          return new URLSearchParams(params).toString();
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting unit kerja: ", error);
    throw error;
  }
};

const deleteNamaRanting = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/nama-ranting/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error delete data by id", error);
    throw error;
  }
};

const getRekapRanting = () => axiosClient.get("/api/ranting/summary");

//Peserta Event
const addPesertaEvent = async (formData) => {
  try {
    const response = await axiosClient.post("/api/event", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error add peserta event:", error);
    throw error;
  }
};

const getAllPeserta = async (queryString = "") => {
  try {
    const response = await axiosClient.get(
      `/api/event${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deletePeserta = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/event/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Pengaduan
const createPengaduan = async (data) => {
  try {
    const formData = new FormData();

    const pengaduanObj = {
      namaLengkap: data.namaLengkap,
      email: data.email,
      npa: data.npa,
      cabang: data.cabang,
      unitKerja: data.unitKerja,
      category: data.category,
      keterangan: data.keterangan,
    };

    formData.append("pengaduan", JSON.stringify(pengaduanObj));

    if (data.bukti) {
      formData.append("bukti", data.bukti);
    }

    const response = await axiosClient.post("/api/pengaduan", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllPengaduan = async (filters = {}) => {
  try {
    const { category, cabang, unitKerja } = filters;

    let queryParams = new URLSearchParams();
    if (category) queryParams.append("category", category);
    if (cabang) queryParams.append("cabang", cabang);
    if (unitKerja) queryParams.append("unitKerja", unitKerja);

    const queryString = queryParams.toString();
    const url = `/api/pengaduan${queryString ? `?${queryString}` : ""}`;

    const response = await axiosClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getPengaduanById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/pengaduan/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllRekapPengaduan = async () => {
  try {
    const response = await axiosClient.get("/api/pengaduan/all");
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deletePengaduan = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/pengaduan/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const countNewPengaduan = async (days = 1, cabang = null) => {
  try {
    let url = `/api/pengaduan/count/new?days=${days}`;

    if (cabang) {
      url += `&cabang=${cabang}`;
    }

    const response = await axiosClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createResponPengaduan = async (data) => {
  try {
    const response = await axiosClient.post("/api/respon-pengaduan", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getResponPengaduanByPengaduanId = async (pengaduanId) => {
  try {
    const response = await axiosClient.get(
      `/api/respon-pengaduan/pengaduan/${pengaduanId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const countResponsesByPengaduanId = async (pengaduanId) => {
  try {
    const response = await axiosClient.get(
      `/api/respon-pengaduan/pengaduan/${pengaduanId}/count`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getTagihanAnggotaById = async (userId) => {
  try {
    const response = await axiosClient.get(`/api/auth/user/${userId}/tagihan`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const exportTidakTerdaftarToExcel = async (cabang = "", unitKerja = "") => {
  try {
    const response = await axiosClient.get(
      `/api/files/download-tidak-terdaftar`,
      {
        params: { cabang, unitKerja },
        responseType: "blob",
      },
    );

    // Buat file download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tidak-terdaftar.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Gagal mengunduh file Excel:", error);
  }
};

// KAS Sanduka
const getTableKasSanduka = async (bulan, tahun) => {
  try {
    const response = await axiosClient.get(
      `/api/rekap-transaksi-sanduka?bulan=${bulan}&tahun=${tahun}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching table kas sanduka:", error);
    throw error;
  }
};

// Helper untuk ekstrak cabang dari keterangan
// Contoh: "Pemasukan Sanduka Sumbangan Anggota Cabang PAKIS AJI (Transfer) untuk Maret 2026"
// Output: "PAKIS AJI"
const extractCabangFromKeterangan = (keterangan) => {
  if (!keterangan || typeof keterangan !== "string") {
    return null;
  }

  const match = keterangan.match(/Cabang\s+([^(]+)/i);
  if (match && match[1]) {
    const result = match[1].trim().toUpperCase();
    return result;
  }

  const match2 = keterangan.match(/Cabang\s+([^(]+)\s*\(/);
  if (match2 && match2[1]) {
    const result = match2[1].trim().toUpperCase();
    return result;
  }

  return null;
};

// Get Realisasi dari Kas Sanduka (hanya PEMASUKAN, grouped per cabang)
const getRealisasiFromKasSanduka = async (bulan, tahun) => {
  try {
    const res = await getTableKasSanduka(bulan, tahun);

    const dataKasSanduka = Array.isArray(res) ? res : res?.data || [];

    // Filter hanya PEMASUKAN
    const pemasukanData = dataKasSanduka.filter((item) => {
      const match = item.jenis === "PEMASUKAN";
      if (match) {
      }
      return match;
    });

    // Group dan total per cabang
    const grouped = {};

    pemasukanData.forEach((item, index) => {
      const cabang = extractCabangFromKeterangan(item.keterangan);

      if (cabang) {
        if (!grouped[cabang]) {
          grouped[cabang] = {
            totalNominal: 0,
            jumlahTransaksi: 0,
          };
        }

        grouped[cabang].totalNominal += item.debet || 0;
        grouped[cabang].jumlahTransaksi += 1;
      } else {
        console.log(`   ❌ Failed to extract cabang`);
      }
    });

    return grouped;
  } catch (error) {
    console.error("❌ Error fetching realisasi from kas sanduka:", error);
    throw error;
  }
};

const postPosPenerimaanSanduka = async (data) => {
  try {
    const response = await axiosClient.post(`/api/pos-penerimaan`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error post penerimaan sanduka:", error);
    throw error;
  }
};
const postPosPengeluaranSanduka = async (data) => {
  try {
    const response = await axiosClient.post(`/api/pos-pengeluaran`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error post pengeluaran sanduka:", error);
    throw error;
  }
};

const postPemasukanSanduka = async ({
  tanggalTransaksi,
  posPenerimaan,
  setoranBulan,
  setoranTahun,
  jenisPenerimaan,
  cabang,
  nominal,
  keterangan,
}) => {
  try {
    const data = {
      tanggalTransaksi,
      posPenerimaan,
      setoranBulan,
      setoranTahun,
      jenisPenerimaan,
      cabang,
      nominal,
      keterangan,
    };

    const response = await axiosClient.post("/api/pemasukan-sanduka", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error post pemasukan sanduka:", error);
    throw error;
  }
};
const postPengeluaranSanduka = async (data) => {
  try {
    const response = await axiosClient.post("/api/pengeluaran-sanduka", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error post pengeluaran sanduka:", error);
    throw error;
  }
};

const getPosPenerimaanSanduka = async () => {
  try {
    const response = await axiosClient.get("/api/pos-penerimaan");
    return response.data;
  } catch (error) {
    console.error("Error gagal ambil data pos penerimaan:", error);
    throw error;
  }
};
const getPosPengeluaranSanduka = async () => {
  try {
    const response = await axiosClient.get("/api/pos-pengeluaran");
    return response.data;
  } catch (error) {
    console.error("Error gagal ambil data pos pengeluaran:", error);
    throw error;
  }
};

const getPenerimaanSanduka = async () => {
  try {
    const response = await axiosClient.get("/api/pemasukan-sanduka");
    return response.data;
  } catch (error) {
    console.error("Error gagal ambil data penerimaan:", error);
    throw error;
  }
};

const getPemasukanKasSandukaById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/pemasukan-sanduka/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const updatePemasukanKasSanduka = async (id, payload) => {
  try {
    const response = await axiosClient.put(
      `/api/pemasukan-sanduka/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

const getPengeluaranKasSandukaById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/pengeluaran-sanduka/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const updatePengeluaranKasSanduka = async (id, payload) => {
  try {
    const response = await axiosClient.put(
      `/api/pengeluaran-sanduka/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

const deletePosPenerimaanSanduka = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/pos-penerimaan/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};
const deletePosPengeluaranSanduka = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/pos-pengeluaran/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const deletePemasukanSanduka = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/pemasukan-sanduka/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};
const deletePengeluaranSanduka = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/pengeluaran-sanduka/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const postSesuaiTargetSanduka = async (tanggalTransaksi) => {
  try {
    const response = await axiosClient.post(
      `/api/pemasukan-sanduka/generate?tanggalTransaksi=${tanggalTransaksi}`,
      null,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error post penerimaan sanduka:", error);
    throw error;
  }
};

const getRingaksanKasSanduka = async (bulan, tahun) => {
  try {
    const response = await axiosClient.get(
      `/api/ringkasan-saldo?bulan=${bulan}&tahun=${tahun}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching table kas sanduka:", error);
    throw error;
  }
};
// END

// KAS UMUM
const createPosPenerimaanUmum = async (data) => {
  try {
    const response = await axiosClient.post(
      `/api/pos-penerimaan-kas-umum`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error create penerimaan umum:", error);
    throw error;
  }
};

const getPosPenerimaanUmum = async () => {
  try {
    const response = await axiosClient.get("/api/pos-penerimaan-kas-umum");
    return response.data;
  } catch (error) {
    console.error("Error gagal ambil data pos umum:", error);
    throw error;
  }
};

const deletePosPenerimaanUmum = async (id) => {
  try {
    const response = await axiosClient.delete(
      `/api/pos-penerimaan-kas-umum/${id}`,
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const createPosPengeluaranUmum = async (data) => {
  try {
    const response = await axiosClient.post(
      `/api/pos-pengeluaran-kas-umum`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error post pengeluaran umum:", error);
    throw error;
  }
};

const getPosPengeluaranUmum = async () => {
  try {
    const response = await axiosClient.get("/api/pos-pengeluaran-kas-umum");
    return response.data;
  } catch (error) {
    console.error("Error gagal ambil data pos pengeluaran:", error);
    throw error;
  }
};

const deletePosPengeluaranUmum = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/pos-pengeluaran/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const createPemasukanUmum = async ({
  tanggalTransaksi,
  posPenerimaan,
  setoranBulan,
  setoranTahun,
  jenisPenerimaan,
  cabang,
  nominal,
  keterangan,
  nomorBukti,
}) => {
  try {
    const data = {
      tanggalTransaksi,
      posPenerimaan,
      setoranBulan,
      setoranTahun,
      jenisPenerimaan,
      cabang,
      nominal,
      keterangan,
      ...(nomorBukti && { nomorBukti }),
    };

    const response = await axiosClient.post("/api/pemasukan-organisasi", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error create pemasukan kas umum:", error);
    throw error;
  }
};

const getPemasukanUmum = async () => {
  try {
    const response = await axiosClient.get("/api/pemasukan-organisasi");
    return response.data;
  } catch (error) {
    console.error("Error gagal ambil data penerimaan:", error);
    throw error;
  }
};

const getPemasukanUmumById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/pemasukan-organisasi/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updatePemasukanUmum = async (id, payload) => {
  try {
    const response = await axiosClient.put(
      `/api/pemasukan-organisasi/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

const deletePemasukanUmum = async (id) => {
  try {
    const response = await axiosClient.delete(
      `/api/pemasukan-organisasi/${id}`,
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const postSesuaiTargetUmum = async (tanggalTransaksi) => {
  try {
    const response = await axiosClient.post(
      `/api/pemasukan-organisasi/generate?tanggalTransaksi=${tanggalTransaksi}`,
      null,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error post penerimaan sanduka:", error);
    throw error;
  }
};

const createPengeluaranUmum = async (data) => {
  try {
    const response = await axiosClient.post(
      "/api/pengeluaran-organisasi",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error create pengeluaran kas umum:", error);
    throw error;
  }
};

const getPengeluaranUmum = async (id) => {
  try {
    const response = await axiosClient.get("/api/pengeluaran-organisasi");
    return response.data;
  } catch (error) {
    console.error("Error gagal ambil data pengeluaran:", error);
    throw error;
  }
};

const getPengeluaranUmumById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/pengeluaran-organisasi/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updatePengeluaranUmum = async (id, payload) => {
  try {
    const response = await axiosClient.put(
      `/api/pengeluaran-organisasi/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

const deletePengeluaranUmum = async (id) => {
  try {
    const response = await axiosClient.delete(
      `/api/pengeluaran-organisasi/${id}`,
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const getTableUmum = async (bulan, tahun) => {
  try {
    const response = await axiosClient.get(
      `/api/rekap-transaksi-organisasi?bulan=${bulan}&tahun=${tahun}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching table kas umum:", error);
    throw error;
  }
};
// END

// Transaksi Cabang
const createTransaksiCabang = async (data) => {
  try {
    const response = await axiosClient.post("/api/transaksi-cabang", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error create transaksi cabang:", error);
    throw error;
  }
};

const getTransaksiCabang = async () => {
  try {
    const response = await axiosClient.get("/api/transaksi-cabang");
    return response.data;
  } catch (error) {
    console.error("Error get transaksi cabang:", error);
    throw error;
  }
};

const getTransaksiCabangById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/transaksi-cabang/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getTransaksiCabangByBulanTahun = async (bulan, tahun) => {
  try {
    const response = await axiosClient.get(
      `/api/transaksi-cabang/by-bulan-tahun?bulan=${bulan}&tahun=${tahun}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error get transaksi cabang by bulan:", error);
    throw error;
  }
};

const updateTransaksiCabang = async (id, payload) => {
  try {
    const response = await axiosClient.put(
      `/api/transaksi-cabang/${id}`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error update transaksi cabang:", error);
    throw error;
  }
};

const deleteTransaksiCabang = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/transaksi-cabang/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};
// END

// New By Nominal
const getAllByNominal = async () => {
  try {
    const response = await axiosClient.get("/api/by-nominal-new");
    return response.data;
  } catch (error) {
    console.error("Error gagal ambil data Bynominal:", error);
    throw error;
  }
};

const getByIdByNominal = async (id) => {
  try {
    const response = await axiosClient.get(`/api/by-nominal/detail/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const importByNominal = async (file, tagihanUntukBulan) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tagihanUntukBulan", tagihanUntukBulan);

    const response = await axiosClient.post(
      `/api/by-nominal-new/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error posting to import API:",
      error.response?.data || error,
    );
    throw error;
  }
};

const deleteByNominal = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/by-nominal-new/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server",
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};

const updateByNominal = async (id, data) => {
  try {
    // 🔴 Validasi ID (biar tidak kejadian [object Object])
    if (!id || typeof id !== "number") {
      throw new Error("ID harus berupa number, contoh: 2804");
    }

    const response = await axiosClient.put(`/api/by-nominal/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error updating data:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

const updateByNominalByBulan = async (npa, tagihanUntukBulan, payload) => {
  try {
    const response = await axiosClient.put(
      `/api/by-nominal-new/update-by-bulan?npa=${npa}&tagihanUntukBulan=${tagihanUntukBulan}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};
// END
// Eksport Foto
const downloadFotoPerCabang = (cabang) => {
  return axiosClient.get(`/api/foto-anggota/download-per-cabang`, {
    params: { cabang },
    responseType: "blob",
  });
};
const downloadFotoByNpa = (npa) => {
  return axiosClient.get(`/api/foto-anggota/${npa}`, {
    responseType: "blob",
  });
};

// Berita
const createBerita = async (data) => {
  try {
    const formData = new FormData();

    formData.append("judul", data.judul);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("role", data.role);
    formData.append("isiBerita", data.isiBerita);
    formData.append("status", data.status || "DRAFT");
    formData.append("responContributor", data.responContributor);
    formData.append("kategori", data.kategori);

    if (data.galeri && data.galeri.length > 0) {
      data.galeri.forEach((g) => {
        if (g.file) {
          formData.append("galeriImages", g.file);
          formData.append("galeriDeskripsi", g.deskripsi || "");
        }
      });
    }

    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    const response = await axiosClient.post("/api/berita/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Response dari server:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error createBerita:", error);
    throw error;
  }
};

const updateBerita = async (id, data) => {
  try {
    let formDataToSend = data;

    if (!(data instanceof FormData)) {
      formDataToSend = new FormData();

      formDataToSend.append("judul", data.judul);
      formDataToSend.append("username", data.username);
      formDataToSend.append("email", data.email);
      formDataToSend.append("role", data.role);
      formDataToSend.append("status", data.status);
      formDataToSend.append("isiBerita", data.isiBerita);
      formDataToSend.append("responEditor", data.responEditor);

      if (data.galeriImages?.length > 0) {
        data.galeriImages.forEach((file) => {
          formDataToSend.append("galeriImages", file);
        });
      }

      if (data.galeriDeskripsi?.length > 0) {
        data.galeriDeskripsi.forEach((desc) => {
          formDataToSend.append("galeriDeskripsi", desc);
        });
      }
    }

    const response = await axiosClient.put(
      `/api/berita/update/${id}`,
      formDataToSend,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error updateBerita:", error);
    throw error;
  }
};

const getAllBerita = async (status) => {
  try {
    const response = await axiosClient.get("/api/berita/all", {
      params: { status },
    });

    return response.data.content || [];
  } catch (error) {
    throw error;
  }
};

const getBeritaById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/berita/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const deleteBerita = async (id, username, role) => {
  try {
    const response = await axiosClient.delete(`/api/berita/${id}`, {
      params: {
        username: username,
        role: role,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error deleteBerita:", error.response?.data);
    throw error.response?.data;
  }
};
const publishBerita = async (id, username, role) => {
  try {
    const response = await axiosClient.post(`/api/berita/publish/${id}`, null, {
      params: {
        username: username,
        role: role,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error publishBerita:", error.response?.data);
    throw error.response?.data;
  }
};
const updateStatusBerita = async (id, status, username, role) => {
  try {
    const response = await axiosClient.post(
      `/api/berita/update-status/${id}`,
      null,
      {
        params: {
          status: status,
          username: username,
          role: role,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error updateStatusBerita:", error.response?.data);
    throw error.response?.data;
  }
};

// EDITOR
const createEditor = async (adminData) => {
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
      "/api/register-editor/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateEditor = async (id, data) => {
  try {
    const formData = new FormData();

    if (data.daerah !== undefined && data.daerah !== null)
      formData.append("daerah", data.daerah);

    if (data.cabang !== undefined && data.cabang !== null)
      formData.append("cabang", data.cabang);

    if (data.nama !== undefined && data.nama !== null)
      formData.append("nama", data.nama);

    if (data.npapgri !== undefined && data.npapgri !== null)
      formData.append("npapgri", data.npapgri);

    if (data.jabatan !== undefined && data.jabatan !== null)
      formData.append("jabatan", data.jabatan);

    if (data.nohp !== undefined && data.nohp !== null)
      formData.append("nohp", data.nohp);

    if (data.email !== undefined && data.email !== null)
      formData.append("email", data.email);

    if (data.password !== undefined && data.password !== null)
      formData.append("password", data.password);

    if (data.passwordNew !== undefined && data.passwordNew !== null)
      formData.append("passwordNew", data.passwordNew);

    const response = await axiosClient.put(
      `/api/register-editor/update/${id}`,
      formData,
    );

    return response.data;
  } catch (error) {
    console.error("Error updateEditor:", error);
    throw error;
  }
};
const getEditorById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/register-editor/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error getEditorById:", error);
    throw error;
  }
};
const getAllEditor = async (page = 0, size = 10) => {
  try {
    const response = await axiosClient.get(`/api/register-editor/all`, {
      params: {
        page,
        size,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error getAllEditor:", error);
    throw error;
  }
};
const deleteEditor = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/register-editor/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error deleteEditor:", error);
    throw error;
  }
};

//Biro & Tour
//Paket Wisata
const createPaketTour = async (formData) => {
  try {
    const response = await axiosClient.post(
      "/api/tour/paket/create",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error createPaketTour:", error);
    throw error;
  }
};

const updatePaketTour = async (id, formData) => {
  try {
    const response = await axiosClient.put(`/api/tour/paket/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error updatePaketTour:", error);
    throw error;
  }
};

const getPaketById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/tour/paket/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getPaketById:", error);
    throw error;
  }
};

const getPaketBySlug = async (slug) => {
  try {
    const response = await axiosClient.get(`/api/tour/paket/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error getPaketBySlug:", error);
    throw error;
  }
};

const getAllPaket = async (nama = "", page = 0, size = 10) => {
  try {
    const response = await axiosClient.get(`/api/tour/paket/all`, {
      params: {
        nama,
        page,
        size,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getAllPaket:", error);
    throw error;
  }
};

const deletePaket = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/tour/paket/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deletePaket:", error);
    throw error;
  }
};

const publishPaket = async (id) => {
  try {
    const response = await axiosClient.post(`/api/tour/paket/${id}/publish`);
    return response.data;
  } catch (error) {
    console.error("Error publishPaket:", error);
    throw error;
  }
};

// Slide Paket
const createSlidePaket = async (formData) => {
  try {
    const response = await axiosClient.post(
      "/api/tour/slide/create",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error createSlidePaket:", error);
    throw error;
  }
};

const getAllSlidePaket = async (nama = "", page = 0, size = 10) => {
  try {
    const response = await axiosClient.get(`/api/tour/slide/all`, {
      params: {
        nama,
        page,
        size,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getAllSlidePaket:", error);
    throw error;
  }
};

const deleteSlidePaket = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/tour/slide/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleteSlidePaket:", error);
    throw error;
  }
};
// END

// vIDEO DASHBOARD
const createVideoDashboard = async (data) => {
  try {
    const response = await axiosClient.post("/api/video-dashboard", data);

    return response.data;
  } catch (error) {
    console.error("Error createVideoDashboard:", error);
    throw error;
  }
};

const getVideoDashboardById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/video-dashboard/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getVideoDashboardById:", error);
    throw error;
  }
};

const getAllVideoDashboard = async () => {
  try {
    const response = await axiosClient.get(`/api/video-dashboard`);
    return response.data;
  } catch (error) {
    console.error("Error getAllVideoDashboard:", error);
    throw error;
  }
};

const updateVideoDashboard = async (id, formData) => {
  try {
    const response = await axiosClient.put(
      `/api/video-dashboard/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error updateVideoDashboard:", error);
    throw error;
  }
};

const deleteVideoDashboard = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/video-dashboard/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleteVideoDashboard:", error);
    throw error;
  }
};

// LIVE
const createLinkLive = async (data) => {
  try {
    const response = await axiosClient.post("/api/live-link/create", data);

    return response.data;
  } catch (error) {
    console.error("Error createLinkLive:", error);
    throw error;
  }
};
const getLinkLive = () => axiosClient.get("/api/live-link");
const deleteLinkLive = async () => {
  try {
    const response = await axiosClient.delete("/api/live-link/delete");
    return response.data;
  } catch (error) {
    throw error;
  }
};
// END

// Runging Text
const createRunningText = async (data) => {
  try {
    const response = await axiosClient.post("api/running-text/create", data);

    return response.data;
  } catch (error) {
    console.error("Error createLinkLive:", error);
    throw error;
  }
};
const getRunningText = () => axiosClient.get("api/running-text");
const deleteRunningText = async () => {
  try {
    const response = await axiosClient.delete("api/running-text/delete");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// LEMBAGA
const createLembaga = async (data) => {
  try {
    const response = await axiosClient.post("/api/lembaga", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error createLembaga:", error);
    throw error;
  }
};

const getAllLembaga = async (
  page = 0,
  size = 10,
  sortBy = "id",
  direction = "desc",
) => {
  try {
    const response = await axiosClient.get(`/api/lembaga`, {
      params: {
        page,
        size,
        sortBy,
        direction,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getAllLembaga:", error);
    throw error;
  }
};

const getLembagaById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/lembaga/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getLembagaById:", error);
    throw error;
  }
};

const updateLembaga = async (id, data) => {
  try {
    const response = await axiosClient.put(`/api/lembaga/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updateLembaga:", error);
    throw error;
  }
};

const deleteLembaga = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/lembaga/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleteLembaga:", error);
    throw error;
  }
};

// Rekapitulasi Iuran
const saveRekap = async (data) => {
  try {
    const response = await axiosClient.post("/api/rekapitulasi-iuran", data);
    return response.data;
  } catch (error) {
    console.error("Error saveRekap:", error);
    throw error;
  }
};

const saveRekapBatch = async (data) => {
  try {
    const response = await axiosClient.post(
      "/api/rekapitulasi-iuran/batch",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error saveRekapBatch:", error);
    throw error;
  }
};

const getRekapByPeriode = async (bulan, tahun) => {
  try {
    const response = await axiosClient.get(`/api/rekapitulasi-iuran/filter`, {
      params: { bulan, tahun },
    });
    return response.data;
  } catch (error) {
    console.error("Error getRekapByPeriode:", error);
    throw error;
  }
};

// Rekapitulasi Derap
const saveRekapDerapBatch = async (data) => {
  try {
    const response = await axiosClient.post(
      "/api/rekapitulasi-derap/batch",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error saveRekapDerapBatch:", error);
    throw error;
  }
};

const getRekapDerapByPeriode = async (bulan, tahun) => {
  try {
    const response = await axiosClient.get(`/api/rekapitulasi-derap/filter`, {
      params: { bulan, tahun },
    });
    return response.data;
  } catch (error) {
    console.error("Error getRekapDerapByPeriode:", error);
    throw error;
  }
};
// END Rekapitulasi Derap

// Rekapitulasi Kalender
const saveRekapKalenderBatch = async (data) => {
  try {
    const response = await axiosClient.post(
      "/api/rekapitulasi-kalender/batch",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error saveRekapKalenderBatch:", error);
    throw error;
  }
};

const getRekapKalenderByPeriode = async (bulan, tahun) => {
  try {
    const response = await axiosClient.get(`/api/rekapitulasi-kalender/filter`, {
      params: { bulan, tahun },
    });
    return response.data;
  } catch (error) {
    console.error("Error getRekapKalenderByPeriode:", error);
    throw error;
  }
};
// END Rekapitulasi Kalender

// Export all functions
export default {
  registerUser,
  loginAdmin,
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
  getUserByNpa,
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
  createDaspenData,
  getAllPensiun,
  getIuranByFilter,
  createTargetDaspen,
  createDerapData,
  createTargetDerap,
  createTargetIuaran,
  getTableIuran,
  getAllTargetDaspen,
  getTableDaspen,
  getTableDerap,
  getTableKalender,
  createKalenderData,
  createTargetKalender,
  getTotalAnggota,
  getTablePemasukanSanduka,
  createPembayaranSanduka,
  createSaldoAwal,
  getDataLapor,
  getRekapLaporDiterima,
  getRekapLaporBelom,
  getTableTargetRealisasi,
  getLaporanPemasukanTahunan,
  getLaporanPengeluaranTahunan,
  getLaporanPemasukan,
  deleteLainlain,
  getLaporanPengeluaran,
  getNotifikasi,
  getAnggotaMeninggal,
  uploadFile,
  getAllFiles,
  updateUserById,
  postLainlain,
  updateVerified,
  getSaldoAkhir,
  keluarAnggota,
  pensiunAnggota,
  mutasiCabangUnitKerja,
  getLainlain,
  getByNIP,
  getKeteranganLainlain,
  updateRegisUser,
  getNoBukti,
  getNoRekening,
  sendSesuaiJumlahTarget,
  getPemasukanUangMasukById,
  editPemasukanUangMasuk,
  batalLaporanById,
  verifikasiLaporanById,
  createKwitansiByIdAndNpa,
  getKwitansiByIdAndNpa,
  searchUsersByName,
  deleteUser,
  getCalculateSandukaBaru,
  getCalculateSandukaMeninggal,
  deletePemasukanSanduka,
  getCalculateSandukaPensiun,
  getCalculateSandukaKeluar,
  getCalculateSandukaPindahCabang,
  getTotalAnggotaStatistik,
  getTotalAnggotaByCabang,
  getFileByNip,
  getAllDuplicates,
  deleteDuplicates,
  updateIuranById,
  createHistoryData,
  getAllHistoryData,
  getAdminById,
  updateAdminById,
  getDefaultIuranById,
  updateIuranData,
  generateKwitansi,
  getNamaKwitansi,
  deleteFiles,
  getJumlahDataUpload,
  getRantingSummary,
  createRanting,
  getGroupedNamaRantingWithCabang,
  deleteRanting,
  getNamaranting,
  hapusPemasukanUangMasuk,
  getDetailKeuangan,
  getUnverifiedUsersCountByCabang,
  getAllUnitKerja,
  deleteUnitKerja,
  getUnverifiedUsersCountSuperAdmin,
  activasiUser,
  getAllTotalData,
  getProgressFile,
  getBackupDatabaseFile,
  getBackupHistoryFile,
  getCekHistoryData,
  getJumlahSantunan,
  createSidebarGallery,
  updateSidebarGallery,
  getAllSidebarGallery,
  getSidebarGalleryById,
  getSidebarGalleryByCategory,
  deletePosPenerimaanSanduka,
  deleteSidebarGallery,
  createNamaRanting,
  getNamaRantingCabang,
  getNamaRantingByCabang,
  getNominalAggregatedData,
  uploadFileRegister,
  updateLainlain,
  deleteUnitKerjaRanting,
  getTotalSantunan,
  deleteNamaRanting,
  getRekapRanting,
  addPesertaEvent,
  getAllPeserta,
  deleteKalender,
  updateKalender,
  createTargetLainLain,
  getTableTargetLainLain,
  updateTargetLainLain,
  deleteTargetLainLain,
  deleteTargetDaspen,
  getIuranAnggotaAll,
  updateTargetDaspen,
  deleteDerap,
  updateDerap,
  deletePeserta,
  createPengaduan,
  getAllPengaduan,
  getPengaduanById,
  createResponPengaduan,
  getResponPengaduanByPengaduanId,
  getAllRekapPengaduan,
  deleteIuranAnggota,
  getIuranAnggota,
  putIuranAnggota,
  deletePengaduan,
  postIuranAnggota,
  uploadSinkronBank,
  getTransaksiBankBalancing,
  getCountAnggotaPotonganBank,
  getCountAnggotaSetorTunai,
  getCountAnggotaTerfilter,
  countNewPengaduan,
  getTransaksiBank,
  postToBackup,
  getPenerimaanSanduka,
  countResponsesByPengaduanId,
  getTagihanAnggotaById,
  exportTidakTerdaftarToExcel,
  postSesuaiTargetSanduka,
  getPosPenerimaanSanduka,
  postPemasukanSanduka,
  deletePengeluaranSanduka,
  getPemasukanKasSandukaById,
  getSantunanDiberikan,
  getPosPengeluaranSanduka,
  updatePemasukanKasSanduka,
  postPengeluaranSanduka,
  getPengeluaranKasSandukaById,
  getTableKasSanduka,
  getRealisasiFromKasSanduka,
  deletePosPengeluaranSanduka,
  updatePengeluaranKasSanduka,
  postPosPengeluaranSanduka,
  postPosPenerimaanSanduka,
  createPosPenerimaanUmum,
  getPosPenerimaanUmum,
  deletePosPenerimaanUmum,
  deleteTransaksiBank,
  createPosPengeluaranUmum,
  getPosPengeluaranUmum,
  deletePosPengeluaranUmum,
  createPemasukanUmum,
  postToBackupByNominal,
  getPemasukanUmum,
  getPemasukanUmumById,
  updatePemasukanUmum,
  deletePemasukanUmum,
  getRingaksanKasSanduka,
  postSesuaiTargetUmum,
  createPengeluaranUmum,
  getPengeluaranUmum,
  getPengeluaranUmumById,
  getBalancingById,
  updateBalancing,
  updatePengeluaranUmum,
  deletePengeluaranUmum,
  deleteBalancing,
  getTableUmum,
  createTransaksiCabang,
  getTransaksiCabang,
  getTransaksiCabangById,
  getTransaksiCabangByBulanTahun,
  updateTransaksiCabang,
  deleteTransaksiCabang,
  getAllByNominal,
  importByNominal,
  deleteByNominal,
  updateByNominal,
  updateByNominalByBulan,
  getByIdByNominal,
  postToBackupNew,
  deleteBalancingById,
  getUnitKerjaByCabang,
  downloadFotoPerCabang,
  downloadFotoByNpa,
  createBerita,
  getAllBerita,
  getBeritaById,
  updateBerita,
  deleteBerita,
  publishBerita,
  updateStatusBerita,
  createEditor,
  updateEditor,
  getEditorById,
  getAllEditor,
  deleteEditor,
  createPaketTour,
  updatePaketTour,
  getPaketById,
  getPaketBySlug,
  getAllPaket,
  deletePaket,
  publishPaket,
  createSlidePaket,
  getAllSlidePaket,
  deleteSlidePaket,
  createVideoDashboard,
  getVideoDashboardById,
  getAllVideoDashboard,
  updateVideoDashboard,
  deleteVideoDashboard,
  importExcelTargetIuran,
  createLinkLive,
  getLinkLive,
  deleteLinkLive,
  createRunningText,
  getRunningText,
  deleteRunningText,
  createLembaga,
  getAllLembaga,
  getLembagaById,
  updateLembaga,
  deleteLembaga,
  saveRekap,
  saveRekapBatch,
  getRekapByPeriode,
  saveRekapDerapBatch,
  getRekapDerapByPeriode,
  saveRekapKalenderBatch,
  getRekapKalenderByPeriode,
  postPosLainLain,
  getPosLainLain,
  getPosLainLainNames,
  updatePosLainLain,
  deletePosLainLain,
};
