import axios from "axios";

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

// General
const getCabang = () => axiosClient.get("/api/daftarCabang");
const getJabatan = () => axiosClient.get("/api/daftarJabatan");
const getGolonganJabatan = () => axiosClient.get("/api/daftarGolongan");
const getUnitKerja = () => axiosClient.get("/api/unit-kerja/all");

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
  getRekapMeninggal,
  getRekapById,
  getAllDataLapor,
  getHistoryData,
  cekNpaList,
};