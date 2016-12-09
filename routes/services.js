const debug = require('debug')('routes:services');
const express = require('express');
const router = express.Router();

const services = require('../bin/lib/list-services');
const uuidOrText = require('../bin/lib/uuid-or-text');

router.use(uuidOrText);

router.post(`^/${Object.keys(services).join('|/')}/`, function(req, res, next) {

  const requestedService = req.path.split('/').pop();

  if(services[requestedService]){
    services[requestedService].request(req, res)
      .catch(err => {
        debug(err);
        res.status = err.status || 500;
        res.send(err.message);
      })
    ;
  }

});

module.exports = router;
