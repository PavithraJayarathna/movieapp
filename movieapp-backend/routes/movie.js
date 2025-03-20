const express = require('express');
const router = express.Router();
const { searchMovieByName } = require('../Controllers/movieController');


//router.get('/movie/:movieId', fetchAndSaveMovie);
//router.get('/movies', getMovies); 
//router.get('/movies/:id', getMovieById); 
router.get('/movies/search/:movieName', searchMovieByName);


module.exports = router;
