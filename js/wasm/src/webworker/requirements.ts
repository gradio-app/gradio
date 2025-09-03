import type { PyodideInterface } from "pyodide";

export function verifyRequirements(requirements: string[]): void {
	requirements.forEach((req) => {
		let url: URL;
		try {
			url = new URL(req);
		} catch {
			// `req` is not a URL -> OK
			return;
		}

		// Ref: The scheme checker in the micropip implementation is https://github.com/pyodide/micropip/blob/v0.1.0/micropip/_compat_in_pyodide.py#L23-L26
		if (url.protocol === "emfs:" || url.protocol === "file:") {
			throw new Error(
				`"emfs:" and "file:" protocols are not allowed for the requirement (${req})`
			);
		}
	});
}

function isPlotly6(pyodide: PyodideInterface, requirement: string): boolean {
	const pyRequirement = pyodide.pyimport("packaging.requirements.Requirement");
	try {
		const reqObj = pyRequirement(requirement);
		return reqObj.name === "plotly" && reqObj.specifier.contains("6");
	} catch (error) {
		return false;
	}
}

function isAltair(pyodide: PyodideInterface, requirement: string): boolean {
	const pyRequirement = pyodide.pyimport("packaging.requirements.Requirement");
	try {
		const reqObj = pyRequirement(requirement);
		return reqObj.name === "altair";
	} catch (error) {
		return false;
	}
}

export function patchRequirements(
	pyodide: PyodideInterface,
	requirements: string[]
): string[] {
	// XXX: `micropip` sometimes doesn't resolve the dependency version correctly.
	// So we explicitly specify the version here for some packages.

	if (requirements.some((req) => isAltair(pyodide, req))) {
		// Plotly 6.x doesn't work work Altair on Pyodide 0.27.2.
		// Ref: https://github.com/gradio-app/gradio/issues/10458
		return requirements.map((req) => {
			if (isPlotly6(pyodide, req)) {
				return `plotly==5.*`;
			}
			return req;
		});
	}

	return requirements;
}
