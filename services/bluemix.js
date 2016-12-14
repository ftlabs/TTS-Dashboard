const debug = require('debug')('services:bluemix');
const fs = require('fs');
const fetch = require('node-fetch');

const cacheBucket = require('../bin/lib/bucket-interface');

const SYNTHESIS_URL = `https://${process.env.BLUEMIX_USERNAME}:${process.env.BLUEMIX_PASSWORD}@stream.watsonplatform.net/text-to-speech/api/v1/synthesize`;
debug(SYNTHESIS_URL);

const characterLimit = 1200;

function makeRequestToService(req, res, next){
	
	const textToSynthesise = req.body.content.substr(0, characterLimit);
	const voiceToUse = req.body.voice || 'en-US_MichaelVoice';

	debug('TEXT:', textToSynthesise);
	debug('VOICE:', voiceToUse);

	return fetch(`${SYNTHESIS_URL}?voice=${voiceToUse}`, {
			method : 'POST',
			headers : { 
				'Content-Type' : 'application/json',
				'Accept' : 'audio/wav'
			},
			body : JSON.stringify({text : textToSynthesise }),
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
			res.set('Content-Type', 'audio/wav');
			res.set('Content-Length', audio.length);
			res.send(audio);

			cacheBucket.put(res.locals.cacheFilename, audio)
				.then(function(){
					debug(`${res.locals.cacheFilename} successfully stored.`);
				})
				.catch(err => {
					debug(`Failed to store ${res.locals.cacheFilename}`, err);
				})
			;

		})
		.catch(err => {
			debug(err);
			res.status(err.status || 500);
			res.end();
		})
	;

}

module.exports = {
	name : 'IBM Watson: Bluemix',
	request : makeRequestToService,
	limit : characterLimit,
	voices : [ 'en-US_MichaelVoice', 'de-DE_BirgitVoice', 'de-DE_DieterVoice', 'en-GB_KateVoice', 'en-US_AllisonVoice', 'en-US_LisaVoice', 'es-ES_EnriqueVoice', 'es-ES_LauraVoice', 'es-LA_SofiaVoice', 'es-US_SofiaVoice', 'fr-FR_ReneeVoice', 'it-IT_FrancescaVoice', 'ja-JP_EmiVoice', 'pt-BR_IsabelaVoice'],
	audioFormat : 'wav'
};

