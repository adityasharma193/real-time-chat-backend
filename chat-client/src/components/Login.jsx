import React, {
  useState,
} from "react";

import {
  loginAPI,
  registerAPI,
} from "../services/api";

import {
  useTheme,
} from "../ThemeContext";

export default function Login({
  onSuccess,
}) {

  const [mode, setMode] =
    useState("login");

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const { dark, setDark } =
    useTheme();

  // ================= CHANGE =================
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });

    setError("");
  };

  // ================= LOGIN =================
  const handleLogin =
    async () => {

      try {

        setLoading(true);

        const data =
          await loginAPI(
            form.email,
            form.password
          );

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );

        onSuccess(
          data.token
        );

      } catch (err) {

        setError(
          err.message
        );

      } finally {

        setLoading(false);
      }
    };

  // ================= REGISTER =================
  const handleRegister =
    async () => {

      try {

        setLoading(true);

        const data =
          await registerAPI(
            form.name,
            form.email,
            form.password
          );

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );

        onSuccess(
          data.token
        );

      } catch (err) {

        setError(
          err.message
        );

      } finally {

        setLoading(false);
      }
    };

  // ================= ENTER =================
  const handleKeyDown =
    (e) => {

      if (e.key === "Enter") {

        e.preventDefault();

        if (
          mode === "login"
        ) {

          handleLogin();

        } else {

          handleRegister();
        }
      }
    };

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin =
    () => {

      window.location.href =
        "https://real-time-chat-backend-0q4t.onrender.com/api/auth/google";
    };

  return (
    <div
      className={`h-screen flex items-center justify-center ${
        dark
          ? "bg-gray-900 text-white"
          : "bg-gray-100"
      }`}
    >

      {/* THEME */}
      <button
        onClick={() =>
          setDark(!dark)
        }

        className="absolute top-4 right-4 bg-blue-500 px-3 py-1 rounded text-white"
      >
        {dark
          ? "Light"
          : "Dark"}
      </button>

      {/* CARD */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded w-80 shadow">

        <h2 className="text-xl mb-4 text-center capitalize">
          {mode}
        </h2>

        {error && (
          <div className="text-red-500 mb-2 text-sm">
            {error}
          </div>
        )}

        {/* NAME */}
        {mode ===
          "register" && (
          <input
            name="name"
            placeholder="Name"
            onChange={
              handleChange
            }
            onKeyDown={
              handleKeyDown
            }
            className="w-full mb-2 p-2 rounded bg-gray-200 dark:bg-gray-700"
          />
        )}

        {/* EMAIL */}
        <input
          name="email"
          placeholder="Email"
          onChange={
            handleChange
          }
          onKeyDown={
            handleKeyDown
          }
          className="w-full mb-2 p-2 rounded bg-gray-200 dark:bg-gray-700"
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={
            handleChange
          }
          onKeyDown={
            handleKeyDown
          }
          className="w-full mb-3 p-2 rounded bg-gray-200 dark:bg-gray-700"
        />

        {/* LOGIN/REGISTER */}
        <button
          onClick={
            mode === "login"
              ? handleLogin
              : handleRegister
          }

          disabled={loading}

          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Login"
            : "Register"}
        </button>

        {/* DIVIDER */}
        <div className="text-center text-sm my-3 opacity-70">
          OR
        </div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={
            handleGoogleLogin
          }

          className="w-full bg-white text-black py-2 rounded border"
        >
          Continue with Google
        </button>

        {/* SWITCH */}
        <div className="text-sm mt-4 text-center">

          {mode ===
          "login" ? (

            <span
              onClick={() =>
                setMode(
                  "register"
                )
              }

              className="cursor-pointer text-blue-500"
            >
              Create account
            </span>

          ) : (

            <span
              onClick={() =>
                setMode(
                  "login"
                )
              }

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