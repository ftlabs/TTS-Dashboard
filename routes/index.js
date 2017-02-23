const express = require('express');
const router = express.Router();
const authS3O = require('s3o-middleware');

const services = require('../bin/lib/list-services');

/* GET home page. */
router.get('/', authS3O,function(req, res, next) {
  res.render('index', { 
    title: process.env.SERVICE_NAME || 'FT Labs TTS Dashboard',
    serviceName: process.env.SERVICE_NAME || 'FT Labs TTS Dashboard',
    availableServices : Object.keys(services).map(s => {
      return{
        shortname : s,
        name : services[s].name,
        voices : services[s].voices,
        limit : services[s].limit
      };
    }),
    token : process.env.SERVICE_TOKEN  
  });
});

module.exports = router;
