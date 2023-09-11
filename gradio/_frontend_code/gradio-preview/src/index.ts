import { create_server } from "./dev_server";

const args = process.argv.slice(2);
// get individual args as `--arg value` or `value`

function parse_args(args: string[]): Record<string, string | true> {
	const arg_map: Record<string, string | true> = {};
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg.startsWith("--")) {
			const name = arg.slice(2);
			const value = args[i + 1];
			arg_map[name] = value || true;
			i++;
		} else {
			arg_map[arg] = true;
		}
	}
	return arg_map;
}

const parsed_args = parse_args(args);

const options = {
	component_dir: "test",
	root_dir: "src",
	...parsed_args
};

function run(): void {
	const server = create_server(options);
}

export { create_server };

run();
