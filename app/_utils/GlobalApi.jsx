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
};
