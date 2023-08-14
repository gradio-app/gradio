import Prism from "prismjs";
import "prismjs/components/prism-python";
import demos_by_category from "$lib/json/demos.json";

let language = "python";

type Demo = {
	name: string;
	dir: string;
	code: string;
	highlighted_code?: string;
};
type Category = {
	category: string;
	demos: Demo[];
};

export async function load() {
	demos_by_category.forEach((category: Category) => {
		category.demos.forEach((demo: Demo) => {
			demo.highlighted_code = Prism.highlight(
				demo.code,
				Prism.languages[language],
				"python"
			);
		});
	});

	return {
		demos_by_category
	};
}
