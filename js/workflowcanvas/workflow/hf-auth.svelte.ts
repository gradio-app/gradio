export function createHFAuth(getServer: () => Record<string, any>) {
	let loggedInUser = $state("");
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
			return;
		}
		tokenStatus = "validating";
		try {
			const res = await fetch("https://huggingface.co/api/whoami-v2", {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (res.ok) {
				const data = await res.json();
				tokenUser = data.name || "User";
				tokenStatus = "idle";
			} else {
				tokenUser = "";
				tokenStatus = "invalid";
			}
		} catch {
			tokenUser = "";
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
		if (!isHFSpace) {
			isCheckingLogin = false;
			return;
		}
		const token = await getOAuthToken();
		if (!token) {
			loggedInUser = "";
			isCheckingLogin = false;
			return;
		}
		try {
			const res = await fetch("https://huggingface.co/api/whoami-v2", {
				headers: { Authorization: `Bearer ${token}` }
			});
			loggedInUser = res.ok ? (await res.json()).name || "User" : "";
		} catch {
			loggedInUser = "User";
		} finally {
			isCheckingLogin = false;
		}
	}

	function handleLogin(): void {
		const target = encodeURIComponent(
			window.location.pathname + window.location.search
		);
		window.location.assign(`/login/huggingface?_target_url=${target}`);
	}

	function handleLogout(): void {
		const target = encodeURIComponent(
			window.location.pathname + window.location.search
		);
		window.location.assign(`/logout?_target_url=${target}`);
	}

	return {
		get loggedInUser() {
			return loggedInUser;
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
		checkLoginStatus
	};
}
