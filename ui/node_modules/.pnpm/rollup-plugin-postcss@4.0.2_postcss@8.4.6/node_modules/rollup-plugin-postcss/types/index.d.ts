import { Plugin } from 'rollup'
import { CreateFilter } from 'rollup-pluginutils'

type FunctionType<T = any, U = any> = (...args: readonly T[]) => U;

type onExtract = (asset: Readonly<{
	code: any;
	map: any;
	codeFileName: string;
	mapFileName: string;
}>) => boolean;

export type PostCSSPluginConf = {
	inject?:
	| boolean
	| Record<string, any>
	| ((cssVariableName: string, id: string) => string);
	extract?: boolean | string;
	onExtract?: onExtract;
	modules?: boolean | Record<string, any>;
	extensions?: string[];
	plugins?: any[];
	autoModules?: boolean;
	namedExports?: boolean | ((id: string) => string);
	minimize?: boolean | any;
	parser?: string | FunctionType;
	stringifier?: string | FunctionType;
	syntax?: string | FunctionType;
	exec?: boolean;
	config?:
	| boolean
	| {
		path: string;
		ctx: any;
	};
	to?: string;
	name?: any[] | any[][];
	loaders?: any[];
	onImport?: (id: string) => void;
	use?: string[] | { [key in 'sass' | 'stylus' | 'less']: any };
	/**
   * @default: false
   **/
	sourceMap?: boolean | 'inline';
	include?: Parameters<CreateFilter>[0];
	exclude?: Parameters<CreateFilter>[1];
};

export default function (options?: Readonly<PostCSSPluginConf>): Plugin
