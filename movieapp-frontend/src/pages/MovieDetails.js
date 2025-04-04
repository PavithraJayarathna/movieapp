import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  const OMDB_API_KEY = "cccd7d7b";
  const userID = localStorage.getItem("user");

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}&plot=full`
        );
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
      setLoading(false);
    };

    const checkIfSaved = async () => {
      try {
        const response = await fetch(`http://35.173.242.217:8000/api/${userID}/movies`);
        const savedMovies = await response.json();

        console.log(savedMovies);

        setIsSaved(savedMovies.includes(id));
      } catch (error) {
        console.error("Error checking saved movies:", error);
      }
    };

    fetchMovieDetails();
    checkIfSaved();
  }, [id]);

  const saveMovie = async () => {
  if (!userID) {
    alert("You must be logged in to save movies!");
    return;
  }

  try {
    const response = await fetch(`http://35.173.242.217:8000/api/${userID}/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieID: id, userID }),
    });

    const data = await response.json();
    setIsSaved(true);
    alert(data.message);
  } catch (error) {
    console.error("Error saving movie:", error);
  }
};


  if (loading) {
    return <p className="mt-10 text-center text-white">Loading movie details...</p>;
  }

  if (!movie || movie.Response === "False") {
    return <p className="mt-10 text-center text-white">Movie not found.</p>;
  }

  return (
    <div className="bg-[#04091d] min-h-screen text-white px-4 sm:px-6 lg:px-36 py-10">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 mb-6 text-white bg-gray-700 rounded-lg hover:bg-gray-600"
      >
        ◀ Go Back
      </button>

      <div className="flex flex-col items-center gap-8 md:flex-row">
        {/* Movie Poster */}
        <img
          src={movie.Poster}
          alt={movie.Title}
          className="w-64 rounded-lg shadow-lg md:w-96"
        />

        {/* Movie Details */}
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold">{movie.Title}</h1>
          <p className="text-gray-400">
            {movie.Year} • {movie.Genre} • {movie.Runtime}
          </p>
          <p className="mt-4 text-gray-300">{movie.Plot}</p>

          {/* Director, Actors, Awards */}
          <div className="mt-4 space-y-2">
            <p>
              <span className="font-semibold">Director:</span> {movie.Director}
            </p>
            <p>
              <span className="font-semibold">Writers:</span> {movie.Writer}
            </p>
            <p>
              <span className="font-semibold">Actors:</span> {movie.Actors}
            </p>
            <p>
              <span className="font-semibold">Awards:</span> 🏆 {movie.Awards}
            </p>
            <p>
              <span className="font-semibold">Box Office:</span> 💰 {movie.BoxOffice}
            </p>
          </div>

          {/* Ratings */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Ratings</h2>
            <div className="flex flex-wrap gap-4 mt-2">
              {movie.Ratings.map((rating, index) => (
                <div key={index} className="p-2 bg-gray-800 rounded-lg">
                  <p className="font-semibold text-yellow-400">{rating.Source}</p>
                  <p>{rating.Value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Save to Bucket Button */}
          <button
            onClick={saveMovie}
            disabled={isSaved}
            className={`mt-6 px-6 py-2 text-white rounded-lg ${
              isSaved ? "bg-green-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {isSaved ? "✔ Saved" : "🡻  Save to Bucket"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
