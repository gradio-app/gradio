import type * as THREEModule from "three";

interface MJCFJoint {
	name: string;
	type: string;
	axis: [number, number, number];
	range: [number, number] | null;
	container: THREEModule.Object3D;
	setJointValue(value: number): void;
}

interface MJCFRobot extends THREEModule.Group {
	joints: Record<string, MJCFJoint>;
	setJointValues(values: Record<string, number>): void;
}

export function parseMJCF(
	THREE: typeof THREEModule,
	xmlText: string
): MJCFRobot {
	const parser = new DOMParser();
	const doc = parser.parseFromString(xmlText, "text/xml");

	const robot = new THREE.Group() as MJCFRobot;
	robot.joints = {};

	const worldbody = doc.querySelector("worldbody");
	if (!worldbody) return robot;

	const defaults = parseDefaults(doc);

	for (const child of Array.from(worldbody.children)) {
		if (child.tagName === "body") {
			const bodyGroup = parseBody(THREE, child, robot.joints, defaults);
			robot.add(bodyGroup);
		} else if (child.tagName === "geom") {
			const geom = parseGeom(THREE, child, defaults);
			if (geom) robot.add(geom);
		} else if (child.tagName === "light") {
			// Skip lights — we set up our own
		}
	}

	robot.setJointValues = (values: Record<string, number>): void => {
		for (const [name, value] of Object.entries(values)) {
			if (robot.joints[name]) {
				robot.joints[name].setJointValue(value);
			}
		}
	};

	return robot;
}

function parseDefaults(doc: Document): Record<string, any> {
	const defaults: Record<string, any> = {};
	const defaultEl = doc.querySelector("default");
	if (defaultEl) {
		const geomEl = defaultEl.querySelector("geom");
		if (geomEl) {
			const rgba = geomEl.getAttribute("rgba");
			if (rgba) defaults.geomRgba = rgba.split(" ").map(Number);
		}
	}
	return defaults;
}

function parseBody(
	THREE: typeof THREEModule,
	el: Element,
	joints: Record<string, MJCFJoint>,
	defaults: Record<string, any>
): THREEModule.Group {
	const group = new THREE.Group();
	group.name = el.getAttribute("name") || "";

	applyTransform(group, el);

	// Joint container — inserted between this body and its children
	// so joint rotations/translations affect child geometry
	let jointContainer: THREEModule.Object3D = group;

	for (const child of Array.from(el.children)) {
		if (child.tagName === "joint") {
			const jointGroup = new THREE.Group();
			const name =
				child.getAttribute("name") ||
				`joint_${Object.keys(joints).length}`;
			const type = child.getAttribute("type") || "hinge";
			const axisStr = child.getAttribute("axis") || "0 0 1";
			const axis = axisStr.split(" ").map(Number) as [
				number,
				number,
				number
			];

			const rangeStr = child.getAttribute("range");
			const range: [number, number] | null = rangeStr
				? (rangeStr.split(" ").map(Number) as [number, number])
				: null;

			const joint: MJCFJoint = {
				name,
				type,
				axis,
				range,
				container: jointGroup,
				setJointValue(value: number) {
					if (type === "hinge") {
						const axisVec = new THREE.Vector3(
							...axis
						).normalize();
						jointGroup.quaternion.setFromAxisAngle(axisVec, value);
					} else if (type === "slide") {
						const axisVec = new THREE.Vector3(
							...axis
						).normalize();
						jointGroup.position.copy(
							axisVec.multiplyScalar(value)
						);
					}
				}
			};

			joints[name] = joint;
			group.add(jointGroup);
			jointContainer = jointGroup;
		} else if (child.tagName === "geom") {
			const geom = parseGeom(THREE, child, defaults);
			if (geom) jointContainer.add(geom);
		} else if (child.tagName === "body") {
			const childBody = parseBody(THREE, child, joints, defaults);
			jointContainer.add(childBody);
		}
	}

	return group;
}

function parseGeom(
	THREE: typeof THREEModule,
	el: Element,
	defaults: Record<string, any>
): THREEModule.Mesh | null {
	const type = el.getAttribute("type") || "sphere";
	const sizeStr = el.getAttribute("size");
	const sizes = sizeStr ? sizeStr.split(" ").map(Number) : [0.05];
	const fromto = el.getAttribute("fromto");

	let geometry: THREEModule.BufferGeometry;
	let position: THREEModule.Vector3 | null = null;
	let quaternion: THREEModule.Quaternion | null = null;

	if (fromto) {
		const pts = fromto.split(" ").map(Number);
		const from = new THREE.Vector3(pts[0], pts[1], pts[2]);
		const to = new THREE.Vector3(pts[3], pts[4], pts[5]);
		const mid = new THREE.Vector3()
			.addVectors(from, to)
			.multiplyScalar(0.5);
		const dir = new THREE.Vector3().subVectors(to, from);
		const length = dir.length();
		dir.normalize();

		position = mid;

		// Align Y-axis to direction
		const up = new THREE.Vector3(0, 1, 0);
		quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir);

		const radius = sizes[0] || 0.05;

		if (type === "cylinder") {
			geometry = new THREE.CylinderGeometry(
				radius,
				radius,
				length,
				16
			);
		} else if (type === "capsule") {
			geometry = new THREE.CapsuleGeometry(radius, length, 8, 16);
		} else {
			geometry = new THREE.CylinderGeometry(
				radius,
				radius,
				length,
				16
			);
		}
	} else {
		switch (type) {
			case "box": {
				const [hx, hy, hz] =
					sizes.length >= 3
						? sizes
						: [sizes[0], sizes[0], sizes[0]];
				geometry = new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2);
				break;
			}
			case "sphere": {
				geometry = new THREE.SphereGeometry(sizes[0], 16, 16);
				break;
			}
			case "cylinder": {
				const radius = sizes[0];
				const halfLength = sizes.length > 1 ? sizes[1] : sizes[0];
				geometry = new THREE.CylinderGeometry(
					radius,
					radius,
					halfLength * 2,
					16
				);
				break;
			}
			case "capsule": {
				const capRadius = sizes[0];
				const capHalfLength =
					sizes.length > 1 ? sizes[1] : sizes[0];
				geometry = new THREE.CapsuleGeometry(
					capRadius,
					capHalfLength * 2,
					8,
					16
				);
				break;
			}
			case "mesh": {
				console.warn(
					"MJCF mesh geoms are not supported in V1. Showing placeholder sphere."
				);
				geometry = new THREE.SphereGeometry(0.05, 8, 8);
				break;
			}
			case "plane": {
				const pw = sizes[0] || 1;
				const ph = sizes.length > 1 ? sizes[1] : sizes[0];
				geometry = new THREE.PlaneGeometry(pw * 2, ph * 2);
				break;
			}
			case "ellipsoid": {
				geometry = new THREE.SphereGeometry(1, 16, 16);
				const sx = sizes[0] || 0.05;
				const sy = sizes.length > 1 ? sizes[1] : sx;
				const sz = sizes.length > 2 ? sizes[2] : sx;
				geometry.scale(sx, sy, sz);
				break;
			}
			default: {
				geometry = new THREE.SphereGeometry(0.05, 8, 8);
				break;
			}
		}
	}

	// Material
	const rgbaStr = el.getAttribute("rgba");
	let color = 0x888888;
	let opacity = 1.0;

	if (rgbaStr) {
		const rgba = rgbaStr.split(" ").map(Number);
		color = new THREE.Color(rgba[0], rgba[1], rgba[2]).getHex();
		opacity = rgba[3] ?? 1.0;
	} else if (defaults.geomRgba) {
		const rgba = defaults.geomRgba;
		color = new THREE.Color(rgba[0], rgba[1], rgba[2]).getHex();
		opacity = rgba[3] ?? 1.0;
	}

	const material = new THREE.MeshStandardMaterial({
		color,
		opacity,
		transparent: opacity < 1,
		roughness: 0.6,
		metalness: 0.2
	});

	const mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;

	// Apply fromto-derived transform
	if (position) {
		mesh.position.copy(position);
	}
	if (quaternion) {
		mesh.quaternion.copy(quaternion);
	}

	// Apply explicit pos/quat/euler (overrides fromto if both specified)
	if (!fromto) {
		applyTransform(mesh, el);
	}

	return mesh;
}

function applyTransform(
	obj: THREEModule.Object3D,
	el: Element
): void {
	const pos = el.getAttribute("pos");
	if (pos) {
		const [x, y, z] = pos.split(" ").map(Number);
		obj.position.set(x, y, z);
	}

	const quat = el.getAttribute("quat");
	if (quat) {
		const [w, x, y, z] = quat.split(" ").map(Number);
		obj.quaternion.set(x, y, z, w);
	}

	const euler = el.getAttribute("euler");
	if (euler) {
		const [x, y, z] = euler.split(" ").map(Number);
		obj.rotation.set(x, y, z);
	}
}
