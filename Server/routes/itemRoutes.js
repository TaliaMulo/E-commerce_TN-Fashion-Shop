const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../authMiddleware');

router.get('/category/:category', itemController.getItemsByCategory);
router.get('/:id', itemController.getItemById);
router.post('/add-to-cart', authMiddleware, itemController.addToCart);
router.post('/add', authMiddleware, itemController.addItem);
router.put('/:id', authMiddleware, itemController.updateItem);
router.delete('/:id', authMiddleware, itemController.deleteItem);
router.get('/search/:searchTerm', itemController.searchItems);
router.get('/random/:count', itemController.getRandomItems);

module.exports = router;