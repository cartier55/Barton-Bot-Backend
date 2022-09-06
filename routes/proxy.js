const express = require('express');
const router = express.Router();
const multer  = require('multer');
const proxyController = require('../controlers/proxyController');
const upload = multer()


router.post('/new', upload.none(), proxyController.proxy);

router.post('/get', upload.none(), proxyController.retrieve);

router.post('/clear', upload.none(), proxyController.clear);


module.exports = router;