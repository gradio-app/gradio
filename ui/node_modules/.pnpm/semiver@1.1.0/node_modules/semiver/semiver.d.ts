export enum Comparison {
	Equals = 0,
	Greater = 1,
	Lesser = -1
}

declare const semiver: (a: string, b: string) => Comparison;

export default semiver;
