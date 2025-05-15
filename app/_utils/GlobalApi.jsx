import axios from "axios";
import { ReceiptEuro } from "lucide-react";

const axiosClient = axios.create({
  baseURL: "https://sanduka.my.id",
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
      }
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
      }
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error("Terjadi kesalahan pada server");
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

// General
const getCabang = () => axiosClient.get("/api/daftarCabang");
const getJabatan = () => axiosClient.get("/api/daftarJabatan");
const getGolonganJabatan = () => axiosClient.get("/api/daftarGolongan");
const getUnitKerja = () => axiosClient.get("/api/unit-kerja");
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
const searchUsersByName = (namaLengkap) => {
  return axiosClient.get(
    `/api/auth/search-users?namaLengkap=${encodeURIComponent(namaLengkap)}`
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
  statusPegawai = null
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
      `/api/auth/users?${params.toString()}`
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
      }
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
        error.response.data.message || "Terjadi kesalahan pada server"
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
    if (error.response) {
      throw new Error(
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
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
      }
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
  unitKerja = null,
  keyword = null
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
          `/api/auth/getByNpa?npaList=${chunk.join(",")}`
        );
        if (response.data) {
          results.push(
            ...(Array.isArray(response.data) ? response.data : [response.data])
          );
        }
      } catch (chunkError) {
        console.warn(
          `Error fetching chunk of NPAs: ${chunk.join(",")}`,
          chunkError
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

const updateIuranById = async (id, payload) => {
  try {
    const response = await axiosClient.put(`/api/iuran/${id}`, payload); // Mengirim payload di body
    return response.data; // Mengembalikan data dari respon API
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error; // Melempar error agar bisa ditangani di tempat lain
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
    if (statusKeanggotaan) params.append("statusKeanggotaan", statusKeanggotaan);

    const url = `/api/files/all?${params.toString()}`;
    const response = await axiosClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data file:", error?.response?.data || error.message);
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
      updatedFormValues
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
      `/api/defaultIuran/filter?iuran=${iuran}`
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
      `/api/iuran/total-anggota-by-cabang?cabang=${cabang}`
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
      updatedData
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
      `/api/target-derap/tabel?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`
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
      updatedData
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
      `/api/target-kalender/tabel?bulan=${bulan}&tahun=${tahun}&cabang=${cabang}`
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
      updatedData
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
      updatedData
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
        error.response.data.message || "Terjadi kesalahan pada server"
      );
    } else {
      throw new Error("Terjadi kesalahan pada jaringan");
    }
  }
};
// END

// Transaksi Bank (data utama)
const getTransaksiBank = async (bulan, tahun, query, size) => {
  try {
    const params = new URLSearchParams();
    if (bulan) params.append("bulan", bulan);
    if (tahun) params.append("tahun", tahun);
    if (query) params.append("query", query);
    if (size) params.append("size", size);

    const response = await axiosClient.get(
      `/api/potongan-gaji?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching transaksi bank:", error);
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
const getTablePemasukanSanduka = async (month, year, jenisPembayaran) => {
  try {
    const response = await axiosClient.get(
      `/api/uang-masuk-keluar/tabel?month=${month}&year=${year}&jenisPembayaran=${jenisPembayaran}`
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
      saldoAwalRequest
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
      }
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
// Get anggota meninggal
const getNamaKwitansi = async (year, month) => {
  try {
    const response = await axiosClient.get(`/api/auth/users-deceased`, {
      params: { year, month },
    });
    return response.data; // Mengembalikan data dari respons
  } catch (error) {
    console.error("Error fetching users deceased:", error);
    throw error; // Melempar error agar dapat ditangani di luar
  }
};
// Generate Kwitansi
const generateKwitansi = async (data) => {
  try {
    const response = await axiosClient.post(`/api/kwitansi/generate`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "blob", // Tambahkan ini untuk menerima data sebagai blob
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
    const response = await axiosClient.get(`/api/kwitansi/${id}/${npaPgri}`, {
      responseType: "blob", // Jika file yang dikembalikan berupa gambar atau PDF
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

const getNominalAggregatedData = async (cabang, unitKerja, namaAnggota, bulan, tahun) => {
  try {
    const params = new URLSearchParams();
    if (cabang) params.append("cabang", cabang);
    if (unitKerja) params.append("unitKerja", unitKerja);
    if (namaAnggota) params.append("namaAnggota", namaAnggota);
    if (bulan) params.append("bulan", bulan);
    if (tahun) params.append("tahun", tahun);

    const response = await axiosClient.get(
      `/api/by-nominal/aggregated?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching aggregated data:", error);
    throw error;
  }
};

const uploadSinkronBank = async (formData) => {
  try {
    const response = await axiosClient.post("/api/potongan-gaji/upload", formData, {
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
    const response = await axiosClient.put(
      `/api/iuran-anggota/${id}`,
      payload // <-- tambahkan payload di sini
    );
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

const getAllPensiun = (
  page = 0,
  size = 10,
  cabang = null,
  bulan = null,
  tahun = null,
  keyword = null
) => {
  const params = new URLSearchParams({ page, size });

  if (cabang) params.append("cabang", cabang);
  if (bulan) params.append("bulan", bulan);
  if (tahun) params.append("tahun", tahun);
  if (keyword) params.append("keyword", encodeURIComponent(keyword));

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
  namaRanting = ""
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
          console.log(dataItem);

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
          /.*(S\.Pd\.I|M\.Pd\.I|S\.Ag|M\.Pd|S\.Pd|S\.PDi|S\.M\.|M\.Pd\.I|S\.Si|S\.Sos|S\.Kom|S\.Ak|S\.Or|S\.Fil\.I|S\.Ps\.I|M\.Kom|A\.Md|Gr|SPd\.SD|S\.Ps|S\.Pust).*/i
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
        namaRanting
      )}`
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
    // Parameter dinamis dari komponen
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

    // Endpoint URL dengan parameter dinamis
    const response = await axiosClient.get("/api/setor/data", { params });

    // Return data dari response
    console.log("Data fetched:", response.data);
    return response.data;
  } catch (error) {
    // Tangani error
    console.error("Error fetching data:", error);
    throw error;
  }
};

const getUnverifiedUsersCountByCabang = async (cabang = "") => {
  try {
    const params = cabang ? { cabang } : {};
    const url = `/api/auth/unverified-users-count?${new URLSearchParams(
      params
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
  unitKerja = ""
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
      "/api/auth/unverified-users-count-super-admin"
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
        error.response.data.message || "Terjadi kesalahan pada server"
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
  searchFileName = null
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
  search = null
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
      }
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
      `/api/sidebar-gallery/category/${category}`
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
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal membuat nama ranting"
    );
  }
};

const getNamaRantingCabang = () => axiosClient.get("/api/nama-ranting");
const getNamaRantingByCabang = (cabang) => {
  return axiosClient.get(`/api/nama-ranting/cabang`, { params: { cabang } });
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
      }
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
      `/api/event${queryString ? `?${queryString}` : ""}`
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
      `/api/respon-pengaduan/pengaduan/${pengaduanId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const countResponsesByPengaduanId = async (pengaduanId) => {
  try {
    const response = await axiosClient.get(
      `/api/respon-pengaduan/pengaduan/${pengaduanId}/count`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getTagihanAnggotaById = async (userId) => {
  try {
    const response = await axiosClient.get(
      `/api/auth/user/${userId}/tagihan`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const exportTidakTerdaftarToExcel = async (cabang = "", unitKerja = "") => {
  try {
    const response = await axiosClient.get(`/api/files/download-tidak-terdaftar`, {
      params: { cabang, unitKerja },
      responseType: "blob",
    });

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
}

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
  getCalculateSandukaPensiun,
  getCalculateSandukaKeluar,
  getTotalAnggotaStatistik,
  getTotalAnggotaByCabang,
  getFileByNip,
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
  deleteSidebarGallery,
  createNamaRanting,
  getNamaRantingCabang,
  getNamaRantingByCabang,
  getNominalAggregatedData,
  uploadFileRegister,
  updateLainlain,
  deleteUnitKerjaRanting,
  deleteNamaRanting,
  getRekapRanting,
  addPesertaEvent,
  getAllPeserta,
  deleteKalender,
  updateKalender,
  deleteTargetDaspen,
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
  countNewPengaduan,
  getTransaksiBank,
  countResponsesByPengaduanId,
  getTagihanAnggotaById,
  exportTidakTerdaftarToExcel
};
