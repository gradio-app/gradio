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

export function createHFAuth(getServer: () => Record<string, any>) {
	let user = $state("");
	let isPro = $state(false);
	let token = $state("");
	let source = $state<AuthSource>("");
	let status = $state<AuthStatus>("checking");
	let isHFSpace = $state(false);

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

	async function init(): Promise<void> {
		isHFSpace = window.location.hostname.endsWith(".hf.space");

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
		init,
		setPAT,
		signIn,
		signOut,
		getQuotaCTA
	};
}
