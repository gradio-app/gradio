interface XYValue {
	x: number;
	y: number;
}

interface ObjectValue {
	values: XYValue[];
}

export function get_domains(
	values: ObjectValue[] | { values: number[] }
): [number, number] {
	let _vs: number[];
	if (Array.isArray(values)) {
		_vs = values.reduce<number[]>((acc, { values }) => {
			return [...acc, ...values.map(({ y }) => y)];
		}, []);
	} else {
		_vs = values.values;
	}
	return [Math.min(..._vs), Math.max(..._vs)];
}

interface Row {
	name: string;
	values: number[];
}

interface RowPoint {
	name: string;
	values: Array<{ x: number; y: number }>;
}

interface TransformedValues {
	x: Row;
	y: Array<RowPoint>;
}

export function transform_values(
	values: Array<Record<string, string>>,
	x?: string,
	y?: string[]
) {
	const transformed_values = Object.entries(
		values[0]
	).reduce<TransformedValues>(
		(acc, next, i) => {
			if ((!x && i === 0) || (x && next[0] === x)) {
				acc.x.name = next[0];
			} else if (!y || (y && y.includes(next[0]))) {
				acc.y.push({ name: next[0], values: [] });
			}
			return acc;
		},
		{ x: { name: "", values: [] }, y: [] }
	);

	for (let i = 0; i < values.length; i++) {
		const _a = Object.entries(values[i]);
		for (let j = 0; j < _a.length; j++) {
			let [name, x] = _a[j];
			if (name === transformed_values.x.name) {
				transformed_values.x.values.push(parseFloat(x));
			} else {
				transformed_values.y[j - 1].values.push({
					y: parseFloat(_a[j][1]),
					x: parseFloat(_a[0][1])
				});
			}
		}
	}

	return transformed_values;
}
