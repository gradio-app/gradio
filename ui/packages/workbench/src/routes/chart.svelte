<script lang="ts">
	import { Chart } from "@gradio/chart";

	const csv = `time,value,price
1,1,4
2,3,8
3,6,12
4,10,16
5,15,20
6,21,24
7,28,28`;

	const csv2 = `time,value,price
0.01,0.01,0.04
0.02,0.03,0.08
0.03,0.06,0.12
0.04,0.10,0.16
0.05,0.15,0.20
0.06,0.21,0.24
0.07,0.28,0.28`;

	const csv3 = `time,value,price
1.1,1.1,4.4
2.2,3.3,8.8
3.3,6.6,12.12
4.4,10.10,16.16
5.5,15.15,20.20
6.6,21.21,24.24
7.7,28.28,28.28`;
</script>

<Chart value={csv} />

<Chart value={csv2} />

<Chart value={csv3} />
