export const loadAsFile = async (x: string, examples_dir: String) => {
	return {
		name: x,
		data: examples_dir + x,
		is_example: true
	};
};

export const loadAsData = async (
	x: string,
	examples_dir: string
): Promise<string> => {
	let file_url = examples_dir + x;
	let response = await fetch(file_url);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	let blob = await response.blob();
	return new Promise((resolve, reject) => {
		var reader = new FileReader();
		reader.addEventListener(
			"load",
			function () {
				resolve(reader.result as string);
			},
			false
		);

		reader.onerror = () => {
			return reject();
		};
		reader.readAsDataURL(blob);
	});
};
