const router = require('express').Router();
const { usersController } = require('../controllers')

router.get('/', usersController.getData);
router.post('/regis', usersController.register);
router.post('/login', usersController.login);

module.exports = router