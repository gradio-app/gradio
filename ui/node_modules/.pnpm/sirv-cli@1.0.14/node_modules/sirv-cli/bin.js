#!/usr/bin/env node
const sade = require('sade');
const boot = require('./index');
const pkg = require('./package');

sade('sirv [dir]')
	.version(pkg.version)
	.describe('Run a static file server')
		.example('build --cors --port 8080')
		.example('public --quiet --etag --maxage 31536000 --immutable')
		.example('public --http2 --key priv.pem --cert cert.pem')
		.example('public -qeim 31536000')
		.example('--port 8080 --etag')
		.example('--host --dev')
	.option('-D, --dev', 'Enable "dev" mode')
	.option('-e, --etag', 'Enable "ETag" header')
	.option('-d, --dotfiles', 'Enable dotfile asset requests')
	.option('-c, --cors', 'Enable "CORS" headers to allow any origin requestor')
	.option('-G, --gzip', 'Send precompiled "*.gz" files when "gzip" is supported', true)
	.option('-B, --brotli', 'Send precompiled "*.br" files when "brotli" is supported', true)
	.option('-m, --maxage', 'Enable "Cache-Control" header & define its "max-age" value (sec)')
	.option('-i, --immutable', 'Enable the "immutable" directive for "Cache-Control" header')
	.option('-k, --http2', 'Enable the HTTP/2 protocol. Requires Node.js 8.4.0+')
	.option('-C, --cert', 'Path to certificate file for HTTP/2 server')
	.option('-K, --key', 'Path to certificate key for HTTP/2 server')
	.option('-P, --pass', 'Passphrase to decrypt a certificate key')
	.option('-s, --single', 'Serve as single-page application with "index.html" fallback')
	.option('-I, --ignores', 'Any URL pattern(s) to ignore "index.html" assumptions')
	.option('-q, --quiet', 'Disable logging to terminal')
	.option('-H, --host', 'Hostname to bind', 'localhost')
	.option('-p, --port', 'Port to bind', 5000)
	.action(boot)
	.parse(process.argv, {
		default: {
			dev: false,
			etag: false,
			quiet: false,
			dotfiles: false,
			immutable: false,
			http2: false,
			cors: false,
			logs: true,
		}
	});
