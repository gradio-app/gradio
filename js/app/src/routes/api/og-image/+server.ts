import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';
import { dev } from "$app/environment";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);

export async function GET({ request, fetch }) {
	try {
		const gradioServer =
			request.headers.get("x-gradio-server") || "http://127.0.0.1:7860";

		let appTitle = "Gradio App";
		let sampleImage = null;

		try {
			const configResponse = await fetch(`${gradioServer}/config`);
			if (configResponse.ok) {
				const config = await configResponse.json();
				if (config.components && Array.isArray(config.components)) {
					const datasetComponents = config.components.filter(
						(comp) => comp.type === "dataset"
					);

					if (datasetComponents.length > 0) {
						const lastDataset = datasetComponents[datasetComponents.length - 1];

						if (
							lastDataset.props &&
							Array.isArray(lastDataset.props.samples) &&
							lastDataset.props.samples.length > 0
						) {
							const firstSample = lastDataset.props.samples[0];

							const sampleData = Array.isArray(firstSample)
								? firstSample[0]
								: firstSample;

							if (sampleData && (sampleData.url || sampleData.path)) {
								sampleImage = sampleData.url || sampleData.path;
							} else if (sampleData && sampleData.background && (sampleData.background.url || sampleData.background.path)) {
								sampleImage = sampleData.background.url || sampleData.background.path;
							}
						}
					}
				}
			}
		} catch (err) {}

		const appRoot = resolve(__dirname, '../../../..');
		let screenshotPath;
		
		if (dev) {
			screenshotPath = join(appRoot, 'static', 'screenshot.cjs');
		} else {
			screenshotPath = join(appRoot, '/node/build/client', 'screenshot.cjs');
		}
		
		if (!fs.existsSync(screenshotPath)) {
			throw new Error(`Screenshot module not found at ${screenshotPath}`);
		}
		
		const { captureScreenshot } = require(screenshotPath);
		
		const finalScreenshot = await captureScreenshot(gradioServer, sampleImage);

		return new Response(finalScreenshot, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "no-store"
			}
		});
	} catch (error) {
		return new Response(`Failed to generate OG image: ${error.message}`, {
			status: 500,
			headers: {
				"Content-Type": "text/plain"
			}
		});
	}
}