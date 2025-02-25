import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SearchResults = () => {
  const [movies, setMovies] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q");

  const OMDB_API_KEY = "cccd7d7b";

  useEffect(() => {
    const fetchMovies = async () => {
      if (searchQuery) {
        try {
          const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${searchQuery}`);
          const data = await response.json();
          if (data.Search) {
            setMovies(data.Search);
          } else {
            setMovies([]);
          }
        } catch (error) {
          console.error("Error fetching movie data:", error);
        }
      }
    };
    fetchMovies();
  }, [searchQuery]);

  return (
    <div className="bg-[#04091d] px-4 sm:px-6 lg:px-36 py-6 min-h-screen">
      <h1 className="text-2xl font-semibold text-white mb-4">
        Search Results for: <span className="text-yellow-500">{searchQuery}</span>
      </h1>

      {movies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {movies.map((movie) => (
            <div
              key={movie.imdbID}
              className="bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105"
              onClick={() => navigate(`/movie/${movie.imdbID}`)} // Navigate to MovieDetails page
            >
              <img src={movie.Poster} alt={movie.Title} className="w-full h-80 object-cover rounded-lg" />
              <h2 className="text-lg font-semibold text-white mt-2">{movie.Title}</h2>
              <p className="text-gray-400">{movie.Year}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No movies found.</p>
      )}
    </div>
  );
};

export default SearchResults;
