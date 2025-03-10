import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import ColorThief from "colorthief";

import H1 from "../assets/img/h1.jpg";
import H2 from "../assets/img/h2.jpg";
import H3 from "../assets/img/h3.jpg";
import H4 from "../assets/img/h4.jpg";
import H5 from "../assets/img/h5.jpg";
import H6 from "../assets/img/h6.png";

const movies = [
  { id: 1, title: "Movie 1", image: H1 },
  { id: 2, title: "Movie 2", image: H2 },
  { id: 3, title: "Movie 3", image: H3 },
  { id: 4, title: "Movie 4", image: H4 },
  { id: 5, title: "Movie 5", image: H5 },
  { id: 6, title: "Movie 6", image: H6 },
];

const MainDisplay = () => {
  const [boxShadowColors, setBoxShadowColors] = useState({});

  const getDominantColor = (imageUrl, id) => {
    const colorThief = new ColorThief();
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const color = colorThief.getColor(img);
      setBoxShadowColors((prevColors) => ({
        ...prevColors,
        [id]: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
      }));
    };
  };

  useEffect(() => {
    movies.forEach((movie) => {
      getDominantColor(movie.image, movie.id);
    });
  }, []);

  const settings = {
    centerMode: true,
    centerPadding: "250px",
    infinite: true,
    slidesToShow: 1,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 768, // Mobile view
        settings: {
          slidesToShow: 1,
          centerMode: false,
        },
      },
    ],
  };

  return (
    <div className="p-0 overflow-visible">
      <Slider {...settings}>
        {movies.map((movie) => (
          <div className="mb-8 overflow-visible" key={movie.id}>
            <div
              className="slider-item"
              style={{
                position: "relative",
                textAlign: "center",
                transformStyle: "preserve-3d",
                transition: "transform 0.5s ease-in-out",
                margin: "10px 30px",
                boxShadow: `0px 20px 40px ${boxShadowColors[movie.id] || "#000"}`,
                borderRadius: "15px",
                overflow: "hidden",
                
              }}
            >
              <img
                src={movie.image}
                alt={movie.title}
                style={{
                  width: "100%",
                  height: "400px",
                  objectFit: "cover",
                }}
              />
              <h3
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "#fff",
                  background: "rgba(0, 0, 0, 0.6)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
              >
                {movie.title}
              </h3>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default MainDisplay;
