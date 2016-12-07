const debug = require('debug')('services:microsoft');
const fs = require('fs');
const fetch = require('node-fetch');

const AUTH_URL = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken';
const SERVICE_URL = 'https://speech.platform.bing.com/synthesize';

function getJWTToken(){
	return fetch(AUTH_URL, {
			method : 'POST',
			headers : {
				'Ocp-Apim-Subscription-Key' : process.env.MICROSOFT_API_KEY
			}
		})
		.then(res => res.text())
		.catch(err => {
			console.log(err)
		})
	;
}

function generateSSML(text){
	
	return `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)'>${text}</voice></speak>`;

}

function handleRequestToService(req, res){

	const textToSynthesise = req.body.content;
	debug('TEXT:', textToSynthesise);

	return getJWTToken()
		.then(JWTToken => {
			debug('JWTToken:', JWTToken);

			const bodyValues = generateSSML(textToSynthesise);
			const headerValues = {
				'Content-Type' : 'application/ssml+xml',
				'Content-Length' : bodyValues.length,
				'X-Microsoft-OutputFormat' : 'riff-16khz-16bit-mono-pcm',
				'Authorization' : `Bearer ${ JWTToken }`,
				'X-Search-AppId' : process.env.MICROSOFT_SEARCH_APP_ID,
				'X-Search-ClientID' : process.env.MICROSOFT_SEARCH_CLIENT_ID,
				'User-Agent' : 'ftlabs-tts-dash'
			};

			return fetch(SERVICE_URL, {
					method : 'POST',
					headers : headerValues,
					body : bodyValues
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
					res.set('Content-Type', 'audio/wav');
					res.set('Content-Length', audio.length);
					res.send(audio);
				})
				.catch(err => {
					debug(err);
				})
			;

		})
	;

}

module.exports = {
	name : 'Microsoft Cognitive Services',
	request : handleRequestToService
};