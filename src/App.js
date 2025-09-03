import React from "react";
import Login from "./login.js";
import Register from "./register.js";
import Home from "./home.js";

export function Login_page() {
  return <Login />;
}

export function Register_page() {
  return <Register />;
}

export function Home_page() {
  return <Home />;
}
export default function App() {
  const currentPage = <Home />;
  return currentPage;
}
