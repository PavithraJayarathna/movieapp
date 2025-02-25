const express = require('express');
const router = express.Router();
const signup = require('../Controllers/signController');
const login = require('../Controllers/loginController');


router.post('/signup', signup);
router.post('/login', login);

module.exports = router;