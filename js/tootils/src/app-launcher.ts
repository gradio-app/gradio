import { spawn, type ChildProcess } from "node:child_process";
import net from "net";
import path from "path";
import fs from "fs";
import os from "os";
import { ROOT_DIR, type DemoConfig, getDemoConfig } from "./demo-config";

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

function generateLaunchScript(
	demoName: string,
	port: number,
	config?: DemoConfig,
	testcaseName?: string
): string {
	// Build launch parameters
	const maxFileSize = config?.max_file_size
		? `"${config.max_file_size}"`
		: "None";
	const cssPaths = config?.css_paths
		? `[${config.css_paths.map((p) => `"${p}"`).join(", ")}]`
		: "None";
	const head = config?.head ? `"${config.head}"` : "None";
	const theme = config?.theme || "None";

	// Determine which module to import
	const moduleName = testcaseName
		? `demo.${demoName}.${testcaseName}_testcase`
		: `demo.${demoName}.run`;

	// Need to import gradio if we're using theme parameter
	const needsGradioImport = theme !== "None";

	// Simple launch - each test gets its own app instance
	return `
import sys
import os
sys.path.insert(0, "${ROOT_DIR}")
os.chdir("${ROOT_DIR}")
${needsGradioImport ? "\nimport gradio as gr" : ""}

from ${moduleName} import demo

if __name__ == "__main__":
    demo.launch(
        server_port=${port},
        max_file_size=${maxFileSize},
        css_paths=${cssPaths},
        head=${head},
        theme=${theme}
    )
`;
}

export async function launchGradioApp(
	demoName: string,
	workerIndex: number = 0,
	timeout: number = 60000,
	testcaseName?: string
): Promise<GradioApp> {
	const config = getDemoConfig(demoName);

	// Partition ports by worker index to avoid collisions
	const basePort = 7860 + workerIndex * 100;
	const port = await findFreePort(basePort, basePort + 99);

	const script = generateLaunchScript(demoName, port, config, testcaseName);

	// Write script to temp file
	const instanceId = testcaseName
		? `${demoName}_${testcaseName}_${port}`
		: `${demoName}_${port}`;
	const scriptPath = path.join(os.tmpdir(), `gradio_test_${instanceId}.py`);
	fs.writeFileSync(scriptPath, script);

	// Create unique directories for this instance to avoid cache conflicts
	const instanceDir = path.join(os.tmpdir(), `gradio_test_${instanceId}`);
	const cacheDir = path.join(instanceDir, "cached_examples");
	const tempDir = path.join(instanceDir, "temp");

	if (!fs.existsSync(instanceDir)) {
		fs.mkdirSync(instanceDir, { recursive: true });
	}

	const childProcess = spawn("python", [scriptPath], {
		stdio: "pipe",
		cwd: ROOT_DIR,
		env: {
			...process.env,
			PYTHONUNBUFFERED: "true",
			GRADIO_ANALYTICS_ENABLED: "False",
			GRADIO_IS_E2E_TEST: "1",
			GRADIO_RESET_EXAMPLES_CACHE: "True",
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
			// Clean up temp file
			try {
				fs.unlinkSync(scriptPath);
			} catch {
				// Ignore cleanup errors
			}
			reject(
				new Error(`Gradio app ${demoName} failed to start within ${timeout}ms`)
			);
		}, timeout);

		let output = "";

		function handleOutput(data: string): void {
			output += data;
			// Check for Gradio's startup message
			if (
				data.includes("Running on local URL:") ||
				data.includes(`Uvicorn running on`)
			) {
				clearTimeout(timeoutId);
				resolve({ port, process: childProcess });
			}
		}

		childProcess.stdout?.on("data", handleOutput);
		childProcess.stderr?.on("data", handleOutput);

		childProcess.on("error", (err) => {
			clearTimeout(timeoutId);
			try {
				fs.unlinkSync(scriptPath);
			} catch {
				// Ignore cleanup errors
			}
			reject(err);
		});

		childProcess.on("exit", (code) => {
			if (code !== 0 && code !== null) {
				clearTimeout(timeoutId);
				try {
					fs.unlinkSync(scriptPath);
				} catch {
					// Ignore cleanup errors
				}
				reject(
					new Error(
						`Gradio app ${demoName} exited with code ${code}.\nOutput: ${output}`
					)
				);
			}
		});
	});
}
