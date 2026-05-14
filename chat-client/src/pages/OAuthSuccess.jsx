import { useEffect } from "react";

import {
  useNavigate,
} from "react-router-dom";

export default function OAuthSuccess() {

  const navigate =
    useNavigate();

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const token =
      params.get("token");

    // ================= SAVE TOKEN =================
    if (token) {

      localStorage.setItem(
        "token",
        token
      );

      // fetch user manually later if needed
      navigate("/");
    }

    // ================= INVALID TOKEN =================
    else {

      navigate("/");
    }

  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      Logging in...
    </div>
  );
}