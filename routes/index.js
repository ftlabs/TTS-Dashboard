var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: process.env.SERVICE_NAME || 'FT Labs TTS Dashboard',
    serviceName: process.env.SERVICE_NAME || 'FT Labs TTS Dashboard',
  });
});

module.exports = router;
