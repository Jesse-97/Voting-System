import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./login.css";
import Toast from "./Toast.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setToast({ msg: "Please enter username and password", type: "error" });
      return;
    }

    console.log("Login:", { username, password });

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log("HTTP status:", res.status);

      const data = await res.json().catch((err) => {
        console.warn("Could not parse JSON:", err);
        return {};
      });

      console.log("Response body:", data);

      if (res.status === 200) {
        const user = data.user;

        localStorage.setItem("user", JSON.stringify(user));

        setToast({ msg: "Login successful", type: "success" });
        navigate("/home", { state: { user } });
      } else if (res.status === 401) {
        setToast({ msg: "Invalid password", type: "error" });
      } else if (res.status === 404) {
        setToast({ msg: "User not found", type: "error" });
      } else {
        setToast({
          msg: "Login failed",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Network error:", err);
      setToast({
        msg: "Network error with server",
        type: "error",
      });
    }
  };

  return (
    <>
      <div className="login-root">
        <div className="video-background">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="/damascus.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="content">
          <div className="login-container">
            <div className="input-container">
              <div className="input-row-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  style={{ width: "25px", height: "25px" }}
                >
                  <path
                    fill="#a3a3a3"
                    d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z"
                  />
                </svg>
                <form className="login-form" onSubmit={handlePasswordSubmit}>
                  <input
                    type="text"
                    placeholder="Username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </form>
              </div>
              <div className="input-row-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  style={{ width: "25px", height: "25px" }}
                >
                  <path
                    fill="#bababa"
                    d="M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z"
                  />
                </svg>
                <form className="login-form" onSubmit={handlePasswordSubmit}>
                  <input
                    type="password"
                    placeholder="Password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </form>
              </div>

              {toast && (
                <Toast
                  message={toast.msg}
                  type={toast.type}
                  onClose={() => setToast(null)}
                />
              )}
            </div>
            <div className="register-container">
              <div className="register-text-container">
                <h2>Don't have an account?</h2>
              </div>
              <div className="register-button-container">
                <button onClick={() => navigate("/register")}>Register</button>
              </div>
            </div>
          </div>
          <div className="button-container">
            <button onClick={handlePasswordSubmit}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                width={"30px"}
                height={"30px"}
              >
                <path
                  fill="#bababa"
                  d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM361 417C351.6 426.4 336.4 426.4 327.1 417C317.8 407.6 317.7 392.4 327.1 383.1L366.1 344.1L216 344.1C202.7 344.1 192 333.4 192 320.1C192 306.8 202.7 296.1 216 296.1L366.1 296.1L327.1 257.1C317.7 247.7 317.7 232.5 327.1 223.2C336.5 213.9 351.7 213.8 361 223.2L441 303.2C450.4 312.6 450.4 327.8 441 337.1L361 417.1z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
