/**
 * Detects if a PLY file is in Gaussian Splat format or regular point cloud format.
 * Gaussian Splat PLY files contain specific properties like f_dc_0, scale_0, opacity, rot_0.
 * Regular point cloud PLY files only contain basic properties like x, y, z and optionally colors.
 */
export async function isGaussianSplatPly(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, {
			headers: {
				Range: "bytes=0-4096"
			}
		});

		if (!response.ok) {
			// If range request fails, try full request with limited read
			const fullResponse = await fetch(url);
			const reader = fullResponse.body?.getReader();
			if (!reader) return true; // Default to Gaussian Splat on error

			const { value } = await reader.read();
			reader.cancel();
			if (!value) return true;

			const header = new TextDecoder().decode(value.slice(0, 4096));
			return checkGaussianSplatHeader(header);
		}

		const headerText = await response.text();
		return checkGaussianSplatHeader(headerText);
	} catch {
		// Default to Gaussian Splat behavior on error for backwards compatibility
		return true;
	}
}

function checkGaussianSplatHeader(header: string): boolean {
	// Find the header section (between "ply" and "end_header")
	const headerLower = header.toLowerCase();
	const endHeaderIndex = headerLower.indexOf("end_header");
	if (endHeaderIndex === -1) {
		// Invalid PLY file, default to Gaussian Splat
		return true;
	}

	const plyHeader = header.substring(0, endHeaderIndex);

	// Gaussian Splat specific properties
	const gaussianSplatProperties = [
		"f_dc_0", // Spherical harmonics
		"scale_0", // Gaussian scale
		"opacity", // Gaussian opacity
		"rot_0" // Rotation quaternion
	];

	// Check if any Gaussian Splat specific properties exist
	for (const prop of gaussianSplatProperties) {
		if (plyHeader.includes(prop)) {
			return true;
		}
	}

	return false;
}
