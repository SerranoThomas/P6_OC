const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const password = require('../middleware/password');
const emailValidator = require('../middleware/emailValidator');
const connexion = require('../middleware/connexion');


router.post('/signup', emailValidator, password, userCtrl.signup);
router.post('/login', connexion, userCtrl.login);

module.exports = router;