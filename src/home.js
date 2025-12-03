import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./home.css";

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    if (location.state?.user) {
      return location.state.user;
    }

    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }

    return null;
  });

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Search query:", query);
  };

  const [open, setOpen] = useState(false);

  const handleSidebarClick = () => {
    setOpen(!open);
    console.log("Sidebar clicked");
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("user");
    location.state = null;
    navigate("/");
  };

  if (!user) {
    return (
      <div className="home-root">
        <div className="video-background">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="/damascus.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="main-container">
          <h2 style={{ color: "white" }}>Redirecting to login...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="home-root">
        <div className="video-background">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="/damascus.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="main-container">
          <div className={`sidebar ${open ? "open" : ""}`}>
            <div className="top">
              <button onClick={handleSidebarClick}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  style={{ width: "25px", height: "25px" }}
                >
                  <path
                    fill="#e0e0e0"
                    d="M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z"
                  />
                </svg>
              </button>
              <div className="visionText visionColor">
                <h1 style={{ fontSize: "1.25rem" }}>Vision</h1>
                <h1 className="ent" style={{ fontSize: "0.8rem" }}>
                  .ent
                </h1>
              </div>
            </div>
            <div className="bottom">
              <div className="text-container">
                <button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    style={{ width: "25px", height: "25px" }}
                  >
                    <path
                      fill="#e0e0e0"
                      d="M463 448.2C440.9 409.8 399.4 384 352 384L288 384C240.6 384 199.1 409.8 177 448.2C212.2 487.4 263.2 512 320 512C376.8 512 427.8 487.3 463 448.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 336C359.8 336 392 303.8 392 264C392 224.2 359.8 192 320 192C280.2 192 248 224.2 248 264C248 303.8 280.2 336 320 336z"
                    />
                  </svg>
                </button>
                <h1 className="visionText" style={{ fontSize: "1.15rem" }}>
                  {user.username}
                </h1>
              </div>
              <div className="text-container">
                <button onClick={handleLogoutClick}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    style={{ width: "25px", height: "25px" }}
                  >
                    <path
                      fill="#e0e0e0"
                      d="M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z"
                    />
                  </svg>
                </button>
                <h1 className="visionText" style={{ fontSize: "1.15rem" }}>
                  Logout
                </h1>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="create-button">
              <button>Create</button>
            </div>
            <div className="search-container">
              <img src="vector_logo1.png" className="logo" alt="" />
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </form>
            </div>
            <div className="display-container">
              <div className="grid-container">
                <div className="item"></div>
                <div className="item"></div>
                <div className="item"></div>
                <div className="item"></div>
              </div>
              <div className="grid-container">
                <div className="item"></div>
                <div className="item"></div>
                <div className="item"></div>
                <div className="item"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
