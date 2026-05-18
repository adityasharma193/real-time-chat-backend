import { useState } from "react";
import {
  loginAPI,
  registerAPI,
} from "../services/api";

export default function Login({
  onSuccess,
}) {

  const [isLogin, setIsLogin] =
    useState(true);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      let data;

      if (isLogin) {

        data = await loginAPI(
          email,
          password
        );

      } else {

        data = await registerAPI(
          name,
          email,
          password
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      onSuccess(data.token);

    } catch (err) {

      setError(
        err.response?.data?.error ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin = () => {

    window.location.href =
      `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">

      {/* BACKGROUND GLOW */}
      <div className="absolute w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full top-20 left-20"></div>

      <div className="absolute w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full bottom-20 right-20"></div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl p-8">

        {/* LOGO */}
        <div className="flex justify-center mb-4">

          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl shadow-lg">
            💬
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          Chat App
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Real-time messaging platform
        </p>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-blue-500 transition"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-blue-500 transition"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-blue-500 transition"
            required
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200 shadow-lg"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition duration-200"
        >
          Continue with Google
        </button>

        {/* TOGGLE */}
        <p className="text-center text-gray-400 mt-6">

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() =>
              setIsLogin(!isLogin)
            }
            className="ml-2 text-blue-400 hover:text-blue-300"
          >
            {isLogin
              ? "Register"
              : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}