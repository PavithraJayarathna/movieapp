import React from "react";
import Rating from '@mui/material/Rating';

const MovieCard = ({ movie }) => {
  return (
    <div
      className="group relative bg-[#04091d] rounded-lg overflow-hidden shadow-md transition-all duration-300 transform hover:scale-110"
    >
      {/* Always Visible Title */}
      <div className="absolute bottom-0 z-10 w-full bg-gradient-to-t from-black to-transparent px-2 py-1 rounded">
        <h3 className="text-sm font-semibold text-white">{movie.title}</h3>
        </div>


      {/* Default Image */}
      <img
        src={movie.image}
        alt={movie.title}
        className="w-full h-56 object-cover transition-opacity duration-300 group-hover:opacity-0"
      />

      {/* Hover Image */}
      <img
        src={movie.hoverImage}
        alt={`${movie.title} Hover`}
        className="w-full h-56 object-cover absolute top-0 left-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Movie Details */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 z-20 transition-opacity duration-300 px-2 py-0">
        <p className="text-sm text-white">{movie.title} ({movie.releaseDate})</p>
        <p className="flex align-middle justify-between mb-2 text-sm text-white">{movie.duration}
        <Rating name="half-rating-read" defaultValue={movie.rating} precision={0.1} readOnly size="small"/>
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
