export async function load({ parent }) {
	const { components, helpers, py_client, routes, on_main, wheel } = await parent();

	return {
		components,
		helpers,
		routes,
		py_client, 
		on_main,
		wheel
	};
}
