import axios from "axios";

const API_URL =
  "https://real-time-chat-backend-0q4t.onrender.com/api";

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

    console.log("ROOMS RESPONSE:", res.data);

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
      `${API_URL}/rooms/${roomId}/messages`,
      authHeaders()
    );

    console.log("MESSAGES RESPONSE:", res.data);

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

// ================= VERIFY OTP =================
export const verifyOtpAPI = async (
  email,
  otp
) => {

  const res = await axios.post(
    `${API_URL}/auth/verify-otp`,
    {
      email,
      otp,
    }
  );

  return res.data;
};

// ================= RESEND OTP =================
export const resendOtpAPI = async (
  email
) => {

  const res = await axios.post(
    `${API_URL}/auth/resend-otp`,
    {
      email,
    }
  );

  return res.data;
};