import rollup from 'rollup';
import fs from 'fs-extra';
import globby from 'globby';

interface Target extends globby.GlobbyOptions {
    /**
     * Path or glob of what to copy.
     */
    readonly src: string | readonly string[];

    /**
     * One or more destinations where to copy.
     */
    readonly dest: string | readonly string[];

    /**
     * Change destination file or folder name.
     */
    readonly rename?: string | ((name: string, extension: string, fullPath: string) => string);

    /**
     * Modify file contents.
     */
    readonly transform?: (contents: Buffer, name: string) => any;
}

interface CopyOptions extends globby.GlobbyOptions, fs.WriteFileOptions, fs.CopyOptions {
    /**
     * Copy items once. Useful in watch mode.
     * @default false
     */
    readonly copyOnce?: boolean;

    /**
     * Remove the directory structure of copied files.
     * @default true
     */
    readonly flatten?: boolean;

    /**
     * Rollup hook the plugin should use.
     * @default 'buildEnd'
     */
    readonly hook?: string;

    /**
     * Array of targets to copy.
     * @default []
     */
    readonly targets?: readonly Target[];

    /**
     * Output copied items to console.
     * @default false
     */
    readonly verbose?: boolean;
}

/**
 * Copy files and folders using Rollup
 */
export default function copy(options?: CopyOptions): rollup.Plugin;
