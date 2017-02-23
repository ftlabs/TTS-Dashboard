const debug = require('debug')('services:polly');
const fs = require('fs');
const shortId = require('shortid').generate;

const SERVICE_URL = process.env.AWS_POLLY_SERVICE_URL || 'https://ftlabs-polly-tts-service.herokuapp.com/convert';
const tmpFolder = process.env.TMP_DIR || '/tmp';

const cacheBucket = require('../bin/lib/bucket-interface');
const splitText = require('../bin/lib/split-text-into-limits');
const runFFMPEG = require('../bin/lib/run-ffmpeg'); 

const characterLimit = 1500;
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

	const textToSynthesise = splitText(req.body.content, characterLimit);
	const voiceToUse = req.body.voice || 'Geraint';

	const requests = textToSynthesise.map( t => {

		return fetch(SERVICE_URL, {
				method : 'PUT',
				body : 	JSON.stringify({
					'Body': t,
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
			.then(data => {
				
				return new Promise( (resolve, reject) => {

					const destination = `${tmpFolder}/${shortId()}.mp3`

					fs.writeFile(destination, data, err => {
						if(err){
							reject(err);
						} else {
							resolve(destination);
						}
					})

				});

			})
		;

	} );

	return Promise.all(requests)
		.then( files => {

			const fileList = files.map(f => {return `file '${f}'`}).join('\n');
			const fileListDestination = `${tmpFolder}/${res.locals.cacheFilename}.txt`;
			const concatenatedDestination = `${tmpFolder}/${res.locals.cacheFilename}`;

			return new Promise( (resolve, reject) => {
				fs.writeFile(fileListDestination, fileList, err => {
					if(err){
						reject(err);
					} else {
						resolve(fileListDestination);
					}
				})
			})
			.then(function(){

				const args = [
					'-f',
					`concat`,
					'-safe',
					'0',
					'-i',
					fileListDestination,
					'-c',
					'copy',
					`${concatenatedDestination}`
				];

				return runFFMPEG(args)
					.then(function(){
						return new Promise( (resolve, reject) => {

							fs.readFile(concatenatedDestination, (err, data) => {
								if(err){
									reject(err);
								} else {
									resolve(data);
								}
							});

						} );
					})
				;

			});

		})
		.then(audio => {
			
			debug(audio);
			res.set('Content-Type', 'audio/mp3');
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
	name : 'Amazon Polly',
	request : handleRequestToService,
	limit : characterLimit,
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
	],
	audioFormat : 'mp3'
};
