const debug = require('debug')('tts-dash:bucket-interface');
const AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION || 'us-west-2'});

const S3 = new AWS.S3();

function checkObjectIsInS3(filename, bucket = process.env.AWS_CACHE_BUCKET){

	return new Promise( (resolve, reject) => {

		S3.headObject({
			Bucket : bucket,
			Key : filename
		}, (err) => {

			if(err && err.code === 'NotFound'){
				resolve(false);
			} else if(err){
				reject(err);
			} else {
				resolve(true);
			}

		});

	} );


}

function getObjectFromS3(filename, bucket = process.env.AWS_CACHE_BUCKET){
	
	return new Promise( (resolve, reject) => {

		S3.getObject({
			Bucket : bucket,
			Key : filename		
		}, (err, data) => {

			if(err){
				reject(err);
			} else {
				resolve(data);
			}

		});

	} );


}

function putObjectInS3Bucket(filename, data, bucket = process.env.AWS_CACHE_BUCKET){
	
	return new Promise( (resolve, reject) => {

		S3.putObject({
			Bucket : bucket,
			Key : filename,
			Body : data,
		}, err => {

			if(err){
				reject(err);
			} else{
				resolve();
			}

		});

	} );
}

module.exports = {
	check : checkObjectIsInS3,
	get : getObjectFromS3,
	put : putObjectInS3Bucket
}