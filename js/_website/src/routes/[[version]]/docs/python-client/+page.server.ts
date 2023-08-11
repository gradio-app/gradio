export async function load({ parent }) {
	const { components, helpers, py_client, routes } = await parent();

	return {
		components,
		helpers,
		routes,
		py_client
	};
}
