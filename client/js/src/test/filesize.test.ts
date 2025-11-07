import { describe, it, expect } from "vitest";
import { filesize, SPECS } from "../utils/filesize";

describe("filesize", () => {
	describe("basic functionality", () => {
		it("should format bytes correctly with default spec (jedec)", () => {
			expect(filesize(0)).toBe("0.0 b");
			expect(filesize(512)).toBe("512.0 b");
			expect(filesize(1024)).toBe("1.0 Kb");
			expect(filesize(1536)).toBe("1.5 Kb"); // 1024 + 512
			expect(filesize(1048576)).toBe("1.0 Mb"); // 1024^2
			expect(filesize(1073741824)).toBe("1.0 Gb"); // 1024^3
		});

		it("should handle different fixed decimal places", () => {
			expect(filesize(1536, 0)).toBe("2 Kb");
			expect(filesize(1536, 1)).toBe("1.5 Kb");
			expect(filesize(1536, 2)).toBe("1.50 Kb");
			expect(filesize(1536, 3)).toBe("1.500 Kb");
		});

		it("should handle negative numbers by taking absolute value", () => {
			expect(filesize(-1024)).toBe("1.0 Kb");
			expect(filesize(-1536)).toBe("1.5 Kb");
			expect(filesize(-0)).toBe("0.0 b");
		});
	});

	describe("SI specification", () => {
		it("should use base 1000 for SI spec", () => {
			expect(filesize(1000, 1, "si")).toBe("1.0 kb");
			expect(filesize(1500, 1, "si")).toBe("1.5 kb");
			expect(filesize(1000000, 1, "si")).toBe("1.0 Mb");
			expect(filesize(1000000000, 1, "si")).toBe("1.0 Gb");
		});

		it("should handle large numbers with SI spec", () => {
			expect(filesize(1e12, 1, "si")).toBe("1.0 Tb");
			expect(filesize(1e15, 1, "si")).toBe("1.0 Pb");
			expect(filesize(1e18, 1, "si")).toBe("1.0 Eb");
		});
	});

	describe("IEC specification", () => {
		it("should use base 1024 with binary units for IEC spec", () => {
			expect(filesize(1024, 1, "iec")).toBe("1.0 Kib");
			expect(filesize(1536, 1, "iec")).toBe("1.5 Kib");
			expect(filesize(1048576, 1, "iec")).toBe("1.0 Mib");
			expect(filesize(1073741824, 1, "iec")).toBe("1.0 Gib");
		});

		it("should handle large numbers with IEC spec", () => {
			expect(filesize(Math.pow(1024, 4), 1, "iec")).toBe("1.0 Tib");
			expect(filesize(Math.pow(1024, 5), 1, "iec")).toBe("1.0 Pib");
		});
	});

	describe("JEDEC specification", () => {
		it("should use base 1024 with decimal-style units for JEDEC spec", () => {
			expect(filesize(1024, 1, "jedec")).toBe("1.0 Kb");
			expect(filesize(1536, 1, "jedec")).toBe("1.5 Kb");
			expect(filesize(1048576, 1, "jedec")).toBe("1.0 Mb");
			expect(filesize(1073741824, 1, "jedec")).toBe("1.0 Gb");
		});
	});

	describe("edge cases", () => {
		it("should handle very large numbers", () => {
			const veryLarge = Math.pow(1024, 8); // Yottabytes
			expect(filesize(veryLarge, 1, "jedec")).toBe("1.0 Yb");
		});

		it("should handle decimal input", () => {
			expect(filesize(1024.5, 1)).toBe("1.0 Kb");
			expect(filesize(1500.7, 2)).toBe("1.47 Kb");
		});

		it("should handle invalid spec by falling back to jedec", () => {
			expect(filesize(1024, 1, "invalid")).toBe("1.0 Kb");
			expect(filesize(1024, 1, "")).toBe("1.0 Kb");
			expect(filesize(1024, 1, undefined)).toBe("1.0 Kb");
		});
	});

	describe("precision and rounding", () => {
		it("should round correctly with different precision levels", () => {
			const testBytes = 1536; // 1.5 KB
			expect(filesize(testBytes, 0)).toBe("2 Kb");
			expect(filesize(testBytes, 1)).toBe("1.5 Kb");
			expect(filesize(testBytes, 2)).toBe("1.50 Kb");
		});

		it("should handle rounding edge cases", () => {
			const almostTwoKb = 2047; // almost 2KB
			expect(filesize(almostTwoKb, 0)).toBe("2 Kb");
			expect(filesize(almostTwoKb, 3)).toBe("1.999 Kb");
		});
	});

	describe("SPECS constant", () => {
		it("should have correct radix values", () => {
			expect(SPECS.si.radix).toBe(1000);
			expect(SPECS.iec.radix).toBe(1024);
			expect(SPECS.jedec.radix).toBe(1024);
		});

		it("should have correct unit arrays", () => {
			expect(SPECS.si.unit).toEqual([
				"b",
				"kb",
				"Mb",
				"Gb",
				"Tb",
				"Pb",
				"Eb",
				"Zb",
				"Yb"
			]);
			expect(SPECS.iec.unit).toEqual([
				"b",
				"Kib",
				"Mib",
				"Gib",
				"Tib",
				"Pib",
				"Eib",
				"Zib",
				"Yib"
			]);
			expect(SPECS.jedec.unit).toEqual([
				"b",
				"Kb",
				"Mb",
				"Gb",
				"Tb",
				"Pb",
				"Eb",
				"Zb",
				"Yb"
			]);
		});
	});
});
