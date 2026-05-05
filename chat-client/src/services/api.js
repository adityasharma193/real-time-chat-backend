const BASE_URL = process.env.REACT_APP_API_URL + "/api";

// ================= CORE REQUEST =================
const request = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
};

// ================= AUTH =================
export const loginAPI = (email, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const registerAPI = (name, email, password) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const verifyOtpAPI = (email, otp) =>
  request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
export const resendOtpAPI = (email) =>
  request("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
// ================= ROOMS =================
export const getRooms = () => request("/rooms");

export const createRoom = (name) =>
  request("/rooms/create", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

// ================= MESSAGES =================
export const getMessages = (roomId, cursor) => {
  if (cursor) {
    return request(`/messages/${roomId}?cursor=${cursor}`); // ✅ FIXED
  }
  return request(`/messages/${roomId}`); // ✅ FIXED
};