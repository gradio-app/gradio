export function createHFAuth(getServer: () => Record<string, any>) {
	let loggedInUser = $state("");
	let isHFSpace = $state(false);
	let hfToken = $state(
		typeof localStorage !== "undefined"
			? (localStorage.getItem("hf_token") ?? "")
			: ""
	);

	function saveToken(token: string): void {
		hfToken = token.trim();
		if (typeof localStorage !== "undefined") {
			if (hfToken) localStorage.setItem("hf_token", hfToken);
			else localStorage.removeItem("hf_token");
		}
	}

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
		if (!isHFSpace) return;
		const token = await getOAuthToken();
		if (!token) {
			loggedInUser = "";
			return;
		}
		try {
			const res = await fetch("https://huggingface.co/api/whoami-v2", {
				headers: { Authorization: `Bearer ${token}` }
			});
			loggedInUser = res.ok ? (await res.json()).name || "User" : "";
		} catch {
			loggedInUser = "User";
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

	$effect(() => {
		checkLoginStatus();
	});

	return {
		get loggedInUser() {
			return loggedInUser;
		},
		get isHFSpace() {
			return isHFSpace;
		},
		get hfToken() {
			return hfToken;
		},
		saveToken,
		handleLogin,
		handleLogout,
		getOAuthToken
	};
}
