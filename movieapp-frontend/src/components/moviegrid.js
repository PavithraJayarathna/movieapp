import React from "react";
import Slider from "react-slick";
import MovieCard from "./moviecard";

// import {CustomPrevArrow, CustomNextArrow} from "./arrow";

import H1 from "../assets/img/h1.jpg";
import H2 from "../assets/img/h2.jpg";
import H3 from "../assets/img/h3.jpg";
import H4 from "../assets/img/h4.jpg";
import H5 from "../assets/img/h5.jpg";
import H6 from "../assets/img/h6.png";

const movies = [
  {
    id: 1,
    title: "Justice League",
    image: H1, // Image: Justice League
    hoverImage: H4, // Image for hover: The Boys
    releaseDate: "2021",
    rating: 6.0,
    duration: "2h 0m",
  },
  {
    id: 2,
    title: "John Wick",
    image: H2, // Image: John Wick
    hoverImage: H5, // Image for hover: Inside Out
    releaseDate: "2014",
    rating: 7.4,
    duration: "1h 41m",
  },
  {
    id: 3,
    title: "Wednesday",
    image: H3, // Image: Wednesday
    hoverImage: H4, // Image for hover: The Boys
    releaseDate: "2022",
    rating: 8.0,
    duration: "1h 0m",
  },
  {
    id: 4,
    title: "The Boys",
    image: H4, // Image: The Boys
    hoverImage: H5, // Image for hover: Inside Out
    releaseDate: "2019",
    rating: 8.7,
    duration: "1h 0m",
  },
  {
    id: 5,
    title: "Inside Out",
    image: H5, // Image: Inside Out
    hoverImage: H1, // Image for hover: Justice League
    releaseDate: "2015",
    rating: 8.1,
    duration: "1h 34m",
  },
  {
    id: 6,
    title: "Harry Potter and the Philosopher's Stone",
    image: H6, // Image: Harry Potter
    hoverImage: H2, // Image for hover: John Wick
    releaseDate: "2001",
    rating: 7.6,
    duration: "2h 32m",
  },
];


const MovieGrid = () => {
  const settings = {
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 5,
    autoplay: false,
    autoplaySpeed: 3000,
    dots: false,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024, // For tablet devices
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // For mobile devices
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4 sm:px-6 lg:px-8">
      <Slider {...settings}>
        {movies.map((movie) => (
          <div key={movie.id} className="p-2">
            <MovieCard movie={movie} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default MovieGrid;