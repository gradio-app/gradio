(() => {
	if (window.__gradioHardwareOverlay) return;
	window.__gradioHardwareOverlay = true;
	const base = new URL(".", document.currentScript.src);
	const style = document.createElement("style");
	style.textContent = `
    #gr-hardware-frame {position:fixed;inset:0;z-index:2147483645;pointer-events:none;border:3px solid #9b65eb;box-shadow:inset 0 0 22px #9b65eb55;animation:gr-hw-shimmer 3s ease-in-out infinite}
    #gr-hardware-badge {position:fixed;bottom:12px;right:12px;z-index:2147483646;background:#fff;color:#6d28d9;padding:10px 15px;border:1px solid #ddd6fe;border-radius:8px;font:13px system-ui;box-shadow:0 2px 10px #0001;text-decoration:none}
    @keyframes gr-hw-shimmer {50% {border-color:#37cbb1;box-shadow:inset 0 0 24px #37cbb155}}
    @media(prefers-reduced-motion:reduce){#gr-hardware-frame{animation:none}}
    #gradio-hardware-settings select {font:inherit;padding:10px;border-radius:8px;max-width:100%}
    #gradio-hardware-settings pre {white-space:pre-wrap;background:#8881;padding:16px;border-radius:12px}
  `;
	document.head.append(style);
	const frame = document.createElement("div");
	frame.id = "gr-hardware-frame";
	frame.hidden = true;
	const badge = document.createElement("a");
	badge.id = "gr-hardware-badge";
	badge.href = new URL("settings", base);
	badge.textContent = "Hardware Settings";
	document.body.append(frame, badge);
	const panel = document.getElementById("gradio-hardware-settings");
	let select, note, telemetry, error;
	if (panel) {
		const label = document.createElement("label");
		label.textContent = "Execution device ";
		select = document.createElement("select");
		label.append(select);
		note = document.createElement("p");
		telemetry = document.createElement("pre");
		error = document.createElement("p");
		error.setAttribute("role", "alert");
		const details = document.createElement("details");
		const summary = document.createElement("summary");
		summary.textContent = "Execution diagnostics";
		details.append(summary, telemetry);
		panel.append(label, note, details, error);
		select.addEventListener("change", async () => {
			select.disabled = true;
			error.textContent = "";
			try {
				const response = await fetch(new URL("select", base), {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-gradio-hardware-token": gradioHardwareToken
					},
					body: JSON.stringify({ hardware: select.value })
				});
				const data = await response.json();
				if (!response.ok)
					throw Error(data.detail || "Could not switch hardware");
				render(data);
			} catch (e) {
				error.textContent = String(e);
			} finally {
				select.disabled = false;
			}
		});
	}
	function render(data) {
		const simulated = data.profile.id !== "host";
		frame.hidden = !simulated;
		badge.textContent = simulated
			? `Simulated: ${data.profile.name} · Settings`
			: "Actual host · Hardware Settings";
		if (!panel) return;
		if (!select.options.length)
			for (const p of data.profiles) select.add(new Option(p.name, p.id));
		select.value = data.profile.id;
		select.disabled = data.active;
		note.textContent = data.profile.note;
		telemetry.textContent = JSON.stringify(
			{
				gpu_time_budget: data.profile.rate,
				buffer_budget_gib: data.profile.buffer_budget_gb,
				active: data.active,
				last_run: data.last_run,
				host_calibration: data.host_calibration,
				mechanism: data.mechanism
			},
			null,
			2
		);
	}
	let timer;
	async function refresh() {
		try {
			const response = await fetch(new URL("status", base));
			if (!response.ok) return;
			render(await response.json());
		} catch {
			badge.textContent = "Hardware preview disconnected";
		}
		timer = setTimeout(refresh, 1500);
	}
	window.addEventListener("pagehide", () => clearTimeout(timer));
	refresh();
})();
