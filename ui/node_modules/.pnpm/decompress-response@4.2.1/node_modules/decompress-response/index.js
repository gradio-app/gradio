'use strict';
const {PassThrough: PassThroughStream} = require('stream');
const zlib = require('zlib');
const mimicResponse = require('mimic-response');

const decompressResponse = response => {
	const contentEncoding = (response.headers['content-encoding'] || '').toLowerCase();

	if (!['gzip', 'deflate', 'br'].includes(contentEncoding)) {
		return response;
	}

	const isBrotli = contentEncoding === 'br';
	if (isBrotli && typeof zlib.createBrotliDecompress !== 'function') {
		return response;
	}

	const decompress = isBrotli ? zlib.createBrotliDecompress() : zlib.createUnzip();
	const stream = new PassThroughStream();

	mimicResponse(response, stream);

	decompress.on('error', error => {
		// Ignore empty response
		if (error.code === 'Z_BUF_ERROR') {
			stream.end();
			return;
		}

		stream.emit('error', error);
	});

	response.pipe(decompress).pipe(stream);

	return stream;
};

module.exports = decompressResponse;
// TODO: remove this in the next major version
module.exports.default = decompressResponse;
