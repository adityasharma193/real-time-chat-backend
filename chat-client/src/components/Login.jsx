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

  // ================= SUBMIT =================
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");

      try {

        let data;

        // LOGIN
        if (isLogin) {

          data =
            await loginAPI(
              email,
              password
            );
        }

        // REGISTER
        else {

          data =
            await registerAPI(
              name,
              email,
              password
            );
        }

        // SAVE TOKEN
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

        // CALLBACK
        if (onSuccess) {

          onSuccess(
            data.token
          );
        }

        // FALLBACK
        else {

          window.location.href =
            "/";
        }

      } catch (err) {

        setError(
          err.response?.data
            ?.error ||
          "Authentication failed"
        );
      }
    };

  return (

    <div className="h-screen flex items-center justify-center bg-gray-900">

      <div className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow-lg">

        <h1 className="text-2xl font-bold text-center text-white mb-6">
          {isLogin
            ? "Login"
            : "Create Account"}
        </h1>

        {error && (
          <div className="bg-red-500/20 text-red-400 text-sm p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >

          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="w-full p-3 rounded bg-gray-700 text-white outline-none"
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
            className="w-full p-3 rounded bg-gray-700 text-white outline-none"
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
            className="w-full p-3 rounded bg-gray-700 text-white outline-none"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition p-3 rounded text-white font-semibold"
          >
            {isLogin
              ? "Login"
              : "Register"}
          </button>

        </form>

        {/* GOOGLE LOGIN */}
        <a
          href={`${process.env.REACT_APP_API_URL}/auth/google`}
        >
          <button className="w-full mt-4 bg-red-500 hover:bg-red-600 transition p-3 rounded text-white font-semibold">
            Continue with Google
          </button>
        </a>

        <div className="text-center mt-4">

          <button
            onClick={() =>
              setIsLogin(
                !isLogin
              )
            }
            className="text-blue-400 text-sm"
          >
            {isLogin
              ? "Create account"
              : "Already have an account?"}
          </button>

        </div>

      </div>

    </div>
  );
}