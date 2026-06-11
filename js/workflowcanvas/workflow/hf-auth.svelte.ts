interface WhoAmI {
	name: string;
	isPro: boolean;
}

async function fetch_whoami(token: string): Promise<WhoAmI | null> {
	try {
		const res = await fetch("https://huggingface.co/api/whoami-v2", {
			headers: { Authorization: `Bearer ${token}` }
		});
		if (!res.ok) return null;
		const body = await res.json();
		return { name: body.name || "User", isPro: body.isPro === true };
	} catch {
		return null;
	}
}

function redirect_to(path: string): void {
	const target = encodeURIComponent(
		window.location.pathname + window.location.search
	);
	window.location.assign(`${path}?_target_url=${target}`);
}

type AuthSource = "" | "oauth" | "pat";
type AuthStatus = "checking" | "ready" | "validating" | "invalid";

const WRITE_TOKEN_COOKIE_PREFIX = "gradio_workflow_write_token";

/**
 * Move a `?write_token=…` query param (from the edit link printed at launch)
 * into a cookie so subsequent /component_server calls carry it, then strip it
 * from the URL. The cookie name is suffixed with the port because cookies are
 * shared across ports on the same host — two local apps would otherwise
 * clobber each other (the server prefix-matches the name).
 */
function applyWriteTokenFromUrl(): void {
	if (typeof window === "undefined") return;
	const params = new URLSearchParams(window.location.search);
	const wt = params.get("write_token");
	if (!wt) return;
	const port =
		window.location.port ||
		(window.location.protocol === "https:" ? "443" : "80");
	const maxAge = 60 * 60 * 24 * 7;
	const secure = window.location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${WRITE_TOKEN_COOKIE_PREFIX}_${port}=${encodeURIComponent(wt)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
	params.delete("write_token");
	const q = params.toString();
	window.history.replaceState(
		{},
		"",
		window.location.pathname + (q ? `?${q}` : "") + window.location.hash
	);
}

export function createHFAuth(getServer: () => Record<string, any>) {
	let user = $state("");
	let isPro = $state(false);
	let token = $state("");
	let source = $state<AuthSource>("");
	let status = $state<AuthStatus>("checking");
	let isHFSpace = $state(false);
	// Optimistic until the server answers, so the owner (the common case)
	// doesn't see edit controls flash out and back in. The server rejects
	// unauthorized saves regardless of what the UI shows.
	let canWrite = $state(true);
	let writeAccessKnown = $state(false);

	function clearIdentity(): void {
		user = "";
		isPro = false;
		token = "";
		source = "";
	}

	function applyIdentity(t: string, who: WhoAmI, src: AuthSource): void {
		token = t;
		user = who.name;
		isPro = who.isPro;
		source = src;
	}

	async function refreshWriteAccess(): Promise<void> {
		const s = getServer();
		if (!s?.get_write_access) {
			// Older backends without write-token support stay fully editable.
			canWrite = true;
			writeAccessKnown = true;
			return;
		}
		try {
			canWrite = (await s.get_write_access()) === "true";
		} catch {
			canWrite = false;
		}
		writeAccessKnown = true;
	}

	async function init(): Promise<void> {
		isHFSpace = window.location.hostname.endsWith(".hf.space");

		applyWriteTokenFromUrl();
		void refreshWriteAccess();

		const oauth = await readOAuthToken();
		if (oauth) {
			const who = await fetch_whoami(oauth);
			if (who) {
				applyIdentity(oauth, who, "oauth");
				status = "ready";
				return;
			}
		}

		const pat =
			typeof localStorage !== "undefined"
				? (localStorage.getItem("hf_token") ?? "")
				: "";
		if (pat) {
			status = "validating";
			const who = await fetch_whoami(pat);
			if (who) {
				applyIdentity(pat, who, "pat");
				status = "ready";
				return;
			}
			status = "invalid";
			return;
		}

		status = "ready";
	}

	async function readOAuthToken(): Promise<string> {
		const s = getServer();
		if (!s?.get_token) return "";
		try {
			return (await s.get_token()) || "";
		} catch {
			return "";
		}
	}

	async function setPAT(input: string): Promise<void> {
		const next = input.trim();
		if (typeof localStorage !== "undefined") {
			if (next) localStorage.setItem("hf_token", next);
			else localStorage.removeItem("hf_token");
		}
		if (!next) {
			clearIdentity();
			status = "ready";
			return;
		}
		status = "validating";
		const who = await fetch_whoami(next);
		if (who) {
			applyIdentity(next, who, "pat");
			status = "ready";
		} else {
			clearIdentity();
			status = "invalid";
		}
	}

	function signIn(): void {
		redirect_to("/login/huggingface");
	}

	function signOut(): void {
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem("hf_token");
		}
		clearIdentity();
		status = "ready";
		if (isHFSpace) redirect_to("/logout");
	}

	function getQuotaCTA(): {
		suffix: string;
		action: { label: string; href?: string; onClick?: () => void };
	} {
		if (!user) {
			return {
				suffix: "Sign in with HuggingFace for your own GPU credits.",
				action: { label: "Sign in", onClick: signIn }
			};
		}
		if (!isPro) {
			return {
				suffix: "Upgrade to PRO for higher ZeroGPU quota.",
				action: {
					label: "Upgrade to PRO",
					href: "https://huggingface.co/subscribe/pro"
				}
			};
		}
		return {
			suffix: "Manage your ZeroGPU credits in account settings.",
			action: {
				label: "Manage credits",
				href: "https://huggingface.co/settings/billing"
			}
		};
	}

	return {
		get user() {
			return user;
		},
		get isPro() {
			return isPro;
		},
		get token() {
			return token;
		},
		get source() {
			return source;
		},
		get status() {
			return status;
		},
		get isHFSpace() {
			return isHFSpace;
		},
		get canWrite() {
			return canWrite;
		},
		get writeAccessKnown() {
			return writeAccessKnown;
		},
		init,
		setPAT,
		signIn,
		signOut,
		getQuotaCTA
	};
}
