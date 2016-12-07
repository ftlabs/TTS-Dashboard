const debug = require('debug')('services:polly');
const SERVICE_URL = process.env.AWS_POLLY_SERVICE_URL || 'https://ftlabs-polly-tts-service.herokuapp.com/convert';

function handleRequestToService(req, res){

	const textToSynthesise = req.body.content;
	debug('TEXT:', textToSynthesise);

	return fetch(SERVICE_URL, {
			method : 'PUT',
			body : 	JSON.stringify({
				'Body': textToSynthesise,
				'VoiceId': 'Geraint',
				'Token': process.env.AWS_POLLY_SERVICE_TOKEN
			})
		})
		.then(res => {
			if(res.status !== 200){
				throw res;
			} else {
				return res;
			}
		})
		.then(res => res.buffer())
		.then(audio => {
			debug(audio);
			res.set('Content-Type', 'audio/mp3');
			res.set('Content-Length', audio.length);
			res.send(audio);
		})
	;

}

module.exports = {
	name : 'Amazon Polly',
	request : handleRequestToService
};
