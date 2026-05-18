import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

// ================= AUTH HEADERS =================
const authHeaders = () => {

  const token =
    localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ================= LOGIN =================
export const loginAPI = async (
  email,
  password
) => {

  const res = await axios.post(
    `${API_URL}/auth/login`,
    {
      email,
      password,
    }
  );

  return res.data;
};

// ================= REGISTER =================
export const registerAPI = async (
  name,
  email,
  password
) => {

  const res = await axios.post(
    `${API_URL}/auth/register`,
    {
      name,
      email,
      password,
    }
  );

  return res.data;
};

// ================= GET ROOMS =================
export const getRooms = async () => {

  const res = await axios.get(
    `${API_URL}/rooms`,
    authHeaders()
  );

  return res.data;
};

// ================= GET MESSAGES =================
export const getMessages = async (
  roomId
) => {

  const res = await axios.get(
    `${API_URL}/messages/${roomId}`,
    authHeaders()
  );

  return res.data;
};