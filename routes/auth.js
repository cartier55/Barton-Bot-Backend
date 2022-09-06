const express = require('express');
const router = express.Router();
const multer  = require('multer');
const authController = require('../controlers/authController');
const upload = multer()


router.post('/signUp', upload.none(), authController.signUp);

router.post('/logIn', upload.none(), authController.logIn)

router.post('/logOut', upload.none(), authController.logOut)

router.post('/changePwd', upload.none(), authController.changePwd)

router.get('/refresh', upload.none(), authController.refreshToken)



module.exports = router;