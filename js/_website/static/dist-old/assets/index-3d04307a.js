const a = "Connection errored out.";
async function c(r, t) {
	const o = new FormData();
	t.forEach((n) => {
		o.append("files", n);
	});
	try {
		var e = await fetch(`${r}/upload`, { method: "POST", body: o });
	} catch {
		return { error: a };
	}
	return { files: await e.json() };
}
export { c as Q };
//# sourceMappingURL=index-3d04307a.js.map
