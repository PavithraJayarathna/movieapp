import React, { useState, useEffect } from "react";

const MovieList = ({ title, movieIds }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_KEY = "/cccd7d7b";

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const movieData = await Promise.all(
          movieIds.map(async (id) => {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`);
            return response.json();
          })
        );
        setMovies(movieData);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
      setLoading(false);
    };

    fetchMovies();
  }, [movieIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
      <h2 className="text-2xl font-bold mt-5">{title}</h2>
      {loading ? (
        <p className="text-center mt-4">Loading movies...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {movies.map((movie) => (
            <div key={movie.imdbID} className="bg-[#1e293b] p-3 rounded-lg shadow-lg">
              <img src={movie.Poster} alt={movie.Title} className="w-full h-60 object-cover rounded" />
              <h3 className="text-lg font-semibold mt-2">{movie.Title}</h3>
              <p className="text-sm text-gray-400">{movie.Year}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieList;
