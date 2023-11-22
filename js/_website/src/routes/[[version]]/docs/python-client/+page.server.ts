export async function load({ parent }) {
	const { components, helpers, modals, py_client, routes, on_main, wheel } =
		await parent();

	return {
		components,
		helpers,
		modals,
		routes,
		py_client,
		on_main,
		wheel
	};
}
