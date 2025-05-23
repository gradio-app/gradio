import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export function initialise_server(): any {
	return setupWorker(...handlers);
}
