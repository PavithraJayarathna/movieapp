import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const OMDB_API_KEY = "cccd7d7b";

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}&plot=full`);
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
      setLoading(false);
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return <p className="text-white text-center mt-10">Loading movie details...</p>;
  }

  if (!movie || movie.Response === "False") {
    return <p className="text-white text-center mt-10">Movie not found.</p>;
  }

  return (
    <div className="bg-[#04091d] min-h-screen text-white px-4 sm:px-6 lg:px-36 py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
      >
        ← Go Back
      </button>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Movie Poster */}
        <img
          src={movie.Poster}
          alt={movie.Title}
          className="w-64 md:w-96 rounded-lg shadow-lg"
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
                <div key={index} className="bg-gray-800 p-2 rounded-lg">
                  <p className="text-yellow-400 font-semibold">{rating.Source}</p>
                  <p>{rating.Value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
