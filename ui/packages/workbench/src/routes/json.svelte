<script lang="ts">
	import { JSON } from "@gradio/json";

	const json = {
		a: 1,
		b: "two",
		c: [
			1,
			"two",
			[1, 2, 3],
			{
				a: 1,
				b: "two",
				c: [1, "two", []]
			}
		],
		d: {
			a: 1,
			b: "two",
			c: [
				1,
				"two",
				[1, 2, 3],
				{
					a: 1,
					b: "two",
					c: [1, "two", []]
				}
			]
		}
	};
</script>

<JSON value={json} />
