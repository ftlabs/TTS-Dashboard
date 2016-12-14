const md5 = require('md5');
const services = require('./list-services');

module.exports = function(service, content, voice = ''){

	if(!service || !content){
		throw `Required parameters missing. service is ${service}, content is ${content}`;
	} else if(services[service] === undefined){
		throw `Invalid service passed "${service}"`;
	}

	let hashedValue = md5(content + voice);

	return `${hashedValue}-${service}.${services[service].audioFormat}`;

}