import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MyMovies = () => {
  const [movies, setMovies] = useState([]);
  const userID = localStorage.getItem("user");

  useEffect(() => {
    if (!userID) {
      console.error("No user logged in.");
      return;
    }

    const fetchSavedMovies = async () => {
      try {
        const response = await fetch(`http://35.173.242.217:8000/api/${userID}/movies`);
        const data = await response.json();

        console.log(data);

        if (!data || data.length === 0) {
          setMovies([]);
          return;
        }

        // Fetch movie details from OMDB API for each saved movie
        const fetchedMovies = await Promise.all(
          data.map(async (movieID) => {
            const movieResponse = await fetch(
              `https://www.omdbapi.com/?apikey=cccd7d7b&i=${movieID}`
            );
            console.log(movieResponse);
            return movieResponse.json();
          })
        );

        setMovies(fetchedMovies);
      } catch (error) {
        console.error("Error fetching saved movies:", error);
      }
    };

    fetchSavedMovies();
  }, [userID]);

  const removeMovie = async (movieId) => {
    try {
      await fetch(`http://35.173.242.217:8000/api/${userID}/movies/${movieId}`, {
        method: "DELETE",
      });

      setMovies(movies.filter((movie) => movie.imdbID !== movieId));
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  return (
    <div className="bg-[#04091d] min-h-screen text-white px-4 sm:px-6 lg:px-36 py-10">
      <h1 className="mb-6 text-3xl font-bold text-yellow-500">My Movies</h1>

      {movies.length === 0 ? (
        <p className="text-center text-gray-400">No movies saved.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {movies.map((movie) => (
            <div key={movie.imdbID} className="p-3 bg-gray-800 rounded-lg shadow-lg">
              <Link to={`/movie/${movie.imdbID}`}>
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  className="object-cover w-full rounded-md h-60"
                />
                <h2 className="mt-2 text-lg font-semibold">{movie.Title}</h2>
                <p className="text-sm text-gray-400">{movie.Year}</p>
              </Link>
              <button
                onClick={() => removeMovie(movie.imdbID)}
                className="w-full py-2 mt-3 text-white bg-red-600 rounded-lg hover:bg-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMovies;
