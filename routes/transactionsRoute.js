const { readToken } = require('../config/encrip');
const { transactionsController } = require('../controllers');

const router = require('express').Router();

router.get('/carts', readToken, transactionsController.getCarts);
router.post('/carts', readToken, transactionsController.addToCart);
router.delete('/carts/:id', readToken, transactionsController.deleteCart);
router.patch('/carts/:id', readToken, transactionsController.updateCart);

module.exports = router