const fs = require('fs');
const fetch = require('node-fetch');

const SYNTHESIS_URL = `https://${process.env.BLUEMIX_USERNAME}:${process.env.BLUEMIX_PASSWORD}@stream.watsonplatform.net/text-to-speech/api/v1/synthesize`;

module.exports = function(req, res, next){

	const textToSynthesise = req.body.content;
	console.log('TEXT:', textToSynthesise);

	fetch(SYNTHESIS_URL, {
			method : 'POST',
			headers : { 
				'Content-Type' : 'application/json',
				'Accept' : 'audio/wav'				
			},
			body : JSON.stringify({text : textToSynthesise}),
		})
		.then(res => res.buffer())
		.then(audio => {

			res.set('Content-Type', 'audio/wav');
			res.set('Content-Length', audio.length);
			res.send(audio);

		})
	;

}