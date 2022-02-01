import { format } from 'url';
import { networkInterfaces } from 'os';

const port = process.env.PORT || 8080;
const isLAN = x => x.family === 'IPv4' && !x.internal;

export default function (opts) {
	opts = Object.assign({ hostname: 'localhost', port, https:false }, opts);
	opts.protocol = opts.https ? 'https' : 'http';

	let k, tmp;
	let local = format(opts);
	let nets = networkInterfaces();
	for (k in nets) {
		if (tmp = nets[k].find(isLAN)) {
			opts.hostname = tmp.address; // network IP
			break;
		}
	}

	return { local, network: format(opts) };
}
