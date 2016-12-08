const debug = require('debug')('services:polly');
const SERVICE_URL = process.env.AWS_POLLY_SERVICE_URL || 'https://ftlabs-polly-tts-service.herokuapp.com/convert';

const characterLimit = 1500;
const splittingRegex = require('../bin/lib/character-splitting-regex')(characterLimit);

const voiceMapping = {
	'Geraint (Welsh English)' : 'Geraint',
	'Gwyneth (Welsh)' : 'Gwyneth',
	'Hans (German)' : 'Hans',
	'Marlene (German)' : 'Marlene',
	'Nicole (Australian)' : 'Nicole',
	'Russell (Australian)' : 'Russell',
	'Amy (British)' : 'Amy',
	'Brian (British)' : 'Brian',
	'Emma (British)' : 'Emma',
	'Raveena (Indian English)' : 'Raveena',
	'Ivy (US)' : 'Ivy',
	'Joanna (US)' : 'Joanna',
	'Joey (US)' : 'Joey',
	'Justin (US)' : 'Justin',
	'Kendra (US)' : 'Kendra',
	'Kimberly (US)' : 'Kimberly',
	'Salli (US)' : 'Salli',
	'Celine (French)' : 'Celine',
	'Mathieu (French)' : 'Mathieu'
};

function handleRequestToService(req, res){

	const textToSynthesise = req.body.content;
	const voiceToUse = req.body.voice || 'Geraint';
	
	debug('TEXT:', textToSynthesise);

	const numberOfPasses = Math.ceil( textToSynthesise.length / characterLimit );
	const chunks = textToSynthesise.match(splittingRegex);

	const audioBuffers = chunks.map( textChunk => {
		
		return fetch(SERVICE_URL, {
				method : 'PUT',
				body : 	JSON.stringify({
					'Body': textChunk,
					'VoiceId': voiceMapping[voiceToUse],
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
		;

	});

	Promise.all(audioBuffers)
		.then(buffers => {

			const totalSize = buffers.reduce( (a, b) => {
				return a.length + b.length;
			}, 0);

			const newBuff = Buffer.alloc(totalSize);

			buffers.forEach( (buffer, idx) => {

			});

		})
	;

}

module.exports = {
	name : 'Amazon Polly',
	request : handleRequestToService,
	voices : [
		'Geraint (Welsh English)',
		'Gwyneth (Welsh)',
		'Hans (German)',
		'Marlene (German)',
		'Nicole (Australian)',
		'Russell (Australian)',
		'Amy (British)',
		'Brian (British)',
		'Emma (British)',
		'Raveena (Indian English)',
		'Ivy (US)',
		'Joanna (US)',
		'Joey (US)',
		'Justin (US)',
		'Kendra (US)',
		'Kimberly (US)',
		'Salli (US)',
		'Celine (French)',
		'Mathieu (French)'
	]
};
