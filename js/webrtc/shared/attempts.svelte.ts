import type { QueueTurn } from "../types";

/**
 * The streams a component starts and their turns in the queue. Starting a
 * stream awaits several things (the turn, the RTC configuration, the
 * microphone), and a stop, a newer start or the unmount can happen during
 * any of them. Each start gets a token; after every await it checks
 * `is_current(token)` and gives up when it no longer is, instead of
 * connecting a stream nobody wants.
 */
export class StreamAttempts {
	/** Whether the current attempt's turn in the queue has come. */
	admitted = $state(false);
	#attempt = 0;
	#destroyed = false;
	// A turn was requested and not given back yet
	#holds_turn = false;
	#turn: () => QueueTurn;

	constructor(turn: () => QueueTurn) {
		this.#turn = turn;
	}

	/** Starts a new attempt, superseding any earlier one. */
	begin(): number {
		return ++this.#attempt;
	}

	is_current(token: number): boolean {
		return token === this.#attempt && !this.#destroyed;
	}

	/** Whether the component was unmounted. */
	get destroyed(): boolean {
		return this.#destroyed;
	}

	/** Joins the queue and waits for the attempt's turn. */
	async request_turn(
		token: number
	): Promise<"admitted" | "refused" | "superseded"> {
		this.#holds_turn = true;
		const got_turn = await this.#turn().request();
		if (!this.is_current(token)) return "superseded";
		if (!got_turn) return "refused";
		this.admitted = true;
		return "admitted";
	}

	/** Ends the current attempt and gives its turn back to the queue. */
	end(): void {
		this.#attempt++;
		this.admitted = false;
		if (this.#holds_turn) {
			this.#holds_turn = false;
			this.#turn().end();
		}
	}

	/** For the component's onDestroy. */
	destroy(): void {
		this.#destroyed = true;
		this.end();
	}
}
