import { readdirSync, unlinkSync, statSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const buildPath = resolve(__dirname, "../../gradio/templates/node/build");

/**
 * Recursively walks a directory and calls the callback for each file
 */
function walkDir(dir, callback) {
	const files = readdirSync(dir);

	for (const file of files) {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			walkDir(filePath, callback);
		} else {
			callback(filePath);
		}
	}
}

/**
 * Cleanup build directory to keep only .br files
 * - Remove all .gz files
 * - Remove all .map files
 * - Remove all .js and .css files that have a corresponding .br file
 */
function cleanupBuild() {
	console.log("Cleaning up build directory:", buildPath);

	let removedGz = 0;
	let removedMap = 0;
	let removedOriginal = 0;

	// First pass: collect all .br files
	const brFiles = new Set();
	walkDir(buildPath, (filePath) => {
		if (filePath.endsWith(".br")) {
			// Store the original file path (without .br extension)
			brFiles.add(filePath.slice(0, -3));
		}
	});

	// Second pass: remove files
	walkDir(buildPath, (filePath) => {
		// Remove .gz files
		if (filePath.endsWith(".gz")) {
			unlinkSync(filePath);
			removedGz++;
			return;
		}

		// Remove .map files
		if (filePath.endsWith(".map")) {
			unlinkSync(filePath);
			removedMap++;
			return;
		}

		// Remove original .js and .css files if they have a .br version
		if (
			(filePath.endsWith(".js") || filePath.endsWith(".css")) &&
			brFiles.has(filePath)
		) {
			unlinkSync(filePath);
			removedOriginal++;
			return;
		}
	});

	console.log(`Cleanup complete:`);
	console.log(`  - Removed ${removedGz} .gz files`);
	console.log(`  - Removed ${removedMap} .map files`);
	console.log(
		`  - Removed ${removedOriginal} original files (kept .br versions)`
	);
}

cleanupBuild();
