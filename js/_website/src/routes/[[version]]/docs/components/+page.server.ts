export async function load({ parent }) {
	const {
		docs,
		components,
		helpers,
		modals,
		py_client,
		routes,
		on_main,
		wheel
	} = await parent();

	let events = docs.events;
	let events_matrix = docs.events_matrix;
	return {
		components,
		helpers,
		modals,
		routes,
		py_client,
		events,
		events_matrix,
		on_main,
		wheel
	};
}
