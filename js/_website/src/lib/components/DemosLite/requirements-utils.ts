export function extractPackageName(line: string): string | null {
	const noComments = line.split("#")[0].trim();

	const match = noComments.match(/^([a-zA-Z0-9_\-.]+)/);
	return match ? match[1] : null;
}

export async function packageExistsOnPyPi(packageName: string) {
	const url = `https://pypi.org/pypi/${packageName}/json`;

	try {
		const response = await fetch(url);

		if (response.status === 200) {
			console.log(`The package '${packageName}' exists on PyPI.`);
			return true;
		} else if (response.status === 404) {
			console.log(`The package '${packageName}' does not exist on PyPI.`);
			return false;
		} else {
			console.log(
				`Failed to fetch information for '${packageName}'. HTTP Status Code: ${response.status}`
			);
			return false;
		}
	} catch (error) {
		console.error(`Error while checking package '${packageName}':`, error);
		return false;
	}
}

export async function excludeUnavailablePackages(
	requirements: string[]
): Promise<string[]> {
	const packageChecks = requirements.map(async (req) => {
		const packageName = extractPackageName(req);
		if (!packageName) return null;

		const exists = await packageExistsOnPyPi(packageName);
		return exists === true ? req : null;
	});

	const results = await Promise.all(packageChecks);
	return results.filter((line) => line !== null);
}
