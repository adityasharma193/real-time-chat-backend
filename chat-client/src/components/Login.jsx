import React, { useState } from "react";
import {
  loginAPI,
  registerAPI,
  verifyOtpAPI,
  resendOtpAPI,
} from "../services/api";
import { useTheme } from "../ThemeContext";

export default function Login({ onSuccess }) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { dark, setDark } = useTheme();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    try {
      setLoading(true);

      const data = await loginAPI(form.email, form.password);

      localStorage.setItem("token", data.token);

      const name = form.email.split("@")[0];
      localStorage.setItem("user", JSON.stringify({ email: form.email, name }));

      onSuccess(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= REGISTER =================
  const handleRegister = async () => {
    try {
      setLoading(true);

      await registerAPI(form.name, form.email, form.password);

      alert("OTP sent to your email");

      setMode("verify");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY =================
  const handleVerify = async () => {
    try {
      setLoading(true);

      await verifyOtpAPI(form.email, form.otp);

      alert("Verified! Now login.");
      setMode("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const handleResend = async () => {
    try {
      setResendLoading(true);

      await resendOtpAPI(form.email);

      alert("OTP resent to your email");
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  // ================= ENTER KEY =================
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (mode === "login") handleLogin();
      else if (mode === "register") handleRegister();
      else handleVerify();
    }
  };

  return (
    <div className={`h-screen flex items-center justify-center ${dark ? "bg-gray-900 text-white" : "bg-gray-100"}`}>

      {/* THEME BUTTON */}
      <button
        onClick={() => setDark(!dark)}
        className="absolute top-4 right-4 bg-blue-500 px-3 py-1 rounded text-white"
      >
        {dark ? "Light" : "Dark"}
      </button>

      <div className="bg-white dark:bg-gray-800 p-6 rounded w-80 shadow">

        <h2 className="text-xl mb-4 text-center capitalize">
          {mode}
        </h2>

        {error && <div className="text-red-500 mb-2">{error}</div>}

        {mode === "register" && (
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full mb-2 p-2 rounded bg-gray-200 dark:bg-gray-700"
          />
        )}

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full mb-2 p-2 rounded bg-gray-200 dark:bg-gray-700"
        />

        {mode !== "verify" && (
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full mb-2 p-2 rounded bg-gray-200 dark:bg-gray-700"
          />
        )}

        {mode === "verify" && (
          <>
            <input
              name="otp"
              placeholder="Enter OTP"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full mb-2 p-2 rounded bg-gray-200 dark:bg-gray-700"
            />

            {/* 🔥 RESEND BUTTON */}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm text-blue-500 hover:underline mb-2"
            >
              {resendLoading ? "Resending..." : "Resend OTP"}
            </button>
          </>
        )}

        <button
          onClick={
            mode === "login"
              ? handleLogin
              : mode === "register"
              ? handleRegister
              : handleVerify
          }
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Login"
            : mode === "register"
            ? "Register"
            : "Verify OTP"}
        </button>

        <div className="text-sm mt-3 text-center">
          {mode === "login" && (
            <span
              onClick={() => setMode("register")}
              className="cursor-pointer text-blue-500"
            >
              Create account
            </span>
          )}
          {mode === "register" && (
            <span
              onClick={() => setMode("login")}
              className="cursor-pointer text-blue-500"
            >
              Back to login
            </span>
          )}
        </div>
      </div>
    </div>
  );
}