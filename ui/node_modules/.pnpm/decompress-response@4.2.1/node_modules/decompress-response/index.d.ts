/// <reference types="node"/>
import {IncomingMessage} from 'http';

declare const decompressResponse: {
	/**
	Decompress a HTTP response if needed.

	@param response - The HTTP incoming stream with compressed data.
	@returns The decompressed HTTP response stream.

	@example
	```
	import {http} from 'http';
	import decompressResponse = require('decompress-response');

	http.get('https://sindresorhus.com', response => {
		response = decompressResponse(response);
	});
	```
	*/
	(response: IncomingMessage): IncomingMessage;

	// TODO: remove this in the next major version, refactor the whole definition to:
	// declare function decompressResponse(response: IncomingMessage): IncomingMessage;
	// export = decompressResponse;
	default: typeof decompressResponse;
};

export = decompressResponse;
