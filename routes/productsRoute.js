const router = require('express').Router()
const { readToken } = require('../config/encrip');
const { productsController } = require('../controllers');

router.get('/brand', productsController.getBrands)
router.get('/category', productsController.getCategory)

router.get('/', productsController.getProducts)

// hanya admin yang bisa menggunakan API dibawah ini
router.post('/', readToken, productsController.addProduct)
router.delete('/:id', readToken, productsController.deleteProduct)
router.patch('/:id', readToken, productsController.updateProduct)

module.exports = router;