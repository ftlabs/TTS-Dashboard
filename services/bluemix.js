const debug = require('debug')('services:bluemix');
const fs = require('fs');
const fetch = require('node-fetch');

const SYNTHESIS_URL = `https://${process.env.BLUEMIX_USERNAME}:${process.env.BLUEMIX_PASSWORD}@stream.watsonplatform.net/text-to-speech/api/v1/synthesize`;
debug(SYNTHESIS_URL);

function makeRequestToService(req, res, next){
	
	const textToSynthesise = req.body.content;
	const voiceToUse = req.body.voice || 'en-US_MichaelVoice';

	debug('TEXT:', textToSynthesise);
	debug('VOICE:', voiceToUse);

	return fetch(`${SYNTHESIS_URL}?voice=${voiceToUse}`, {
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

module.exports = {
	name : 'IBM Watson: Bluemix',
	request : makeRequestToService,
	voices : [ 'en-US_MichaelVoice', 'de-DE_BirgitVoice', 'de-DE_DieterVoice', 'en-GB_KateVoice', 'en-US_AllisonVoice', 'en-US_LisaVoice', 'es-ES_EnriqueVoice', 'es-ES_LauraVoice', 'es-LA_SofiaVoice', 'es-US_SofiaVoice', 'fr-FR_ReneeVoice', 'it-IT_FrancescaVoice', 'ja-JP_EmiVoice', 'pt-BR_IsabelaVoice']
};

