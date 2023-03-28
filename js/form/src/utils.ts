export const debounce = (callback: Function, wait = 250) => {
	let timeout: NodeJS.Timeout | null = null;
	return (...args: Array<unknown>) => {
		const next = () => callback(...args);
		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(next, wait);
	};
};
