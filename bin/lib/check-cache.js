const md5 = require('md5');

const checkForBucketObject = require('./bucket-interface.js').check;
const getBucketObject = require('./bucket-interface.js').get;

module.exports = function(req, res, next){

	next();

};