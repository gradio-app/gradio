export async function get_jwt(
	space: string,
	token: `hf_${string}`
): Promise<string | false> {
	try {
		const r = await fetch(`https://huggingface.co/api/spaces/${space}/jwt`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const jwt = (await r.json()).token;

		return jwt || false;
	} catch (e) {
		console.error(e);
		return false;
	}
}
