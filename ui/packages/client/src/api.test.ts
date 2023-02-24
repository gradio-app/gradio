import { test, describe, assert, afterEach } from "vitest";
import { spy } from "tinyspy";

import {
	determine_protocol,
	process_endpoint,
	remove_trailing_slash
} from "./api";

describe("remove_trailing_slash", () => {
	test("https://asd-asd-asd.hf.space", () => {
		assert.equal(
			remove_trailing_slash("https://asd-asd-asd.hf.space"),
			"https://asd-asd-asd.hf.space"
		);
	});

	test("https://asd-asd-asd.hf.space/", () => {
		assert.equal(
			remove_trailing_slash("https://asd-asd-asd.hf.space/"),
			"https://asd-asd-asd.hf.space"
		);
	});

	test("https://asd-asd-asd.hf.space/", () => {
		assert.equal(
			remove_trailing_slash("https://asd-asd-asd.hf.space/space/space/"),
			"https://asd-asd-asd.hf.space/space/space"
		);
	});

	test("https://asd-asd-asd.hf.space/", () => {
		assert.equal(
			remove_trailing_slash("https://asd-asd-asd.hf.space/space/space"),
			"https://asd-asd-asd.hf.space/space/space"
		);
	});
});

describe("process_endpoint", () => {
	test("space: user/space", () => {
		// later
	});

	test("space: full url", () => {
		assert.deepEqual(process_endpoint("https://asd-asd-asd.hf.space"), {
			host: "asd-asd-asd.hf.space",
			protocol: "wss",
			is_space: true
		});
	});

	test("space: url without protocol", () => {
		assert.deepEqual(process_endpoint("asd-asd-asd.hf.space"), {
			host: "asd-asd-asd.hf.space",
			protocol: "wss",
			is_space: true
		});
	});

	test("not secure: localhost", () => {
		assert.deepEqual(process_endpoint("http://localhost:9870"), {
			host: "localhost:9870",
			protocol: "ws",
			is_space: false
		});
	});

	test("not secure: subdomain", () => {
		assert.deepEqual(process_endpoint("http://random.url.com"), {
			host: "random.url.com",
			protocol: "ws",
			is_space: false
		});
	});

	test("not secure: root domain", () => {
		assert.deepEqual(process_endpoint("http://example.com"), {
			host: "example.com",
			protocol: "ws",
			is_space: false
		});
	});

	test("secure: localhost", () => {
		assert.deepEqual(process_endpoint("https://localhost:9870"), {
			host: "localhost:9870",
			protocol: "wss",
			is_space: false
		});
	});

	test("secure: subdomain", () => {
		assert.deepEqual(process_endpoint("https://random.url.com"), {
			host: "random.url.com",
			protocol: "wss",
			is_space: false
		});
	});

	test("unknown: no protocol example.com", () => {
		assert.deepEqual(process_endpoint("random.url.com"), {
			host: "random.url.com",
			protocol: "wss",
			is_space: false
		});
	});
});

// describe("determine_protocol", () => {
// 	test("https:", async () => {

//   });
// });
