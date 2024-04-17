export async function load({ parent }) {
	const {
		components,
		helpers,
		modals,
		py_client,
		py_client_pages,
		routes,
		on_main,
		wheel
	} = await parent();

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
