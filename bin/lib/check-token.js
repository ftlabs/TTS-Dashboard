module.exports = function(req, res, next){

	if(!req.query.token || (req.query.token !== process.env.SERVICE_TOKEN) ){
		res.status(401);
		res.json({
			status : 'err',
			message : 'Token passed was invalid'
		});
	} else {
		next();
	}

};