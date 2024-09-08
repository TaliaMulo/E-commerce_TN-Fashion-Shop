const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/favorites', authMiddleware, userController.addToFavorites);
router.delete('/favorites/:itemId', authMiddleware, userController.removeFromFavorites);
router.get('/favorites', authMiddleware, userController.getFavorites);
router.get('/details', authMiddleware, userController.getUserDetails);

module.exports = router;