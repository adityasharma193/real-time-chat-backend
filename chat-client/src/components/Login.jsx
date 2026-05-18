import {
  useState,
} from "react";

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

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ================= SUBMIT =================
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");

      try {

        setLoading(true);

        let data;

        // LOGIN
        if (isLogin) {

          data =
            await loginAPI(
              email,
              password
            );

        } else {

          // REGISTER
          data =
            await registerAPI(
              name,
              email,
              password
            );
        }

        // SAVE USER
        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );

        // IMPORTANT
        if (
          typeof onSuccess ===
          "function"
        ) {

          onSuccess(
            data.token
          );

        } else {

          console.error(
            "onSuccess is not a function"
          );
        }

      } catch (err) {

        console.error(err);

        setError(
          err.response?.data
            ?.error ||
            err.message ||
            "Something went wrong"
        );

      } finally {

        setLoading(false);
      }
    };

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin =
    () => {

      window.location.href =
        `${process.env.REACT_APP_API_URL}/auth/google`;
    };

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#020617] overflow-hidden relative">

      {/* BACKGROUND */}
      <div className="absolute inset-0">

        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 opacity-20 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 opacity-20 blur-3xl rounded-full" />

      </div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md bg-[#0f172a]/90 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl p-10">

        {/* LOGO */}
        <div className="flex justify-center mb-6">

          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-xl text-4xl">
            💬
          </div>

        </div>

        {/* TITLE */}
        <h1 className="text-5xl font-black text-center text-white mb-3">
          Chat App
        </h1>

        <p className="text-center text-slate-400 mb-10 text-lg">
          Real-time messaging platform
        </p>

        {/* ERROR */}
        {error && (

          <div className="mb-6 bg-red-500/20 border border-red-500 text-red-300 px-4 py-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >

          {!isLogin && (

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-2xl px-5 py-4 text-white outline-none"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-2xl px-5 py-4 text-white outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-2xl px-5 py-4 text-white outline-none"
            required
          />

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-700 hover:scale-[1.02] transition py-4 rounded-2xl text-white font-bold text-lg shadow-lg"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>

        </form>

        {/* GOOGLE */}
        <button
          onClick={
            handleGoogleLogin
          }
          className="w-full mt-5 bg-red-500 hover:bg-red-600 transition py-4 rounded-2xl text-white font-bold text-lg shadow-lg"
        >
          Continue with Google
        </button>

        {/* TOGGLE */}
        <div className="mt-8 text-center text-slate-400">

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() =>
              setIsLogin(
                !isLogin
              )
            }
            className="ml-2 text-blue-400 hover:text-blue-300 font-semibold"
          >
            {isLogin
              ? "Register"
              : "Login"}
          </button>

        </div>

      </div>
    </div>
  );
}