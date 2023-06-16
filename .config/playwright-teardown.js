import { spawnSync } from "node:child_process";

export default async function global_teardown() {
	spawnSync(`killall`, [`python`], {
		shell: true
	});
}
