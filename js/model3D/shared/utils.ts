/**
 * Gaussian Splat PLY files contain specific properties for representing
 * 3D Gaussian primitives. Regular point cloud PLY files only have
 * vertex positions and optional colors/normals.
 */
const GAUSSIAN_SPLAT_PROPERTIES = [
	"scale_0",
	"scale_1",
	"scale_2",
	"opacity",
	"rot_0",
	"rot_1",
	"rot_2",
	"rot_3",
];

export async function isGaussianSplatPly(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, {
			headers: { Range: "bytes=0-2047" },
		});
		const buffer = await response.arrayBuffer();
		const text = new TextDecoder("ascii").decode(buffer);

		const headerEnd = text.indexOf("end_header");
		if (headerEnd === -1) {
			return false;
		}
		const header = text.substring(0, headerEnd);

		return GAUSSIAN_SPLAT_PROPERTIES.every((prop) =>
			header.includes(`property float ${prop}`),
		);
	} catch {
		return false;
	}
}
