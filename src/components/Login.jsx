import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Adjust the import
const mockUsers = [
  { email: "Pratik@gmail.com", password: "Upstep123" },
  { email: "Vinay@gmail.com", password: "Upstep2023" },
  { email: "Aayam@gmail.com", password: "Upstep2024" },
];

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggedIn, logout } = useAuth(); // Use the custom hook
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();

    const userExists = mockUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (userExists) {
      login(userExists.email); // Call login from context
      navigate("/dashboard"); // Redirect to the dashboard
    } else {
      alert("Invalid email or password");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1721132447246-5d33f3008b05?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
      }}
    >
      <div className="p-10 bg-white bg-opacity-60 rounded-xl shadow-xl transform transition-transform hover:scale-105 duration-300 ease-in-out">
        <div className="p-8 bg-white bg-opacity-90 rounded-lg shadow-lg transform transition-transform hover:scale-105 duration-300 ease-in-out">
          <h2 className="text-3xl font-bold text-blue-500 text-center mb-6">
            {isLoggedIn ? "Welcome Back!" : "Login to Your Account"}
          </h2>

          {isLoggedIn ? (
            <>
              <button
                onClick={logout}
                className="w-full py-3 mb-4 px-6 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 text-white font-bold rounded-md shadow-lg hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-transform hover:scale-105 duration-300 ease-in-out"
              >
                Logout
              </button>
            </>
          ) : (
            <form className="space-y-6" onSubmit={submit}>
              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm font-semibold text-gray-900">
                  Email
                </label>
                <input
                  type="text"
                  name="email"
                  placeholder="Enter your Email"
                  className="mt-2 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="password" className="text-sm font-semibold text-gray-900">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="mt-2 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-md shadow-lg hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-transform hover:scale-105 duration-300 ease-in-out"
              >
                Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
