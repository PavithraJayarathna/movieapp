import express from 'express';
import signup from '../Controllers/signController.js';
import login from '../Controllers/loginController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

export default router;  // Use ES module export
