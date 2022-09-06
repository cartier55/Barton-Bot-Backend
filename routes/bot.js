const express = require('express');
const router = express.Router();
const multer  = require('multer');
const botController = require('../controlers/botController');
const upload = multer()


router.post('/create', upload.none(), botController.createJob);
router.get('/list', upload.none(), botController.listJobs);
router.put('/update', upload.none(), botController.updateJob);
router.delete('/destroy/:id', upload.none(), botController.destroyPendingJob);
router.delete('/destroy/completed/:id', upload.none(), botController.destroyCompletedJob);




module.exports = router;