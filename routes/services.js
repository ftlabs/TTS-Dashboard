const fs = require('fs');
const express = require('express');
const router = express.Router();

const services = {};

fs.readdirSync(`${__dirname}/../services`).forEach(service => {
  services[service.replace('.js', '')] = require(`../services/${service}`);
});

router.post(`^/${Object.keys(services).join('|/')}/`, function(req, res, next) {

  const requestedService = req.path.split('/').pop();

  if(services[requestedService]){
    services[requestedService](req, res)
  }

});

module.exports = router;
