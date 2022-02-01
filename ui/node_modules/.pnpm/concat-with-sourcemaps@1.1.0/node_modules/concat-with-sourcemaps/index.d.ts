import { RawSourceMap } from "source-map";

declare module "concat-with-sourcemaps" {

	export default class Concat {
		constructor(generateSourceMap: boolean, fileName: string, separator?: string);
		add(filePath: string | null, content: string | Buffer, sourceMap?: string | RawSourceMap): void;
		readonly content: Buffer;
		readonly sourceMap: string | undefined;
	}

}
