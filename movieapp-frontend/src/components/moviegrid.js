import React, { useState, useEffect } from "react";

const MovieList = ({ title, movieIds }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_KEY = "cccd7d7b";

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const movieData = await Promise.all(
          movieIds.map(async (id) => {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`); //This want to edit key->apikey
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
    <div className="px-4 mx-auto text-white max-w-7xl sm:px-6 lg:px-8">
      <h2 className="mt-5 text-2xl font-bold">{title}</h2>
      {loading ? (
        <p className="mt-4 text-center">Loading movies...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.map((movie) => (
            <div key={movie.imdbID} className="bg-[#1e293b] p-3 rounded-lg shadow-lg">
              <img src={movie.Poster} alt={movie.Title} className="object-cover w-full rounded h-60" />
              <h3 className="mt-2 text-lg font-semibold">{movie.Title}</h3>
              <p className="text-sm text-gray-400">{movie.Year}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieList;
