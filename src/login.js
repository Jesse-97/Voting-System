import React from "react";
import "./login.css";

export default function Login() {
  return (
    <>
      <div className="background hide"></div>
      <div className="content">
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
            <input type="text" placeholder="Username..." />
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
            <input type="password" placeholder="Password..." />
          </div>
        </div>
      </div>
    </>
  );
}
