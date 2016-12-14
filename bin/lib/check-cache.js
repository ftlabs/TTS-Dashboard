const debug = require('debug')('bin:lib:check-cache');
// const md5 = require('md5');

const checkForBucketObject = require('./bucket-interface').check;
const getBucketObject = require('./bucket-interface').get;
const services = require('./list-services');
const generateHashFilename = require('./hash-values');

module.exports = function(req, res, next){

	const requestedService = req.path.replace( /\//g, '');
	const content = (req.body.uuid === '' || req.body.uuid === undefined) ? req.body.content : req.body.uuid;

	const fileName = generateHashFilename(requestedService, content, req.body.voice);

	res.locals.cacheFilename = fileName;

	debug('Hashed filename:', fileName);
	debug(req.path, requestedService, req.body.content);
	
	checkForBucketObject(fileName)
		.then(thereIsACachedVersion => {
			debug(`Is there a cached version of ${fileName}`, thereIsACachedVersion);
			if(thereIsACachedVersion){
				getBucketObject(fileName)
					.then(data => {
						debug(`Delivering TTS from cache`, data);
						res.set('Content-Type', `audio/${services[requestedService].audioFormat}`);
						res.set('Content-Length', data.ContentLength);
						res.send(data.Body);
					})
					.catch(err => {
						debug(err);
						next();
					})
				;
			} else {
				next();
			}

		})
		.catch(err => {
			debug(err);
			next();
		})
	;
	

};