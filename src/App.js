import React from "react";
import Login from "./login.js";
import Register from "./register.js";

export function Login_page() {
  return <Login />;
}

export function Register_page() {
  return <Register />;
}
export default function App() {
  const currentPage = <Login />;
  return currentPage;
}
