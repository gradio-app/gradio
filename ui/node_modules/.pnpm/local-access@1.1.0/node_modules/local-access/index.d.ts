export interface Options {
	https?: boolean;
	hostname?: string;
	port?: string | number;
	pathname?: string;
}

export default function (options?: Options): {
	network: string;
	local: string;
}
