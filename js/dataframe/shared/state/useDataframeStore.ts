import { getContext } from "svelte";
import {
	DataframeStore,
	DATAFRAME_STORE_KEY
} from "./DataframeStore.svelte";

export function getDataframeStore(): DataframeStore {
	const store = getContext<DataframeStore | null>(DATAFRAME_STORE_KEY);
	if (!store) {
		throw new Error("DataframeStore context is not available");
	}
	return store;
}
