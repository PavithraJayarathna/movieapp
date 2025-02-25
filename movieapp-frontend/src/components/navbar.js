import React, { useState } from "react";
import { LoginButton, SignupButton } from "./buttons";
import { FaUserCircle } from "react-icons/fa"; // Profile icon

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAuth = async () => {
    if (isSignup) {
      // Signup Logic
      if (!email || !username || !password || !confirmPassword) {
        alert("All fields are required!");
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      try {
        const response = await fetch("http://localhost:8000/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, password }),
        });

        const data = await response.json();
        if (response.ok) {
          alert("Signup successful! Please log in.");
          setIsSignup(false);
        } else {
          alert(data.message || "Signup failed");
        }
      } catch (error) {
        console.error("Signup error:", error);
        alert("An error occurred. Please try again.");
      }
    } else {
      // Login Logic
      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }
      try {
        const response = await fetch("http://localhost:8000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data.user.username);
          setIsModalOpen(false);
        } else {
          alert(data.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <>
      <nav className="bg-[#161f2e] text-white sticky top-0 z-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-thin border-t-2 border-b-2 border-yellow-500">
                CINE APP
              </a>
            </div>

            {/* Menu Items */}
            <div className="relative hidden space-x-4 md:flex">
              {user ? (
                <div className="relative">
                  <button
                    className="flex items-center text-lg font-medium"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >   
                    {user.toUpperCase()}
                    <FaUserCircle className="ml-2 text-2xl" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 w-32 mt-2 text-black bg-white rounded shadow-lg">
                      <button className="block w-full px-4 py-2 text-left hover:bg-gray-200" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <LoginButton onClick={() => { setIsModalOpen(true); setIsSignup(false); }}>Log in</LoginButton>
                  <SignupButton onClick={() => { setIsModalOpen(true); setIsSignup(true); }}>Sign up</SignupButton>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal (Login & Signup) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative z-50 p-6 bg-white rounded-lg shadow-lg w-80">
            <h2 className="mb-4 text-xl font-semibold">{isSignup ? "Sign Up" : "Login"}</h2>
            <input
              type="text"
              placeholder="Email"
              className="w-full px-3 py-2 mb-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {isSignup && (
              <input
                type="text"
                placeholder="Username"
                className="w-full px-3 py-2 mb-2 border rounded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 mb-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isSignup && (
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-3 py-2 mb-4 border rounded"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}
            <button className="w-full py-2 text-white bg-blue-500 rounded" onClick={handleAuth}>
              {isSignup ? "Sign Up" : "Log in"}
            </button>
            <button className="w-full py-2 mt-2 bg-gray-300 rounded" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
