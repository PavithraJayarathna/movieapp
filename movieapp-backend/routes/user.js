import express from 'express';
import signup from '../Controllers/signController.js';
import login from '../Controllers/loginController.js';
import { getUserMovies, saveUserMovie, removeUserMovie, } from '../Controllers/movieController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.get("/:userID/movies", getUserMovies);
router.post("/:userID/movies", saveUserMovie);
router.delete("/:userID/movies/:movieID", removeUserMovie);

export default router; 
