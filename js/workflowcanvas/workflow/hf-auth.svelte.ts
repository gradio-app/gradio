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

export function createHFAuth(getServer: () => Record<string, any>) {
	let loggedInUser = $state("");
	let isPro = $state(false);
	let isHFSpace = $state(false);
	let isCheckingLogin = $state(true);
	let hfToken = $state(
		typeof localStorage !== "undefined"
			? (localStorage.getItem("hf_token") ?? "")
			: ""
	);
	let tokenUser = $state("");
	let tokenStatus = $state<"idle" | "validating" | "invalid">("idle");

	async function validateToken(token: string): Promise<void> {
		if (!token) {
			tokenUser = "";
			tokenStatus = "idle";
			isPro = false;
			return;
		}
		tokenStatus = "validating";
		const who = await fetch_whoami(token);
		if (who) {
			tokenUser = who.name;
			isPro = who.isPro;
			tokenStatus = "idle";
		} else {
			tokenUser = "";
			isPro = false;
			tokenStatus = "invalid";
		}
	}

	function saveToken(token: string): void {
		hfToken = token.trim();
		if (typeof localStorage !== "undefined") {
			if (hfToken) localStorage.setItem("hf_token", hfToken);
			else localStorage.removeItem("hf_token");
		}
		void validateToken(hfToken);
	}

	// Validate any token loaded from localStorage on init so the user
	// sees the "Signed in as …" badge without needing to re-paste.
	if (hfToken) void validateToken(hfToken);

	async function getOAuthToken(): Promise<string> {
		const s = getServer();
		if (!s?.get_token) return "";
		try {
			return (await s.get_token()) || "";
		} catch {
			return "";
		}
	}

	async function checkLoginStatus(): Promise<void> {
		isHFSpace = window.location.hostname.endsWith(".hf.space");
		const token = await getOAuthToken();
		if (!token) {
			loggedInUser = "";
			isPro = false;
			isCheckingLogin = false;
			return;
		}
		const who = await fetch_whoami(token);
		loggedInUser = who?.name ?? "";
		isPro = who?.isPro ?? false;
		isCheckingLogin = false;
	}

	function handleLogin(): void {
		redirect_to("/login/huggingface");
	}

	function handleLogout(): void {
		if (isHFSpace) {
			redirect_to("/logout");
			return;
		}
		saveToken("");
		loggedInUser = "";
		isPro = false;
	}

	function getQuotaCTA(): {
		suffix: string;
		action: { label: string; href?: string; onClick?: () => void };
	} {
		if (!loggedInUser && !tokenUser) {
			return {
				suffix: "Sign in with HuggingFace for your own GPU credits.",
				action: { label: "Sign in", onClick: handleLogin }
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
		get loggedInUser() {
			return loggedInUser;
		},
		get isPro() {
			return isPro;
		},
		get isHFSpace() {
			return isHFSpace;
		},
		get isCheckingLogin() {
			return isCheckingLogin;
		},
		get hfToken() {
			return hfToken;
		},
		get tokenUser() {
			return tokenUser;
		},
		get tokenStatus() {
			return tokenStatus;
		},
		saveToken,
		handleLogin,
		handleLogout,
		getOAuthToken,
		checkLoginStatus,
		getQuotaCTA
	};
}
