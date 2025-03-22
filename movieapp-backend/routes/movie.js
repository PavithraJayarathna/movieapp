import express from 'express';
import { searchMovieByName } from '../Controllers/movieController.js';

const router = express.Router();

// Define your routes
// router.get('/movie/:movieId', fetchAndSaveMovie);
// router.get('/movies', getMovies); 
// router.get('/movies/:id', getMovieById); 
router.get('/movies/search/:movieName', searchMovieByName);

export default router;  // Use export default instead of module.exports
