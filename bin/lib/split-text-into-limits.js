module.exports = function(phrase, chunkSize = 90){

	const words = phrase.split(' ');

	const chunks = [];

	let currentChunk = '';

	words.forEach(word => {

		if(`${currentChunk} `.length + word.length < chunkSize){
			currentChunk = `${currentChunk} ${word}`;
		} else {
			chunks.push(currentChunk);
			currentChunk =` ${word}`;
		}

	});

	if(chunks.length === 0){
		chunks.push(currentChunk);
	}

	return chunks;

}