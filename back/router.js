/**
 * Created by roten on 7/25/17.
 */
var express = require('express')
var router = express.Router()
router.post('/pointing', require('./controller/HotelNameClassifier').classifier)
router.post('/standardMyData', require('./controller/HotelNameClassifier').dataStandardise);

module.exports = router