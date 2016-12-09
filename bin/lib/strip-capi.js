const fetch = require('node-fetch');
const serviceURL = process.env.STRIP_CAPI_SERVICE;

module.exports = function(articleUUID){

	return fetch(`${serviceURL}/strip`,{
			method : 'PUT',
			body : JSON.stringify({
				token : process.env.STRIP_CAPI_SERVICE_TOKEN,
				uuid : articleUUID
			})		
		})
		.then(res => {
			if(res.status !== 200){
				throw res; 
			} else {
				return res;
			}
		})
		.then(res => res.text())
	;

}