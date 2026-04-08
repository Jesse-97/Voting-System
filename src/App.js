import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Login from "./login.js";
import Register from "./register.js";
import Home from "./home.js";
import Create from "./create.js";
import UserMenu from "./userMenu.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/user-menu" element={<UserMenu />} />
      </Routes>
    </BrowserRouter>
  );
}
