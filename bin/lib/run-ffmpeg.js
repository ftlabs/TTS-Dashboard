const debug = require('debug')('bin:lib:run-ffmpeg');
const ffmpeg = require('ffmpeg-static');
const spawn = require('child_process').spawn;

module.exports = function(args){

	debug('\n\n', args.join(' '), '\n\n');

	return new Promise( ( resolve, reject) => {

		let output = '';
		const process = spawn(ffmpeg.path, args);

		process.stdout.on('data', (data) => {
			debug(`stdout: ${data}`);
		});

		process.stderr.on('data', (data) => {
			// debug(`stderr: ${data}`);
			output += data + '\n';			
		});

		process.on('close', (code) => {

			if(code === 1){
				debug(`FFMPEG exited with status code 1`);
				reject();
			} else if(code === 0){
				debug('FFMPEG closed and was happy');
				resolve(output);
			}

		});

	});


}