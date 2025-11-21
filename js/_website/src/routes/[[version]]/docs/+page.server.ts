import { redirect } from "@sveltejs/kit";
import * as version from "$lib/json/version.json";

const COLOR_SETS = [
	"green",
	"yellow",
	"red",
	"blue",
	"pink",
	"purple",
	"green",
	"yellow",
	"red",
	"blue",
	"pink",
	"purple"
];

const VERSION = version.version;

export async function load({ params, url }) {
	if (params?.version === VERSION) {
		throw redirect(302, url.href.replace(`/${params.version}`, ""));
	}

	return {
		COLOR_SETS
	};
}
