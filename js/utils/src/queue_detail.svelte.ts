// The place in line of a waiting stream, from the component's loading
// status, e.g. "2/3 · ~25s" next to "Waiting". The countdown
// ticks every second between estimates; only a new estimate restarts it.

export interface QueueStatus {
	stream_state?: "open" | "closed" | "waiting" | "ended" | null;
	queue_position?: number | null;
	queue_size?: number | null;
	eta?: number | null;
}

export class QueueDetail {
	#place = $state<{
		position: string | null;
		eta: number | null;
		received_at: number;
	} | null>(null);
	#now = $state(Date.now());
	#timer: ReturnType<typeof setInterval> | null = null;

	update(status: QueueStatus | null | undefined): void {
		if (!status || status.stream_state !== "waiting") {
			this.#place = null;
			this.#stop();
			return;
		}
		const position =
			status.queue_position != null && status.queue_size != null
				? `${status.queue_position + 1}/${status.queue_size}`
				: null;
		const eta = status.eta != null && status.eta > 0 ? status.eta : null;
		const current = this.#place;
		if (current?.position === position && current?.eta === eta) return;
		this.#place = { position, eta, received_at: Date.now() };
		this.#now = Date.now();
		if (!this.#timer) {
			this.#timer = setInterval(() => (this.#now = Date.now()), 1000);
		}
	}

	#stop(): void {
		if (this.#timer) clearInterval(this.#timer);
		this.#timer = null;
	}

	get text(): string | null {
		const place = this.#place;
		if (!place) return null;
		const parts: string[] = [];
		if (place.position) parts.push(place.position);
		if (place.eta != null) {
			const left = Math.round(
				place.eta - (this.#now - place.received_at) / 1000
			);
			if (left > 0) parts.push(`~${left}s`);
		}
		return parts.length ? parts.join(" · ") : null;
	}

	destroy(): void {
		this.#stop();
	}
}
