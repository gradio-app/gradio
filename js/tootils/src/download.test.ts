import { describe, test, expect } from "vitest";
import { download_file } from "./download.js";
import { TEST_TXT } from "./fixtures.js";

describe("download_file", () => {
	test("captures a file download triggered by clicking an anchor element", async () => {
		const link = document.createElement("a");
		link.href = TEST_TXT.url!;
		link.download = TEST_TXT.orig_name!;
		link.id = "test-download-link";
		link.textContent = "Download";
		document.body.appendChild(link);

		try {
			const { suggested_filename, content } =
				await download_file("#test-download-link");

			expect(suggested_filename).toBe("alphabet.txt");
			expect(content).toBe("abcdefghijklmnopqrstuvwxyz");
		} finally {
			document.body.removeChild(link);
		}
	});
});
