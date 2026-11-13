import type { QueueTurn } from "../types";

/**
 * A component's stream starts and their queue turns. A stop, newer start or
 * unmount can happen during any await of a start, so each start gets a token
 * and gives up once `is_current(token)` is false.
 */
export class StreamAttempts {
	/** Whether the current attempt's turn in the queue has come. */
	admitted = $state(false);
	#attempt = 0;
	#destroyed = false;
	#holds_turn = false;
	#turn: () => QueueTurn;

	constructor(turn: () => QueueTurn) {
		this.#turn = turn;
	}

	begin(): number {
		return ++this.#attempt;
	}

	is_current(token: number): boolean {
		return token === this.#attempt && !this.#destroyed;
	}

	get destroyed(): boolean {
		return this.#destroyed;
	}

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

	destroy(): void {
		this.#destroyed = true;
		this.end();
	}
}
