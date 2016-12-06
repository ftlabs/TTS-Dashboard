const debug = require('debug')('bin:lib:list-services');
const fs = require('fs');
const services = {};

fs.readdirSync(`${__dirname}/../../services`).forEach(service => {
  services[service.replace('.js', '')] = require(`../../services/${service}`);
});

module.exports = services;