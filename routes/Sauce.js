const express = require('express')
const router = express.Router()
const sauceCtrl = require('../controllers/Sauce')
const multer = require('../middleware/multer_config')
const auth = require('../middleware/auth')

router.get('/', auth, sauceCtrl.getSauce)
router.get('/:id', auth, sauceCtrl.getOneSauce)
router.post('/', auth, multer, sauceCtrl.createSauce)
router.put('/:id', auth, multer, sauceCtrl.updateSauce)
router.delete('/:id', auth, sauceCtrl.deleteDauce)
router.post('/:id/like', auth, sauceCtrl.likeDisLike)

module.exports = router