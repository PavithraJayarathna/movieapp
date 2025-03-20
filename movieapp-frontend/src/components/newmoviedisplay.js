import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectCoverflow, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ColorThief from "colorthief";

import backImage from "../assets/back.jpg";


import child from "../assets/topchild.png";
import p1 from "../assets/w1.jpg";
import p2 from "../assets/w2.jpg";
import p3 from "../assets/w3.jpg";
import p4 from "../assets/w4.jpg";
import p5 from "../assets/w5.jpg";
import p6 from "../assets/w6.jpg";
import p7 from "../assets/w7.jpg";
import p8 from "../assets/w8.jpg";

const MovieDisplay = () => {
  const [imageColorDetails, setImageColorDetails] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const imgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleColorChange = (newValue) => {
    rgbToHsl(newValue);
  };

  const rgbToHsl = ([r, g, b]) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const hsl = [0, 0, (max + min) / 2];

    if (max !== min) {
      const d = max - min;
      hsl[1] = hsl[2] > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) {
        hsl[0] = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        hsl[0] = (b - r) / d + 2;
      } else {
        hsl[0] = (r - g) / d + 4;
      }
      hsl[0] /= 6;
    }
    setImageColorDetails(hsl);
  };

  const getImage = (swiper) => {
    const activeSlide = swiper.slides[swiper.activeIndex];
    const activeImg = activeSlide?.querySelector("img");
    if (activeImg) {
      getDominantColor(activeImg.src);
    }
  };

  const getDominantColor = (imageUrl) => {
    const colorThief = new ColorThief();
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const color = colorThief.getColor(img);
      handleColorChange(color);
    };
  };

  

    const handleMovieClick = (imdbID) => {
    navigate(`/movie/${imdbID}`);
    };


    const slides = [
        { image: p1, imdbID: "tt2527338" },
        { image: p2, imdbID: "tt0451279" },
        { image: p3, imdbID: "tt4154796" },
        { image: p4, imdbID: "tt3741700" },
        { image: p5, imdbID: "tt2527336" },
        { image: p6, imdbID: "tt13443470" },
        { image: p7, imdbID: "tt1211837" },
        { image: p8, imdbID: "tt9140560" },
      ];
      

  return (
    <>
    <div className="relative z-0 flex items-center justify-center w-full h-screen overflow-hidden text-white bg-center bg-cover" style={{ 
        backgroundImage: `url(${backImage})`,
        top: `calc(${scrollOffset * -0.1}px)`,}}>
        <div className="flex items-center justify-center w-full h-auto overflow-hidden mt-">
          <Swiper
            modules={[Pagination, EffectCoverflow, Autoplay]}
            className="mt-64 w-full max-w-[1200px] h-[600px] sm:h-[350px] md:h-[450px] xl:h-[900px]"
            style={{ overflow: "visible" }}
            onSlideChange={getImage}
            ref={imgRef}
            loop={true}
            autoplay={{ delay: 3000 }}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            initialSlide={1}
            slidesPerView={2}
            breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 3 } }}
            pagination={false}
            speed={2000}
            preventClicks={true}
            coverflowEffect={{ rotate: -11, stretch: -100, depth: 250, modifier: 1, slideShadows: false }}
          >
            {slides.map((movie, index) => (
            <SwiperSlide key={index} className="cursor-default">
                <img onClick={() => handleMovieClick(movie.imdbID)}
                src={movie.image}
                alt={`Slide ${index + 1}`}
                className="cursor-pointer w-[100%] max-h-[500px] sm:max-h-[300px] md:max-h-[400px] xl:max-h-[500px] object-cover rounded-3xl transition-all duration-300"
                style={{
                    boxShadow:
                    "12px 12px 40px rgba(0, 0, 0, 0.3), -12px -12px 40px rgba(0, 0, 0, 0.15)",
                    transform: "scale(1.1)",
                }}
                />
            </SwiperSlide>
)           )}


          </Swiper>
        </div>
      </div>

      <div className="absolute z-40 flex items-center justify-center w-full h-screen text-white bg-center bg-cover pointer-events-none" style={{
        backgroundImage: `url(${child})`,
        filter: `hue-rotate(${imageColorDetails[0] * 360}deg) saturate(${imageColorDetails[1] * 100}%) brightness(${imageColorDetails[2] * 100 + 200}%)`,
        transition: "filter 2s ease-out",
        top: `calc(${scrollOffset * 0}px)`,
      }}></div>
    </>
  );
};


export default MovieDisplay;
