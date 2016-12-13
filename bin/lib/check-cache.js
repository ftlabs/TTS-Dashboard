const debug = require('debug')('bin:lib:check-cache');
const md5 = require('md5');

const checkForBucketObject = require('./bucket-interface').check;
const getBucketObject = require('./bucket-interface').get;
const services = require('./list-services');

module.exports = function(req, res, next){

	const requestedService = req.path.replace( /\//g, '');
	const selectedVoice = req.body.voice || '';
	let hashedValue = (req.body.uuid === '' || req.body.uuid === undefined) ? md5(req.body.content + selectedVoice) : md5(req.body.uuid + selectedVoice);

	const fileName = `${hashedValue}-${requestedService}.${services[requestedService].audioFormat}`;

	debug(hashedValue, fileName);
	debug(req.path, requestedService, req.body.content);
	
	checkForBucketObject(fileName)
		.then(thereIsACachedVersion => {
			debug(`Is there a cached version of ${fileName}`, thereIsACachedVersion);
			if(thereIsACachedVersion){
				next();
				getBucketObject(fileName)
					.then(audio => {
						res.set('Content-Type', `audio/${services[requestedService].audioFormat}`);
						res.set('Content-Length', audio.length);
						res.send(audio);
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