import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSearch } from "react-icons/fa";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate(); // ✅ Use React Router for navigation

  const handleAuth = async () => {
    if (isSignup) {
      if (!email || !username || !password || !confirmPassword) {
        alert("All fields are required!");
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      try {
        const response = await fetch("http://3.93.185.27:8000/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        alert("An error occurred. Please try again.");
      }
    } else {
      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }
      try {
        const response = await fetch("http://3.93.185.27:8000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        alert("An error occurred. Please try again.");
      }
    }
  };

  // ✅ Fix: Use `useNavigate` for search navigation
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <>
      <nav className="bg-[#161f2e] text-white sticky top-0 z-50 shadow-lg">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="flex items-center justify-between h-16">
            
            {/* ✅ Fix: Use <Link> instead of <a href="/"> */}
            <Link to="/" className="text-2xl font-semibold tracking-widest text-yellow-500">
              CINE<span className="text-white">APP</span>
            </Link>

            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full px-4 py-2 pl-10 text-white bg-gray-900 border border-gray-700 rounded-full focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch} // ✅ Fix: Search navigation
              />
              <FaSearch className="absolute text-gray-400 left-3 top-3" />
            </div>

            {/* Auth Buttons */}
            <div className="relative hidden space-x-4 md:flex">
              {user ? (
                <div className="relative">
                  <button className="flex items-center text-lg font-medium" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    {user.toUpperCase()}
                    <FaUserCircle className="ml-2 text-2xl text-yellow-500" />
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
                  <button
                    className="px-4 py-2 text-sm font-semibold text-black transition-all bg-yellow-500 rounded-lg hover:bg-yellow-600"
                    onClick={() => { setIsModalOpen(true); setIsSignup(false); }}
                  >
                    Log in
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-semibold text-white transition-all bg-gray-700 rounded-lg hover:bg-gray-600"
                    onClick={() => { setIsModalOpen(true); setIsSignup(true); }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative z-50 p-6 bg-[#04091d] border border-gray-700 rounded-xl shadow-2xl w-96">
            <h2 className="mb-4 text-2xl font-semibold text-center text-yellow-500">
              {isSignup ? "Sign Up" : "Login"}
            </h2>

            <input
              type="text"
              placeholder="Email"
              className="w-full px-4 py-3 mb-3 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {isSignup && (
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 mb-3 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 mb-3 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {isSignup && (
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-3 mb-4 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            <button className="w-full py-3 font-semibold text-black transition-all bg-yellow-500 rounded-lg hover:bg-yellow-600" onClick={handleAuth}>
              {isSignup ? "Sign Up" : "Log in"}
            </button>

            <button className="w-full py-3 mt-3 text-white transition-all bg-gray-700 rounded-lg hover:bg-gray-600" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
