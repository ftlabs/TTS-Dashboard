const debug = require('debug')('bin:lib:clean-up');
const fs = require('fs');

module.exports = function(filePath){
	debug('Deleting:', filePath);
	return new Promise( (resolve, reject) => {
		fs.unlink(filePath, err => {
			if(err){
				reject(err);
			} else {
				resolve(filePath);
			}
		})
	} );

}