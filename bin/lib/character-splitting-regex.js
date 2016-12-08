module.exports = function(limit){

	return new RegExp(`.{1,${limit}}`, 'g');

}