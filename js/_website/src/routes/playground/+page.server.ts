import Prism from "prismjs";
import demos_by_category from "$lib/json/demos.json";

type Demo = {
	name: string;
	dir: string;
	code: string;
	requirements: string[];
};
type Category = {
	category: string;
	demos: Demo[];
};

export async function load() {
	return {
		demos_by_category
	};
}
