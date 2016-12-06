const express = require('express');
const router = express.Router();

const services = require('../bin/lib/list-services');

router.post(`^/${Object.keys(services).join('|/')}/`, function(req, res, next) {

  const requestedService = req.path.split('/').pop();

  if(services[requestedService]){
    services[requestedService].request(req, res);
  }

});

module.exports = router;
