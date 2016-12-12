const debug = require('debug')('bin:lib:uuid-or-text');
const stripCAPIService = require('./strip-capi');

module.exports = function(req, res, next){

	debug(req.body);

	if(req.body.uuid !== undefined && req.body.uuid !== ''){
		stripCAPIService(req.body.uuid)
			.then(content => {
				req.body.content = content;
				debug(req.body.content);
				next();
			})
			.catch(err => {
				debug(err);
			})
		;
	} else {
		next();
	}

};