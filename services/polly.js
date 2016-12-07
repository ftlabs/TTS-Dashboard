const debug = require('debug')('services:polly');
const SERVICE_URL = process.env.AWS_POLLY_SERVICE_URL || 'https://ftlabs-polly-tts-service.herokuapp.com/convert';

function handleRequestToService(req, res){

	const textToSynthesise = req.body.content;
	const voiceToUse = req.body.voice || 'Geraint';
	
	debug('TEXT:', textToSynthesise);

	return fetch(SERVICE_URL, {
			method : 'PUT',
			body : 	JSON.stringify({
				'Body': textToSynthesise,
				'VoiceId': voiceToUse,
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
	request : handleRequestToService,
	voices : ['Geraint', 'Gwyneth', 'Mads', 'Naja', 'Hans', 'Marlene', 'Nicole', 'Russell', 'Amy', 'Brian', 'Emma', 'Raveena', 'Ivy', 'Joanna', 'Joey', 'Justin', 'Kendra', 'Kimberly', 'Salli', 'Conchita', 'Enrique', 'Miguel', 'Penelope', 'Chantal', 'Celine', 'Mathieu', 'Dora', 'Karl', 'Carla', 'Giorgio', 'Mizuki', 'Liv', 'Lotte', 'Ruben', 'Ewa', 'Jacek', 'Jan', 'Maja', 'Ricardo', 'Vitoria', 'Cristiano', 'Ines', 'Carmen', 'Maxim', 'Tatyana', 'Astrid', 'Filiz']
};
