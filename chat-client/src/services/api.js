import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

// ================= TOKEN HEADERS =================
const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ================= GET ROOMS =================
export const getRooms = async () => {
  try {

    const res = await axios.get(
      `${API_URL}/rooms`,
      authHeaders()
    );

    console.log(
      "ROOMS RESPONSE:",
      res.data
    );

    return res.data;

  } catch (err) {

    console.error(
      "getRooms error:",
      err.response?.data || err.message
    );

    return { rooms: [] };
  }
};

// ================= GET MESSAGES =================
export const getMessages = async (roomId) => {
  try {

    const res = await axios.get(
      `${API_URL}/messages/${roomId}`,
      authHeaders()
    );

    console.log(
      "MESSAGES RESPONSE:",
      res.data
    );

    return res.data;

  } catch (err) {

    console.error(
      "getMessages error:",
      err.response?.data || err.message
    );

    return { messages: [] };
  }
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

// ================= GOOGLE LOGIN =================
export const googleLogin = () => {

  window.location.href =
    `${API_URL}/auth/google`;
};

// ================= LOGOUT =================
export const logoutAPI = () => {

  localStorage.removeItem("token");
  localStorage.removeItem("user");
};