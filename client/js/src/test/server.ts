import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export function initialise_server(): any {
	return setupServer(...handlers);
}
