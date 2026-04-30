import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import http from "http";
import net from "net";
import path from "path";
import fs from "fs";
import os from "os";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../../..");

export interface GradioApp {
	port: number;
	process: ChildProcess;
}

export function killGradioApp(process: ChildProcess): void {
	try {
		process.kill("SIGTERM");
	} catch {
		// Process may already be dead
	}
}

/**
 * Sweep orphaned gradio demo python processes — i.e. processes running
 * `python <demo>/run.py` whose parent has died (PPID == 1, reparented to
 * init/launchd). Without this, a Playwright worker that crashes (e.g.
 * after a test timeout) leaves its spawned demo apps behind: the new
 * worker has an empty appCache and won't kill them, ports get squatted,
 * and resources accumulate. Documented behavior, not a guess: in the SSR
 * profile run, this orphaning produced 100+ leaked python procs / 7.5GB.
 *
 * Best-effort: failures in the sweep are swallowed so they can't block
 * the spawn path itself.
 */
function reapOrphanedDemos(): void {
	try {
		const result = spawnSync("ps", ["-A", "-o", "pid=,ppid=,command="], {
			encoding: "utf8"
		});
		if (result.status !== 0 || !result.stdout) return;

		for (const line of result.stdout.split("\n")) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			const match = trimmed.match(/^(\d+)\s+(\d+)\s+(.*)$/);
			if (!match) continue;
			const [, pidStr, ppidStr, cmd] = match;
			if (ppidStr !== "1") continue;
			// Only target our test demo apps (python running gradio demo files).
			// Match `gradio/.../demo/<name>/<file>.py` to avoid accidentally
			// killing unrelated python processes.
			if (!/python.*\/demo\/[^/]+\/[^/]+\.py/.test(cmd)) continue;
			if (!cmd.includes("/gradio/")) continue;
			try {
				process.kill(Number(pidStr), "SIGTERM");
			} catch {
				// already dead, or not ours to kill
			}
		}
	} catch {
		// ps unavailable or parse error — non-fatal
	}
}

export async function findFreePort(
	startPort: number,
	endPort: number
): Promise<number> {
	for (let port = startPort; port < endPort; port++) {
		if (await isPortFree(port)) {
			return port;
		}
	}
	throw new Error(`Could not find free port in range ${startPort}-${endPort}`);
}

function isPortFree(port: number): Promise<boolean> {
	return new Promise((resolve) => {
		const sock = net.createConnection(port, "127.0.0.1");
		sock.once("connect", () => {
			sock.end();
			resolve(false);
		});
		sock.once("error", (e: NodeJS.ErrnoException) => {
			sock.destroy();
			// ECONNREFUSED → no listener (free). Anything else (ECONNRESET from
			// a half-closed socket left by a SIGTERM'd demo, ETIMEDOUT, etc.)
			// → don't trust the port, skip to the next one. Previously we
			// rejected on non-ECONNREFUSED errors, which aborted the whole
			// findFreePort scan and surfaced as "Failed to launch app".
			resolve(e.code === "ECONNREFUSED");
		});
	});
}

/**
 * Poll the server with HTTP GET requests until it returns a response.
 * Gradio prints "Running on local URL:" before the server is fully ready,
 * so we need to verify it actually responds to HTTP requests.
 */
async function waitForServerReady(
	port: number,
	timeoutMs: number = 15000
): Promise<void> {
	const start = Date.now();
	const pollInterval = 200;

	while (Date.now() - start < timeoutMs) {
		try {
			await new Promise<void>((resolve, reject) => {
				// Use HEAD on /gradio_api/info to avoid triggering SSR rendering on
				// the root URL, which could block Gradio's own startup health check.
				const req = http.request(
					`http://127.0.0.1:${port}/gradio_api/info`,
					{ method: "HEAD", timeout: 2000 },
					(res) => {
						res.resume(); // drain the response
						resolve();
					}
				);
				req.on("error", reject);
				req.on("timeout", () => {
					req.destroy();
					reject(new Error("request timeout"));
				});
				req.end();
			});
			return; // Server responded successfully
		} catch {
			// Server not ready yet, wait and retry
			await new Promise((r) => setTimeout(r, pollInterval));
		}
	}
	throw new Error(
		`Server on port ${port} did not become ready within ${timeoutMs}ms`
	);
}

export function getTestcases(demoName: string): string[] {
	const demoDir = path.join(ROOT_DIR, "demo", demoName);
	if (!fs.existsSync(demoDir)) {
		return [];
	}

	return fs
		.readdirSync(demoDir)
		.filter((f) => f.endsWith("_testcase.py"))
		.map((f) => path.basename(f, ".py"));
}

// Check if a testcase file exists for this demo
export function hasTestcase(demoName: string, testcaseName: string): boolean {
	const testcaseFile = path.join(
		ROOT_DIR,
		"demo",
		demoName,
		`${testcaseName}_testcase.py`
	);
	return fs.existsSync(testcaseFile);
}

// Get the path to a demo's Python file
function getDemoFilePath(demoName: string, testcaseName?: string): string {
	if (testcaseName) {
		return path.join(ROOT_DIR, "demo", demoName, `${testcaseName}_testcase.py`);
	}
	return path.join(ROOT_DIR, "demo", demoName, "run.py");
}

export async function launchGradioApp(
	demoName: string,
	workerIndex: number = 0,
	timeout: number = 60000,
	testcaseName?: string
): Promise<GradioApp> {
	// Sweep orphaned demo apps from previous (crashed) worker generations
	// before claiming a port — see reapOrphanedDemos() for rationale.
	reapOrphanedDemos();

	// Partition ports by worker index to avoid collisions
	const basePort = 7860 + workerIndex * 100;
	const port = await findFreePort(basePort, basePort + 99);

	// Get the path to the demo file
	const demoFilePath = getDemoFilePath(demoName, testcaseName);

	// Create unique directories for this instance to avoid cache conflicts
	const instanceId = testcaseName
		? `${demoName}_${testcaseName}_${port}`
		: `${demoName}_${port}`;
	const instanceDir = path.join(os.tmpdir(), `gradio_test_${instanceId}`);
	const cacheDir = path.join(instanceDir, "cached_examples");
	const tempDir = path.join(instanceDir, "temp");

	if (!fs.existsSync(instanceDir)) {
		fs.mkdirSync(instanceDir, { recursive: true });
	}

	// Run the demo via _demo_runner.py instead of directly. The wrapper
	// watches its stdin pipe: if the playwright worker that spawned us
	// dies (cleanly or via SIGKILL on timeout), the kernel closes the pipe,
	// stdin returns EOF and the demo self-exits immediately — instead of
	// becoming an orphan that survives the rest of the suite.
	const demoRunnerPath = path.join(__dirname, "_demo_runner.py");
	const childProcess = spawn("python", [demoRunnerPath, demoFilePath], {
		stdio: "pipe",
		cwd: ROOT_DIR,
		env: {
			...process.env,
			PYTHONUNBUFFERED: "true",
			GRADIO_ANALYTICS_ENABLED: "False",
			GRADIO_IS_E2E_TEST: "1",
			GRADIO_RESET_EXAMPLES_CACHE: "True",
			// Control the port via environment variable
			GRADIO_SERVER_PORT: port.toString(),
			// Use unique directories per instance to avoid conflicts
			GRADIO_EXAMPLES_CACHE: cacheDir,
			GRADIO_TEMP_DIR: tempDir
		}
	});

	childProcess.stdout?.setEncoding("utf8");
	childProcess.stderr?.setEncoding("utf8");

	// Wait for app to be ready
	return new Promise<GradioApp>((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			killGradioApp(childProcess);
			reject(
				new Error(`Gradio app ${demoName} failed to start within ${timeout}ms`)
			);
		}, timeout);

		let output = "";
		let startupDetected = false;

		function handleOutput(data: string): void {
			output += data;
			// Check for Gradio's startup message
			if (
				!startupDetected &&
				(data.includes("Running on local URL:") ||
					data.includes(`Uvicorn running on`))
			) {
				startupDetected = true;
				clearTimeout(timeoutId);
				// The startup message is printed before the server is fully ready.
				// Poll with HTTP requests to ensure it actually responds.
				waitForServerReady(port)
					.then(() => resolve({ port, process: childProcess }))
					.catch(reject);
			}
		}

		childProcess.stdout?.on("data", handleOutput);
		childProcess.stderr?.on("data", handleOutput);

		childProcess.on("error", (err) => {
			clearTimeout(timeoutId);
			reject(err);
		});

		childProcess.on("exit", (code) => {
			if (code !== 0 && code !== null) {
				clearTimeout(timeoutId);
				reject(
					new Error(
						`Gradio app ${demoName} exited with code ${code}.\nOutput: ${output}`
					)
				);
			}
		});
	});
}
