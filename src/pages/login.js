import React from "react";
// import MainDisplay from "../components/maindisplay";
import MovieList from "../components/moviegrid";


import MovieDisplay from "../components/newmoviedisplay";


const LoginPage = () => {
  return (
    <div className="bg-[#04091d] min-h-screen">
      <h2 className="absolute z-40 text-white text-2xl font-bold max-w-7xl mx-28 mt-0 py-4 sm:px-6 lg:px-8">
        Top Picks
      </h2>
      {/* <MainDisplay /> */}
      <MovieDisplay/>
      
      <MovieList 
        title="Top Rated Movies" 
        movieIds={["tt0111161", "tt0068646", "tt0468569", "tt0167260", "tt0137523"]} 
      />

      {/* Famous Movies */}
      <MovieList 
        title="Famous Movies" 
        movieIds={["tt0499549", "tt0167260", "tt4154796", "tt0120737", "tt0080684"]} 
      />

      {/* Picks for You */}
      <MovieList 
        title="Picks for You" 
        movieIds={["tt6723592", "tt0114709", "tt0266543", "tt2382320", "tt0910970"]} 
      />

      {/* Latest Movies */}
      <MovieList 
        title="Latest Movies" 
        movieIds={["tt1462764", "tt9362722", "tt12261776", "tt13539646", "tt10545296"]} 
      />
    </div>
  );
};

export default LoginPage;
