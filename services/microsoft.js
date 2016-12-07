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
	request : handleRequestToService,
	voices : [ ' Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)', 'Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)', ' Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)', ' Microsoft Server Speech Text to Speech Voice (de-DE, Stefan, Apollo)', ' Microsoft Server Speech Text to Speech Voice (en-AU, Catherine)', ' Microsoft Server Speech Text to Speech Voice (en-CA, Linda)', ' Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)', ' Microsoft Server Speech Text to Speech Voice (en-GB, George, Apollo)', ' Microsoft Server Speech Text to Speech Voice (en-IN, Ravi, Apollo)', ' Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)', ' Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)', ' Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)', ' Microsoft Server Speech Text to Speech Voice (es-MX, Raul, Apollo)', ' Microsoft Server Speech Text to Speech Voice (fr-CA, Caroline)', ' Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)', ' Microsoft Server Speech Text to Speech Voice (fr-FR, Paul, Apollo)', ' Microsoft Server Speech Text to Speech Voice (it-IT, Cosimo, Apollo)', ' Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)', ' Microsoft Server Speech Text to Speech Voice (ja-JP, Ichiro, Apollo)', ' Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)', ' Microsoft Server Speech Text to Speech Voice (ru-RU, Irina, Apollo)', ' Microsoft Server Speech Text to Speech Voice (ru-RU, Pavel, Apollo)', ' Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)', ' Microsoft Server Speech Text to Speech Voice (zh-CN, Yaoyao, Apollo)', ' Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)', ' Microsoft Server Speech Text to Speech Voice (zh-HK, Tracy, Apollo)', ' Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)', ' Microsoft Server Speech Text to Speech Voice (zh-TW, Yating, Apollo)', ' Microsoft Server Speech Text to Speech Voice (zh-TW, Zhiwei, Apollo)' ]
};