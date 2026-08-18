/**
 * Browsers do not expose "the user closed this tab". What they do expose is:
 *
 * - `pagehide`, which fires when the document is being taken away, carrying a
 *   `persisted` flag that says whether it was parked in the back/forward cache
 *   and can be restored later.
 * - `visibilitychange`, which fires whenever the page is backgrounded or
 *   foregrounded, and is the only one of the two that mobile browsers deliver
 *   dependably.
 *
 * While unloading, the spec fires `pagehide` *before* the visibility state flips
 * to hidden. So a page that is still `visible` when `pagehide` arrives is being
 * destroyed by something happening in the foreground — a closed tab, a reload,
 * or a navigation. A page that is already `hidden` was backgrounded earlier, so
 * whatever is destroying it now is the browser or the operating system
 * reclaiming memory rather than a person.
 *
 * The distinction is deliberately one-sided. Reading "deliberate" into someone
 * merely switching tabs would throw away work they expect to find waiting, while
 * reading "not deliberate" into a real exit only delays cleanup, so every
 * ambiguous case is treated as not deliberate. Two consequences follow, and
 * callers have to be built for them:
 *
 * - Closing a tab that is not in the foreground (⌘W on an inactive tab, or the
 *   iOS tab switcher, which hides the page before you can tap the X) is
 *   indistinguishable from the system reclaiming a background tab, and is
 *   reported as not deliberate.
 * - Nothing here is guaranteed to run at all. A crash, a force quit, an
 *   out-of-memory kill, or a dead battery destroys the page silently. This is an
 *   optimisation for the common case, never a signal to depend on.
 */

/**
 * Calls `callback` when the page comes back into use, either restored from the
 * back/forward cache or brought to the foreground again.
 *
 * A page that was frozen or cached has had its connections closed underneath it
 * without any error being delivered, so anything that was streaming has to be
 * checked rather than trusted. Returns a function that stops listening.
 */
export function on_page_return(callback: () => void): () => void {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return () => {};
	}

	const handle_pageshow = (event: Event): void => {
		if ((event as PageTransitionEvent).persisted) callback();
	};
	const handle_visibility = (): void => {
		if (document.visibilityState === "visible") callback();
	};

	window.addEventListener("pageshow", handle_pageshow);
	document.addEventListener("visibilitychange", handle_visibility);
	return () => {
		window.removeEventListener("pageshow", handle_pageshow);
		document.removeEventListener("visibilitychange", handle_visibility);
	};
}

/**
 * Whether a `pagehide` event represents someone deliberately leaving the page.
 */
export function is_deliberate_exit(event: PageTransitionEvent): boolean {
	// Headed for the back/forward cache, so the page may yet be restored.
	if (event.persisted) return false;
	return document.visibilityState === "visible";
}

/**
 * Calls `callback` when someone deliberately leaves the page. Returns a function
 * that stops listening.
 */
export function on_deliberate_exit(callback: () => void): () => void {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return () => {};
	}

	const handle_pagehide = (event: Event): void => {
		if (is_deliberate_exit(event as PageTransitionEvent)) {
			callback();
		}
	};

	window.addEventListener("pagehide", handle_pagehide);
	return () => window.removeEventListener("pagehide", handle_pagehide);
}
