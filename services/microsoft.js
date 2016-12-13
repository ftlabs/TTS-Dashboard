const debug = require('debug')('services:microsoft');
const fs = require('fs');
const fetch = require('node-fetch');
const escape = require('escape-quotes');
const unidecode = require('unidecode');

const AUTH_URL = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken';
const SERVICE_URL = 'https://speech.platform.bing.com/synthesize';

const characterLimit = 800;

const voiceMappings = {
	'Zira (en-US)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)',
		'language' : 'en-US',
		'gender' : 'female'
	},
	'Hoda (ar-EG)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)',
		'language' : 'ar-EG',
		'gender' : 'female'
	},
	'Hedda (de-DE)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)',
		'language' : 'de-DE',
		'gender' : 'fmale'
	},
	'Stefan (de-DE)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (de-DE, Stefan, Apollo)',
		'language' : 'de-DE',
		'gender' : 'male'
	},
	'Catherine (en-AU)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (en-AU, Catherine)',
		'language' : 'en-AU',
		'gender' : 'female'
	},
	'Linda (en-CA)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (en-CA, Linda)',
		'language' : 'en-CA',
		'gender' : 'female'
	},
	'Susan (en-GB)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)',
		'language' : 'en-GB',
		'gender' : 'female'
	},
	'George (en-GB)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (en-GB, George, Apollo)',
		'language' : 'en-GB',
		'gender' : 'male'
	},
	'Ravi (en-IN)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (en-IN, Ravi, Apollo)',
		'language' : 'en-IN',
		'gender' : 'male'
	},
	'Benjamin (en-US)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)',
		'language' : 'en-US',
		'gender' : 'male'
	},
	'Laura (es-ES)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)',
		'language' : 'es-ES',
		'gender' : 'female'
	},
	'Pablo (es-ES)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)',
		'language' : 'es-ES',
		'gender' : 'male'
	},
	'Raul (es-MX)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (es-MX, Raul, Apollo)',
		'language' : 'es-MX',
		'gender' : 'male'
	},
	'Caroline (fr-CA)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (fr-CA, Caroline)',
		'language' : 'fr-CA',
		'gender' : 'female'
	},
	'Julie (fr-FR)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)',
		'language' : 'fr-FR',
		'gender' : 'female'
	},
	'Paul (fr-FR)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (fr-FR, Paul, Apollo)',
		'language' : 'fr-FR',
		'gender' : 'male'
	},
	'Cosimo (it-IT)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (it-IT, Cosimo, Apollo)',
		'language' : 'it-IT',
		'gender' : 'male'
	},
	'Ayumi (ja-JP)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)',
		'language' : 'ja-JP',
		'gender' : 'female'
	},
	'Ichiro (ja-JP)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ichiro, Apollo)',
		'language' : 'ja-JP',
		'gender' : 'male'
	},
	'Daniel (pt-BR)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)',
		'language' : 'pr-BR',
		'gender' : 'male'
	},
	'Irina (ru-RU)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (ru-RU, Irina, Apollo)',
		'language' : 'ru-RU',
		'gender' : 'female'
	},
	'Pavel (re-RU)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (ru-RU, Pavel, Apollo)',
		'language' : 're-RU',
		'gender' : 'male'
	},
	'Huihui (zh-CN)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)',
		'language' : 'zh-CN',
		'gender' : 'female'
	},
	'Yaoyao (zh-CN)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (zh-CN, Yaoyao, Apollo)',
		'language' : 'zh-CN',
		'gender' : 'female'
	},
	'Kangkang (zh-CN)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)',
		'language' : 'zh-CN',
		'gender' : 'male'
	},
	'Tracey (zh-HK)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (zh-HK, Tracy, Apollo)',
		'language' : 'zh-HK',
		'gender' : 'female'
	},
	'Danny (zh-HK)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)',
		'language' : 'zh-HK',
		'gender' : 'male'
	},
	'Yating (zh-TW)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (zh-TW, Yating, Apollo)',
		'language' : 'zh-TW',
		'gender' : 'female'
	},
	'Zhiwei (zh-TW)' :  { 
		'name' : 'Microsoft Server Speech Text to Speech Voice (zh-TW, Zhiwei, Apollo)',
		'language' : 'zh-TW',
		'gender' : 'male'
	}
};

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

function generateSSML(text, voice){
	
	const ssml = `<speak version='1.0' xml:lang='${voiceMappings[voice].language}'><voice xml:lang='${voiceMappings[voice].language}' xml:gender='${voiceMappings[voice].gender}' name='${voiceMappings[voice].name}'>${unidecode( text ) }</voice></speak>`;
	debug(ssml);
	return ssml;

}

function handleRequestToService(req, res){

	const textToSynthesise = req.body.content.substr(0, characterLimit);
	const voiceToUse = req.body.voice || 'Zira (en-US)';
	
	return getJWTToken()
		.then(JWTToken => {
			debug('JWTToken:', JWTToken);

			const bodyValues = generateSSML(textToSynthesise, voiceToUse);
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
					res.status(err.status || 500);
					res.end();
				})
			;

		})
	;

}

module.exports = {
	name : 'Microsoft Cognitive Services',
	request : handleRequestToService,
	limit : characterLimit,
	voices : [ 
		'Zira (en-US)',
		'Hoda (ar-EG)',
		'Hedda (de-DE)',
		'Stefan (de-DE)',
		'Catherine (en-AU)',
		'Linda (en-CA)',
		'Susan (en-GB)',
		'George (en-GB)',
		'Ravi (en-IN)',
		'Benjamin (en-US)',
		'Laura (es-ES)',
		'Pablo (es-ES)',
		'Raul (es-MX)',
		'Caroline (fr-CA)',
		'Julie (fr-FR)',
		'Paul (fr-FR)',
		'Cosimo (it-IT)',
		'Ayumi (ja-JP)',
		'Ichiro (ja-JP)',
		'Daniel (pt-BR)',
		'Irina (ru-RU)',
		'Pavel (re-RU)',
		'Huihui (zh-CN)',
		'Yaoyao (zh-CN)',
		'Kangkang (zh-CN)',
		'Tracey (zh-HK)',
		'Danny (zh-HK)',
		'Yating (zh-TW)',
		'Zhiwei (zh-TW)'
	],
	audioFormat : 'wav'
};