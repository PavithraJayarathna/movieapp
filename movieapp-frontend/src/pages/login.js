import React from "react";
import Navbar from "../components/navbar";
import MainDisplay from "../components/maindisplay";
import MovieGrid from "../components/moviegrid";


const LoginPage = () => {
  return (
    <div className="bg-[#04091d] min-h-screen">
      <Navbar />
      <h2 className="text-white text-2xl max-w-7xl mx-auto mt-5  sm:px-6 lg:px-8">
        Top Picks
      </h2>
      <MainDisplay />
      
      <h2 className="text-white text-2xl max-w-7xl mx-auto mt-5  sm:px-6 lg:px-8">
        For You
      </h2>
      <MovieGrid />

      <h2 className="text-white text-2xl max-w-7xl mx-auto mt-5  sm:px-6 lg:px-8">
        Popular Movies
      </h2>
      <MovieGrid />

      <h2 className="text-white text-2xl max-w-7xl mx-auto mt-5  sm:px-6 lg:px-8">
        New Movies
      </h2>
      <MovieGrid />
    </div>
  );
};

export default LoginPage;
