const express = require('express');
const mongoConnect = require('../utils/db/mongoConnect');
const router = express.Router();

/* GET home page. */
router.get('/test', async function(req, res, next) {
  res.send('test')
});

module.exports = router;
