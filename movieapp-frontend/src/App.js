import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import LoginPage from './pages/login';
import SearchResult from './pages/SearchResult';
import MovieDetails from './pages/MovieDetails';
import Navbar from "./components/navbar";
import MyMovies from './pages/MyMovies';

import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/search" element={<SearchResult/>} />
        <Route path="/movie/:id" element={<MovieDetails/>} />
        <Route path="/my-movies" element={<MyMovies/>} />
      </Routes>
    </Router>
  );
}

export default App;
