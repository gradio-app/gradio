// @vitest-environment node

import { loadPyodide, PyodideInterface } from "pyodide";
import { describe, it, expect, beforeEach } from "vitest";
import { writeFileWithParents, renameWithParents } from "./file";

describe("writeFileWithParents()", () => {
  let pyodide: PyodideInterface;

  beforeEach(async () => {
    pyodide = await loadPyodide({
      indexURL: "../../node_modules/pyodide", // Installed at the Yarn workspace root
    });
  });

  const testCases: { paths: string[] }[] = [
    { paths: ["foo.py"] },
    { paths: ["foo/bar.py"] },
    { paths: ["foo/bar.py", "foo/hoge.py"] },
    { paths: ["foo/bar/baz.py"] },
    { paths: ["foo/bar/baz.py", "foo/bar/hoge.py"] },
    { paths: ["/foo.py"] },
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

  beforeEach(async () => {
    pyodide = await loadPyodide({
      indexURL: "../../node_modules/pyodide", // Installed at the Yarn workspace root
    });
  });

  const testCases: { oldPath: string; newPath: string }[] = [
    { oldPath: "foo.py", newPath: "bar.py" }, // Same dir, without a parent path
    { oldPath: "foo.py", newPath: "bar/baz.py" }, // To a nested dir
    { oldPath: "baz/foo.py", newPath: "bar.py" }, // From a nested dir
    { oldPath: "foo/bar.py", newPath: "foo/baz.py" }, // Same dir with a parent path
    { oldPath: "foo/bar.py", newPath: "baz/qux.py" }, // With parent paths, different dirs
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
