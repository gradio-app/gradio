// @vitest-environment node

import path from "node:path";
import { loadPyodide, PyodideInterface } from "pyodide";
import { describe, it, expect, beforeAll } from "vitest";
import { writeFileWithParents, renameWithParents } from "./file";

describe("writeFileWithParents()", () => {
	let pyodide: PyodideInterface;

	beforeAll(async () => {
		pyodide = await loadPyodide({
			indexURL: path.resolve(__dirname, "../../node_modules/pyodide")
		});
	});

	const testCases: { paths: string[] }[] = [
		{ paths: ["foo.py"] },
		{ paths: ["foo/bar.py"] },
		{ paths: ["foo/bar/baz.py", "foo/hoge.py"] },
		{ paths: ["foo/bar/baz/pii.py"] },
		{ paths: ["foo/bar/baz/boo.py", "foo/bar/hoge.py"] },
		{ paths: ["/boo/foo.py"] }
	];
	testCases.forEach(({ paths }) => {
		it(`writes files (${paths})`, () => {
			for (const path of paths) {
				expect(pyodide.FS.analyzePath(path).exists).toBe(false);

				writeFileWithParents(pyodide, path, "# Test");

				expect(pyodide.FS.analyzePath(path).exists).toBe(true);
				expect(pyodide.FS.readFile(path, { encoding: "utf8" })).toEqual(
					"# Test"
				);
			}
		});
	});

	it("can write binary files", () => {
		const path = "foo/bar.dat";
		const uint8View = new Uint8Array([0, 1, 2, 3]); // Random data
		writeFileWithParents(pyodide, path, uint8View);
		expect(pyodide.FS.readFile(path)).toEqual(uint8View);
	});
});

describe("renameWithParents", () => {
	let pyodide: PyodideInterface;

	beforeAll(async () => {
		pyodide = await loadPyodide({
			indexURL: path.resolve(__dirname, "../../node_modules/pyodide")
		});
	});

	const testCases: { oldPath: string; newPath: string }[] = [
		{ oldPath: "foo.py", newPath: "bar.py" }, // Same dir, without a parent path
		{ oldPath: "foo.py", newPath: "bar/baz.py" }, // To a nested dir
		{ oldPath: "baz/foo.py", newPath: "bar.py" }, // From a nested dir
		{ oldPath: "foo/bar.py", newPath: "foo/baz.py" }, // Same dir with a parent path
		{ oldPath: "foo/bar.py", newPath: "baz/qux.py" } // With parent paths, different dirs
	];
	testCases.forEach(({ oldPath, newPath }) => {
		it(`renames "${oldPath}" to "${newPath}"`, () => {
			writeFileWithParents(pyodide, oldPath, "# Test");
			expect(pyodide.FS.analyzePath(oldPath).exists).toBe(true);

			renameWithParents(pyodide, oldPath, newPath);

			expect(pyodide.FS.analyzePath(oldPath).exists).toBe(false);
			expect(pyodide.FS.analyzePath(newPath).exists).toBe(true);
			expect(pyodide.FS.readFile(newPath, { encoding: "utf8" })).toEqual(
				"# Test"
			);
		});
	});

	["foo.py", "foo/bar.py"].forEach((path) => {
		it(`does nothing when the source and the destination are the same`, () => {
			writeFileWithParents(pyodide, path, "# Test");
			expect(pyodide.FS.analyzePath(path).exists).toBe(true);

			renameWithParents(pyodide, path, path);

			expect(pyodide.FS.analyzePath(path).exists).toBe(true);
			expect(pyodide.FS.readFile(path, { encoding: "utf8" })).toEqual("# Test");
		});
	});
});
