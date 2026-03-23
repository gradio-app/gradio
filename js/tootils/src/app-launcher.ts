import { spawn, type ChildProcess } from "node:child_process";
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
	return new Promise((resolve, reject) => {
		const sock = net.createConnection(port, "127.0.0.1");
		sock.once("connect", () => {
			sock.end();
			resolve(false);
		});
		sock.once("error", (e: NodeJS.ErrnoException) => {
			sock.destroy();
			if (e.code === "ECONNREFUSED") {
				resolve(true);
			} else {
				reject(e);
			}
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

	// Run the demo file directly - the demo's own if __name__ == "__main__" block
	// has the correct launch parameters (show_error, etc.)
	const childProcess = spawn("python", [demoFilePath], {
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
